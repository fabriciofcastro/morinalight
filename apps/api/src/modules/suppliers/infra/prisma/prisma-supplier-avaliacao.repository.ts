import { getPrisma } from "../../../../infra/database/prisma.service";
import { PrismaAvaliacaoSupplierRepository } from "../../repositories/supplier-avaliacao.repository";

export class PrismaAvaliacaoSupplierRepositoryImpl extends PrismaAvaliacaoSupplierRepository {
  constructor() {
    const prisma = getPrisma();
    super(prisma);
  }
}
