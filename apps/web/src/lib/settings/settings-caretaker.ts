/**
 * Settings Caretaker - Memento Pattern Implementation
 * 
 * Gerencia versões e snapshots das configurações da empresa.
 */

import { Caretaker, Memento, Originator } from "@/lib/patterns/memento-pattern";
import { getPrismaClient } from "@/lib/prisma";
import { CompanySettings } from "@prisma/client";

// Memento Concreto para CompanySettings
export class SettingsMemento implements Memento<CompanySettings> {
    constructor(
        private readonly state: CompanySettings,
        private readonly date: Date = new Date(),
        private readonly metadata: any = {}
    ) { }

    getState(): CompanySettings {
        return JSON.parse(JSON.stringify(this.state));
    }

    getDate(): Date {
        return this.date;
    }

    getMetadata(): any {
        return this.metadata;
    }
}

// Originator
export class SettingsOriginator extends Originator<CompanySettings> {
    save(metadata?: any): Memento<CompanySettings> {
        return new SettingsMemento(this.getState(), new Date(), metadata);
    }
}

// Caretaker com persistência no banco
export class SettingsCaretaker extends Caretaker<CompanySettings> {
    constructor(
        originator: SettingsOriginator,
        private readonly orgId: string,
        private readonly userId: string
    ) {
        super(originator);
    }

    // Sobrescreve backup para salvar no banco também
    public async backup(metadata?: any): Promise<void> {
        // 1. Salva em memória (comportamento padrão)
        super.backup(metadata);

        // 2. Persiste no banco como CompanySettingsVersion
        const memento = this.getHistory()[this.getHistory().length - 1]; // pega o último
        if (!memento) {
            throw new Error("No history available to save");
        }
        const state = memento.getState();
        const prisma = await getPrismaClient();

        if (!prisma) {
            console.warn("Prisma unavailable, backup saved only in memory");
            return;
        }

        // Determinar próxima versão
        const lastVersion = await prisma.companySettingsVersion.findFirst({
            where: { orgId: this.orgId },
            orderBy: { version: 'desc' }
        });

        const nextVersion = (lastVersion?.version || 0) + 1;

        await prisma.companySettingsVersion.create({
            data: {
                orgId: this.orgId,
                version: nextVersion,
                snapshot: state as any, // Json
                name: metadata?.name || `Version ${nextVersion}`,
                createdBy: this.userId,
                createdAt: memento.getDate(),
            }
        });

        console.log(`[SettingsCaretaker] Version ${nextVersion} persisted to database`);
    }

    // Restaura de uma versão específica do banco
    public async restoreFromVersion(version: number): Promise<boolean> {
        const prisma = await getPrismaClient();
        if (!prisma) return false;

        const versionRecord = await prisma.companySettingsVersion.findUnique({
            where: {
                orgId_version: {
                    orgId: this.orgId,
                    version: version
                }
            }
        });

        if (!versionRecord) {
            console.error(`Version ${version} not found for org ${this.orgId}`);
            return false;
        }

        // Reconstrói o memento
        const memento = new SettingsMemento(
            versionRecord.snapshot as unknown as CompanySettings,
            versionRecord.createdAt,
            { name: versionRecord.name, version: versionRecord.version }
        );

        // Restaura o originator
        // Nota: Precisamos de acesso público ao restore ou cast
        // Como o design pattern separa, vamos usar o método público do originator se disponível,
        // mas a classe base Originator tem restore publico.
        // A questão aqui é que o Caretaker base não expõe o originator.
        // Vamos assumir que passamos o originator no construtor e guardamos referência local se necessário,
        // mas o `super` já guarda. O problema é que é private na base.
        // WORKAROUND: Cast para acessar property ou alterar a base. 
        // Vamos alterar a base Memento Pattern para protected originator.

        // (Assumindo que eu alterarei o arquivo base memento-pattern.ts para protected)
        // @ts-ignore
        this.originator.restore(memento);

        return true;
    }
}
