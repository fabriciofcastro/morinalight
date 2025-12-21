import type { FastifyInstance } from "fastify";
import type {
  ClienteRepository,
  ComissaoRepository,
  RepresentanteRepository,
} from "../domain/repositories";
import { registerAssinarComissaoRoute } from "./assinar-comissao.route";
import { registerCreateClienteRoute } from "./create-cliente.route";
import { registerCreateRepresentanteRoute } from "./create-representante.route";
import { registerListClientesRoute } from "./list-clientes.route";
import { registerListComissoesRoute } from "./list-comissoes.route";
import { registerListRepresentantesRoute } from "./list-representantes.route";
import { registerPagarComissaoRoute } from "./pagar-comissao.route";
import { registerUpdateClienteRoute } from "./update-cliente.route";

type ClientesHttpDeps = {
  clienteRepository: ClienteRepository;
  representanteRepository: RepresentanteRepository;
  comissaoRepository: ComissaoRepository;
};

export async function registerClientesHttpRoutes(app: FastifyInstance, deps: ClientesHttpDeps) {
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
