import { getPrisma } from "../../../../infra/database/prisma.service";
import { PrismaAlertaSupplierRepository } from "../../repositories/supplier-alerta.repository";

export class PrismaAlertaSupplierRepositoryImpl extends PrismaAlertaSupplierRepository {
  constructor() {
    const prisma = getPrisma();
    super(prisma);
  }
}

