/**
 * Compliance Module
 * Módulo para funcionalidades de compliance (LGPD, etc.)
 */

import type { FastifyInstance } from "fastify";
import { registerLgpdDeleteRoute } from "./http/lgpd-delete.route";
import { registerLgpdExportRoute } from "./http/lgpd-export.route";

export async function registerComplianceModule(app: FastifyInstance) {
  await registerLgpdExportRoute(app);
  await registerLgpdDeleteRoute(app);
}
