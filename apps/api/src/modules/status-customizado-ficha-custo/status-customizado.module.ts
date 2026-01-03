import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaStatusCustomizadoRepository } from "./infra/prisma/prisma-status-customizado.repository";
import {
  registerCreateStatusCustomizadoRoute,
  registerListStatusCustomizadosRoute,
  registerGetStatusCustomizadoRoute,
  registerUpdateStatusCustomizadoRoute,
  registerDeleteStatusCustomizadoRoute,
} from "./http";
import type { StatusCustomizadoRepository } from "./domain/repositories/status-customizado.repository";

export type StatusCustomizadoModuleOptions = {
  statusCustomizadoRepository?: StatusCustomizadoRepository;
};

export async function registerStatusCustomizadoModule(
  app: FastifyInstance,
  options: StatusCustomizadoModuleOptions = {},
) {
  const statusCustomizadoRepository =
    options.statusCustomizadoRepository ??
    (process.env.DATABASE_URL ? new PrismaStatusCustomizadoRepository(new PrismaClient()) : undefined);

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


