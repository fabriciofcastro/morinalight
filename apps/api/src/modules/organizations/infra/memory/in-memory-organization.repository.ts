import type {
  OrganizationMembershipRecord,
  OrganizationMemberView,
  OrganizationRecord,
  OrganizationRepository,
  OrganizationView,
} from "../../repositories/organization.repository";

type Membership = {
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
};

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public readonly organizations: OrganizationRecord[] = [];
  public readonly memberships: Membership[] = [];

  async listarPorUsuario(userId: string): Promise<OrganizationView[]> {
    const memberships = this.memberships.filter((membership) => membership.userId === userId);

    return memberships
      .map((membership) => {
        const org = this.organizations.find(
          (organization) => organization.organizationId === membership.organizationId,
        );
        if (!org) return null;
        return {
          organizationId: org.organizationId,
          name: org.name,
          slug: org.slug,
          role: membership.role,
        } satisfies OrganizationView;
      })
      .filter((item): item is OrganizationView => Boolean(item));
  }

  async criar(input: OrganizationRecord): Promise<OrganizationRecord> {
    this.organizations.push({ ...input });
    return input;
  }

  async encontrarPorId(organizationId: string): Promise<OrganizationRecord | null> {
    const found = this.organizations.find(
      (organization) => organization.organizationId === organizationId,
    );
    return found ? { ...found } : null;
  }

  async encontrarPorSlug(slug: string): Promise<OrganizationRecord | null> {
    const found = this.organizations.find((organization) => organization.slug === slug);
    return found ? { ...found } : null;
  }

  async vincularUsuario(organizationId: string, userId: string, role: string): Promise<void> {
    const existing = this.memberships.find(
      (membership) => membership.organizationId === organizationId && membership.userId === userId,
    );
    if (existing) {
      existing.role = role;
      return;
    }
    this.memberships.push({ organizationId, userId, role, createdAt: new Date() });
  }

  async encontrarMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembershipRecord | null> {
    const found = this.memberships.find(
      (membership) => membership.organizationId === organizationId && membership.userId === userId,
    );
    return found ? { ...found } : null;
  }

  async listarMembros(organizationId: string): Promise<OrganizationMemberView[]> {
    return this.memberships
      .filter((membership) => membership.organizationId === organizationId)
      .map(
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
    const membership = this.memberships.find(
      (item) => item.organizationId === organizationId && item.userId === userId,
    );
    if (!membership) return null;
    membership.role = role;
    return { ...membership };
  }

  async removerMembro(organizationId: string, userId: string): Promise<void> {
    const index = this.memberships.findIndex(
      (item) => item.organizationId === organizationId && item.userId === userId,
    );
    if (index >= 0) {
      this.memberships.splice(index, 1);
    }
  }

  async atualizar(input: {
    organizationId: string;
    name?: string;
    slug?: string;
    description?: string | null;
  }): Promise<OrganizationRecord | null> {
    const org = this.organizations.find(
      (o) => o.organizationId === input.organizationId,
    );
    if (!org) return null;

    if (input.name !== undefined) org.name = input.name;
    if (input.slug !== undefined) org.slug = input.slug;
    if (input.description !== undefined) org.description = input.description;

    return { ...org };
  }

  async deletar(organizationId: string): Promise<void> {
    // Remover memberships
    const membershipIndexes: number[] = [];
    this.memberships.forEach((m, i) => {
      if (m.organizationId === organizationId) {
        membershipIndexes.push(i);
      }
    });
    membershipIndexes.reverse().forEach((i) => {
      this.memberships.splice(i, 1);
    });

    // Remover organização
    const orgIndex = this.organizations.findIndex(
      (o) => o.organizationId === organizationId,
    );
    if (orgIndex >= 0) {
      this.organizations.splice(orgIndex, 1);
    }
  }
}
