"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, cn, Input, Label } from "@morina/ui";
import { ClipboardList, Loader2, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Informe um e-mail corporativo." })
    .trim()
    .min(1, "Informe um e-mail corporativo.")
    .email("Formato de e-mail inválido."),
  password: z
    .string({ required_error: "A senha precisa de pelo menos 8 caracteres." })
    .min(8, "A senha precisa de pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua ao menos um número."),
  remember: z.boolean().optional().default(false),
  otp: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || /^[0-9]{6}$/.test(value), {
      message: "Token de 6 dígitos.",
    }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type LoginInsight = {
  sessionCount: number;
  threatsBlocked: number;
  lastAudit: string;
};

const defaultInsights: LoginInsight = {
  sessionCount: 0,
  threatsBlocked: 0,
  lastAudit: "há poucos minutos",
};

type LoginFormProps = {
  onAuthenticate?: (payload: LoginFormData) => Promise<void>;
  insights?: LoginInsight;
};

export function LoginForm({ onAuthenticate, insights = defaultInsights }: LoginFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
      otp: "",
    },
    mode: "onBlur",
  });

  async function submit(data: LoginFormData) {
    setStatus("idle");
    setFeedback(null);

    try {
      await (onAuthenticate
        ? onAuthenticate(data)
        : new Promise((resolve) => setTimeout(resolve, 1200)));

      setStatus("success");
      setFeedback("Acesso autorizado. Redirecionando para o cockpit de operações...");
      reset({ ...data, password: "", otp: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback(
        "Credenciais recusadas. Revise o token dinâmico ou solicite um novo acesso temporário.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-[var(--space-6)]" noValidate>
      <div className="grid gap-[var(--space-5)]">
        <div className="grid gap-[var(--space-2)]">
          <Label htmlFor="login-email">E-mail corporativo</Label>
          <Input
            {...register("email")}
            id="login-email"
            type="email"
            inputMode="email"
            placeholder="nome.sobrenome@morina.ai"
            autoComplete="email"
            className={cn(
              errors.email && "border-[color-mix(in_oklab,var(--danger)_55%,transparent)]",
            )}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="login-email-error"
          />
          {errors.email ? (
            <span
              id="login-email-error"
              className="text-[var(--fs-xs)] text-[var(--danger)] leading-[var(--lh-snug)]"
            >
              {errors.email.message}
            </span>
          ) : (
            <span className="text-[var(--fs-xs)] leading-[var(--lh-relaxed)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Acesso exclusivo para domínios autorizados. Cada tentativa gera log imediato.
            </span>
          )}
        </div>

        <div className="grid gap-[var(--space-2)]">
          <Label htmlFor="login-password">Senha</Label>
          <Input
            {...register("password")}
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              errors.password && "border-[color-mix(in_oklab,var(--danger)_55%,transparent)]",
            )}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="login-password-error"
          />
          <div className="grid gap-1 text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            {errors.password ? (
              <span id="login-password-error" className="text-[var(--danger)]">
                {errors.password.message}
              </span>
            ) : (
              <span id="login-password-error">
                Mínimo 8 caracteres com letras maiúsculas, minúsculas e números.
              </span>
            )}
            <div className="flex items-center gap-2 text-[color-mix(in_oklab,var(--muted)_65%,var(--fg)_35%)]">
              <ClipboardList className="h-3 w-3" aria-hidden />
              <span>Política alinhada ao SOC corporativo.</span>
            </div>
          </div>
        </div>

        <div className="grid gap-[var(--space-2)]">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="login-otp">Token dinâmico</Label>
            <span className="text-[10px] uppercase tracking-[0.32em] text-[color-mix(in_oklab,var(--muted)_65%,var(--fg)_35%)]">
              Opcional (MFA)
            </span>
          </div>
          <Input
            {...register("otp")}
            id="login-otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="123 456"
            className={cn(
              errors.otp && "border-[color-mix(in_oklab,var(--danger)_55%,transparent)]",
            )}
            aria-invalid={Boolean(errors.otp)}
            aria-describedby="login-otp-error"
          />
          {errors.otp ? (
            <span id="login-otp-error" className="text-[var(--fs-xs)] text-[var(--danger)]">
              {errors.otp.message}
            </span>
          ) : (
            <span className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Em cenários críticos enviamos via app corporativo em segundos.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-[var(--space-3)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
        <label className="flex items-center gap-2">
          <input
            {...register("remember")}
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_92%,transparent)] text-[var(--primary)] outline-none transition hover:border-[color-mix(in_oklab,var(--primary)_60%,transparent)] focus:shadow-[0_0_0_2px_rgba(91,138,255,0.25)]"
          />
          <span>Lembrar sessão por 30 dias</span>
        </label>
        <button
          type="button"
          className="border-b border-dashed border-[color-mix(in_oklab,var(--primary)_45%,transparent)] text-[color-mix(in_oklab,var(--primary)_80%,var(--fg)_20%)] transition hover:text-[var(--primary)]"
        >
          Esqueci meus dados
        </button>
      </div>

      <div className="grid gap-[var(--space-3)] rounded-[var(--r-md)] border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_92%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
        <div className="flex items-center gap-[var(--space-2)] text-[color-mix(in_oklab,var(--primary)_60%,var(--fg)_40%)]">
          <ShieldQuestion className="h-4 w-4" aria-hidden />
          <span>Monitoramento em tempo real habilitado.</span>
        </div>
        <div className="grid gap-2 text-[color-mix(in_oklab,var(--muted)_72%,var(--fg)_28%)]">
          <div className="flex items-center justify-between">
            <span>Sessões protegidas hoje</span>
            <strong className="text-[var(--fg)]">{insights.sessionCount}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Ataques bloqueados nas últimas 24h</span>
            <strong className="text-[var(--fg)]">{insights.threatsBlocked}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Última auditoria</span>
            <strong className="text-[var(--fg)]">{insights.lastAudit}</strong>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "flex items-start gap-[var(--space-3)] rounded-[var(--r-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)]",
            status === "success"
              ? "border-[color-mix(in_oklab,var(--success)_40%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_85%,var(--success)_8%)] text-[color-mix(in_oklab,var(--success)_70%,var(--fg)_30%)]"
              : "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_85%,var(--danger)_8%)] text-[color-mix(in_oklab,var(--danger)_70%,var(--fg)_30%)]",
          )}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4" aria-hidden />
          <span>{feedback}</span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="group relative overflow-hidden">
        <span className="absolute inset-0 -z-10 translate-y-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.32)_0%,transparent_70%)] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Validando
          </>
        ) : (
          <>Entrar</>
        )}
      </Button>

      <p className="text-center text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
        Acesso monitorado. Cada tentativa gera auditoria automática e alerta para o time de
        segurança.
      </p>
    </form>
  );
}
