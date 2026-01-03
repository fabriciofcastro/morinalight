import type { Metadata } from "next";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { GlassCard } from "@morina/ui";

export const metadata: Metadata = {
  title: "Configurações — MORINA",
  description: "Central de configurações do sistema MORINA",
};

export default function SettingsPage() {
  return (
    <SettingsLayout title="Configurações" description="Central de configurações do sistema">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
        {/* Welcome Section */}
        <GlassCard glow className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Bem-vindo às Configurações</h2>
              <p className="text-sm text-white/70">
                Gerencie todas as configurações do sistema MORINA. Este sistema é uma extensão
                complementar ao e-millennium, focada em resolver dores específicas da operação.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Organização</h3>
                <p className="text-xs text-white/50">
                  Configure dados da empresa, estrutura organizacional e filiais.
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Pessoas</h3>
                <p className="text-xs text-white/50">
                  Gerencie usuários, equipe, convites e perfis de acesso.
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Segurança</h3>
                <p className="text-xs text-white/50">
                  Configure permissões, auditoria e aprovações RBAC.
                </p>
              </div>
              <div className="border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Personalização</h3>
                <p className="text-xs text-white/50">
                  Customize tema, identidade visual e preferências.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-sm font-semibold text-white mb-1">Estrutura Organizacional</h3>
            <p className="text-xs text-white/50">Configure departamentos, setores e cargos</p>
          </GlassCard>
          <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-sm font-semibold text-white mb-1">Permissões</h3>
            <p className="text-xs text-white/50">Gerencie controle de acesso e RBAC</p>
          </GlassCard>
          <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
            <h3 className="text-sm font-semibold text-white mb-1">Equipe</h3>
            <p className="text-xs text-white/50">Administre membros e papéis</p>
          </GlassCard>
        </div>
      </div>
    </SettingsLayout>
  );
}

