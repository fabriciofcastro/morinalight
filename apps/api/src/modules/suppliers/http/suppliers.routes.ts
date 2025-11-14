import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireOrganizationAccess } from "../../../core/auth/rbac.guards";
import { getTenant } from "../../../core/tenant/tenant.utils";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import type { SupplierRepository } from "../repositories/supplier.repository";

const createSupplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  zipCode: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
});

const updateSupplierSchema = createSupplierSchema.partial();

const querySchema = z.object({
  status: z.string().optional(),
  busca: z.string().min(2).max(120).optional(),
});

type SuppliersDeps = {
  supplierRepository: SupplierRepository;
  organizationRepository: OrganizationRepository;
};

export async function registerSuppliersRoutes(app: FastifyInstance, deps: SuppliersDeps) {
  app.get("/suppliers", async (request, reply) => {
    const tenant = getTenant(request);
    const query = querySchema.parse(request.query ?? {});

    const suppliers = await deps.supplierRepository.findByOrgId(tenant.orgId, {
      status: query.status,
      busca: query.busca,
    });

    return reply.send({ itens: suppliers });
  });

  app.get("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const supplier = await deps.supplierRepository.findById(id);

    if (!supplier) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    await requireOrganizationAccess(deps.organizationRepository)(
      { ...request, params: { orgId: supplier.orgId } } as any,
      reply,
    );
    if (reply.sent) return;

    return reply.send(supplier);
  });

  app.post("/suppliers", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const tenant = getTenant(request);
    const body = createSupplierSchema.parse(request.body ?? {});

    const supplier = await deps.supplierRepository.create({
      orgId: tenant.orgId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      document: body.document,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      status: body.status || "ativo",
      notes: body.notes,
      createdBy: request.auth.userId,
      updatedBy: request.auth.userId,
    });

    return reply.status(201).send(supplier);
  });

  app.put("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = updateSupplierSchema.parse(request.body ?? {});

    const existing = await deps.supplierRepository.findById(id);

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    await requireOrganizationAccess(deps.organizationRepository)(
      { ...request, params: { orgId: existing.orgId } } as any,
      reply,
    );
    if (reply.sent) return;

    const supplier = await deps.supplierRepository.update(id, {
      ...body,
      updatedBy: request.auth.userId,
    });

    return reply.send(supplier);
  });

  app.delete("/suppliers/:id", async (request, reply) => {
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária" });
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await deps.supplierRepository.findById(id);

    if (!existing) {
      return reply.status(404).send({ message: "Fornecedor não encontrado" });
    }

    // Verificar acesso à organização do fornecedor
    await requireOrganizationAccess(deps.organizationRepository)(
      { ...request, params: { orgId: existing.orgId } } as any,
      reply,
    );
    if (reply.sent) return;

    await deps.supplierRepository.delete(id);

    return reply.status(204).send();
  });
}
