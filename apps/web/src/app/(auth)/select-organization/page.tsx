"use client";

import { Button } from "@morina/ui";
import { Building2, ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";

interface Organization {
  organizationId: string;
  name: string;
  slug: string;
}

export default function SelectOrganizationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscar organizações salvas no login
    const orgsStr = localStorage.getItem("auth_organizations");
    if (orgsStr) {
      try {
        const parsed = JSON.parse(orgsStr) as Organization[];
        setOrganizations(Array.isArray(parsed) ? parsed : []);
      } catch {
        setOrganizations([]);
      }
    } else {
      setOrganizations([]);
    }
    setIsLoading(false);
  }, []);

  const handleSelectOrganization = (orgId: string) => {
    authApi.setCurrentOrganization(orgId);
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))] p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--text-1)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text-1)) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[hsl(var(--text-1))]">
            Selecione uma organização
          </h1>
          <p className="mt-2 text-[hsl(var(--text-2))]">Escolha a organização que deseja acessar</p>
        </div>

        {organizations.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
            <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--text-1))]">
              Nenhuma organização encontrada
            </h3>
            <p className="mt-2 text-sm text-[hsl(var(--text-3))]">
              Não foi possível carregar a lista. Faça login novamente ou contate o suporte.
            </p>
            <Button onClick={() => router.push("/login")} className="mt-6">
              Voltar para o login
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {organizations.map((org) => (
              <button
                type="button"
                key={org.organizationId}
                onClick={() => handleSelectOrganization(org.organizationId)}
                className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-left transition-all hover:border-[hsl(var(--primary))] hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                      <Building2 className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--text-1))]">{org.name}</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--text-3))]">@{org.slug}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[hsl(var(--text-3))] transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
