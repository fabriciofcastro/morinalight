import type { FastifyInstance } from "fastify";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import type { SupplierRepository } from "./repositories/supplier.repository";
import { PrismaSupplierRepository } from "./infra/prisma/prisma-supplier.repository";
import { registerSuppliersRoutes } from "./http/suppliers.routes";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";

export type SuppliersModuleOptions = {
  supplierRepository?: SupplierRepository;
  organizationRepository?: OrganizationRepository;
};

export async function registerSuppliersModule(
  app: FastifyInstance,
  options: SuppliersModuleOptions = {},
) {
  const supplierRepository = options.supplierRepository ?? new PrismaSupplierRepository();

  // Aplicar hook de tenant nas rotas de fornecedores se organizationRepository estiver disponível
  if (options.organizationRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: ["/suppliers"],
    });
  }

  await registerSuppliersRoutes(app, {
    supplierRepository,
    organizationRepository: options.organizationRepository!,
  });
  
  return {
    supplierRepository,
  };
}

