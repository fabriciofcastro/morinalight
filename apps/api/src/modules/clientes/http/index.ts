import type { FastifyInstance } from "fastify";
import type {
  ClienteRepository,
  ComissaoRepository,
  RepresentanteRepository,
} from "../domain/repositories";
import { registerAssinarComissaoRoute } from "./assinar-comissao.route";
import { registerCreateClienteContactRoute } from "./create-cliente-contact.route";
import { registerCreateClienteRoute } from "./create-cliente.route";
import { registerCreateClienteTagRoute } from "./create-cliente-tag.route";
import { registerCreateRepresentanteRoute } from "./create-representante.route";
import { registerDeleteClienteContactRoute } from "./delete-cliente-contact.route";
import { registerListClienteContactsRoute } from "./list-cliente-contacts.route";
import { registerListClienteTagsRoute } from "./list-cliente-tags.route";
import { registerListClientesRoute } from "./list-clientes.route";
import { registerListComissoesRoute } from "./list-comissoes.route";
import { registerListRepresentantesRoute } from "./list-representantes.route";
import { registerPagarComissaoRoute } from "./pagar-comissao.route";
import { registerUpdateClienteContactRoute } from "./update-cliente-contact.route";
import { registerUpdateClienteRoute } from "./update-cliente.route";
import { registerUpdateClienteTagsRoute } from "./update-cliente-tags.route";

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

  // Rotas de tags
  await registerListClienteTagsRoute(app);
  await registerCreateClienteTagRoute(app);
  await registerUpdateClienteTagsRoute(app);

  // Rotas de contatos
  await registerListClienteContactsRoute(app);
  await registerCreateClienteContactRoute(app);
  await registerUpdateClienteContactRoute(app);
  await registerDeleteClienteContactRoute(app);
}
