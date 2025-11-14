"use client";

import { useMemo, useState, useTransition } from "react";

import { Button, GlassCard, cn } from "@morina/ui";
import Link from "next/link";

import type { OrganizationMember } from "@/types/organization";
import { Badge } from "@/components/ui/badge";

type TeamClientProps = {
  orgId: string;
  initialMembers: OrganizationMember[];
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

const ROLE_LABELS = {
  owner: "Proprietário(a)",
  admin: "Administrador(a)",
  manager: "Gestor(a)",
  member: "Colaborador(a)",
  viewer: "Visitante",
} as const;

const ROLE_OPTIONS = [
  { value: "owner", label: ROLE_LABELS.owner },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "manager", label: ROLE_LABELS.manager },
  { value: "member", label: ROLE_LABELS.member },
  { value: "viewer", label: ROLE_LABELS.viewer },
] satisfies Array<{ value: OrganizationMember["role"]; label: string }>;

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  suspended: "Suspenso",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  pending: "secondary",
  suspended: "outline",
};

export function TeamClient({ orgId, initialMembers }: TeamClientProps) {
  const [members, setMembers] = useState<OrganizationMember[]>(initialMembers);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAction, startTransition] = useTransition();
  const [busyMember, setBusyMember] = useState<string | null>(null);

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members],
  );

  async function refreshMembers() {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error((await response.json())?.message ?? "Falha ao atualizar lista.");
      }

      const payload = (await response.json()) as { itens: OrganizationMember[] };
      setMembers(payload.itens);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao atualizar lista.",
      });
    }
  }

  async function handleRoleChange(userId: string, role: OrganizationMember["role"]) {
    setBusyMember(userId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Não foi possível atualizar o papel.");
        }

        const payload = (await response.json()) as { membership: { role: string } };

        setMembers((current) =>
          current.map((member) =>
            member.userId === userId ? { ...member, role: payload.membership.role as typeof role } : member,
          ),
        );

        setFeedback({
          type: "success",
          message: "Papel atualizado com sucesso.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao atualizar papel.",
        });
      } finally {
        setBusyMember(null);
        await refreshMembers();
      }
    });
  }

  async function handleRemoveMember(userId: string) {
    setBusyMember(userId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok && response.status !== 204) {
          const payload = await response.json();
          throw new Error(payload?.message ?? "Não foi possível remover o membro.");
        }

        setMembers((current) => current.filter((member) => member.userId !== userId));
        setFeedback({
          type: "success",
          message: "Membro removido da organização.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao remover membro.",
        });
        await refreshMembers();
      } finally {
        setBusyMember(null);
      }
    });
  }

  return (
    <GlassCard
      glow
      className="flex flex-col gap-[var(--space-6)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)]/60 p-[var(--space-6)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-2)]">
          <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Equipe operacional
          </span>
          <div className="flex items-center gap-[var(--space-3)]">
            <h2 className="text-[clamp(1.8rem,2.6vw,2.3rem)] font-semibold leading-[1.2] text-[var(--fg)]">
              Controle de membros
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {members.length} integrantes
            </Badge>
          </div>
        </div>
        <Link href="/settings/company" className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)] underline-offset-4 hover:text-[var(--primary-color)] hover:underline">
          Ajustar branding da organização
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-[var(--space-3)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
        <span>
          Proprietários ativos:{" "}
          <strong className="text-[color-mix(in oklab,var(--primary-color) 80%,var(--fg) 20%)]">{ownerCount}</strong>
        </span>
        <span>Convites gerenciados no módulo &ldquo;Convites&rdquo;.</span>
      </div>

      {feedback ? (
        <div
          className={cn(
            "rounded-[var(--r-lg)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)]",
            feedback.type === "success"
              ? "bg-[color-mix(in oklab,var(--primary-color) 18%,transparent)] text-[var(--primary-contrast)]"
              : "bg-[color-mix(in oklab,var(--accent-color) 12%,transparent)] text-[color-mix(in oklab,var(--accent-color) 80%,var(--fg) 20%)]",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-[var(--space-3)] bg-[color-mix(in oklab,var(--surface-color) 95%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 62%,var(--fg) 38%)]">
          <span>Colaborador</span>
          <span>Status</span>
          <span>Papel</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
          {members.map((member) => {
            const isBusy = busyMember === member.userId && pendingAction;
            const status = member.user?.status ?? "active";
            const statusLabel = STATUS_LABELS[status] ?? status;
            const statusVariant = STATUS_VARIANTS[status] ?? "secondary";

            return (
              <div
                key={member.userId}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-4)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)]"
              >
                <div className="flex flex-col gap-[var(--space-1)]">
                  <span className="text-[var(--fs-sm)] font-semibold text-[var(--fg)]">
                    {member.user?.displayName ?? member.user?.email ?? member.userId}
                  </span>
                  <span className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]">
                    {member.user?.email ?? "E-mail não disponível"}
                  </span>
                </div>

                <div>
                  <Badge variant={statusVariant} className="text-[10px]">
                    {statusLabel}
                  </Badge>
                </div>

                <div>
                  <label className="flex flex-col gap-[var(--space-1)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
                    Papel
                    <select
                      className="rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-sm)] text-[var(--fg)] shadow-[0_12px_26px_rgba(12,17,29,0.08)] focus:border-[color-mix(in oklab,var(--primary-color) 45%,transparent)] focus:outline-none"
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(member.userId, event.target.value as OrganizationMember["role"])
                      }
                      disabled={isBusy}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-[var(--space-2)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--fs-xs)]"
                    disabled={isBusy || member.role === "owner" && ownerCount <= 1}
                    onClick={() => handleRemoveMember(member.userId)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

