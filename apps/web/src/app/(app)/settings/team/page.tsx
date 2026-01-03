import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
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
  title: "Equipe — MORINA",
  description: "Administre membros da equipe e seus papéis na organização.",
};

export const dynamic = "force-dynamic";

async function fetchMembers(orgId: string): Promise<OrganizationMember[]> {
  const response = await fetch(`${apiUrl}/organizations/${orgId}/members`, {
    headers: {
      "x-user-id": defaultActorId || "",
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
      "x-user-id": defaultActorId || "",
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
  const orgId = defaultOrgId || "";
  const members = await fetchMembers(orgId);
  const invites = await fetchInvites(orgId);

  return (
    <SettingsLayout
      title="Equipe"
      description="Administre membros da equipe e seus papéis na organização"
      showBackButton
      backHref="/settings"
    >
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
        <TeamClient orgId={orgId} initialMembers={members} />
        <TeamInvites orgId={orgId} initialInvites={invites} />
      </div>
    </SettingsLayout>
  );
}
