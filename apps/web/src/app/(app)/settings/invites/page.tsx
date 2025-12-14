import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { InvitesClient } from "./invites-client";

export const metadata: Metadata = {
  title: "Convites — MORINA",
  description: "Gerencie convites para membros da organização.",
};

export const dynamic = "force-dynamic";

export default function InvitesPage() {
  return (
    <SettingsLayout
      title="Convites"
      description="Gerencie convites para membros da organização"
      showBackButton
      backHref="/settings"
    >
      <InvitesClient />
    </SettingsLayout>
  );
}


