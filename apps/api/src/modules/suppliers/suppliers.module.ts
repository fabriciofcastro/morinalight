import type { FastifyInstance } from "fastify";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { registerSuppliersRoutes } from "./http/suppliers.routes";
import { PrismaSupplierRepository } from "./infra/prisma/prisma-supplier.repository";
import { PrismaAlertaSupplierRepositoryImpl } from "./infra/prisma/prisma-supplier-alerta.repository";
import { PrismaSupplierAuditLogRepository } from "./infra/prisma/prisma-supplier-audit-log.repository";
import { PrismaAvaliacaoSupplierRepositoryImpl } from "./infra/prisma/prisma-supplier-avaliacao.repository";
import { PrismaSupplierContactRepository } from "./infra/prisma/prisma-supplier-contact.repository";
import { PrismaSupplierDocumentRepository } from "./infra/prisma/prisma-supplier-document.repository";
import { PrismaHistoricoPrecoSupplierRepositoryImpl } from "./infra/prisma/prisma-supplier-historico-preco.repository";
import { PrismaNotaSupplierRepository } from "./infra/prisma/prisma-supplier-nota.repository";
import { PrismaSupplierTagRepositoryImpl } from "./infra/prisma/prisma-supplier-tag.repository";
import { PrismaSupplierVersionRepository } from "./infra/prisma/prisma-supplier-version.repository";
import type { SupplierRepository } from "./repositories/supplier.repository";

export type SuppliersModuleOptions = {
  supplierRepository?: SupplierRepository;
  organizationRepository?: OrganizationRepository;
};

export type SuppliersDeps = {
  supplierRepository: SupplierRepository;
  organizationRepository: OrganizationRepository;
  auditRepository: PrismaSupplierAuditLogRepository;
  versionRepository: PrismaSupplierVersionRepository;
  documentRepository: PrismaSupplierDocumentRepository;
};

export async function registerSuppliersModule(
  app: FastifyInstance,
  options: SuppliersModuleOptions = {},
) {
  const auditRepository = new PrismaSupplierAuditLogRepository();
  const versionRepository = new PrismaSupplierVersionRepository();
  const documentRepository = new PrismaSupplierDocumentRepository();
  const tagRepository = new PrismaSupplierTagRepositoryImpl();
  const avaliacaoRepository = new PrismaAvaliacaoSupplierRepositoryImpl();
  const historicoPrecoRepository = new PrismaHistoricoPrecoSupplierRepositoryImpl();
  const alertaRepository = new PrismaAlertaSupplierRepositoryImpl();
  const contactRepository = new PrismaSupplierContactRepository();
  const notaRepository = new PrismaNotaSupplierRepository();
  const supplierRepository =
    options.supplierRepository ??
    new PrismaSupplierRepository(undefined, auditRepository, versionRepository);

  if (!options.organizationRepository) {
    throw new Error("SuppliersModule: organizationRepository é obrigatório");
  }

  // Aplicar hook de tenant nas rotas de fornecedores se organizationRepository estiver disponível
  registerTenantHook(app, {
    organizationRepository: options.organizationRepository,
    extractOrgId: extractOrgIdFromParamsOrHeaders,
    routes: ["/suppliers"],
  });

  await registerSuppliersRoutes(
    app,
    {
      supplierRepository,
      organizationRepository: options.organizationRepository,
    },
    {
      auditRepository,
      versionRepository,
      documentRepository,
      tagRepository,
      avaliacaoRepository,
      historicoPrecoRepository,
      alertaRepository,
      contactRepository,
      notaRepository,
    },
  );

  // Register import routes
  const { registerSupplierImportRoutes } = await import("./http/suppliers-import.routes");
  await registerSupplierImportRoutes(app, {
    supplierRepository,
    organizationRepository: options.organizationRepository,
  });

  return {
    supplierRepository,
    auditRepository,
    versionRepository,
    documentRepository,
    tagRepository,
    avaliacaoRepository,
    historicoPrecoRepository,
    alertaRepository,
    contactRepository,
    notaRepository,
  };
}
