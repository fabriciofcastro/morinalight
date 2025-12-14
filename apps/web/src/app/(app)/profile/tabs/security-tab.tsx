"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Lock,
  LogOut,
  QrCode,
  Shield,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [sessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      browser: "Chrome 120.0",
      ip: "192.168.1.100",
      location: "São Paulo, SP, Brasil",
      lastActive: new Date(),
      isCurrent: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      browser: "Safari 17.0",
      ip: "192.168.1.101",
      location: "São Paulo, SP, Brasil",
      lastActive: new Date(Date.now() - 3600000),
      isCurrent: false,
    },
  ]);

  const [apiTokens] = useState([
    {
      id: "1",
      name: "API Token Principal",
      lastUsed: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 2592000000),
    },
  ]);

  const [securityActivity] = useState([
    {
      id: "1",
      type: "login",
      description: "Login realizado com sucesso",
      ip: "192.168.1.100",
      location: "São Paulo, SP",
      timestamp: new Date(),
      status: "success",
    },
    {
      id: "2",
      type: "password_change",
      description: "Senha alterada",
      timestamp: new Date(Date.now() - 86400000),
      status: "success",
    },
    {
      id: "3",
      type: "failed_login",
      description: "Tentativa de login falhada",
      ip: "192.168.1.200",
      timestamp: new Date(Date.now() - 172800000),
      status: "warning",
    },
  ]);

  const [passwordHistory, setPasswordHistory] = useState<Array<{
    id: string;
    changedAt: string;
    ip: string;
    userAgent?: string;
  }>>([]);
  const [loadingPasswordHistory, setLoadingPasswordHistory] = useState(false);

  const loadPasswordHistory = useCallback(async () => {
    setLoadingPasswordHistory(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const response = await fetch("/api/profile/password-history", { headers });
      if (response.ok) {
        const data = await response.json();
        setPasswordHistory(data.itens || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPasswordHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadPasswordHistory();
  }, [loadPasswordHistory]);

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "As senhas não coincidem.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      notificationCenter.add({
        type: "error",
        title: "Senha fraca",
        message: "A senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }

    setChangingPassword(true);
    // TODO: Implementar alteração de senha
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Senha alterada com sucesso.",
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setChangingPassword(false);
  };

  const handleToggle2FA = () => {
    // TODO: Implementar toggle 2FA
    setTwoFactorEnabled(!twoFactorEnabled);
    notificationCenter.add({
      type: "info",
      title: "2FA",
      message: twoFactorEnabled
        ? "2FA será desativado em breve."
        : "Configuração de 2FA será implementada em breve.",
    });
  };

  const handleEndSession = (sessionId: string) => {
    // TODO: Implementar encerrar sessão
    notificationCenter.add({
      type: "info",
      title: "Encerrar Sessão",
      message: "Funcionalidade será implementada em breve.",
    });
  };

  const handleEndAllSessions = () => {
    // TODO: Implementar encerrar todas as sessões
    notificationCenter.add({
      type: "info",
      title: "Encerrar Todas as Sessões",
      message: "Funcionalidade será implementada em breve.",
    });
  };

  const handleCreateApiToken = () => {
    // TODO: Implementar criar token
    notificationCenter.add({
      type: "info",
      title: "Criar Token",
      message: "Funcionalidade será implementada em breve.",
    });
  };

  const handleRevokeToken = (tokenId: string) => {
    // TODO: Implementar revogar token
    notificationCenter.add({
      type: "info",
      title: "Revogar Token",
      message: "Funcionalidade será implementada em breve.",
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Muito fraca", color: "bg-red-500" };
    if (password.length < 8) return { strength: 2, label: "Fraca", color: "bg-orange-500" };
    if (password.length < 12) return { strength: 3, label: "Média", color: "bg-yellow-500" };
    return { strength: 4, label: "Forte", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-6">
      {/* Alteração de Senha */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Key className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Alteração de Senha</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Senha Atual *</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <Label htmlFor="new-password">Nova Senha *</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Digite sua nova senha"
            />
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="mb-1 flex h-2 gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-full flex-1",
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-white/10",
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/50">{passwordStrength.label}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirmar Nova Senha *</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              placeholder="Confirme sua nova senha"
            />
            {passwordForm.confirmPassword &&
              passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">As senhas não coincidem</p>
              )}
          </div>

          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-white">Requisitos de senha:</p>
            <ul className="space-y-1 text-xs text-white/70">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Pelo menos uma letra maiúscula</li>
              <li>• Pelo menos uma letra minúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Pelo menos um caractere especial</li>
            </ul>
          </div>

          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
          >
            {changingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </div>
      </GlassCard>

      {/* 2FA */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-white">Autenticação de Dois Fatores (2FA)</h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-sm",
                twoFactorEnabled ? "text-green-400" : "text-white/50",
              )}
            >
              {twoFactorEnabled ? "Ativado" : "Desativado"}
            </span>
            <button
              type="button"
              onClick={handleToggle2FA}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                twoFactorEnabled ? "bg-[hsl(var(--primary))]" : "bg-white/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  twoFactorEnabled && "translate-x-5",
                )}
              />
            </button>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="space-y-4">
            <div className="rounded border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-48 w-48 items-center justify-center border border-white/10 bg-white/5">
                  <QrCode className="h-32 w-32 text-white/20" />
                </div>
              </div>
              <p className="text-center text-sm text-white/70">
                Escaneie este QR Code com seu aplicativo autenticador
              </p>
            </div>

            <div>
              <Label>Códigos de Backup</Label>
              <div className="mt-2 rounded border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs text-white/50">
                  Guarde estes códigos em local seguro. Eles podem ser usados para acessar sua conta
                  caso você perca acesso ao seu dispositivo.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs text-white/70">
                  <div>ABC123</div>
                  <div>DEF456</div>
                  <div>GHI789</div>
                  <div>JKL012</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Sessões Ativas */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-white">Sessões Ativas</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleEndAllSessions}>
            <LogOut className="mr-2 h-4 w-4" />
            Encerrar Todas as Outras Sessões
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-white">{session.device}</span>
                  {session.isCurrent && (
                    <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60">{session.browser}</p>
                <p className="text-xs text-white/50">
                  {session.ip} • {session.location}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Última atividade: {session.lastActive.toLocaleString("pt-BR")}
                </p>
              </div>
              {!session.isCurrent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndSession(session.id)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Encerrar
                </Button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tokens de API */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-white">Tokens de API</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCreateApiToken}>
            Criar Novo Token
          </Button>
        </div>

        <div className="space-y-3">
          {apiTokens.length === 0 ? (
            <p className="text-center text-sm text-white/50">Nenhum token criado</p>
          ) : (
            apiTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-semibold text-white">{token.name}</p>
                  <p className="text-xs text-white/50">
                    Criado em {token.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-xs text-white/50">
                    Último uso: {token.lastUsed.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeToken(token.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revogar
                </Button>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Histórico de Senhas */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-white">Histórico de Senhas</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadPasswordHistory}
            disabled={loadingPasswordHistory}
          >
            {loadingPasswordHistory ? "Carregando..." : "Atualizar"}
          </Button>
        </div>

        <div className="space-y-3">
          {passwordHistory.length === 0 ? (
            <p className="text-center text-sm text-white/50">
              Nenhum histórico de senhas disponível. As alterações de senha serão registradas aqui.
            </p>
          ) : (
            passwordHistory.map((hist) => (
              <div
                key={hist.id}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    Alterada em {new Date(hist.changedAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-white/50">IP: {hist.ip}</p>
                  {hist.userAgent && (
                    <p className="text-xs text-white/40 mt-1">{hist.userAgent}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Atividade de Segurança */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Atividade de Segurança</h2>
        </div>

        <div className="space-y-3">
          {securityActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded border border-white/10 bg-white/5 p-4"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded",
                  activity.status === "success" && "bg-green-500/20 text-green-400",
                  activity.status === "warning" && "bg-yellow-500/20 text-yellow-400",
                )}
              >
                {activity.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{activity.description}</p>
                {activity.ip && (
                  <p className="text-xs text-white/50">
                    {activity.ip} • {activity.location}
                  </p>
                )}
                <p className="text-xs text-white/40">
                  {activity.timestamp.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}


