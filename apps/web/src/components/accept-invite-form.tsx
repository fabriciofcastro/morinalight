"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label, cn } from "@morina/ui";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const acceptSchema = z.object({
  email: z
    .string({ required_error: "Informe o e-mail convidado." })
    .trim()
    .email("Formato inválido."),
  displayName: z
    .string({ required_error: "Informe como deseja ser identificado." })
    .min(2, "Nome muito curto.")
    .max(120, "Nome muito longo."),
  password: z
    .string({ required_error: "Defina uma senha forte." })
    .min(8, "Mínimo de 8 caracteres.")
    .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua ao menos um número."),
});

export type AcceptInviteData = z.infer<typeof acceptSchema>;

type AcceptInviteFormProps = {
  inviteToken: string;
};

export function AcceptInviteForm({ inviteToken }: AcceptInviteFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteData>({
    resolver: zodResolver(acceptSchema),
    mode: "onBlur",
  });

  const isBusy = pending || isSubmitting;

  function onSubmit(data: AcceptInviteData) {
    setStatus("idle");
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            inviteToken,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message ?? "Não foi possível concluir o cadastro.");
        }

        setStatus("success");
        setMessage("Convite aceito com sucesso. Redirecionando para o login...");
        reset();
        setTimeout(() => {
          router.push("/login");
        }, 1800);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Erro inesperado ao aceitar convite. Tente novamente.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[var(--space-5)]"
      noValidate
    >
      <div className="grid gap-[var(--space-4)]">
        <div className="grid gap-[var(--space-2)]">
          <Label htmlFor="invite-email">E-mail corporativo</Label>
          <div className="relative">
            <Input
              id="invite-email"
              type="email"
              placeholder="nome@empresa.com"
              autoComplete="email"
              className={cn(
                "transition-all focus:bg-[hsla(var(--surface) / 0.95)]",
                !errors.email && "input-shimmer",
              )}
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="invite-email-error"
            />
            {!errors.email && (
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[hsla(var(--primary) / 0.05)] to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
            )}
          </div>
          <span
            id="invite-email-error"
            className="text-[var(--fs-xs)] text-[hsl(var(--danger))] leading-[var(--lh-snug)] transition-all"
          >
            {errors.email?.message}
          </span>
        </div>

        <div className="grid gap-[var(--space-2)]">
          <Label htmlFor="invite-name">Nome público</Label>
          <div className="relative">
            <Input
              id="invite-name"
              type="text"
              placeholder="Como deseja aparecer para a equipe?"
              autoComplete="name"
              className={cn(
                "transition-all focus:bg-[hsla(var(--surface) / 0.95)]",
                !errors.displayName && "input-shimmer",
              )}
              {...register("displayName")}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby="invite-name-error"
            />
            {!errors.displayName && (
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[hsla(var(--primary) / 0.05)] to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
            )}
          </div>
          <span
            id="invite-name-error"
            className="text-[var(--fs-xs)] text-[hsl(var(--danger))] leading-[var(--lh-snug)] transition-all"
          >
            {errors.displayName?.message}
          </span>
        </div>

        <div className="grid gap-[var(--space-2)]">
          <Label htmlFor="invite-password">Defina uma senha</Label>
          <div className="relative">
            <Input
              id="invite-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(
                "transition-all focus:bg-[hsla(var(--surface) / 0.95)]",
                !errors.password && "input-shimmer",
              )}
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="invite-password-error"
            />
            {!errors.password && (
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[hsla(var(--primary) / 0.05)] to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
            )}
          </div>
          <span
            id="invite-password-error"
            className="text-[var(--fs-xs)] text-[hsl(var(--danger))] leading-[var(--lh-snug)] transition-all"
          >
            {errors.password?.message ??
              "Mínimo 8 caracteres com letras maiúsculas, minúsculas e números."}
          </span>
        </div>
      </div>

      {message ? (
        <div
          className={cn(
            "flex items-center gap-[var(--space-2)] rounded-[var(--r-md)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)]",
            status === "success"
              ? "bg-[color-mix(in oklab,var(--primary-color) 16%,transparent)] text-[var(--primary-contrast)]"
              : "bg-[color-mix(in oklab,var(--danger-color) 12%,transparent)] text-[color-mix(in oklab,var(--danger-color) 80%,var(--fg) 20%)]",
          )}
        >
          {status === "success" ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
          <span>{message}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isBusy}>
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Processando...
          </>
        ) : (
          "Ativar acesso"
        )}
      </Button>
    </form>
  );
}

