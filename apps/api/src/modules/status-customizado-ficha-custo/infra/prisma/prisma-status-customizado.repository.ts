import type { PrismaClient } from "@prisma/client";
import type { StatusCustomizado } from "../../domain/entities/status-customizado";
import type {
  ListarStatusCustomizadosInput,
  ListarStatusCustomizadosOutput,
  StatusCustomizadoRepository,
} from "../../domain/repositories/status-customizado.repository";

export class PrismaStatusCustomizadoRepository implements StatusCustomizadoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async criar(status: StatusCustomizado): Promise<StatusCustomizado> {
    const created = await this.prisma.statusCustomizadoFichaCusto.create({
      data: {
        id: status.id,
        orgId: status.orgId,
        nome: status.nome,
        cor: status.cor,
        descricao: status.descricao,
        ordem: status.ordem,
        ativo: status.ativo,
        criadoPor: status.criadoPor,
        atualizadoPor: status.atualizadoPor ?? null,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
        deletedAt: status.deletedAt ?? null,
        deletedBy: status.deletedBy ?? null,
      },
    });

    return this.toDomain(created);
  }

  async buscarPorId(id: string, orgId: string): Promise<StatusCustomizado | null> {
    const found = await this.prisma.statusCustomizadoFichaCusto.findFirst({
      where: {
        id,
        orgId,
        deletedAt: null,
      },
    });

    return found ? this.toDomain(found) : null;
  }

  async listar(input: ListarStatusCustomizadosInput): Promise<ListarStatusCustomizadosOutput> {
    const pagina = input.pagina ?? 1;
    const tamanhoPagina = input.tamanhoPagina ?? 20;
    const skip = (pagina - 1) * tamanhoPagina;

    const where: any = {
      orgId: input.orgId,
      deletedAt: null,
    };

    if (input.ativo !== undefined) {
      where.ativo = input.ativo;
    }

    if (input.busca) {
      where.OR = [
        { nome: { contains: input.busca, mode: "insensitive" } },
        { descricao: { contains: input.busca, mode: "insensitive" } },
      ];
    }

    const [status, total] = await Promise.all([
      this.prisma.statusCustomizadoFichaCusto.findMany({
        where,
        skip,
        take: tamanhoPagina,
        orderBy: this.buildOrderBy(input.ordenacao),
      }),
      this.prisma.statusCustomizadoFichaCusto.count({ where }),
    ]);

    return {
      status: status.map((s) => this.toDomain(s)),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    };
  }

  async atualizar(status: StatusCustomizado): Promise<StatusCustomizado> {
    const updated = await this.prisma.statusCustomizadoFichaCusto.update({
      where: { id: status.id },
      data: {
        nome: status.nome,
        cor: status.cor,
        descricao: status.descricao,
        ordem: status.ordem,
        ativo: status.ativo,
        atualizadoPor: status.atualizadoPor ?? null,
        updatedAt: status.updatedAt,
      },
    });

    return this.toDomain(updated);
  }

  async deletar(id: string, orgId: string, deletedBy: string): Promise<void> {
    await this.prisma.statusCustomizadoFichaCusto.update({
      where: { id },
      data: {
        ativo: false,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async buscarPorNome(orgId: string, nome: string): Promise<StatusCustomizado | null> {
    const found = await this.prisma.statusCustomizadoFichaCusto.findFirst({
      where: {
        orgId,
        nome: {
          equals: nome,
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    return found ? this.toDomain(found) : null;
  }

  async contarPorOrg(orgId: string, ativo?: boolean): Promise<number> {
    const where: any = {
      orgId,
      deletedAt: null,
    };

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    return this.prisma.statusCustomizadoFichaCusto.count({ where });
  }

  private buildOrderBy(ordenacao?: { campo: string; direcao: "asc" | "desc" }) {
    if (!ordenacao) {
      return { ordem: "asc" as const, nome: "asc" as const };
    }

    return {
      [ordenacao.campo]: ordenacao.direcao,
    };
  }

  private toDomain(prisma: any): StatusCustomizado {
    return {
      id: prisma.id,
      orgId: prisma.orgId,
      nome: prisma.nome,
      cor: prisma.cor,
      descricao: prisma.descricao,
      ordem: prisma.ordem,
      ativo: prisma.ativo,
      criadoPor: prisma.criadoPor,
      atualizadoPor: prisma.atualizadoPor ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      deletedAt: prisma.deletedAt ?? null,
      deletedBy: prisma.deletedBy ?? null,
    };
  }
}
