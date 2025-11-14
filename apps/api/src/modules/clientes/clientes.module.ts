import type { FastifyInstance } from "fastify";
import { env } from "../../core/config/env";
import { registerTenantHook } from "../../core/tenant/tenant.middleware";
import { extractOrgIdFromParamsOrHeaders } from "../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../organizations/repositories/organization.repository";
import { registerClientesHttpRoutes } from "./http";
import { PrismaClienteRepository } from "./infra/prisma/prisma-cliente.repository";
import { PrismaRepresentanteRepository } from "./infra/prisma/prisma-representante.repository";
import { PrismaComissaoRepository } from "./infra/prisma/prisma-comissao.repository";
import { PrismaContratoRepository } from "./infra/prisma/prisma-contrato.repository";
import { PrismaVendaRepository } from "./infra/prisma/prisma-venda.repository";
import { EmillenniumClient } from "./infra/integrations/emillennium-client";
import type {
  ClienteRepository,
  RepresentanteRepository,
  ComissaoRepository,
  ContratoRepository,
} from "./domain/repositories";
import type { VendaRepository } from "./infra/services/venda-sync.service";

export type ClientesModuleOptions = {
  clienteRepository?: ClienteRepository;
  representanteRepository?: RepresentanteRepository;
  comissaoRepository?: ComissaoRepository;
  contratoRepository?: ContratoRepository;
  vendaRepository?: VendaRepository;
  organizationRepository?: OrganizationRepository;
  emillenniumClient?: EmillenniumClient;
};

export async function registerClientesModule(
  app: FastifyInstance,
  options: ClientesModuleOptions = {},
) {
  const clienteRepository =
    options.clienteRepository ??
    (process.env.DATABASE_URL ? new PrismaClienteRepository() : undefined);

  const representanteRepository =
    options.representanteRepository ??
    (process.env.DATABASE_URL ? new PrismaRepresentanteRepository() : undefined);

  const comissaoRepository =
    options.comissaoRepository ??
    (process.env.DATABASE_URL ? new PrismaComissaoRepository() : undefined);

  const contratoRepository =
    options.contratoRepository ??
    (process.env.DATABASE_URL ? new PrismaContratoRepository() : undefined);

  const vendaRepository =
    options.vendaRepository ??
    (process.env.DATABASE_URL ? new PrismaVendaRepository() : undefined);

  // Criar cliente do e-millennium se configurado
  let emillenniumClient: EmillenniumClient | undefined;
  if (
    env.EMILLENNIUM_BASE_URL &&
    env.EMILLENNIUM_USERNAME &&
    env.EMILLENNIUM_PASSWORD
  ) {
    emillenniumClient = new EmillenniumClient({
      baseUrl: env.EMILLENNIUM_BASE_URL,
      username: env.EMILLENNIUM_USERNAME,
      password: env.EMILLENNIUM_PASSWORD,
      tenantId: env.EMILLENNIUM_TENANT_ID,
      vitrineId: env.EMILLENNIUM_VITRINE_ID,
    });
  }

  // Aplicar hook de tenant nas rotas de clientes
  if (options.organizationRepository && clienteRepository) {
    registerTenantHook(app, {
      organizationRepository: options.organizationRepository,
      extractOrgId: extractOrgIdFromParamsOrHeaders,
      routes: ["/clientes", "/representantes", "/comissoes"],
    });
  }

  // Registrar rotas HTTP
  if (clienteRepository && representanteRepository && comissaoRepository) {
    await registerClientesHttpRoutes(app, {
      clienteRepository,
      representanteRepository,
      comissaoRepository,
    });
  }

  app.log.info("Módulo Clientes registrado");

  return {
    clienteRepository,
    representanteRepository,
    comissaoRepository,
    contratoRepository,
    vendaRepository,
    emillenniumClient,
  };
}


