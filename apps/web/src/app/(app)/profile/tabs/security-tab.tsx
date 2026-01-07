"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { PasskeySettings } from "@/components/profile/passkey-settings";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { Button, GlassCard, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    History,
    Key,
    LogOut,
    QrCode,
    Shield,
    Smartphone,
    Trash2,
    X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState<string[]>([]);
  const [twoFactorQRCodeUrl, setTwoFactorQRCodeUrl] = useState<string | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<Array<{
    id: string;
    deviceId: string;
    name: string;
    browser?: string | null;
    os?: string | null;
    ip?: string | null;
    location?: string | null;
    lastUsed: string;
    createdAt: string;
  }>>([]);
  const [loadingTrustedDevices, setLoadingTrustedDevices] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [exportingData, setExportingData] = useState(false);

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

  const [apiTokens, setApiTokens] = useState<Array<{
    id: string;
    name: string;
    tokenPrefix: string;
    lastUsed: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }>>([]);
  
  interface ApiToken {
    id: string;
    name: string;
    tokenPrefix: string;
    lastUsed: string | null;
    expiresAt: string | null;
    createdAt: string;
  }
  const [loadingApiTokens, setLoadingApiTokens] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [selectedTokenForHistory, setSelectedTokenForHistory] = useState<string | null>(null);
  const [tokenHistory, setTokenHistory] = useState<Array<{
    id: string;
    endpoint: string | null;
    method: string | null;
    ip: string | null;
    userAgent: string | null;
    statusCode: number | null;
    responseTime: number | null;
    timestamp: string;
  }>>([]);
  const [loadingTokenHistory, setLoadingTokenHistory] = useState(false);

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

  const load2FAStatus = useCallback(async () => {
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      // Buscar status do usuário atual (assumindo que temos userId disponível)
      // Por enquanto, vamos buscar do perfil
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.user?.twoFactorEnabled) {
          setTwoFactorEnabled(true);
          // Buscar QR code se necessário
          if (!twoFactorSecret) {
            const qrResponse = await fetch(`/api/users/${profileData.user.id}/2fa/qr-code`, { headers });
            if (qrResponse.ok) {
              const qrData = await qrResponse.json();
              setTwoFactorSecret(qrData.secret);
              setTwoFactorBackupCodes(qrData.backupCodes || []);
              setTwoFactorQRCodeUrl(qrData.otpAuthUrl);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [twoFactorSecret]);

  const loadTrustedDevices = useCallback(async () => {
    setLoadingTrustedDevices(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      // Buscar userId do perfil
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/trusted-devices`, { headers });
          if (response.ok) {
            const data = await response.json();
            setTrustedDevices(data.devices || []);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrustedDevices(false);
    }
  }, []);

  useEffect(() => {
    void load2FAStatus();
    void loadTrustedDevices();
  }, [load2FAStatus, loadTrustedDevices]);

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Desativar 2FA
      if (!confirm("Tem certeza que deseja desativar o 2FA? Isso reduzirá a segurança da sua conta.")) {
        return;
      }

      setTwoFactorLoading(true);
      try {
        const headers = {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        };
        const profileResponse = await fetch("/api/profile", { headers });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const userId = profileData.user?.id;
          if (userId) {
            const response = await fetch(`/api/users/${userId}/2fa/disable`, {
              method: "POST",
              headers,
            });
            if (response.ok) {
              setTwoFactorEnabled(false);
              setTwoFactorSecret(null);
              setTwoFactorBackupCodes([]);
              setTwoFactorQRCodeUrl(null);
              notificationCenter.add({
                type: "success",
                title: "2FA Desativado",
                message: "Autenticação de dois fatores foi desativada com sucesso.",
              });
            } else {
              const error = await response.json().catch(() => ({ message: "Erro ao desativar 2FA" }));
              notificationCenter.add({
                type: "error",
                title: "Erro",
                message: error.message || "Não foi possível desativar o 2FA.",
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro inesperado ao desativar 2FA.",
        });
      } finally {
        setTwoFactorLoading(false);
      }
    } else {
      // Ativar 2FA
      setTwoFactorLoading(true);
      try {
        const headers = {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        };
        const profileResponse = await fetch("/api/profile", { headers });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const userId = profileData.user?.id;
          if (userId) {
            const response = await fetch(`/api/users/${userId}/2fa/enable`, {
              method: "POST",
              headers,
            });
            if (response.ok) {
              const data = await response.json();
              setTwoFactorEnabled(true);
              setTwoFactorSecret(data.secret);
              setTwoFactorBackupCodes(data.backupCodes || []);
              setTwoFactorQRCodeUrl(data.otpAuthUrl);
              notificationCenter.add({
                type: "success",
                title: "2FA Ativado",
                message: "Autenticação de dois fatores foi ativada. Configure seu aplicativo autenticador.",
              });
            } else {
              const error = await response.json().catch(() => ({ message: "Erro ao ativar 2FA" }));
              notificationCenter.add({
                type: "error",
                title: "Erro",
                message: error.message || "Não foi possível ativar o 2FA.",
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro inesperado ao ativar 2FA.",
        });
      } finally {
        setTwoFactorLoading(false);
      }
    }
  };

  const handleRemoveTrustedDevice = async (deviceId: string) => {
    if (!confirm("Deseja remover este dispositivo confiável?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/trusted-devices/${deviceId}`, {
            method: "DELETE",
            headers,
          });
          if (response.ok) {
            notificationCenter.add({
              type: "success",
              title: "Dispositivo Removido",
              message: "Dispositivo confiável removido com sucesso.",
            });
            void loadTrustedDevices();
          } else {
            const error = await response.json().catch(() => ({ message: "Erro ao remover dispositivo" }));
            notificationCenter.add({
              type: "error",
              title: "Erro",
              message: error.message || "Não foi possível remover o dispositivo.",
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao remover dispositivo.",
      });
    }
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

  const loadApiTokens = useCallback(async () => {
    setLoadingApiTokens(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/api-tokens`, { headers });
          if (response.ok) {
            const data = await response.json();
            setApiTokens(
              (data.tokens || []).map((token: ApiToken) => ({
                ...token,
                lastUsed: token.lastUsed ? new Date(token.lastUsed) : null,
                expiresAt: token.expiresAt ? new Date(token.expiresAt) : null,
                createdAt: new Date(token.createdAt),
              })),
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApiTokens(false);
    }
  }, []);

  useEffect(() => {
    void loadApiTokens();
  }, [loadApiTokens]);

  const handleCreateApiToken = async () => {
    const name = prompt("Digite um nome para o token:");
    if (!name || !name.trim()) return;

    setCreatingToken(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/api-tokens`, {
            method: "POST",
            headers,
            body: JSON.stringify({ name: name.trim() }),
          });
          if (response.ok) {
            const data = await response.json();
            setNewTokenValue(data.tokenValue);
            notificationCenter.add({
              type: "success",
              title: "Token Criado",
              message: "Token criado com sucesso. Guarde-o em local seguro, ele não será exibido novamente.",
            });
            void loadApiTokens();
          } else {
            const error = await response.json().catch(() => ({ message: "Erro ao criar token" }));
            notificationCenter.add({
              type: "error",
              title: "Erro",
              message: error.message || "Não foi possível criar o token.",
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar token.",
      });
    } finally {
      setCreatingToken(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm("Deseja revogar este token? Ele não poderá ser usado novamente.")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/api-tokens/${tokenId}`, {
            method: "DELETE",
            headers,
          });
          if (response.ok) {
            notificationCenter.add({
              type: "success",
              title: "Token Revogado",
              message: "Token revogado com sucesso.",
            });
            void loadApiTokens();
          } else {
            const error = await response.json().catch(() => ({ message: "Erro ao revogar token" }));
            notificationCenter.add({
              type: "error",
              title: "Erro",
              message: error.message || "Não foi possível revogar o token.",
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao revogar token.",
      });
    }
  };

  const loadTokenHistory = useCallback(async (tokenId: string) => {
    setLoadingTokenHistory(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const profileResponse = await fetch("/api/profile", { headers });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData.user?.id;
        if (userId) {
          const response = await fetch(`/api/users/${userId}/api-tokens/${tokenId}/history`, { headers });
          if (response.ok) {
            const data = await response.json();
            setTokenHistory(data.itens || []);
            setSelectedTokenForHistory(tokenId);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTokenHistory(false);
    }
  }, []);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Muito fraca", color: "bg-red-500" };
    if (password.length < 8) return { strength: 2, label: "Fraca", color: "bg-orange-500" };
    if (password.length < 12) return { strength: 3, label: "Média", color: "bg-yellow-500" };
    return { strength: 4, label: "Forte", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
      };

      const profileResponse = await fetch("/api/profile", { headers });
      if (!profileResponse.ok) throw new Error("Falha ao carregar perfil");
      const profileData = await profileResponse.json();
      const userId = profileData.user?.id;

      if (!userId) throw new Error("Usuário não identificado");

      const response = await fetch(`/api/users/${userId}/lgpd/export`, { headers });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meus-dados-morina-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        notificationCenter.add({
          type: "success",
          title: "Exportação Concluída",
          message: "Seus dados foram exportados com sucesso em formato JSON.",
        });
      } else {
        throw new Error("Falha na exportação");
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro na Exportação",
        message: "Não foi possível exportar seus dados no momento.",
      });
    } finally {
      setExportingData(false);
    }
  };

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

      {/* Passkeys */}
      <PasskeySettings />

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
              disabled={twoFactorLoading}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors disabled:opacity-50",
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
            {twoFactorQRCodeUrl && (
              <div className="rounded border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex h-48 w-48 items-center justify-center border border-white/10 bg-white/5">
                    {twoFactorQRCodeUrl ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorQRCodeUrl)}`}
                        alt="QR Code para 2FA"
                        className="h-full w-full"
                      />
                    ) : (
                      <QrCode className="h-32 w-32 text-white/20" />
                    )}
                  </div>
                </div>
                <p className="text-center text-sm text-white/70">
                  Escaneie este QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
                </p>
                {twoFactorSecret && (
                  <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs text-white/50">Ou configure manualmente com este código:</p>
                    <p className="font-mono text-sm text-white">{twoFactorSecret}</p>
                  </div>
                )}
              </div>
            )}

            {twoFactorBackupCodes.length > 0 && (
              <div>
                <Label htmlFor="backup-codes">Códigos de Backup</Label>
                <div className="mt-2 rounded border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-xs text-white/50">
                    Guarde estes códigos em local seguro. Eles podem ser usados para acessar sua conta
                    caso você perca acesso ao seu dispositivo.
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs text-white/70">
                    {twoFactorBackupCodes.map((code, idx) => (
                      <div key={idx}>{code}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleToggle2FA}
          disabled={twoFactorLoading}
          className="mt-4"
        >
          {twoFactorLoading
            ? "Processando..."
            : twoFactorEnabled
              ? "Desativar 2FA"
              : "Ativar 2FA"}
        </Button>
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadApiTokens}
              disabled={loadingApiTokens}
            >
              {loadingApiTokens ? "Carregando..." : "Atualizar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateApiToken}
              disabled={creatingToken}
            >
              {creatingToken ? "Criando..." : "Criar Novo Token"}
            </Button>
          </div>
        </div>

        {/* Exibir novo token criado (apenas uma vez) */}
        {newTokenValue && (
          <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 p-4">
            <p className="mb-2 text-sm font-semibold text-green-400">Token criado com sucesso!</p>
            <p className="mb-3 text-xs text-white/70">
              Guarde este token em local seguro. Ele não será exibido novamente.
            </p>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <p className="font-mono text-sm text-white break-all">{newTokenValue}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setNewTokenValue(null)}
            >
              Fechar
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {apiTokens.length === 0 ? (
            <p className="text-center text-sm text-white/50">Nenhum token criado</p>
          ) : (
            apiTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{token.name}</p>
                  <p className="text-xs text-white/50 font-mono">{token.tokenPrefix}</p>
                  <p className="text-xs text-white/50">
                    Criado em {token.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                  {token.lastUsed ? (
                    <p className="text-xs text-white/50">
                      Último uso: {token.lastUsed.toLocaleDateString("pt-BR")}
                    </p>
                  ) : (
                    <p className="text-xs text-white/50">Nunca usado</p>
                  )}
                  {token.expiresAt && (
                    <p className="text-xs text-white/50">
                      Expira em: {token.expiresAt.toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void loadTokenHistory(token.id)}
                        disabled={loadingTokenHistory}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Histórico
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4" align="end">
                      <div className="space-y-2">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white">Histórico de Uso</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTokenForHistory(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {loadingTokenHistory ? (
                          <p className="text-center text-xs text-white/50">Carregando...</p>
                        ) : tokenHistory.length === 0 ? (
                          <p className="text-center text-xs text-white/50">Nenhum uso registrado</p>
                        ) : (
                          <div className="max-h-96 space-y-2 overflow-y-auto">
                            {tokenHistory.map((usage) => (
                              <div
                                key={usage.id}
                                className="rounded border border-white/10 bg-white/5 p-3"
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <p className="text-xs font-medium text-white">
                                    {usage.method} {usage.endpoint || "N/A"}
                                  </p>
                                  {usage.statusCode && (
                                    <span
                                      className={cn(
                                        "rounded px-1.5 py-0.5 text-[10px] font-mono",
                                        usage.statusCode >= 200 && usage.statusCode < 300
                                          ? "bg-green-500/20 text-green-400"
                                          : usage.statusCode >= 400
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-yellow-500/20 text-yellow-400",
                                      )}
                                    >
                                      {usage.statusCode}
                                    </span>
                                  )}
                                </div>
                                {usage.ip && (
                                  <p className="text-xs text-white/50">IP: {usage.ip}</p>
                                )}
                                {usage.responseTime && (
                                  <p className="text-xs text-white/50">
                                    Tempo de resposta: {usage.responseTime}ms
                                  </p>
                                )}
                                <p className="text-xs text-white/40">
                                  {new Date(usage.timestamp).toLocaleString("pt-BR")}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
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

      {/* Dispositivos Confiáveis */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-white">Dispositivos Confiáveis</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadTrustedDevices}
            disabled={loadingTrustedDevices}
          >
            {loadingTrustedDevices ? "Carregando..." : "Atualizar"}
          </Button>
        </div>

        <div className="space-y-3">
          {trustedDevices.length === 0 ? (
            <p className="text-center text-sm text-white/50">
              Nenhum dispositivo confiável registrado. Dispositivos confiáveis não precisam de 2FA a cada login.
            </p>
          ) : (
            trustedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 p-4"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-white">{device.name}</span>
                  </div>
                  {device.browser && <p className="text-sm text-white/60">{device.browser}</p>}
                  {device.os && <p className="text-xs text-white/50">OS: {device.os}</p>}
                  {device.ip && (
                    <p className="text-xs text-white/50">
                      {device.ip} {device.location ? `• ${device.location}` : ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-white/40">
                    Último uso: {new Date(device.lastUsed).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveTrustedDevice(device.deviceId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
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
      {/* LGPD Compliance */}
      <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-blue-500/20">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Privacidade e Dados (LGPD)</h2>
              <p className="text-sm text-white/60 max-w-xl">
                Em conformidade com a Lei Geral de Proteção de Dados (Art. 18), você tem o direito à portabilidade.
                Baixe todos os seus dados pessoais, logs de atividade e preferências em um formato legível por máquina.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-blue-500/30 hover:bg-blue-500/20 text-blue-100 shrink-0"
            onClick={handleExportData}
            disabled={exportingData}
          >
            {exportingData ? (
              <>Processando...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar Meus Dados (JSON)
              </>
            )}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}




