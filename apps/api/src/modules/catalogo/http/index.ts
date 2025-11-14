import type {
  CategoryRepository,
  ProdutoAuditoriaRepository,
  ProductVariantRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { registerApproveProductRoute } from "./approve-product.route";
import { registerCreateCategoryRoute } from "./create-category.route";
import { registerCreateProductRoute } from "./create-product.route";
import { registerCreateVariantRoute } from "./create-variant.route";
import { registerGetProductRoute } from "./get-product.route";
import { registerListAuditRoute } from "./list-audit.route";
import { registerListAuditFeedRoute } from "./list-audit-feed.route";
import { registerListCategoriesRoute } from "./list-categories.route";
import { registerListProductsRoute } from "./list-products.route";
import { registerListVariantsRoute } from "./list-variants.route";
import { registerRejectProductRoute } from "./reject-product.route";
import { registerUpdateCategoryRoute } from "./update-category.route";
import { registerUpdateProductRoute } from "./update-product.route";
import { registerUpdateVariantRoute } from "./update-variant.route";

type RegisterCatalogoHttpOptions = {
  produtoRepository: ProdutoRepository;
  auditoriaRepository?: ProdutoAuditoriaRepository;
  categoriaRepository?: CategoryRepository;
  varianteRepository?: ProductVariantRepository;
  eventBus?: DomainEventBus;
};

export async function registerCatalogoHttp(
  app: FastifyInstance,
  options: RegisterCatalogoHttpOptions,
) {
  await registerCreateProductRoute(app, options);
  await registerUpdateProductRoute(app, options);
  await registerApproveProductRoute(app, options);
  await registerRejectProductRoute(app, options);
  await registerListProductsRoute(app, options);
  await registerGetProductRoute(app, options);

  if (options.varianteRepository) {
    await registerCreateVariantRoute(app, {
      produtoRepository: options.produtoRepository,
      varianteRepository: options.varianteRepository,
    });
    await registerUpdateVariantRoute(app, {
      varianteRepository: options.varianteRepository,
    });
    await registerListVariantsRoute(app, {
      varianteRepository: options.varianteRepository,
    });
  }

  if (options.categoriaRepository) {
    await registerCreateCategoryRoute(app, {
      categoriaRepository: options.categoriaRepository,
    });
    await registerUpdateCategoryRoute(app, {
      categoriaRepository: options.categoriaRepository,
    });
    await registerListCategoriesRoute(app, {
      categoriaRepository: options.categoriaRepository,
    });
  }

  if (options.auditoriaRepository) {
    await registerListAuditRoute(app, {
      produtoRepository: options.produtoRepository,
      auditoriaRepository: options.auditoriaRepository,
    });
    await registerListAuditFeedRoute(app, {
      produtoRepository: options.produtoRepository,
      auditoriaRepository: options.auditoriaRepository,
    });
  }
}
