/**
 * Prisma Client Export
 * 
 * Centraliza a exportação do cliente Prisma para uso em rotas HTTP.
 * Usa o serviço de Prisma que já configura middlewares e conexão.
 */

import { getPrisma } from "../src/infra/database/prisma.service";

export const prisma = getPrisma();








