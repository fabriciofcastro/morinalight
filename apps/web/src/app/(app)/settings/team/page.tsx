import type { Metadata } from "next";

import { apiUrl, defaultActorId, defaultOrgId } from "@/lib/env";
import type {
  OrganizationInvite,
  OrganizationInviteResponse,
  OrganizationMember,
  OrganizationMemberResponse,
} from "@/types/organization";

import { TeamClient } from "./team-client";
import { TeamInvites } from "./team-invites";

export const metadata: Metadata = {
  title: "Gestão de Equipe — AlphaSysCore",
  description: "Administre papéis e presença da equipe operacional na organização Morina Light.",
};

export const dynamic = "force-dynamic";

async function fetchMembers(orgId: string): Promise<OrganizationMember[]> {
  const response = await fetch(`${apiUrl}/organizations/${orgId}/members`, {
    headers: {
      "x-user-id": defaultActorId,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as OrganizationMemberResponse;
  return payload.itens;
}

async function fetchInvites(orgId: string): Promise<OrganizationInvite[]> {
  const response = await fetch(`${apiUrl}/organizations/${orgId}/invites`, {
    headers: {
      "x-user-id": defaultActorId,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as OrganizationInviteResponse;
  return payload.itens;
}

export default async function TeamSettingsPage() {
  const orgId = defaultOrgId;
  const members = await fetchMembers(orgId);
  const invites = await fetchInvites(orgId);

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-[var(--space-3)]">
        <span className="inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          AlphaSysCore
        </span>
        <h1 className="text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
          Equipe &amp; Papéis
        </h1>
        <p className="max-w-[62ch] text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Acompanhe quem tem acesso à sua operação, administre papéis e mantenha a governança em
          dia. Toda alteração gera auditoria e reforça a segurança multi-tenant da Morina.
        </p>
      </header>

      <TeamClient orgId={orgId} initialMembers={members} />
      <TeamInvites orgId={orgId} initialInvites={invites} />
    </div>
  );
}
