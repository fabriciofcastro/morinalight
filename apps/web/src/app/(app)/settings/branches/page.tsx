import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { BranchesClient } from "./branches-client";

export const metadata: Metadata = {
  title: "Filiais — MORINA",
  description: "Gerencie filiais e unidades da empresa.",
};

export const dynamic = "force-dynamic";

export default function BranchesPage() {
  return (
    <SettingsLayout
      title="Filiais"
      description="Gerencie filiais e unidades da empresa"
      showBackButton
      backHref="/settings"
    >
      <BranchesClient />
    </SettingsLayout>
  );
}

