import type { FastifyInstance } from "fastify";
import type {
  ClienteRepository,
  RepresentanteRepository,
  ComissaoRepository,
} from "../domain/repositories";
import { registerCreateClienteRoute } from "./create-cliente.route";
import { registerListClientesRoute } from "./list-clientes.route";
import { registerUpdateClienteRoute } from "./update-cliente.route";
import { registerCreateRepresentanteRoute } from "./create-representante.route";
import { registerListRepresentantesRoute } from "./list-representantes.route";
import { registerListComissoesRoute } from "./list-comissoes.route";
import { registerAssinarComissaoRoute } from "./assinar-comissao.route";
import { registerPagarComissaoRoute } from "./pagar-comissao.route";

type ClientesHttpDeps = {
  clienteRepository: ClienteRepository;
  representanteRepository: RepresentanteRepository;
  comissaoRepository: ComissaoRepository;
};

export async function registerClientesHttpRoutes(
  app: FastifyInstance,
  deps: ClientesHttpDeps,
) {
  await registerCreateClienteRoute(app, {
    clienteRepository: deps.clienteRepository,
  });

  await registerListClientesRoute(app, {
    clienteRepository: deps.clienteRepository,
  });

  await registerUpdateClienteRoute(app, {
    clienteRepository: deps.clienteRepository,
  });

  await registerCreateRepresentanteRoute(app, {
    clienteRepository: deps.clienteRepository,
    representanteRepository: deps.representanteRepository,
  });

  await registerListRepresentantesRoute(app, {
    representanteRepository: deps.representanteRepository,
  });

  await registerListComissoesRoute(app, {
    comissaoRepository: deps.comissaoRepository,
  });

  await registerAssinarComissaoRoute(app, {
    comissaoRepository: deps.comissaoRepository,
  });

  await registerPagarComissaoRoute(app, {
    comissaoRepository: deps.comissaoRepository,
  });
}


