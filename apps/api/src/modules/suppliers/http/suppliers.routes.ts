import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { checkOrganizationAccess } from "../../../core/auth/rbac.guards";
import { getTenant } from "../../../core/tenant/tenant.utils";
import { getPrisma } from "../../../infra/database/prisma.service";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { SupplierRepository } from "../repositories/supplier.repository";
import { registerUploadDocumentoSupplierRoute } from "./upload-documento-supplier.route";

const createSupplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  zipCode: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  contatoPrincipal: z.string().optional().nullable(),
  cargoContato: z.string().optional().nullable(),
  ramoAtividade: z.string().optional().nullable(),
  tipoFornecedor: z.string().optional().nullable(),
  prazoPagamento: z.number().int().positive().optional().nullable(),
  condicaoPagamento: z.string().optional().nullable(),
  limiteCredito: z.number().positive().optional().nullable(),
});

const updateSupplierSchema = createSupplierSchema.partial();

const querySchema = z.object({
  status: z.string().optional(),
  busca: z.string().max(120).optional().transform((val) => {
    // Remover busca se tiver menos de 2 caracteres ou estiver vazia
    if (!val || val.trim().length < 2) {
      return undefined;
    }
    return val.trim();
  }),
  documento: z.string().optional().transform((val) => {
    if (!val || val.trim().length === 0) {
      return undefined;
    }
    return val.trim().replace(/\D/g, ""); // Remove formatação
  }),
  cidade: z.string().optional().transform((val) => {
    if (!val || val.trim().length === 0) {
      return undefined;
    }
    return val.trim();
  }),
  estado: z.string().max(2).optional().transform((val) => {
    if (!val || val.trim().length === 0) {
      return undefined;
    }
    return val.trim().toUpperCase();
  }),
  email: z.string().email().optional().transform((val) => {
    if (!val || val.trim().length === 0) {
      return undefined;
    }
    return val.trim().toLowerCase();
  }),
  telefone: z.string().optional().transform((val) => {
    if (!val || val.trim().length === 0) {
      return undefined;
    }
    return val.trim().replace(/\D/g, ""); // Remove formatação
  }),
  pagina: z.coerce.number().int().positive().default(1).optional(),
  tamanhoPagina: z.coerce.number().int().positive().max(100).default(20).optional(),
  ordenarPor: z.enum(["name", "createdAt", "updatedAt", "status"]).default("createdAt").optional(),
  ordem: z.enum(["asc", "desc"]).default("desc").optional(),
});

import type { AuditoriaSupplierRepository } from "../repositories/supplier-audit-log.repository";
import type { DocumentoSupplierRepository } from "../repositories/supplier-document.repository";
import type { VersaoSupplierRepository } from "../repositories/supplier-version.repository";
import type { SupplierTagRepository } from "../repositories/supplier-tag.repository";
import type { AvaliacaoSupplierRepository } from "../repositories/supplier-avaliacao.repository";
import type { HistoricoPrecoSupplierRepository } from "../repositories/supplier-historico-preco.repository";
import type { AlertaSupplierRepository } from "../repositories/supplier-alerta.repository";
import type { SupplierContactRepository } from "../repositories/supplier-contact.repository";
import type { NotaSupplierRepository } from "../repositories/supplier-nota.repository";

type SuppliersDeps = {
  supplierRepository: SupplierRepository;
  organizationRepository: OrganizationRepository;
};

type SuppliersAuditDeps = {
  auditRepository: AuditoriaSupplierRepository;
  versionRepository: VersaoSupplierRepository;
  documentRepository: DocumentoSupplierRepository;
  tagRepository?: SupplierTagRepository;
  avaliacaoRepository?: AvaliacaoSupplierRepository;
  historicoPrecoRepository?: HistoricoPrecoSupplierRepository;
  alertaRepository?: AlertaSupplierRepository;
  contactRepository?: SupplierContactRepository;
  notaRepository?: NotaSupplierRepository;
};

