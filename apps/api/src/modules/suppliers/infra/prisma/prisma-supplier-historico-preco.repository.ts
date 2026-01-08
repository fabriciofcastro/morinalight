import { getPrisma } from "../../../../infra/database/prisma.service";
import { PrismaHistoricoPrecoSupplierRepository } from "../../repositories/supplier-historico-preco.repository";

export class PrismaHistoricoPrecoSupplierRepositoryImpl extends PrismaHistoricoPrecoSupplierRepository {
  constructor() {
    const prisma = getPrisma();
    super(prisma);
  }
}
