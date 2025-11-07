import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { registerApproveProductRoute } from "./approve-product.route";
import { registerCreateProductRoute } from "./create-product.route";
import { registerListAuditRoute } from "./list-audit.route";
import { registerRejectProductRoute } from "./reject-product.route";

type RegisterCatalogoHttpOptions = {
  produtoRepository: ProdutoRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export async function registerCatalogoHttp(
  app: FastifyInstance,
  options: RegisterCatalogoHttpOptions,
) {
  await registerCreateProductRoute(app, options);
  await registerApproveProductRoute(app, options);
  await registerRejectProductRoute(app, options);
  if (options.auditoriaRepository) {
    await registerListAuditRoute(app, {
      produtoRepository: options.produtoRepository,
      auditoriaRepository: options.auditoriaRepository,
    });
  }
}