export async function registerSuppliersRoutes(
  app: FastifyInstance,
  deps: SuppliersDeps,
  auditDeps?: SuppliersAuditDeps,
) {
  app.get("/suppliers", async (request, reply) => {
    try {
      const tenant = getTenant(request);
      
      // Validar query com tratamento de erros
      const queryResult = querySchema.safeParse(request.query ?? {});
      if (!queryResult.success) {
        return reply.status(400).send({
          message: "Parâmetros de consulta inválidos",
          errors: queryResult.error.errors,
        });
      }

      const query = queryResult.data;

      const resultado = await deps.supplierRepository.findByOrgId(tenant.orgId, {
        status: query.status,
        busca: query.busca,
        documento: query.documento,
        cidade: query.cidade,
        estado: query.estado,
        email: query.email,
        telefone: query.telefone,
        pagina: query.pagina,
        tamanhoPagina: query.tamanhoPagina,
        ordenarPor: query.ordenarPor,
        ordem: query.ordem,
      });

      return reply.send(resultado);
    } catch (error) {
      // Se o erro for sobre tenant context, retornar erro mais claro
      if (error instanceof Error && error.message.includes("Contexto de tenant")) {
        return reply.status(400).send({
          message: "Organização não especificada. Header 'x-org-id' é obrigatório.",
          code: "MISSING_ORG_ID",
        });
      }

      // Log do erro para debug
      app.log.error(error, "Erro ao listar fornecedores");

      return reply.status(500).send({
        message: "Erro interno ao buscar fornecedores",
        code: "INTERNAL_ERROR",
      });
    }
  });

  app.get("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const supplier = await deps.supplierRepository.findById(id);

    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    return reply.send(supplier);
  });

  app.post("/suppliers", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const tenant = getTenant(request);
    const body = createSupplierSchema.parse(request.body ?? {});

    const supplier = await (deps.supplierRepository as any).create(
      {
        orgId: tenant.orgId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        document: body.document,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        status: body.status || "ativo",
        notes: body.notes,
        website: body.website || null,
        contatoPrincipal: body.contatoPrincipal || null,
        cargoContato: body.cargoContato || null,
        ramoAtividade: body.ramoAtividade || null,
        tipoFornecedor: body.tipoFornecedor || null,
        prazoPagamento: body.prazoPagamento || null,
        condicaoPagamento: body.condicaoPagamento || null,
        limiteCredito: body.limiteCredito || null,
        createdBy: request.auth.userId,
        updatedBy: request.auth.userId,
      },
      {
        actorId: request.auth.userId,
        orgId: tenant.orgId,
        ipAddress: request.ip || request.socket.remoteAddress || null,
        userAgent: request.headers["user-agent"] || null,
      },
    );

    return reply.status(201).send(supplier);
  });

  app.put("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = updateSupplierSchema.parse(request.body ?? {});

    const existing = await deps.supplierRepository.findById(id);

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      existing.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    const supplier = await (deps.supplierRepository as any).update(
      id,
      {
        ...body,
        updatedBy: request.auth.userId,
      },
      {
        actorId: request.auth.userId,
        orgId: existing.orgId,
        ipAddress: request.ip || request.socket.remoteAddress || null,
        userAgent: request.headers["user-agent"] || null,
      },
    );

    return reply.send(supplier);
  });

  app.delete("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await deps.supplierRepository.findById(id);

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      existing.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    await (deps.supplierRepository as any).delete(
      id,
      request.auth.userId,
      {
        actorId: request.auth.userId,
        orgId: existing.orgId,
        ipAddress: request.ip || request.socket.remoteAddress || null,
        userAgent: request.headers["user-agent"] || null,
      },
    );

    return reply.status(204).send();
  });

  app.post("/suppliers/:id/restore", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await deps.supplierRepository.findById(id, true); // Incluir deletados

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    if (!existing.deletedAt) {
      return reply.status(400).send({ message: "Fornecedor não está deletado" });
    }

    // Verificar acesso à organização do fornecedor
    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      existing.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    const supplier = await (deps.supplierRepository as any).restore(id, {
      actorId: request.auth.userId,
      orgId: existing.orgId,
      ipAddress: request.ip || request.socket.remoteAddress || null,
      userAgent: request.headers["user-agent"] || null,
    });

    return reply.send(supplier);
  });

  app.delete("/suppliers/:id/hard", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await deps.supplierRepository.findById(id, true); // Incluir deletados

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      existing.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    await deps.supplierRepository.hardDelete(id);

    return reply.status(204).send();
  });

  // Endpoint para buscar auditoria do fornecedor
  if (auditDeps) {
    app.get("/suppliers/:id/auditoria", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id } = z.object({ id: z.string() }).parse(request.params);
      const tenant = getTenant(request);

      const querySchema = z.object({
        limite: z.coerce.number().int().positive().max(100).default(20).optional(),
        cursor: z.string().optional(),
        acao: z.string().optional(),
        dataInicio: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
        dataFim: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
      });

      const queryResult = querySchema.safeParse(request.query ?? {});
      if (!queryResult.success) {
        return reply.status(400).send({
          message: "Parâmetros de consulta inválidos",
          errors: queryResult.error.errors,
        });
      }

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const auditoria = await auditDeps.auditRepository.findBySupplierId(id, {
        orgId: tenant.orgId,
        ...queryResult.data,
      });

      return reply.send(auditoria);
    });
  }

  // Endpoint para buscar versões do fornecedor
  if (auditDeps) {
    app.get("/suppliers/:id/versoes", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id } = z.object({ id: z.string() }).parse(request.params);

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const versoes = await auditDeps.versionRepository.findBySupplierId(id);

      return reply.send({ versoes });
    });

    app.get("/suppliers/:id/versoes/:versao", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id, versao } = z
        .object({
          id: z.string(),
          versao: z.coerce.number().int().positive(),
        })
        .parse(request.params);

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const versaoData = await auditDeps.versionRepository.findByVersion(id, versao);
      if (!versaoData) {
        return reply.status(404).send({ message: "Versão não encontrada" });
      }

      return reply.send(versaoData);
    });
  }

  // Endpoint para buscar estatísticas do fornecedor
  app.get("/suppliers/:id/estatisticas", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tenant = getTenant(request);

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    // Calcular estatísticas
    const prisma = getPrisma();

    // Total de fichas de custo (distinct fichaCustoId onde tem insumo deste fornecedor)
    const fichasCusto = await prisma.insumoFichaCusto.findMany({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
      select: {
        fichaCustoId: true,
      },
      distinct: ["fichaCustoId"],
    });
    const totalFichasCusto = fichasCusto.length;

    // Total de insumos fornecidos
    const totalInsumos = await prisma.insumoFichaCusto.count({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
    });

    // Valor total em compras (soma de custoTotal)
    const valorTotal = await prisma.insumoFichaCusto.aggregate({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
      _sum: {
        custoTotal: true,
      },
    });

    // Total de boletos
    const totalBoletos = await prisma.boletoFichaCusto.count({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
    });

    // Última compra (maior data de criação de insumo ou boleto)
    const ultimaCompraInsumo = await prisma.insumoFichaCusto.findFirst({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    const ultimaCompraBoleto = await prisma.boletoFichaCusto.findFirst({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    let ultimaCompra: Date | null = null;
    if (ultimaCompraInsumo?.createdAt && ultimaCompraBoleto?.createdAt) {
      ultimaCompra =
        ultimaCompraInsumo.createdAt > ultimaCompraBoleto.createdAt
          ? ultimaCompraInsumo.createdAt
          : ultimaCompraBoleto.createdAt;
    } else if (ultimaCompraInsumo?.createdAt) {
      ultimaCompra = ultimaCompraInsumo.createdAt;
    } else if (ultimaCompraBoleto?.createdAt) {
      ultimaCompra = ultimaCompraBoleto.createdAt;
    }

    return reply.send({
      totalFichasCusto,
      totalInsumos,
      valorTotal: valorTotal._sum.custoTotal ? Number(valorTotal._sum.custoTotal) : 0,
      totalBoletos,
      ultimaCompra: ultimaCompra?.toISOString() || null,
    });
  });

  // Endpoint para buscar fichas de custo do fornecedor
  app.get("/suppliers/:id/fichas-custo", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tenant = getTenant(request);

    const querySchema = z.object({
      pagina: z.coerce.number().int().positive().default(1).optional(),
      tamanhoPagina: z.coerce.number().int().positive().max(100).default(20).optional(),
      status: z.string().optional(),
      dataInicio: z.string().datetime().optional(),
      dataFim: z.string().datetime().optional(),
    });

    const queryResult = querySchema.safeParse(request.query ?? {});
    if (!queryResult.success) {
      return reply.status(400).send({
        message: "Parâmetros de consulta inválidos",
        errors: queryResult.error.errors,
      });
    }

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    const prisma = getPrisma();
    const pagina = queryResult.data.pagina || 1;
    const tamanhoPagina = queryResult.data.tamanhoPagina || 20;
    const skip = (pagina - 1) * tamanhoPagina;

    // Buscar fichas de custo que têm insumos deste fornecedor
    const where: any = {
      insumos: {
        some: {
          fornecedorId: id,
        },
      },
      orgId: tenant.orgId,
      deletedAt: null,
    };

    if (queryResult.data.status) {
      where.status = queryResult.data.status;
    }

    if (queryResult.data.dataInicio || queryResult.data.dataFim) {
      where.createdAt = {};
      if (queryResult.data.dataInicio) {
        where.createdAt.gte = new Date(queryResult.data.dataInicio);
      }
      if (queryResult.data.dataFim) {
        where.createdAt.lte = new Date(queryResult.data.dataFim);
      }
    }

    const [total, fichas] = await Promise.all([
      prisma.fichaCusto.count({ where }),
      prisma.fichaCusto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: tamanhoPagina,
        include: {
          insumos: {
            where: {
              fornecedorId: id,
            },
          },
        },
      }),
    ]);

    return reply.send({
      itens: fichas.map((ficha) => ({
        id: ficha.id,
        numeroSequencial: ficha.numeroSequencial,
        referenciaPeca: ficha.referenciaPeca,
        nomePeca: ficha.nomePeca,
        status: ficha.status,
        totalCustos: Number(ficha.totalCustos),
        custoFinalPeca: Number(ficha.custoFinalPeca),
        createdAt: ficha.createdAt.toISOString(),
        updatedAt: ficha.updatedAt.toISOString(),
        valorFornecedor: ficha.insumos.reduce(
          (sum, insumo) => sum + Number(insumo.custoTotal),
          0,
        ),
      })),
      total,
      pagina,
      tamanhoPagina,
      totalPaginas: Math.ceil(total / tamanhoPagina),
    });
  });

  // Endpoint para buscar insumos do fornecedor
  app.get("/suppliers/:id/insumos", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tenant = getTenant(request);

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    const prisma = getPrisma();

    // Buscar todos os insumos deste fornecedor
    const insumos = await prisma.insumoFichaCusto.findMany({
      where: {
        fornecedorId: id,
        fichaCusto: {
          orgId: tenant.orgId,
          deletedAt: null,
        },
      },
      include: {
        fichaCusto: {
          select: {
            id: true,
            numeroSequencial: true,
            referenciaPeca: true,
            nomePeca: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Agrupar por descrição
    const agrupados = insumos.reduce((acc, insumo) => {
      const descricao = insumo.descricao;
      if (!acc[descricao]) {
        acc[descricao] = {
          descricao,
          tipo: insumo.tipo,
          insumos: [],
          precos: [],
          quantidadeTotal: 0,
          valorTotal: 0,
        };
      }
      acc[descricao].insumos.push(insumo);
      acc[descricao].precos.push(Number(insumo.custoUnitario));
      acc[descricao].quantidadeTotal += Number(insumo.quantidade);
      acc[descricao].valorTotal += Number(insumo.custoTotal);
      return acc;
    }, {} as Record<string, any>);

    const resultado = Object.values(agrupados).map((grupo: any) => {
      const precos = grupo.precos.sort((a: number, b: number) => a - b);
      return {
        descricao: grupo.descricao,
        tipo: grupo.tipo,
        quantidadeTotal: grupo.quantidadeTotal,
        valorTotal: grupo.valorTotal,
        precoMinimo: precos[0],
        precoMaximo: precos[precos.length - 1],
        precoMedio: grupo.precos.reduce((a: number, b: number) => a + b, 0) / grupo.precos.length,
        ultimaCompra: grupo.insumos[0].createdAt.toISOString(),
        totalCompras: grupo.insumos.length,
        fichaMaisRecente: grupo.insumos[0].fichaCusto,
      };
    });

    return reply.send({ insumos: resultado });
  });

  // Endpoint para buscar boletos do fornecedor
  app.get("/suppliers/:id/boletos", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tenant = getTenant(request);

    const querySchema = z.object({
      status: z.string().optional(),
      dataInicio: z.string().datetime().optional(),
      dataFim: z.string().datetime().optional(),
    });

    const queryResult = querySchema.safeParse(request.query ?? {});
    if (!queryResult.success) {
      return reply.status(400).send({
        message: "Parâmetros de consulta inválidos",
        errors: queryResult.error.errors,
      });
    }

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    const prisma = getPrisma();

    const where: any = {
      fornecedorId: id,
      fichaCusto: {
        orgId: tenant.orgId,
        deletedAt: null,
      },
    };

    if (queryResult.data.status) {
      where.status = queryResult.data.status;
    }

    if (queryResult.data.dataInicio || queryResult.data.dataFim) {
      where.dataVencimento = {};
      if (queryResult.data.dataInicio) {
        where.dataVencimento.gte = new Date(queryResult.data.dataInicio);
      }
      if (queryResult.data.dataFim) {
        where.dataVencimento.lte = new Date(queryResult.data.dataFim);
      }
    }

    const boletos = await prisma.boletoFichaCusto.findMany({
      where,
      include: {
        fichaCusto: {
          select: {
            id: true,
            numeroSequencial: true,
            referenciaPeca: true,
            nomePeca: true,
          },
        },
      },
      orderBy: {
        dataVencimento: "desc",
      },
    });

    return reply.send({
      boletos: boletos.map((boleto) => ({
        id: boleto.id,
        valorBoleto: Number(boleto.valorBoleto),
        dataVencimento: boleto.dataVencimento.toISOString(),
        status: boleto.status,
        dataPagamento: boleto.dataPagamento?.toISOString() || null,
        codigoBarras: boleto.codigoBarras,
        linhaDigitavel: boleto.linhaDigitavel,
        arquivoUrl: boleto.arquivoUrl,
        fichaCusto: boleto.fichaCusto,
        createdAt: boleto.createdAt.toISOString(),
      })),
    });
  });

  // Endpoints para documentos do fornecedor
  if (auditDeps?.documentRepository) {
    // Listar documentos
    app.get("/suppliers/:id/documentos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id } = z.object({ id: z.string() }).parse(request.params);

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const documentos = await auditDeps.documentRepository.findBySupplierId(id);

      return reply.send({
        documentos: documentos.map((doc) => ({
          id: doc.id,
          tipo: doc.tipo,
          nomeArquivo: doc.nomeArquivo,
          arquivoUrl: doc.arquivoUrl,
          tamanhoBytes: Number(doc.tamanhoBytes),
          mimeType: doc.mimeType,
          descricao: doc.descricao,
          anexadoPor: doc.anexadoPor,
          createdAt: doc.createdAt.toISOString(),
        })),
      });
    });

    // Deletar documento
    app.delete("/suppliers/:id/documentos/:docId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id, docId } = z
        .object({
          id: z.string(),
          docId: z.string(),
        })
        .parse(request.params);

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const documento = await auditDeps.documentRepository.findById(docId);
      if (!documento || documento.supplierId !== id) {
        return reply.status(404).send({ message: "Documento não encontrado" });
      }

      await auditDeps.documentRepository.delete(docId);

      return reply.status(204).send();
    });

    // Upload de documento (simplificado - em produção seria multipart/form-data com storage)
    app.post("/suppliers/:id/documentos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }

      const { id } = z.object({ id: z.string() }).parse(request.params);

      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const bodySchema = z.object({
        tipo: z.enum(["foto_peca", "nota_fiscal", "boleto", "comprovante_pagamento", "outros"]),
        nomeArquivo: z.string().min(1),
        arquivoUrl: z.string().url(),
        arquivoStorageKey: z.string(),
        tamanhoBytes: z.coerce.bigint(),
        mimeType: z.string(),
        descricao: z.string().optional().nullable(),
      });

      const bodyResult = bodySchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          message: "Dados inválidos",
          errors: bodyResult.error.errors,
        });
      }

      const documento = await auditDeps.documentRepository.create({
        supplierId: id,
        tipo: bodyResult.data.tipo,
        nomeArquivo: bodyResult.data.nomeArquivo,
        arquivoUrl: bodyResult.data.arquivoUrl,
        arquivoStorageKey: bodyResult.data.arquivoStorageKey,
        tamanhoBytes: bodyResult.data.tamanhoBytes,
        mimeType: bodyResult.data.mimeType,
        descricao: bodyResult.data.descricao,
        anexadoPor: request.auth.userId,
      });

      return reply.status(201).send({
        id: documento.id,
        tipo: documento.tipo,
        nomeArquivo: documento.nomeArquivo,
        arquivoUrl: documento.arquivoUrl,
        tamanhoBytes: Number(documento.tamanhoBytes),
        mimeType: documento.mimeType,
        descricao: documento.descricao,
        anexadoPor: documento.anexadoPor,
        createdAt: documento.createdAt.toISOString(),
      });
    });
  }

  // Endpoint para duplicar fornecedor
  app.post("/suppliers/:id/duplicate", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tenant = getTenant(request);

    const bodySchema = z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        status: z.string().optional(),
      })
      .optional();

    const bodyResult = bodySchema.safeParse(request.body);

    const supplier = await deps.supplierRepository.findById(id);
    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    const access = await checkOrganizationAccess(
      deps.organizationRepository,
      request.auth.userId,
      supplier.orgId,
    );
    if (!access.hasAccess) {
      return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
    }

    // Criar cópia do fornecedor
    const novoSupplier = await deps.supplierRepository.create(
      {
        orgId: tenant.orgId,
        name: bodyResult.success && bodyResult.data?.name ? bodyResult.data.name : `${supplier.name} (Cópia)`,
        email: bodyResult.success && bodyResult.data?.email !== undefined ? bodyResult.data.email : supplier.email,
        phone: bodyResult.success && bodyResult.data?.phone !== undefined ? bodyResult.data.phone : supplier.phone,
        document: supplier.document,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zipCode: supplier.zipCode,
        status: bodyResult.success && bodyResult.data?.status ? bodyResult.data.status : supplier.status,
        notes: supplier.notes,
        createdBy: request.auth.userId,
        updatedBy: request.auth.userId,
      },
      {
        actorId: request.auth.userId,
        orgId: tenant.orgId,
        ipAddress: request.ip || request.socket.remoteAddress || null,
        userAgent: request.headers["user-agent"] || null,
      },
    );

    return reply.status(201).send(novoSupplier);
  });

  // ============================================
  // TAGS/CATEGORIAS
  // ============================================
  if (auditDeps?.tagRepository) {
    // Listar tags da organização
    app.get("/suppliers/tags", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const tenant = getTenant(request);
      const tags = await auditDeps.tagRepository.findByOrgId(tenant.orgId);
      return reply.send({ tags });
    });

    // Criar tag
    app.post("/suppliers/tags", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const tenant = getTenant(request);
      const body = z.object({
        name: z.string().min(1),
        color: z.string().optional().nullable(),
      }).parse(request.body);
      const tag = await auditDeps.tagRepository.create({
        orgId: tenant.orgId,
        name: body.name,
        color: body.color,
      });
      return reply.status(201).send(tag);
    });

    // Atualizar tag
    app.put("/suppliers/tags/:id", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.object({
        name: z.string().min(1).optional(),
        color: z.string().optional().nullable(),
      }).parse(request.body);
      const tag = await auditDeps.tagRepository.update(id, body);
      return reply.send(tag);
    });

    // Deletar tag
    app.delete("/suppliers/tags/:id", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      await auditDeps.tagRepository.delete(id);
      return reply.status(204).send();
    });

    // Adicionar tag ao fornecedor
    app.post("/suppliers/:id/tags/:tagId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, tagId } = z.object({
        id: z.string(),
        tagId: z.string(),
      }).parse(request.params);
      await auditDeps.tagRepository.addTagToSupplier(id, tagId);
      return reply.status(204).send();
    });

    // Remover tag do fornecedor
    app.delete("/suppliers/:id/tags/:tagId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, tagId } = z.object({
        id: z.string(),
        tagId: z.string(),
      }).parse(request.params);
      await auditDeps.tagRepository.removeTagFromSupplier(id, tagId);
      return reply.status(204).send();
    });

    // Listar tags do fornecedor
    app.get("/suppliers/:id/tags", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const tags = await auditDeps.tagRepository.getSupplierTags(id);
      return reply.send({ tags });
    });
  }

  // ============================================
  // AVALIAÇÕES
  // ============================================
  if (auditDeps?.avaliacaoRepository) {
    // Criar/Atualizar avaliação
    app.post("/suppliers/:id/avaliacoes", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.object({
        nota: z.number().min(1).max(5),
        comentario: z.string().optional().nullable(),
      }).parse(request.body);
      const avaliacao = await auditDeps.avaliacaoRepository.create({
        supplierId: id,
        userId: request.auth.userId,
        nota: body.nota,
        comentario: body.comentario,
      });
      return reply.status(201).send(avaliacao);
    });

    // Listar avaliações do fornecedor
    app.get("/suppliers/:id/avaliacoes", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const avaliacoes = await auditDeps.avaliacaoRepository.findBySupplierId(id);
      const stats = await auditDeps.avaliacaoRepository.getAverageRating(id);
      return reply.send({ avaliacoes, stats });
    });

    // Deletar avaliação
    app.delete("/suppliers/:id/avaliacoes/:avaliacaoId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { avaliacaoId } = z.object({ avaliacaoId: z.string() }).parse(request.params);
      await auditDeps.avaliacaoRepository.delete(avaliacaoId);
      return reply.status(204).send();
    });
  }

  // ============================================
  // HISTÓRICO DE PREÇOS
  // ============================================
  if (auditDeps?.historicoPrecoRepository) {
    // Criar registro de preço
    app.post("/suppliers/:id/historico-precos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.object({
        insumoId: z.string().optional().nullable(),
        insumoNome: z.string().min(1),
        preco: z.number().positive(),
        quantidade: z.number().positive().optional().nullable(),
        unidade: z.string().optional().nullable(),
        fichaCustoId: z.string().optional().nullable(),
        dataCompra: z.string().datetime(),
      }).parse(request.body);
      const historico = await auditDeps.historicoPrecoRepository.create({
        supplierId: id,
        insumoId: body.insumoId || null,
        insumoNome: body.insumoNome,
        preco: body.preco,
        quantidade: body.quantidade || null,
        unidade: body.unidade || null,
        fichaCustoId: body.fichaCustoId || null,
        dataCompra: new Date(body.dataCompra),
      });
      return reply.status(201).send(historico);
    });

    // Listar histórico de preços
    app.get("/suppliers/:id/historico-precos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const query = z.object({
        insumoId: z.string().optional(),
        dataInicio: z.string().datetime().optional(),
        dataFim: z.string().datetime().optional(),
      }).parse(request.query || {});
      const historicos = await auditDeps.historicoPrecoRepository.findBySupplierId(id, {
        insumoId: query.insumoId,
        dataInicio: query.dataInicio ? new Date(query.dataInicio) : undefined,
        dataFim: query.dataFim ? new Date(query.dataFim) : undefined,
      });
      return reply.send({ historicos });
    });

    // Estatísticas de preços
    app.get("/suppliers/:id/historico-precos/stats", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const query = z.object({
        insumoId: z.string().optional(),
      }).parse(request.query || {});
      const stats = await auditDeps.historicoPrecoRepository.getPriceStats(id, query.insumoId);
      return reply.send(stats);
    });
  }

  // ============================================
  // ALERTAS
  // ============================================
  if (auditDeps?.alertaRepository) {
    // Listar alertas
    app.get("/suppliers/alertas", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const tenant = getTenant(request);
      const query = z.object({
        supplierId: z.string().optional(),
        tipo: z.string().optional(),
        status: z.string().optional(),
        lido: z.coerce.boolean().optional(),
      }).parse(request.query || {});
      const alertas = await auditDeps.alertaRepository.findByOrgId(tenant.orgId, {
        supplierId: query.supplierId,
        tipo: query.tipo,
        status: query.status,
        lido: query.lido,
      });
      return reply.send({ alertas });
    });

    // Marcar alerta como lido
    app.post("/suppliers/alertas/:id/ler", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const alerta = await auditDeps.alertaRepository.markAsRead(id, request.auth.userId);
      return reply.send(alerta);
    });

    // Contar alertas não lidos
    app.get("/suppliers/alertas/nao-lidos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const tenant = getTenant(request);
      const query = z.object({
        supplierId: z.string().optional(),
      }).parse(request.query || {});
      const count = await auditDeps.alertaRepository.getUnreadCount(tenant.orgId, query.supplierId);
      return reply.send({ count });
    });
  }

  // ============================================
  // NOTAS
  // ============================================
  if (auditDeps?.notaRepository) {
    // Listar notas
    app.get("/suppliers/:id/notas", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const query = z.object({
        tipo: z.string().optional(),
        criadoPor: z.string().optional(),
        busca: z.string().optional(),
      }).parse(request.query || {});

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const notas = await auditDeps.notaRepository.findBySupplierId(id, {
        tipo: query.tipo,
        criadoPor: query.criadoPor,
        busca: query.busca,
      });

      return reply.send({ notas });
    });

    // Criar nota
    app.post("/suppliers/:id/notas", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.object({
        titulo: z.string().max(255).optional().nullable(),
        conteudo: z.string().min(1),
        tipo: z.enum(["nota", "lembrete", "observacao"]).default("nota").optional(),
      }).parse(request.body || {});

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const nota = await auditDeps.notaRepository.create({
        supplierId: id,
        orgId: supplier.orgId,
        titulo: body.titulo,
        conteudo: body.conteudo,
        tipo: body.tipo || "nota",
        criadoPor: request.auth.userId,
      });

      return reply.status(201).send(nota);
    });

    // Atualizar nota
    app.put("/suppliers/:id/notas/:notaId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, notaId } = z.object({
        id: z.string(),
        notaId: z.string(),
      }).parse(request.params);
      const body = z.object({
        titulo: z.string().max(255).optional().nullable(),
        conteudo: z.string().min(1).optional(),
        tipo: z.enum(["nota", "lembrete", "observacao"]).optional(),
      }).parse(request.body || {});

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      // Verificar se a nota existe e pertence ao fornecedor
      const nota = await auditDeps.notaRepository.findById(notaId);
      if (!nota || nota.supplierId !== id) {
        return reply.status(404).send({ message: "Nota não encontrada" });
      }

      const notaAtualizada = await auditDeps.notaRepository.update(notaId, body);
      return reply.send(notaAtualizada);
    });

    // Deletar nota
    app.delete("/suppliers/:id/notas/:notaId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, notaId } = z.object({
        id: z.string(),
        notaId: z.string(),
      }).parse(request.params);

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      // Verificar se a nota existe e pertence ao fornecedor
      const nota = await auditDeps.notaRepository.findById(notaId);
      if (!nota || nota.supplierId !== id) {
        return reply.status(404).send({ message: "Nota não encontrada" });
      }

      await auditDeps.notaRepository.delete(notaId);
      return reply.status(204).send();
    });
  }

  // ============================================
  // CONTATOS
  // ============================================
  if (auditDeps?.contactRepository) {
    // Listar contatos
    app.get("/suppliers/:id/contatos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const contatos = await auditDeps.contactRepository.findBySupplierId(id);
      return reply.send({ contatos });
    });

    // Criar contato
    app.post("/suppliers/:id/contatos", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.object({
        name: z.string().min(1),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        cargo: z.string().optional().nullable(),
        isPrincipal: z.boolean().default(false).optional(),
        notes: z.string().max(500).optional().nullable(),
      }).parse(request.body || {});

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      const contato = await auditDeps.contactRepository.create({
        supplierId: id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        cargo: body.cargo,
        isPrincipal: body.isPrincipal || false,
        notes: body.notes,
      });

      return reply.status(201).send(contato);
    });

    // Atualizar contato
    app.put("/suppliers/:id/contatos/:contactId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, contactId } = z.object({
        id: z.string(),
        contactId: z.string(),
      }).parse(request.params);
      const body = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        cargo: z.string().optional().nullable(),
        isPrincipal: z.boolean().optional(),
        notes: z.string().max(500).optional().nullable(),
      }).parse(request.body || {});

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      // Verificar se o contato existe e pertence ao fornecedor
      const contato = await auditDeps.contactRepository.findById(contactId);
      if (!contato || contato.supplierId !== id) {
        return reply.status(404).send({ message: "Contato não encontrado" });
      }

      const contatoAtualizado = await auditDeps.contactRepository.update(contactId, body);
      return reply.send(contatoAtualizado);
    });

    // Deletar contato
    app.delete("/suppliers/:id/contatos/:contactId", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, contactId } = z.object({
        id: z.string(),
        contactId: z.string(),
      }).parse(request.params);

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      // Verificar se o contato existe e pertence ao fornecedor
      const contato = await auditDeps.contactRepository.findById(contactId);
      if (!contato || contato.supplierId !== id) {
        return reply.status(404).send({ message: "Contato não encontrado" });
      }

      await auditDeps.contactRepository.delete(contactId);
      return reply.status(204).send();
    });

    // Definir contato principal
    app.post("/suppliers/:id/contatos/:contactId/principal", async (request, reply) => {
      if (!request.auth) {
        return reply.status(401).send({ message: "Autenticação necessária" });
      }
      const { id, contactId } = z.object({
        id: z.string(),
        contactId: z.string(),
      }).parse(request.params);

      // Verificar se o fornecedor existe e o usuário tem acesso
      const supplier = await deps.supplierRepository.findById(id);
      if (!supplier) {
        return reply.status(404).send({ message: "Fornecedor não encontrado" });
      }

      const access = await checkOrganizationAccess(
        deps.organizationRepository,
        request.auth.userId,
        supplier.orgId,
      );
      if (!access.hasAccess) {
        return reply.status(403).send({ message: access.error || "Acesso negado à organização" });
      }

      // Verificar se o contato existe e pertence ao fornecedor
      const contato = await auditDeps.contactRepository.findById(contactId);
      if (!contato || contato.supplierId !== id) {
        return reply.status(404).send({ message: "Contato não encontrado" });
      }

      await auditDeps.contactRepository.setPrincipal(id, contactId);
      const contatoAtualizado = await auditDeps.contactRepository.findById(contactId);
      return reply.send(contatoAtualizado);
    });
  }

  // ============================================
  // UPLOAD REAL DE DOCUMENTOS
  // ============================================
  if (auditDeps?.documentRepository) {
    await registerUploadDocumentoSupplierRoute(app, {
      supplierRepository: deps.supplierRepository,
      organizationRepository: deps.organizationRepository,
      documentRepository: auditDeps.documentRepository,
    });
  }
}
