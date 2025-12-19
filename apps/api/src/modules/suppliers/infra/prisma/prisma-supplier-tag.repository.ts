import { getPrisma } from "../../../../infra/database/prisma.service";
import { PrismaSupplierTagRepository } from "../../repositories/supplier-tag.repository";

export class PrismaSupplierTagRepositoryImpl extends PrismaSupplierTagRepository {
  constructor() {
    const prisma = getPrisma();
    super(prisma);
  }
}

