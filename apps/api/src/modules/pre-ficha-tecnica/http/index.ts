import type { FastifyInstance } from "fastify";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";
import type { DomainEventBus } from "@morina/shared-kernel";
import { registerCreatePreFichaTecnicaRoute } from "./create-pre-ficha-tecnica.route";
import { registerListPreFichasTecnicasRoute } from "./list-pre-fichas-tecnicas.route";
import { registerGetPreFichaTecnicaRoute } from "./get-pre-ficha-tecnica.route";
import { registerSubmeterPreFichaTecnicaRoute } from "./submeter-pre-ficha-tecnica.route";
import { registerAprovarTecnicamentePreFichaTecnicaRoute } from "./aprovar-tecnicamente-pre-ficha-tecnica.route";
import { registerReprovarPreFichaTecnicaRoute } from "./reprovar-pre-ficha-tecnica.route";
import { registerAprovarDiretoriaPreFichaTecnicaRoute } from "./aprovar-diretoria-pre-ficha-tecnica.route";
import { registerListarVersoesPreFichaTecnicaRoute } from "./listar-versoes-pre-ficha-tecnica.route";
import { registerUpdatePreFichaTecnicaRoute } from "./update-pre-ficha-tecnica.route";
import { registerAtualizarChecklistTecnicoRoute } from "./atualizar-checklist-tecnico.route";
import { registerExportarPdfPreFichaTecnicaRoute } from "./exportar-pdf-pre-ficha-tecnica.route";
import { registerCompararVersoesPreFichaTecnicaRoute } from "./comparar-versoes-pre-ficha-tecnica.route";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerPreFichaTecnicaRoutes(
  app: FastifyInstance,
  deps: Dependencies,
) {
  await registerCreatePreFichaTecnicaRoute(app, deps);
  await registerListPreFichasTecnicasRoute(app, deps);
  await registerGetPreFichaTecnicaRoute(app, deps);
  await registerSubmeterPreFichaTecnicaRoute(app, deps);
  await registerAprovarTecnicamentePreFichaTecnicaRoute(app, deps);
  await registerReprovarPreFichaTecnicaRoute(app, deps);
  await registerAprovarDiretoriaPreFichaTecnicaRoute(app, deps);
  await registerListarVersoesPreFichaTecnicaRoute(app);
  await registerUpdatePreFichaTecnicaRoute(app, deps);
  await registerAtualizarChecklistTecnicoRoute(app, deps);
  await registerExportarPdfPreFichaTecnicaRoute(app, deps);
  await registerCompararVersoesPreFichaTecnicaRoute(app, deps);
}












