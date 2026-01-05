"use client";

import { Button, cn, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Terminal,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth";
import { MFALogin } from "./mfa-login";

type LoginNoticePayload = {
  message: string;
  attempts?: number;
  status?: number;
  category?: string;
  origin?: string;
  code?: string;
  retryAction?: () => void;
};

// Input sanitization helper
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

export function LoginForm({
  onNotice,
  onDismissNotice,
}: {
  onNotice?: (payload: LoginNoticePayload) => void;
  onDismissNotice?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-bot field
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Validation errors for inline tooltips
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Fetch CSRF token on mount
  useEffect(() => {
    async function fetchCSRFToken() {
      try {
        const response = await fetch("/api/auth/csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    }
    fetchCSRFToken();
  }, []);

  function emitNotice(payload: LoginNoticePayload) {
    onNotice?.(payload);
  }

  // Real-time email validation
  const validateEmail = (value: string): string => {
    if (!value) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Email inválido";
    }
    return "";
  };

  // Real-time password validation
  const validatePassword = (value: string): string => {
    if (!value) return "";
    if (value.length < 8) {
      return "Mínimo 8 caracteres";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🔵 [LOGIN] handleSubmit called");
    e.preventDefault();

    // Honeypot check (anti-bot)
    if (honeypot) {
      console.log("🤖 [SECURITY] Bot detected via honeypot");
      // Silently reject (don't give feedback to bot)
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      return;
    }

    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedPassword = sanitizeInput(password.trim());

    console.log("🔵 [LOGIN] Email:", sanitizedEmail);
    console.log("🔵 [LOGIN] Password length:", sanitizedPassword.length);
    console.log("🔵 [LOGIN] Terms accepted:", termsAccepted);
    console.log("🔵 [LOGIN] Remember me:", rememberMe);

    // Client-side validation
    const emailErr = validateEmail(sanitizedEmail);
    const passwordErr = validatePassword(sanitizedPassword);

    if (emailErr) {
      setEmailError(emailErr);
      emitNotice({ message: `⚠️ ${emailErr}`, attempts: loginAttempts, category: "VALIDATION", origin: "CLIENT" });
      return;
    }

    if (passwordErr) {
      setPasswordError(passwordErr);
      emitNotice({ message: `⚠️ ${passwordErr}`, attempts: loginAttempts, category: "VALIDATION", origin: "CLIENT" });
      return;
    }

    if (!termsAccepted) {
      console.log("🔴 [LOGIN] Validation failed: terms not accepted");
      emitNotice({
        message: "Protocolo de segurança: Aceite os termos.",
        attempts: loginAttempts,
        category: "VALIDATION",
        origin: "CLIENT",
      });
      return;
    }

    if (!csrfToken) {
      emitNotice({
        message: "🔒 Token de segurança não carregado. Recarregue a página.",
        attempts: loginAttempts,
        category: "SECURITY",
        origin: "CLIENT",
      });
      return;
    }

    console.log("✅ [LOGIN] All validations passed, calling API...");
    setIsLoading(true);

    try {
      console.log("🔵 [LOGIN] Calling authApi.login...");
      const response = await authApi.login({
        email: sanitizedEmail,
        password: sanitizedPassword,
        remember: rememberMe,
      }, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });
      console.log("✅ [LOGIN] API response:", response);

      if (response.requiresTwoFactor) {
        console.log("🔵 [LOGIN] 2FA required");
        setMfaRequired(true);
        setIsLoading(false);
        return;
      }

      // Pequeno delay para garantir que o cookie seja salvo
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("🔵 [LOGIN] Redirecting...");
      // Usar window.location.href para garantir redirecionamento completo
      if (response.user.mustChangePassword) {
        window.location.href = "/auth/force-change";
      } else if (response.organizations && response.organizations.length > 1) {
        window.location.href = "/select-organization";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      console.error("🔴 [LOGIN] Error caught:", err);
      console.error("🔴 [LOGIN] Error details:", {
        message: (err as any).message,
        statusCode: (err as any).statusCode,
        response: (err as any).response,
        code: (err as any).code,
      });
      const error = err as {
        code?: string;
        message?: string;
        statusCode?: number;
        response?: { status?: number; data?: { error?: string; message?: string; code?: string; retryAfter?: number } };
      };
      setLoginAttempts((prev) => prev + 1);
      const nextAttempts = loginAttempts + 1;

      // Rastrear erro para analytics
      if (typeof window !== "undefined") {
        import("@/lib/errors/error-tracking").then(({ errorTracking }) => {
          import("@/lib/errors").then(({ parseError }) => {
            const appError = parseError(err, false);
            errorTracking.trackError(appError, {
              component: "LoginForm",
              email: sanitizedEmail,
              attempts: nextAttempts,
              errorCode: error.response?.data?.code || error.code,
            }).catch(console.error);
          }).catch(console.error);
        }).catch(console.error);
      }

      // Tratamento específico de erros
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || errorData?.message;
      const errorCode = errorData?.code;

      // Erro de rede/conexão - com retry automático
      if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error" ||
        error.message === "Failed to fetch" ||
        error.message?.includes("NetworkError") ||
        error.message?.includes("Connection refused")
      ) {
        emitNotice({
          message: "🔌 Falha de Conexão: Não foi possível contatar o servidor.",
          attempts: nextAttempts,
          status: 0,
          category: "NETWORK",
          origin: "NETWORK",
          code: error.code ?? "ERR_NETWORK",
          retryAction: () => handleSubmit(e),
        });
        return;
      }

      // Timeout - com retry automático
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        emitNotice({
          message: "⏱️ Tempo Esgotado: Servidor demorou para responder.",
          attempts: nextAttempts,
          status: 0,
          category: "TIMEOUT",
          origin: "NETWORK",
          code: error.code ?? "TIMEOUT",
          retryAction: () => handleSubmit(e),
        });
        return;
      }

      // Erros HTTP específicos
      switch (status) {
        case 400:
          emitNotice({
            message: "⚠️ Dados Inválidos: Verifique email e senha.",
            attempts: nextAttempts,
            status,
            category: "BAD_REQUEST",
            origin: "API",
            code: errorCode ?? String(errorMessage ?? "BAD_REQUEST"),
          });
          break;

        case 401:
          if (errorMessage === "invalid_credentials" || errorCode === "INVALID_CREDENTIALS") {
            emitNotice({
              message: "🔐 Acesso Negado: Email ou senha incorretos.",
              attempts: nextAttempts,
              status,
              category: "AUTH",
              origin: "API",
              code: errorCode ?? "INVALID_CREDENTIALS",
            });
          } else if (errorMessage === "user_not_found" || errorCode === "USER_NOT_FOUND") {
            emitNotice({
              message: "👤 Usuário Não Encontrado: Email não cadastrado.",
              attempts: nextAttempts,
              status,
              category: "AUTH",
              origin: "API",
              code: errorCode ?? "USER_NOT_FOUND",
            });
          } else if (errorMessage === "invalid_password" || errorCode === "INVALID_PASSWORD") {
            emitNotice({
              message: "🔑 Senha Incorreta: Verifique sua senha e tente novamente.",
              attempts: nextAttempts,
              status,
              category: "AUTH",
              origin: "API",
              code: errorCode ?? "INVALID_PASSWORD",
            });
          } else {
            emitNotice({
              message: "🚫 Não Autorizado: Credenciais inválidas.",
              attempts: nextAttempts,
              status,
              category: "AUTH",
              origin: "API",
              code: errorCode ?? String(errorMessage ?? "UNAUTHORIZED"),
            });
          }
          break;

        case 403:
          if (errorCode === "CSRF_TOKEN_MISSING" || errorCode === "CSRF_MISSING") {
            emitNotice({
              message: "🔒 Token de Segurança Ausente: Recarregue a página.",
              attempts: nextAttempts,
              status,
              category: "SECURITY",
              origin: "API",
              code: errorCode,
            });
          } else if (errorCode === "CSRF_TOKEN_INVALID" || errorCode === "CSRF_INVALID") {
            emitNotice({
              message: "🔒 Token de Segurança Expirado: Recarregue a página.",
              attempts: nextAttempts,
              status,
              category: "SECURITY",
              origin: "API",
              code: errorCode,
            });
          } else if (errorMessage === "account_locked" || errorCode === "ACCOUNT_LOCKED") {
            emitNotice({
              message: "🔒 Conta Bloqueada: Contate o administrador do sistema.",
              attempts: nextAttempts,
              status,
              category: "SECURITY",
              origin: "API",
              code: errorCode ?? "ACCOUNT_LOCKED",
            });
          } else if (errorMessage === "account_disabled" || errorCode === "ACCOUNT_DISABLED") {
            emitNotice({
              message: "⛔ Conta Desativada: Entre em contato com o suporte.",
              attempts: nextAttempts,
              status,
              category: "SECURITY",
              origin: "API",
              code: errorCode ?? "ACCOUNT_DISABLED",
            });
          } else {
            emitNotice({
              message: "🚷 Acesso Proibido: Você não tem permissão para acessar.",
              attempts: nextAttempts,
              status,
              category: "SECURITY",
              origin: "API",
              code: errorCode ?? String(errorMessage ?? "FORBIDDEN"),
            });
          }
          break;

        case 429: {
          const retryAfter = errorData?.retryAfter || 300;
          emitNotice({
            message: `⏸️ Muitas Tentativas: Aguarde ${Math.ceil(retryAfter / 60)} minutos antes de tentar novamente.`,
            attempts: nextAttempts,
            status,
            category: "RATE_LIMIT",
            origin: "API",
            code: errorCode ?? "RATE_LIMIT",
          });
          break;
        }

        case 500:
          emitNotice({
            message: "⚙️ Erro no Servidor: Problema interno. Tente novamente em instantes.",
            attempts: nextAttempts,
            status,
            category: "SERVER",
            origin: "API",
            code: errorCode ?? "INTERNAL_ERROR",
          });
          break;

        case 502:
        case 503: {
          const isApiUnavailable =
            errorCode === "API_UNAVAILABLE" ||
            errorCode === "API_CONNECTION_ERROR" ||
            (typeof errorMessage === "string" &&
              (errorMessage.includes("não está disponível") ||
                errorMessage.includes("não está rodando") ||
                errorMessage.includes("ECONNREFUSED")));
          emitNotice({
            message: isApiUnavailable
              ? "🔌 API não está rodando. Execute: pnpm turbo dev"
              : "🔧 Servidor Indisponível: Sistema em manutenção. Tente mais tarde.",
            attempts: nextAttempts,
            status,
            category: "UPSTREAM",
            origin: "API",
            code: errorCode ?? `HTTP_${status}`,
          });
          break;
        }

        case 504:
          emitNotice({
            message: "⏱️ Gateway Timeout: Servidor não respondeu a tempo. Tente novamente.",
            attempts: nextAttempts,
            status,
            category: "TIMEOUT",
            origin: "API",
            code: errorCode ?? "GATEWAY_TIMEOUT",
          });
          break;

        default:
          if (status) {
            const msg = `❌ Erro ${status}: ${errorMessage || "Falha ao processar login. Tente novamente."}`;
            emitNotice({
              message: msg,
              attempts: nextAttempts,
              status,
              category: "UNKNOWN",
              origin: "API",
              code: errorCode ?? String(errorMessage ?? `HTTP_${status}`),
            });
          } else {
            emitNotice({
              message: "🔴 Erro Desconhecido: Não foi possível conectar ao servidor.",
              attempts: nextAttempts,
              status: 0,
              category: "UNKNOWN",
              origin: "CLIENT",
              code: error.code ?? "UNKNOWN",
            });
          }
      }
    } finally {
      if (!mfaRequired) {
        setIsLoading(false);
      }
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = calculatePasswordStrength(password);

  if (mfaRequired) {
    return (
      <MFALogin
        email={email}
        onCancel={() => setMfaRequired(false)}
      />
    );
  }

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 relative group/form [@media(max-height:760px)]:gap-4"
        aria-label="Formulário de login"
      >
        {/* Scanline "terminal" no foco */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-focus-within/form:opacity-100 transition-opacity duration-300">
          <div className="absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[hsl(var(--primary)/0.55)] to-transparent animate-auth-scanline" />
        </div>

        {/* Honeypot field (hidden from users, visible to bots) */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="space-y-6">
          {/* Email Input with Tooltip */}
          <div className="group space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.2em] pl-1 flex items-center gap-2"
            >
              <Terminal className="h-3 w-3" />
              Identificador Corporativo
            </Label>
            <Tooltip open={!!emailError && email.length > 0}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className={cn(
                    "relative bg-black/40 border flex items-center px-0 h-12 transition-all duration-300 group-hover:border-white/20",
                    emailError && email.length > 0 ? "border-red-500/40" : "border-white/10 focus-within:border-[hsl(var(--primary))]"
                  )}>
                    <div className="h-full w-12 flex items-center justify-center border-r border-white/10 bg-white/5">
                      <Mail className="h-5 w-5 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        onDismissNotice?.();
                        setEmail(e.target.value);
                        setEmailError(validateEmail(e.target.value));
                      }}
                      placeholder="USUARIO@MORINA.COM"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 px-4 h-full font-mono tracking-wide"
                      required
                      autoComplete="username"
                      disabled={isLoading}
                    />
                    <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                    <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-red-500/90 text-white border-red-600">
                <p className="text-xs font-mono">{emailError}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Password Input with Tooltip */}
          <div className="group space-y-1.5">
            <div className="flex justify-between items-center pl-1">
              <Label
                htmlFor="password"
                className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.2em] flex items-center gap-2"
              >
                <ShieldCheck className="h-3 w-3" />
                Credencial de Acesso
              </Label>
              <Link
                href="/forgot-password"
                className="text-[9px] text-white/40 hover:text-[hsl(var(--primary))] transition-colors font-mono uppercase tracking-wider"
              >
                [ Recuperar Acesso ]
              </Link>
            </div>
            <Tooltip open={!!passwordError && password.length > 0}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className={cn(
                    "relative bg-black/40 border flex items-center px-0 h-12 transition-all duration-300 group-hover:border-white/20",
                    passwordError && password.length > 0 ? "border-red-500/40" : "border-white/10 focus-within:border-[hsl(var(--primary))]"
                  )}>
                    <div className="h-full w-12 flex items-center justify-center border-r border-white/10 bg-white/5">
                      <Lock className="h-5 w-5 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        onDismissNotice?.();
                        setPassword(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                      }}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 px-4 h-full font-mono tracking-wide"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-full w-12 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all border-l border-white/10"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                    <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-red-500/90 text-white border-red-600">
                <p className="text-xs font-mono">{passwordError}</p>
              </TooltipContent>
            </Tooltip>

            {/* Password strength */}
            <div
              className={cn(
                "mt-2 h-3",
                "[@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:h-2.5",
              )}
              aria-hidden="true"
            >
              <div
                className={cn(
                  "flex h-full gap-0.5",
                  password ? "opacity-100" : "opacity-40",
                )}
              >
                {[0, 1, 2, 3, 4].map((step) => (
                  <div
                    key={`strength-below-${step}`}
                    className={cn(
                      "flex-1 transition-colors duration-200",
                      step < strength
                        ? strength <= 2
                          ? "bg-red-500"
                          : strength <= 3
                            ? "bg-yellow-500"
                            : "bg-[hsl(var(--primary))]"
                        : "bg-white/10",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Remember */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-4 w-4 border border-white/30 bg-black/20 peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all flex items-center justify-center">
                <div className="h-2 w-2 bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors font-mono leading-snug">
              CONFIRMO LEITURA:{" "}
              <Link href="/termos" className="text-[hsl(var(--primary))] hover:underline">
                TERMOS
              </Link>{" "}
              &{" "}
              <Link href="/privacidade" className="text-[hsl(var(--primary))] hover:underline">
                POLÍTICAS
              </Link>
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-4 w-4 border border-white/30 bg-black/20 peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all flex items-center justify-center">
                <div className="h-2 w-2 bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors font-mono uppercase">
              Manter Sessão Ativa
            </span>
          </label>
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          className={cn(
            "w-full h-14 font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden group border border-transparent",
            termsAccepted && !isLoading
              ? "bg-[hsl(var(--primary))] text-black hover:bg-[hsl(var(--primary)/0.9)] shadow-[0_0_20px_hsl(var(--primary)/0.3)] cursor-pointer"
              : "bg-white/5 text-white/20 border-white/10 cursor-not-allowed",
          )}
          disabled={isLoading || !termsAccepted || loginAttempts >= 5}
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700" />

          <span className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">ESTABELECENDO CONEXÃO...</span>
              </>
            ) : (
              <>
                INICIAR SISTEMA
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </Button>
      </form>
    </TooltipProvider>
  );
}
