import type { PrismaClient } from "@prisma/client";

export type AlertaSupplierRecord = {
  id: string;
  supplierId: string | null;
  orgId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  prioridade: string;
  status: string;
  dataVencimento: Date | null;
  lido: boolean;
  lidoEm: Date | null;
  lidoPor: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAlertaSupplierInput = {
  supplierId?: string | null;
  orgId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  prioridade?: string;
  status?: string;
  dataVencimento?: Date | null;
};

export type UpdateAlertaSupplierInput = {
  status?: string;
  lido?: boolean;
  lidoPor?: string | null;
};

export interface AlertaSupplierRepository {
  create(input: CreateAlertaSupplierInput): Promise<AlertaSupplierRecord>;
  update(id: string, input: UpdateAlertaSupplierInput): Promise<AlertaSupplierRecord>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AlertaSupplierRecord | null>;
  findByOrgId(
    orgId: string,
    filters?: { supplierId?: string; tipo?: string; status?: string; lido?: boolean },
  ): Promise<AlertaSupplierRecord[]>;
  findBySupplierId(supplierId: string): Promise<AlertaSupplierRecord[]>;
  markAsRead(id: string, userId: string): Promise<AlertaSupplierRecord>;
  getUnreadCount(orgId: string, supplierId?: string): Promise<number>;
}

export class PrismaAlertaSupplierRepository implements AlertaSupplierRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateAlertaSupplierInput): Promise<AlertaSupplierRecord> {
    const alerta = await this.prisma.alertaSupplier.create({
      data: {
        supplierId: input.supplierId || null,
        orgId: input.orgId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensagem: input.mensagem,
        prioridade: input.prioridade || "media",
        status: input.status || "pendente",
        dataVencimento: input.dataVencimento || null,
      },
    });
    return this.mapToRecord(alerta);
  }

  async update(id: string, input: UpdateAlertaSupplierInput): Promise<AlertaSupplierRecord> {
    const updateData: any = {
      updatedAt: new Date(),
    };
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.lido !== undefined) {
      updateData.lido = input.lido;
      if (input.lido) {
        updateData.lidoEm = new Date();
      } else {
        updateData.lidoEm = null;
      }
    }
    if (input.lidoPor !== undefined) {
      updateData.lidoPor = input.lidoPor;
    }

    const alerta = await this.prisma.alertaSupplier.update({
      where: { id },
      data: updateData,
    });
    return this.mapToRecord(alerta);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.alertaSupplier.delete({ where: { id } });
  }

  async findById(id: string): Promise<AlertaSupplierRecord | null> {
    const alerta = await this.prisma.alertaSupplier.findUnique({ where: { id } });
    return alerta ? this.mapToRecord(alerta) : null;
  }

  async findByOrgId(
    orgId: string,
    filters?: { supplierId?: string; tipo?: string; status?: string; lido?: boolean },
  ): Promise<AlertaSupplierRecord[]> {
    const where: any = { orgId };
    if (filters?.supplierId) {
      where.supplierId = filters.supplierId;
    }
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.lido !== undefined) {
      where.lido = filters.lido;
    }

    const alertas = await this.prisma.alertaSupplier.findMany({
      where,
      orderBy: [{ prioridade: "desc" }, { createdAt: "desc" }],
    });
    return alertas.map(this.mapToRecord);
  }

  async findBySupplierId(supplierId: string): Promise<AlertaSupplierRecord[]> {
    const alertas = await this.prisma.alertaSupplier.findMany({
      where: { supplierId },
      orderBy: [{ prioridade: "desc" }, { createdAt: "desc" }],
    });
    return alertas.map(this.mapToRecord);
  }

  async markAsRead(id: string, userId: string): Promise<AlertaSupplierRecord> {
    const alerta = await this.prisma.alertaSupplier.update({
      where: { id },
      data: {
        lido: true,
        lidoEm: new Date(),
        lidoPor: userId,
      },
    });
    return this.mapToRecord(alerta);
  }

  async getUnreadCount(orgId: string, supplierId?: string): Promise<number> {
    const where: any = {
      orgId,
      lido: false,
    };
    if (supplierId) {
      where.supplierId = supplierId;
    }
    return this.prisma.alertaSupplier.count({ where });
  }

  private mapToRecord(alerta: {
    id: string;
    supplierId: string | null;
    orgId: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    prioridade: string;
    status: string;
    dataVencimento: Date | null;
    lido: boolean;
    lidoEm: Date | null;
    lidoPor: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AlertaSupplierRecord {
    return {
      id: alerta.id,
      supplierId: alerta.supplierId,
      orgId: alerta.orgId,
      tipo: alerta.tipo,
      titulo: alerta.titulo,
      mensagem: alerta.mensagem,
      prioridade: alerta.prioridade,
      status: alerta.status,
      dataVencimento: alerta.dataVencimento,
      lido: alerta.lido,
      lidoEm: alerta.lidoEm,
      lidoPor: alerta.lidoPor,
      createdAt: alerta.createdAt,
      updatedAt: alerta.updatedAt,
    };
  }
}
