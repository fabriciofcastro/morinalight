import { getPrisma } from "../../infra/database/prisma.service";

import type { FastifyInstance } from "fastify";
import type { StatusCustomizadoRepository } from "./domain/repositories/status-customizado.repository";
import {
    registerCreateStatusCustomizadoRoute,
    registerDeleteStatusCustomizadoRoute,
    registerGetStatusCustomizadoRoute,
    registerListStatusCustomizadosRoute,
    registerUpdateStatusCustomizadoRoute,
} from "./http";
import { PrismaStatusCustomizadoRepository } from "./infra/prisma/prisma-status-customizado.repository";

export type StatusCustomizadoModuleOptions = {
  statusCustomizadoRepository?: StatusCustomizadoRepository;
};

export async function registerStatusCustomizadoModule(
  app: FastifyInstance,
  options: StatusCustomizadoModuleOptions = {},
) {
  const statusCustomizadoRepository =
    options.statusCustomizadoRepository ??
    (process.env.DATABASE_URL
      ? new PrismaStatusCustomizadoRepository(getPrisma())
      : undefined);


  if (statusCustomizadoRepository) {
    await registerCreateStatusCustomizadoRoute(app, { statusCustomizadoRepository });
    await registerListStatusCustomizadosRoute(app, { statusCustomizadoRepository });
    await registerGetStatusCustomizadoRoute(app, { statusCustomizadoRepository });
    await registerUpdateStatusCustomizadoRoute(app, { statusCustomizadoRepository });
    await registerDeleteStatusCustomizadoRoute(app, { statusCustomizadoRepository });
  }

  app.log.info("✅ Módulo Status Customizado Ficha Custo registrado");

  return {
    statusCustomizadoRepository,
  };
}
