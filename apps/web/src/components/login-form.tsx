"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, cn, Input, Label } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
    .min(8, "A senha precisa de pelo menos 8 caracteres."),
  remember: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onAuthenticate?: (payload: LoginFormData) => Promise<void>;
};

export function LoginForm({ onAuthenticate }: LoginFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [_emailValue, setEmailValue] = useState("");
  const [_passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onBlur",
  });

  const email = watch("email");
  const password = watch("password");

  const isBusy = pending || isSubmitting;
  const isEmailValid = email && !errors.email && email.includes("@");
  const isPasswordValid = password && !errors.password && password.length >= 8;

  async function submit(data: LoginFormData) {
    setStatus("idle");
    setMessage(null);

    if (onAuthenticate) {
      try {
        await onAuthenticate(data);
        setStatus("success");
        setMessage("Acesso autorizado. Redirecionando...");
        reset({ ...data, password: "" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Credenciais inválidas. Tente novamente.",
        );
      }
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message ?? "Credenciais inválidas. Tente novamente.");
        }

        setStatus("success");
        setMessage("Acesso autorizado. Redirecionando...");
        reset({ ...data, password: "" });

        // Salvar sessão completa
        if (payload.token) {
          const { setAuthSession } = await import("@/lib/auth-client");
          setAuthSession({
            token: payload.token,
            user: payload.user,
            organizations: payload.organizations ?? [],
          });
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Erro inesperado. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-5">
        {/* Campo de e-mail */}
        <motion.div
          className="field"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Label
            htmlFor="login-email"
            className="label mb-2 text-sm font-medium text-[hsl(var(--text-2))]"
          >
            E-mail corporativo
          </Label>
          <div className="relative">
            {/* Efeito glass border quando focado/preenchido */}
            <motion.div
              className="pointer-events-none absolute -inset-[1px] rounded-lg"
              animate={{
                opacity: focusedField === "email" || isEmailValid ? 1 : 0,
                scale: focusedField === "email" || isEmailValid ? 1 : 0.95,
              }}
              transition={{ duration: 0.3 }}
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2))",
                filter: "blur(8px)",
              }}
            />

            <Input
              id="login-email"
              type="email"
              placeholder="nome@empresa.com"
              autoComplete="email"
              className={cn(
                "input relative z-10 h-12 w-full cursor-text rounded-lg border px-4 text-[hsl(var(--text-1))] transition-all placeholder:text-[hsl(var(--text-3))] focus:outline-none",
                focusedField === "email" || isEmailValid
                  ? "border-[hsl(var(--primary)_/_0.5)] bg-[hsla(var(--surface) / 0.95)] backdrop-blur-sm shadow-[0_0_20px_hsl(var(--primary)_/_0.15)]"
                  : "border-[hsl(var(--border))] bg-[hsla(var(--surface) / 0.8)]",
                errors.email &&
                  "border-[hsl(var(--danger))] focus:ring-2 focus:ring-[hsl(var(--danger)_/_0.35))]",
                !errors.email && isEmailValid && "border-[hsl(var(--success)_/_0.5)]",
              )}
              {...register("email", {
                onChange: (e) => setEmailValue(e.target.value),
              })}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="login-email-error"
            />

            {/* Ícone de validação */}
            <AnimatePresence>
              {isEmailValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Efeito de brilho interno quando focado */}
            {focusedField === "email" && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[hsla(var(--primary) / 0.1)] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          {errors.email && (
            <motion.span
              id="login-email-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs leading-snug text-[hsl(var(--danger))]"
            >
              {errors.email.message}
            </motion.span>
          )}
        </motion.div>

        {/* Campo de senha */}
        <motion.div
          className="field"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Label
            htmlFor="login-password"
            className="label mb-2 text-sm font-medium text-[hsl(var(--text-2))]"
          >
            Senha
          </Label>
          <div className="relative">
            {/* Efeito glass border quando focado/preenchido */}
            <motion.div
              className="pointer-events-none absolute -inset-[1px] rounded-lg"
              animate={{
                opacity: focusedField === "password" || isPasswordValid ? 1 : 0,
                scale: focusedField === "password" || isPasswordValid ? 1 : 0.95,
              }}
              transition={{ duration: 0.3 }}
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2))",
                filter: "blur(8px)",
              }}
            />

            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(
                "input relative z-10 h-12 w-full cursor-text rounded-lg border px-4 text-[hsl(var(--text-1))] transition-all placeholder:text-[hsl(var(--text-3))] focus:outline-none",
                focusedField === "password" || isPasswordValid
                  ? "border-[hsl(var(--primary)_/_0.5)] bg-[hsla(var(--surface) / 0.95)] backdrop-blur-sm shadow-[0_0_20px_hsl(var(--primary)_/_0.15)]"
                  : "border-[hsl(var(--border))] bg-[hsla(var(--surface) / 0.8)]",
                errors.password &&
                  "border-[hsl(var(--danger))] focus:ring-2 focus:ring-[hsl(var(--danger)_/_0.35))]",
                !errors.password && isPasswordValid && "border-[hsl(var(--success)_/_0.5)]",
              )}
              {...register("password", {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="login-password-error"
            />

            {/* Ícone de validação */}
            <AnimatePresence>
              {isPasswordValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Efeito de brilho interno quando focado */}
            {focusedField === "password" && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[hsla(var(--primary) / 0.1)] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Indicador de força da senha */}
            {password && !errors.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 flex gap-1"
              >
                {[1, 2, 3, 4].map((level) => (
                  <motion.div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      password.length >= level * 2
                        ? "bg-[hsl(var(--success))]"
                        : "bg-[hsl(var(--border))]",
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: password.length >= level * 2 ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: level * 0.05 }}
                  />
                ))}
              </motion.div>
            )}
          </div>
          {errors.password ? (
            <motion.span
              id="login-password-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs leading-snug text-[hsl(var(--danger))]"
            >
              {errors.password.message}
            </motion.span>
          ) : (
            <span className="mt-1.5 text-xs leading-snug text-[hsl(var(--text-3))]">
              Mínimo de 8 caracteres.
            </span>
          )}
        </motion.div>
      </div>

      {/* Opções e links */}
      <motion.div
        className="flex items-center justify-between gap-4 text-xs text-[hsl(var(--text-3))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <label className="flex cursor-pointer items-center gap-2">
          <input
            {...register("remember")}
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border border-[hsl(var(--border))] bg-[hsl(var(--elevated))] text-[hsl(var(--primary))] outline-none transition-all hover:border-[hsl(var(--primary)_/_0.6))] focus:ring-2 focus:ring-[hsl(var(--primary)_/_0.35))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
          />
          <span className="cursor-pointer">Lembrar sessão</span>
        </label>
        <motion.button
          type="button"
          className="cursor-pointer border-b border-dashed border-[hsl(var(--primary)_/_0.45))] text-[hsl(var(--primary)_/_0.8))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Esqueci minha senha
        </motion.button>
      </motion.div>

      {/* Mensagem de feedback */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all backdrop-blur-sm",
              status === "success"
                ? "bg-[hsl(var(--success)_/_0.15)] text-[hsl(var(--success))] border border-[hsl(var(--success)_/_0.3))] shadow-[0_0_20px_hsl(var(--success)_/_0.2)]"
                : "bg-[hsl(var(--danger)_/_0.15)] text-[hsl(var(--danger))] border border-[hsl(var(--danger)_/_0.3))] shadow-[0_0_20px_hsl(var(--danger)_/_0.2)]",
            )}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              {status === "success" ? (
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ShieldX className="h-4 w-4 flex-shrink-0" />
              )}
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {message}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de submit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          disabled={isBusy}
          className={cn(
            "btn btn-primary relative h-12 w-full cursor-pointer overflow-hidden rounded-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)_/_0.5))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))] disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))]",
            isEmailValid && isPasswordValid && "shadow-[0_0_30px_hsl(var(--primary)_/_0.4)]",
          )}
        >
          {/* Efeito de brilho deslizante no hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Efeito de pulso quando campos estão válidos */}
          {isEmailValid && isPasswordValid && (
            <motion.div
              className="absolute inset-0 bg-[hsl(var(--primary)_/_0.2)]"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <span className="relative z-10 flex items-center justify-center gap-2">
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </form>
  );
}
