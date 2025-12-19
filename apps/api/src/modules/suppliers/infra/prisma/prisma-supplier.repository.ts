import type { Prisma, PrismaClient, Supplier } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type { AuditoriaSupplierRepository } from "../../repositories/supplier-audit-log.repository";
import type {
  CreateSupplierInput,
  SupplierRecord,
  SupplierRepository,
  UpdateSupplierInput,
} from "../../repositories/supplier.repository";
import type { VersaoSupplierRepository } from "../../repositories/supplier-version.repository";

type AuditContext = {
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  orgId: string;
};

export class PrismaSupplierRepository implements SupplierRepository {
  private prisma: PrismaClient;
  private auditRepository?: AuditoriaSupplierRepository;
  private versionRepository?: VersaoSupplierRepository;

  constructor(
    prisma?: PrismaClient,
    auditRepository?: AuditoriaSupplierRepository,
    versionRepository?: VersaoSupplierRepository,
  ) {
    this.prisma = prisma ?? getPrisma();
    this.auditRepository = auditRepository;
    this.versionRepository = versionRepository;
  }

  async findById(id: string, includeDeleted = false): Promise<SupplierRecord | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return null;
    }

    // Se não incluir deletados e o registro estiver deletado, retornar null
    if (!includeDeleted && supplier.deletedAt) {
      return null;
    }

    return this.mapToRecord(supplier);
  }

  async findByOrgId(
    orgId: string,
    filters?: {
      status?: string;
      busca?: string;
      documento?: string;
      cidade?: string;
      estado?: string;
      email?: string;
      telefone?: string;
      pagina?: number;
      tamanhoPagina?: number;
      ordenarPor?: "name" | "createdAt" | "updatedAt" | "status";
      ordem?: "asc" | "desc";
      includeDeleted?: boolean;
      onlyDeleted?: boolean;
    },
  ): Promise<SupplierListResult> {
    const where: Prisma.SupplierWhereInput = { orgId };

    // Lógica de soft delete
    if (filters?.onlyDeleted) {
      where.deletedAt = { not: null };
    } else if (!filters?.includeDeleted) {
      where.deletedAt = null; // Excluir deletados por padrão
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Busca geral (quando não há filtros específicos)
    if (filters?.busca && !filters.documento && !filters.cidade && !filters.estado && !filters.email && !filters.telefone) {
      where.OR = [
        { name: { contains: filters.busca, mode: "insensitive" } },
        { email: { contains: filters.busca, mode: "insensitive" } },
        { document: { contains: filters.busca, mode: "insensitive" } },
        { phone: { contains: filters.busca, mode: "insensitive" } },
        { city: { contains: filters.busca, mode: "insensitive" } },
        { state: { contains: filters.busca, mode: "insensitive" } },
        { address: { contains: filters.busca, mode: "insensitive" } },
      ];
    }

    // Filtros específicos (busca avançada)
    if (filters?.documento) {
      where.document = { contains: filters.documento, mode: "insensitive" };
    }
    if (filters?.cidade) {
      where.city = { contains: filters.cidade, mode: "insensitive" };
    }
    if (filters?.estado) {
      where.state = { contains: filters.estado, mode: "insensitive" };
    }
    if (filters?.email) {
      where.email = { contains: filters.email, mode: "insensitive" };
    }
    if (filters?.telefone) {
      where.phone = { contains: filters.telefone, mode: "insensitive" };
    }

    // Paginação
    const pagina = filters?.pagina || 1;
    const tamanhoPagina = Math.min(Math.max(filters?.tamanhoPagina || 20, 1), 100);
    const skip = (pagina - 1) * tamanhoPagina;

    // Ordenação
    const ordenarPor = filters?.ordenarPor || "createdAt";
    const ordem = filters?.ordem || "desc";
    const orderBy: Prisma.SupplierOrderByWithRelationInput = { [ordenarPor]: ordem };

    // Contar total
    const total = await this.prisma.supplier.count({ where });

    // Buscar itens
    const suppliers = await this.prisma.supplier.findMany({
      where,
      orderBy,
      skip,
      take: tamanhoPagina,
    });

    const totalPaginas = Math.ceil(total / tamanhoPagina);

    return {
      itens: suppliers.map(this.mapToRecord),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas,
    };
  }

  async create(input: CreateSupplierInput, context?: AuditContext): Promise<SupplierRecord> {
    const supplier = await this.prisma.supplier.create({
      data: {
        orgId: input.orgId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        document: input.document,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        status: input.status || "ativo",
        notes: input.notes,
        website: input.website,
        contatoPrincipal: input.contatoPrincipal,
        cargoContato: input.cargoContato,
        ramoAtividade: input.ramoAtividade,
        tipoFornecedor: input.tipoFornecedor,
        prazoPagamento: input.prazoPagamento,
        condicaoPagamento: input.condicaoPagamento,
        limiteCredito: input.limiteCredito,
        createdBy: input.createdBy,
        updatedBy: input.updatedBy,
      },
    });

    // Auditoria automática (não bloqueia a operação se falhar)
    if (this.auditRepository && context) {
      try {
        await this.auditRepository.create({
          supplierId: supplier.id,
          orgId: context.orgId,
          acao: "criar",
          estadoAnterior: null,
          estadoNovo: this.supplierToJson(supplier),
          actorId: context.actorId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (error) {
        console.error("Erro ao registrar auditoria de criação:", error);
      }
    }

    return this.mapToRecord(supplier);
  }

  async update(id: string, input: UpdateSupplierInput, context?: AuditContext): Promise<SupplierRecord> {
    // Buscar estado anterior para auditoria e versionamento
    const estadoAnterior = await this.prisma.supplier.findUnique({ where: { id } });
    if (!estadoAnterior) {
      throw new Error("Fornecedor não encontrado");
    }

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        document: input.document,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        status: input.status,
        notes: input.notes,
        website: input.website,
        contatoPrincipal: input.contatoPrincipal,
        cargoContato: input.cargoContato,
        ramoAtividade: input.ramoAtividade,
        tipoFornecedor: input.tipoFornecedor,
        prazoPagamento: input.prazoPagamento,
        condicaoPagamento: input.condicaoPagamento,
        limiteCredito: input.limiteCredito,
        updatedBy: input.updatedBy,
        updatedAt: new Date(),
      },
    });

    // Versionamento automático (não bloqueia a operação se falhar)
    if (this.versionRepository && context) {
      try {
        const proximaVersao = await this.versionRepository.getNextVersionNumber(id);
        await this.versionRepository.create({
          supplierId: id,
          versao: proximaVersao,
          dadosSnapshot: this.supplierToJson(supplier), // ✅ CORRIGIDO: Salvar estado NOVO, não anterior
          criadoPor: context.actorId,
          motivoAlteracao: "Atualização de dados do fornecedor",
        });
      } catch (error) {
        // Log silencioso - não bloqueia a operação principal
        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao criar versão:", error);
        }
      }
    }

    // Auditoria automática (não bloqueia a operação se falhar)
    if (this.auditRepository && context) {
      try {
        const camposAlterados = this.identificarCamposAlterados(estadoAnterior, supplier);
        
        // Registrar uma auditoria por campo alterado ou uma geral
        if (camposAlterados.length > 0) {
          for (const campo of camposAlterados) {
            await this.auditRepository.create({
              supplierId: id,
              orgId: context.orgId,
              acao: "atualizar",
              campo,
              estadoAnterior: this.getFieldValue(estadoAnterior, campo),
              estadoNovo: this.getFieldValue(supplier, campo),
              actorId: context.actorId,
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
            });
          }
        } else {
          // Se não há campos específicos alterados, registrar auditoria geral
          await this.auditRepository.create({
            supplierId: id,
            orgId: context.orgId,
            acao: "atualizar",
            estadoAnterior: this.supplierToJson(estadoAnterior),
            estadoNovo: this.supplierToJson(supplier),
            actorId: context.actorId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
        }
      } catch (error) {
        console.error("Erro ao registrar auditoria de atualização:", error);
      }
    }

    return this.mapToRecord(supplier);
  }

  async delete(id: string, deletedBy: string, context?: AuditContext): Promise<void> {
    // Buscar estado anterior para auditoria
    const estadoAnterior = await this.prisma.supplier.findUnique({ where: { id } });
    if (!estadoAnterior) {
      throw new Error("Fornecedor não encontrado");
    }

    await this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    // Auditoria automática (não bloqueia a operação se falhar)
    if (this.auditRepository && context) {
      try {
        await this.auditRepository.create({
          supplierId: id,
          orgId: context.orgId,
          acao: "deletar",
          estadoAnterior: this.supplierToJson(estadoAnterior),
          estadoNovo: null,
          actorId: context.actorId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (error) {
        console.error("Erro ao registrar auditoria de deleção:", error);
      }
    }
  }

  async restore(id: string, context?: AuditContext): Promise<SupplierRecord> {
    // Buscar estado anterior para auditoria
    const estadoAnterior = await this.prisma.supplier.findUnique({ where: { id } });
    if (!estadoAnterior) {
      throw new Error("Fornecedor não encontrado");
    }

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    // Auditoria automática (não bloqueia a operação se falhar)
    if (this.auditRepository && context) {
      try {
        await this.auditRepository.create({
          supplierId: id,
          orgId: context.orgId,
          acao: "restaurar",
          estadoAnterior: this.supplierToJson(estadoAnterior),
          estadoNovo: this.supplierToJson(supplier),
          actorId: context.actorId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (error) {
        console.error("Erro ao registrar auditoria de restauração:", error);
      }
    }

    return this.mapToRecord(supplier);
  }

  async hardDelete(id: string): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id },
    });
  }

  private mapToRecord(supplier: Supplier): SupplierRecord {
    return {
      id: supplier.id,
      orgId: supplier.orgId,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      document: supplier.document,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zipCode: supplier.zipCode,
      status: supplier.status,
      notes: supplier.notes,
      website: supplier.website,
      contatoPrincipal: supplier.contatoPrincipal,
      cargoContato: supplier.cargoContato,
      ramoAtividade: supplier.ramoAtividade,
      tipoFornecedor: supplier.tipoFornecedor,
      prazoPagamento: supplier.prazoPagamento ? Number(supplier.prazoPagamento) : null,
      condicaoPagamento: supplier.condicaoPagamento,
      limiteCredito: supplier.limiteCredito ? Number(supplier.limiteCredito) : null,
      avaliacao: supplier.avaliacao ? Number(supplier.avaliacao) : null,
      dataUltimaCompra: supplier.dataUltimaCompra,
      totalCompras: supplier.totalCompras ? Number(supplier.totalCompras) : null,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      deletedAt: supplier.deletedAt,
      deletedBy: supplier.deletedBy,
    };
  }

  private supplierToJson(supplier: Supplier): Record<string, unknown> {
    return {
      id: supplier.id,
      orgId: supplier.orgId,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      document: supplier.document,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zipCode: supplier.zipCode,
      status: supplier.status,
      notes: supplier.notes,
      website: supplier.website,
      contatoPrincipal: supplier.contatoPrincipal,
      cargoContato: supplier.cargoContato,
      ramoAtividade: supplier.ramoAtividade,
      tipoFornecedor: supplier.tipoFornecedor,
      prazoPagamento: supplier.prazoPagamento,
      condicaoPagamento: supplier.condicaoPagamento,
      limiteCredito: supplier.limiteCredito ? Number(supplier.limiteCredito) : null,
      avaliacao: supplier.avaliacao ? Number(supplier.avaliacao) : null,
      dataUltimaCompra: supplier.dataUltimaCompra?.toISOString() || null,
      totalCompras: supplier.totalCompras ? Number(supplier.totalCompras) : null,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
      deletedAt: supplier.deletedAt?.toISOString() || null,
      deletedBy: supplier.deletedBy,
    };
  }

  private identificarCamposAlterados(antes: Supplier, depois: Supplier): string[] {
    const campos: (keyof Supplier)[] = [
      "name",
      "email",
      "phone",
      "document",
      "address",
      "city",
      "state",
      "zipCode",
      "status",
      "notes",
      "website",
      "contatoPrincipal",
      "cargoContato",
      "ramoAtividade",
      "tipoFornecedor",
      "prazoPagamento",
      "condicaoPagamento",
      "limiteCredito",
    ];

    return campos.filter((campo) => antes[campo] !== depois[campo]);
  }

  private getFieldValue(supplier: Supplier, campo: string): unknown {
    const value = supplier[campo as keyof Supplier];
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
}
