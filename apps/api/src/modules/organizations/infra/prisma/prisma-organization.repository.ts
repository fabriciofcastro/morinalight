import type { OrganizationRole } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  OrganizationMembershipRecord,
  OrganizationMemberView,
  OrganizationRecord,
  OrganizationRepository,
  OrganizationView,
} from "../../repositories/organization.repository";

const prisma = getPrisma();

export class PrismaOrganizationRepository implements OrganizationRepository {
  async listarPorUsuario(userId: string): Promise<OrganizationView[]> {
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return memberships.map(
      (membership) =>
        ({
          organizationId: membership.organizationId,
          name: membership.organization.name,
          slug: membership.organization.slug,
          role: membership.role,
        }) satisfies OrganizationView,
    );
  }

  async criar(input: {
    organizationId: string;
    name: string;
    slug: string;
    description?: string | null;
  }): Promise<OrganizationRecord> {
    const record = await prisma.organization.create({
      data: {
        id: input.organizationId,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
      },
    });

    return {
      organizationId: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      legalName: record.legalName,
      cnpj: record.cnpj,
      address: record.address,
      phone: record.phone,
      email: record.email,
      website: record.website,
    };
  }

  async encontrarPorId(organizationId: string): Promise<OrganizationRecord | null> {
    const record = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!record) return null;
    return {
      organizationId: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      legalName: record.legalName,
      cnpj: record.cnpj,
      address: record.address,
      phone: record.phone,
      email: record.email,
      website: record.website,
    };
  }

  async encontrarPorSlug(slug: string): Promise<OrganizationRecord | null> {
    const record = await prisma.organization.findUnique({ where: { slug } });
    if (!record) return null;
    return {
      organizationId: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      legalName: record.legalName,
      cnpj: record.cnpj,
      address: record.address,
      phone: record.phone,
      email: record.email,
      website: record.website,
    };
  }

  async vincularUsuario(organizationId: string, userId: string, role: string): Promise<void> {
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      create: {
        organizationId,
        userId,
        role: role as OrganizationRole,
      },
      update: {
        role: role as OrganizationRole,
      },
    });
  }

  async encontrarMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembershipRecord | null> {
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    if (!membership) return null;
    return {
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
    };
  }

  async listarMembros(organizationId: string): Promise<OrganizationMemberView[]> {
    const memberships = await prisma.organizationMembership.findMany({
      where: { organizationId },
      orderBy: {
        createdAt: "asc",
      },
    });
    return memberships.map(
      (membership) =>
        ({
          organizationId: membership.organizationId,
          userId: membership.userId,
          role: membership.role,
          createdAt: membership.createdAt,
        }) satisfies OrganizationMemberView,
    );
  }

  async atualizarPapel(
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<OrganizationMembershipRecord | null> {
    const membership = await prisma.organizationMembership.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role: role as OrganizationRole },
    });

    return {
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
    };
  }

  async removerMembro(organizationId: string, userId: string): Promise<void> {
    await prisma.organizationMembership.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async atualizar(input: {
    organizationId: string;
    name?: string;
    slug?: string;
    description?: string | null;
    legalName?: string | null;
    cnpj?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  }): Promise<OrganizationRecord | null> {
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      legalName?: string | null;
      cnpj?: string | null;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
    } = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.legalName !== undefined) updateData.legalName = input.legalName;
    if (input.cnpj !== undefined) updateData.cnpj = input.cnpj;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.website !== undefined) updateData.website = input.website;

    const record = await prisma.organization.update({
      where: { id: input.organizationId },
      data: updateData,
    });

    return {
      organizationId: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      legalName: record.legalName,
      cnpj: record.cnpj,
      address: record.address,
      phone: record.phone,
      email: record.email,
      website: record.website,
    };
  }

  async deletar(organizationId: string): Promise<void> {
    // Deletar membros primeiro (cascade)
    await prisma.organizationMembership.deleteMany({
      where: { organizationId },
    });

    // Deletar convites
    await prisma.userInvite.deleteMany({
      where: { organizationId },
    });

    // Deletar organização
    await prisma.organization.delete({
      where: { id: organizationId },
    });
  }
}
