import type { FastifyInstance } from "fastify";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { registerSuppliersRoutes } from "./http/suppliers.routes";
import { PrismaSupplierRepository } from "./infra/prisma/prisma-supplier.repository";
import type { SupplierRepository } from "./repositories/supplier.repository";

export type SuppliersModuleOptions = {
  supplierRepository?: SupplierRepository;
  organizationRepository?: OrganizationRepository;
};

export async function registerSuppliersModule(
  app: FastifyInstance,
  options: SuppliersModuleOptions = {},
) {
  const supplierRepository = options.supplierRepository ?? new PrismaSupplierRepository();

  if (!options.organizationRepository) {
    throw new Error("SuppliersModule: organizationRepository é obrigatório");
  }

  // Aplicar hook de tenant nas rotas de fornecedores se organizationRepository estiver disponível
  registerTenantHook(app, {
    organizationRepository: options.organizationRepository,
    extractOrgId: extractOrgIdFromParamsOrHeaders,
    routes: ["/suppliers"],
  });

  await registerSuppliersRoutes(app, {
    supplierRepository,
    organizationRepository: options.organizationRepository,
  });

  return {
    supplierRepository,
  };
}
