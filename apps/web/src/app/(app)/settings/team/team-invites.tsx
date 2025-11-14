"use client";

import { Button, cn, GlassCard } from "@morina/ui";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import type { OrganizationInvite } from "@/types/organization";

type TeamInvitesProps = {
  orgId: string;
  initialInvites: OrganizationInvite[];
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
] satisfies Array<{ value: OrganizationInvite["role"]; label: string }>;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline"> = {
  pending: "secondary",
  accepted: "default",
  cancelled: "outline",
};

export function TeamInvites({ orgId, initialInvites }: TeamInvitesProps) {
  const [invites, setInvites] = useState(initialInvites);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const [formState, setFormState] = useState<{ email: string; role: OrganizationInvite["role"] }>({
    email: "",
    role: "member",
  });

  function resetForm() {
    setFormState({ email: "", role: "member" });
  }

  async function refreshInvites() {
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error((await response.json())?.message ?? "Falha ao atualizar convites.");
      }

      const payload = (await response.json()) as { itens: OrganizationInvite[] };
      setInvites(payload.itens);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao atualizar convites.",
      });
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/invites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formState),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Não foi possível criar o convite.");
        }

        const payload = (await response.json()) as { invite: OrganizationInvite };
        setInvites((current) => [payload.invite, ...current]);
        setFeedback({
          type: "success",
          message: "Convite enviado com sucesso.",
        });
        resetForm();
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao criar convite.",
        });
      } finally {
        await refreshInvites();
      }
    });
  }

  function handleCancel(inviteId: string) {
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}`, {
          method: "DELETE",
        });

        if (!response.ok && response.status !== 204) {
          const payload = await response.json();
          throw new Error(payload?.message ?? "Não foi possível cancelar o convite.");
        }

        setInvites((current) => current.filter((invite) => invite.inviteId !== inviteId));
        setFeedback({
          type: "success",
          message: "Convite cancelado.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao cancelar convite.",
        });
        await refreshInvites();
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
            Convites inteligentes
          </span>
          <div className="flex items-center gap-[var(--space-3)]">
            <h2 className="text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold leading-[1.2] text-[var(--fg)]">
              Convidar novo membro
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {invites.filter((invite) => invite.status === "pending").length} pendentes
            </Badge>
          </div>
        </div>
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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] items-end gap-[var(--space-3)]"
      >
        <label className="flex flex-col gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
          Email corporativo
          <input
            required
            name="email"
            type="email"
            value={formState.email}
            onChange={handleInputChange}
            placeholder="nome@empresa.com"
            className="rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-sm)] text-[var(--fg)] shadow-[0_12px_26px_rgba(12,17,29,0.08)] focus:border-[color-mix(in oklab,var(--primary-color) 45%,transparent)] focus:outline-none"
            disabled={pending}
          />
        </label>

        <label className="flex flex-col gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
          Papel
          <select
            name="role"
            value={formState.role}
            onChange={handleInputChange}
            className="rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-sm)] text-[var(--fg)] shadow-[0_12px_26px_rgba(12,17,29,0.08)] focus:border-[color-mix(in oklab,var(--primary-color) 45%,transparent)] focus:outline-none"
            disabled={pending}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" size="sm" disabled={pending || !formState.email}>
          Enviar convite
        </Button>
      </form>

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-[var(--space-3)] bg-[color-mix(in oklab,var(--surface-color) 95%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 62%,var(--fg) 38%)]">
          <span>Email</span>
          <span>Papel</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
          {invites.map((invite) => (
            <div
              key={invite.inviteId}
              className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-4)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)]"
            >
              <div className="flex flex-col gap-[var(--space-1)]">
                <span className="text-[var(--fs-sm)] font-semibold text-[var(--fg)]">
                  {invite.email}
                </span>
                <span className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]">
                  Convidado em {new Date(invite.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="text-[var(--fs-sm)]">{ROLE_LABELS[invite.role]}</span>
              <Badge
                variant={STATUS_VARIANTS[invite.status] ?? "secondary"}
                className="text-[10px]"
              >
                {STATUS_LABELS[invite.status] ?? invite.status}
              </Badge>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--fs-xs)]"
                  disabled={pending || invite.status !== "pending"}
                  onClick={() => handleCancel(invite.inviteId)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ))}
          {invites.length === 0 ? (
            <div className="px-[var(--space-4)] py-[var(--space-5)] text-center text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Nenhum convite registrado para esta organização.
            </div>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
