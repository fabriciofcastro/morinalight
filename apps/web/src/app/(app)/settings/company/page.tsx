import type { Metadata } from "next";

import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { CompanySettingsTabs } from "@/components/settings/CompanySettingsTabs";

export const metadata: Metadata = {
  title: "Dados da Empresa — MORINA",
  description: "Gerencie os dados cadastrais, fiscais e identidade visual da empresa MORINA.",
};

export default function CompanySettingsPage() {
  return (
    <SettingsLayout
      title="Dados da Empresa"
      description="Gerencie os dados cadastrais, fiscais e identidade visual da empresa"
      showBackButton
      backHref="/settings"
    >
      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col">
        <CompanySettingsTabs />
      </div>
    </SettingsLayout>
  );
}
