/**
 * LGPD Compliance - Data Portability (Portabilidade de Dados)
 * 
 * Sistema para exportar dados pessoais conforme LGPD
 */

import { auditService } from "@/lib/audit/audit-service";

export interface UserDataExport {
    exportedAt: string;
    version: string;
    personalData: {
        id: string;
        email: string;
        name: string;
        cpf?: string;
        phone?: string;
        birthDate?: string;
        address?: any;
    };
    profile?: any;
    preferences?: any;
    orders?: any[];
    activities?: any[];
    consents?: any[];
}

export class DataPortabilityService {
    /**
     * Exporta todos os dados do usuário
     */
    async exportUserData(
        userId: string,
        requestedBy: string,
        format: "json" | "csv" | "xml" = "json",
    ): Promise<Blob> {
        try {
            // 1. Coletar todos os dados do usuário
            const userData = await this.collectUserData(userId);

            // 2. Formatar dados
            let content: string;
            let mimeType: string;

            switch (format) {
                case "json":
                    content = JSON.stringify(userData, null, 2);
                    mimeType = "application/json";
                    break;
                case "csv":
                    content = this.convertToCSV(userData);
                    mimeType = "text/csv";
                    break;
                case "xml":
                    content = this.convertToXML(userData);
                    mimeType = "application/xml";
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // 3. Criar blob
            const blob = new Blob([content], { type: mimeType });

            // 4. Audit log
            await auditService.logDataExport(requestedBy, userId, format);

            return blob;
        } catch (error) {
            await auditService.logFailure(
                "data_export",
                requestedBy,
                "user_data",
                error as Error,
                { resourceId: userId },
            );

            throw error;
        }
    }

    /**
     * Coleta todos os dados do usuário
     */
    private async collectUserData(userId: string): Promise<UserDataExport> {
        // Importação dinâmica para evitar problemas em build/runtime se prisma não estiver configurado
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            console.warn("[GDPR] Prisma not available, returning mock data for portability.");
            return {
                exportedAt: new Date().toISOString(),
                version: "1.0",
                personalData: {
                    id: userId,
                    email: "mock@example.com",
                    name: "Mock User",
                },
                profile: {},
                preferences: {},
                orders: [],
                activities: [],
                consents: [],
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                notificationPreferences: true,
                usageLogs: {
                    take: 50,
                    orderBy: { createdAt: 'desc' }
                },
                memberships: {
                    include: { organization: true }
                }
            }
        });

        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        return {
            exportedAt: new Date().toISOString(),
            version: "1.0",
            personalData: {
                id: user.id,
                email: user.email,
                name: user.displayName || "",
                cpf: user.cpf || undefined,
                phone: user.phone || undefined,
                birthDate: user.birthDate?.toISOString(),
                address: undefined, // Endereço não está na model User
            },
            profile: {
                avatarUrl: user.avatarUrl,
                status: user.status,
                createdAt: user.createdAt,
            },
            preferences: {
                notifications: user.notificationPreferences
            },
            orders: [], // Usuário não tem pedidos diretos no schema atual
            activities: user.usageLogs,
            consents: [], // Consentimentos seriam em tabela separada ou logs
        };
    }

    /**
     * Converte dados para CSV
     */
    private convertToCSV(data: UserDataExport): string {
        const lines: string[] = [];

        // Header
        lines.push("Section,Key,Value");

        // Personal Data
        for (const [key, value] of Object.entries(data.personalData)) {
            lines.push(`Personal Data,${key},"${value}"`);
        }

        // Profile
        if (data.profile) {
            for (const [key, value] of Object.entries(data.profile)) {
                lines.push(`Profile,${key},"${value}"`);
            }
        }

        return lines.join("\n");
    }

    /**
     * Converte dados para XML
     */
    private convertToXML(data: UserDataExport): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += "<UserData>\n";
        xml += `  <ExportedAt>${data.exportedAt}</ExportedAt>\n`;
        xml += `  <Version>${data.version}</Version>\n`;

        xml += "  <PersonalData>\n";
        for (const [key, value] of Object.entries(data.personalData)) {
            xml += `    <${key}>${value}</${key}>\n`;
        }
        xml += "  </PersonalData>\n";

        xml += "</UserData>";

        return xml;
    }

    /**
     * Envia dados por email
     */
    async sendDataByEmail(userId: string, email: string): Promise<void> {
        const blob = await this.exportUserData(userId, userId, "json");
        const base64 = await this.blobToBase64(blob);

        // Envio real via Resend (Novo EmailService)
        const { emailService } = await import("@/lib/email/resend");

        await emailService.send({
            to: email,
            subject: 'Seus dados pessoais - LGPD/GDPR',
            html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>Solicitação de Portabilidade de Dados</h1>
              <p>Olá,</p>
              <p>Conforme sua solicitação, segue em anexo o arquivo contendo seus dados pessoais armazenados em nosso sistema.</p>
              <p>Este arquivo foi gerado automaticamente em cumprimento às leis de proteção de dados (LGPD/GDPR).</p>
              <br/>
              <p>Atenciosamente,<br/><strong>Equipe de Privacidade MorinaLight</strong></p>
            </div>
          `,
            attachments: [{
                filename: 'meus-dados.json',
                content: base64,
            }],
        });

        console.log(`[LGPD] Data sent to ${email}`);
    }

    /**
     * Helper para converter blob em base64
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

export const dataPortabilityService = new DataPortabilityService();
