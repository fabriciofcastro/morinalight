/**
 * Prisma Client Export
 * 
 * Centraliza a exportação do cliente Prisma para uso em repositórios.
 * Usa o serviço de Prisma que já configura middlewares e conexão.
 */

import { getPrisma } from "../database/prisma.service";

export const prisma = getPrisma();


