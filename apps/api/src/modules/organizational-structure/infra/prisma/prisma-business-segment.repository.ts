import { getPrisma } from "../../../../infra/database/prisma.service";
import { BusinessSegment } from "../../domain/entities/business-segment";
import type {
    BusinessSegmentFiltro,
    BusinessSegmentRepository,
} from "../../domain/repositories/business-segment-repository";

const prisma = getPrisma();

function toDomain(record: {
    id: string;
    orgId: string;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}) {
    return BusinessSegment.restaurar({
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        description: record.description,
        active: record.active,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    });
}

export class PrismaBusinessSegmentRepository implements BusinessSegmentRepository {
    async save(businessSegment: BusinessSegment): Promise<void> {
        const dados = businessSegment.dados;
        await prisma.businessSegment.upsert({
            where: { id: dados.id },
            create: {
                id: dados.id,
                orgId: dados.orgId,
                name: dados.name,
                description: dados.description,
                active: dados.active,
                createdAt: dados.createdAt,
                updatedAt: dados.updatedAt,
            },
            update: {
                name: dados.name,
                description: dados.description,
                active: dados.active,
                updatedAt: dados.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<BusinessSegment | null> {
        const record = await prisma.businessSegment.findUnique({
            where: { id },
        });

        if (!record) {
            return null;
        }

        return toDomain(record);
    }

    async findAll(filtro: BusinessSegmentFiltro): Promise<BusinessSegment[]> {
        const where: any = {
            orgId: filtro.orgId,
        };

        if (filtro.active !== undefined) {
            where.active = filtro.active;
        }

        if (filtro.busca) {
            where.OR = [
                { name: { contains: filtro.busca, mode: "insensitive" } },
                { description: { contains: filtro.busca, mode: "insensitive" } },
            ];
        }

        const records = await prisma.businessSegment.findMany({
            where,
            orderBy: { name: "asc" },
        });

        return records.map(toDomain);
    }

    async delete(id: string): Promise<void> {
        await prisma.businessSegment.delete({
            where: { id },
        });
    }
}
