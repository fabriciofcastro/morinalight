"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  Bell,
  Eye,
  Keyboard,
  Moon,
  Palette,
  Save,
  Settings,
  Shield,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";

export function PreferencesTab() {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    // Aparência
    theme: "dark" as "light" | "dark" | "auto",
    density: "comfortable" as "compact" | "comfortable" | "spacious",
    fontSize: "medium" as "small" | "medium" | "large",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h" as "12h" | "24h",

    // Notificações
    emailNotifications: {
      system: true,
      security: true,
      approvals: true,
      activities: false,
    },
    pushNotifications: {
      system: true,
      security: true,
      approvals: true,
      activities: false,
    },
    inAppNotifications: {
      system: true,
      security: true,
      approvals: true,
      activities: true,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    digest: "daily" as "none" | "daily" | "weekly",

    // Privacidade
    profileVisibility: "organization" as "public" | "organization" | "private",
    whoCanFindMe: "organization" as "everyone" | "organization" | "none",
    dataSharing: {
      analytics: true,
      improvements: true,
    },

    // Acessibilidade
    highContrast: false,
    reduceMotion: false,
    screenReader: false,

    // Atalhos de teclado
    keyboardShortcuts: [
      { id: "search", action: "Buscar", defaultKey: "Ctrl+K", customKey: "" },
      { id: "notifications", action: "Abrir Notificações", defaultKey: "Ctrl+N", customKey: "" },
      { id: "profile", action: "Abrir Perfil", defaultKey: "Ctrl+P", customKey: "" },
      { id: "settings", action: "Abrir Configurações", defaultKey: "Ctrl+,", customKey: "" },
      { id: "logout", action: "Fazer Logout", defaultKey: "Ctrl+Shift+Q", customKey: "" },
    ] as Array<{ id: string; action: string; defaultKey: string; customKey: string }>,
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implementar salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Preferências salvas com sucesso.",
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Aparência */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Palette className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Aparência</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Tema</Label>
            <div className="mt-2 flex gap-2">
              {(["light", "dark", "auto"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setPreferences((prev) => ({ ...prev, theme }))}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 border px-4 py-3 transition-colors",
                    preferences.theme === theme
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  <span className="capitalize">{theme === "auto" ? "Automático" : theme === "light" ? "Claro" : "Escuro"}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="density">Densidade da Interface</Label>
            <select
              id="density"
              value={preferences.density}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  density: e.target.value as typeof preferences.density,
                }))
              }
              className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="compact">Compacta</option>
              <option value="comfortable">Confortável</option>
              <option value="spacious">Espaçosa</option>
            </select>
          </div>

          <div>
            <Label htmlFor="font-size">Tamanho da Fonte</Label>
            <select
              id="font-size"
              value={preferences.fontSize}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  fontSize: e.target.value as typeof preferences.fontSize,
                }))
              }
              className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
                className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences((prev) => ({ ...prev, timezone: e.target.value }))}
                className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date-format">Formato de Data</Label>
              <select
                id="date-format"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences((prev) => ({ ...prev, dateFormat: e.target.value }))}
                className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <Label htmlFor="time-format">Formato de Hora</Label>
              <div className="mt-2 flex gap-2">
                {(["12h", "24h"] as const).map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setPreferences((prev) => ({ ...prev, timeFormat: format }))}
                    className={cn(
                      "flex-1 border px-4 py-2 text-sm transition-colors",
                      preferences.timeFormat === format
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notificações */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Notificações</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Notificações por Email</h3>
            <div className="space-y-2">
              {Object.entries(preferences.emailNotifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 capitalize">{key}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        emailNotifications: {
                          ...prev.emailNotifications,
                          [key]: !value,
                        },
                      }))
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      value ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        value && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Notificações Push</h3>
            <div className="space-y-2">
              {Object.entries(preferences.pushNotifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 capitalize">{key}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        pushNotifications: {
                          ...prev.pushNotifications,
                          [key]: !value,
                        },
                      }))
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      value ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        value && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Notificações In-App</h3>
            <div className="space-y-2">
              {Object.entries(preferences.inAppNotifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 capitalize">{key}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        inAppNotifications: {
                          ...prev.inAppNotifications,
                          [key]: !value,
                        },
                      }))
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      value ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        value && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Horário de Silêncio</h3>
            <label className="mb-3 flex items-center justify-between">
              <span className="text-sm text-white/70">Ativar horário de silêncio</span>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled },
                  }))
                }
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  preferences.quietHours.enabled ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    preferences.quietHours.enabled && "translate-x-5",
                  )}
                />
              </button>
            </label>
            {preferences.quietHours.enabled && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="quiet-start">Início</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">Fim</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="digest">Resumo de Notificações</Label>
            <select
              id="digest"
              value={preferences.digest}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  digest: e.target.value as typeof preferences.digest,
                }))
              }
              className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="none">Nenhum</option>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Privacidade */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Privacidade</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
            <select
              id="profile-visibility"
              value={preferences.profileVisibility}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  profileVisibility: e.target.value as typeof preferences.profileVisibility,
                }))
              }
              className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="public">Público</option>
              <option value="organization">Apenas Organização</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div>
            <Label htmlFor="who-can-find-me">Quem Pode Me Encontrar</Label>
            <select
              id="who-can-find-me"
              value={preferences.whoCanFindMe}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  whoCanFindMe: e.target.value as typeof preferences.whoCanFindMe,
                }))
              }
              className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="everyone">Todos</option>
              <option value="organization">Apenas Organização</option>
              <option value="none">Ninguém</option>
            </select>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Compartilhamento de Dados</h3>
            <div className="space-y-2">
              {Object.entries(preferences.dataSharing).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 capitalize">
                    {key === "analytics" ? "Dados de Análise" : "Melhorias do Produto"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        dataSharing: {
                          ...prev.dataSharing,
                          [key]: !value,
                        },
                      }))
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      value ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        value && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Acessibilidade */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Acessibilidade</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-white/70">Alto Contraste</span>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({ ...prev, highContrast: !prev.highContrast }))
              }
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                preferences.highContrast ? "bg-[hsl(var(--primary))]" : "bg-white/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  preferences.highContrast && "translate-x-5",
                )}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-white/70">Redução de Movimento</span>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({ ...prev, reduceMotion: !prev.reduceMotion }))
              }
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                preferences.reduceMotion ? "bg-[hsl(var(--primary))]" : "bg-white/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  preferences.reduceMotion && "translate-x-5",
                )}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-white/70">Leitor de Tela</span>
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({ ...prev, screenReader: !prev.screenReader }))
              }
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                preferences.screenReader ? "bg-[hsl(var(--primary))]" : "bg-white/20",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  preferences.screenReader && "translate-x-5",
                )}
              />
            </button>
          </label>
        </div>
      </GlassCard>

      {/* Atalhos de Teclado */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Atalhos de Teclado</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Personalize os atalhos de teclado para ações comuns. Clique no campo para definir um novo atalho.
          </p>

          <div className="space-y-3">
            {preferences.keyboardShortcuts.map((shortcut) => {
              const displayKey = shortcut.customKey || shortcut.defaultKey;

              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between gap-4 border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{shortcut.action}</p>
                    <p className="text-xs text-white/50">
                      Padrão: <span className="font-mono">{shortcut.defaultKey}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={displayKey}
                        readOnly
                        placeholder="Pressione as teclas..."
                        className="w-32 font-mono text-sm"
                        onKeyDown={(e) => {
                          e.preventDefault();
                          const keys: string[] = [];
                          if (e.ctrlKey || e.metaKey) keys.push(e.metaKey ? "Cmd" : "Ctrl");
                          if (e.shiftKey) keys.push("Shift");
                          if (e.altKey) keys.push("Alt");
                          if (e.key && !["Control", "Meta", "Shift", "Alt"].includes(e.key)) {
                            keys.push(e.key.toUpperCase());
                          }
                          if (keys.length > 0) {
                            const newKey = keys.join("+");
                            setPreferences((prev) => ({
                              ...prev,
                              keyboardShortcuts: prev.keyboardShortcuts.map((s) =>
                                s.id === shortcut.id ? { ...s, customKey: newKey } : s,
                              ),
                            }));
                          }
                        }}
                        onFocus={(e) => {
                          e.target.value = "";
                        }}
                      />
                    </div>

                    {shortcut.customKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreferences((prev) => ({
                            ...prev,
                            keyboardShortcuts: prev.keyboardShortcuts.map((s) =>
                              s.id === shortcut.id ? { ...s, customKey: "" } : s,
                            ),
                          }));
                        }}
                        className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Restaurar padrão"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreferences((prev) => ({
                  ...prev,
                  keyboardShortcuts: prev.keyboardShortcuts.map((s) => ({ ...s, customKey: "" })),
                }));
                notificationCenter.add({
                  type: "success",
                  title: "Atalhos restaurados",
                  message: "Todos os atalhos foram restaurados para os valores padrão.",
                });
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Restaurar Todos os Padrões
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Preferências"}
        </Button>
      </div>
    </div>
  );
}


