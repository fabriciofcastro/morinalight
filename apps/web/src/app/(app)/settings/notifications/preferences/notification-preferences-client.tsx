"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  Bell,
  Calendar,
  Mail,
  Save,
  Send,
  Settings,
  Smartphone,
  TestTube,
} from "lucide-react";
import { useState } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";

type NotificationCategory = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  frequency: "immediate" | "daily" | "weekly";
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
};

const CATEGORIES: NotificationCategory[] = [
  {
    id: "system",
    name: "Sistema",
    description: "Manutenção, atualizações e avisos do sistema",
    enabled: true,
    channels: { email: true, push: true, inApp: true },
    frequency: "immediate",
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  },
  {
    id: "security",
    name: "Segurança",
    description: "Logins, alterações de senha e alertas de segurança",
    enabled: true,
    channels: { email: true, push: true, inApp: true },
    frequency: "immediate",
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  },
  {
    id: "approval",
    name: "Aprovações",
    description: "Solicitações pendentes que requerem sua aprovação",
    enabled: true,
    channels: { email: false, push: true, inApp: true },
    frequency: "immediate",
    quietHours: { enabled: true, start: "22:00", end: "08:00" },
  },
  {
    id: "activity",
    name: "Atividades",
    description: "Mudanças em itens que você criou ou está seguindo",
    enabled: true,
    channels: { email: false, push: false, inApp: true },
    frequency: "daily",
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  },
  {
    id: "message",
    name: "Mensagens",
    description: "Comunicações diretas e mensagens de outros usuários",
    enabled: true,
    channels: { email: true, push: true, inApp: true },
    frequency: "immediate",
    quietHours: { enabled: true, start: "22:00", end: "08:00" },
  },
  {
    id: "report",
    name: "Relatórios",
    description: "Relatórios agendados e resumos automáticos",
    enabled: true,
    channels: { email: true, push: false, inApp: false },
    frequency: "weekly",
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  },
];

export function NotificationPreferencesClient() {
  const [categories, setCategories] = useState<NotificationCategory[]>(CATEGORIES);
  const [saving, setSaving] = useState(false);
  const [testNotification, setTestNotification] = useState({
    type: "info" as "success" | "error" | "info" | "warning",
    channel: "inApp" as "email" | "push" | "inApp",
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implementar salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Preferências de notificações salvas com sucesso.",
    });
    setSaving(false);
  };

  const handleTestNotification = () => {
    notificationCenter.add({
      type: testNotification.type,
      title: "Notificação de Teste",
      message: "Esta é uma notificação de teste para verificar suas configurações.",
    });
  };

  const updateCategory = (id: string, updates: Partial<NotificationCategory>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      {categories.map((category) => (
        <GlassCard key={category.id} className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                <button
                  type="button"
                  onClick={() => updateCategory(category.id, { enabled: !category.enabled })}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    category.enabled ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      category.enabled && "translate-x-5",
                    )}
                  />
                </button>
              </div>
              <p className="text-sm text-white/60">{category.description}</p>
            </div>
          </div>

          {category.enabled && (
            <div className="space-y-4">
              {/* Channels */}
              <div>
                <Label className="mb-3 block">Canais de Notificação</Label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/70">Email</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateCategory(category.id, {
                          channels: { ...category.channels, email: !category.channels.email },
                        })
                      }
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        category.channels.email ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          category.channels.email && "translate-x-5",
                        )}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/70">Push</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateCategory(category.id, {
                          channels: { ...category.channels, push: !category.channels.push },
                        })
                      }
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        category.channels.push ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          category.channels.push && "translate-x-5",
                        )}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/70">In-App</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateCategory(category.id, {
                          channels: { ...category.channels, inApp: !category.channels.inApp },
                        })
                      }
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        category.channels.inApp ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          category.channels.inApp && "translate-x-5",
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <Label htmlFor={`frequency-${category.id}`}>Frequência</Label>
                <select
                  id={`frequency-${category.id}`}
                  value={category.frequency}
                  onChange={(e) =>
                    updateCategory(category.id, {
                      frequency: e.target.value as NotificationCategory["frequency"],
                    })
                  }
                  className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="immediate">Imediato</option>
                  <option value="daily">Resumo Diário</option>
                  <option value="weekly">Resumo Semanal</option>
                </select>
              </div>

              {/* Quiet Hours */}
              <div>
                <label className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/70">Horário de Silêncio</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCategory(category.id, {
                        quietHours: { ...category.quietHours, enabled: !category.quietHours.enabled },
                      })
                    }
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      category.quietHours.enabled ? "bg-[hsl(var(--primary))]" : "bg-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        category.quietHours.enabled && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
                {category.quietHours.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`quiet-start-${category.id}`}>Início</Label>
                      <Input
                        id={`quiet-start-${category.id}`}
                        type="time"
                        value={category.quietHours.start}
                        onChange={(e) =>
                          updateCategory(category.id, {
                            quietHours: { ...category.quietHours, start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quiet-end-${category.id}`}>Fim</Label>
                      <Input
                        id={`quiet-end-${category.id}`}
                        type="time"
                        value={category.quietHours.end}
                        onChange={(e) =>
                          updateCategory(category.id, {
                            quietHours: { ...category.quietHours, end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      ))}

      {/* Advanced Settings */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Configurações Avançadas</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="keyword-filters">Filtros por Palavras-chave</Label>
            <textarea
              id="keyword-filters"
              placeholder="Digite palavras-chave separadas por vírgula para filtrar notificações..."
              className="mt-2 flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
            />
            <p className="mt-1 text-xs text-white/50">
              Notificações contendo estas palavras serão filtradas automaticamente
            </p>
          </div>

          <div>
            <Label htmlFor="custom-rules">Regras Customizadas</Label>
            <textarea
              id="custom-rules"
              placeholder="Ex: Só notificar se for urgente, Não notificar durante reuniões..."
              className="mt-2 flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
            />
            <p className="mt-1 text-xs text-white/50">
              Defina regras personalizadas para suas notificações (funcionalidade será implementada em breve)
            </p>
          </div>

          <div>
            <label className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/70">Integração com Calendário</span>
              </div>
              <button
                type="button"
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  "bg-white/20", // TODO: Implementar estado
                )}
              >
                <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white" />
              </button>
            </label>
            <p className="text-xs text-white/50">
              Não enviar notificações durante eventos do calendário (funcionalidade será implementada em breve)
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Test Notification */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <TestTube className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Teste de Notificação</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="test-type">Tipo de Notificação</Label>
              <select
                id="test-type"
                value={testNotification.type}
                onChange={(e) =>
                  setTestNotification((prev) => ({
                    ...prev,
                    type: e.target.value as typeof testNotification.type,
                  }))
                }
                className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
                <option value="info">Informação</option>
                <option value="warning">Aviso</option>
              </select>
            </div>

            <div>
              <Label htmlFor="test-channel">Canal</Label>
              <select
                id="test-channel"
                value={testNotification.channel}
                onChange={(e) =>
                  setTestNotification((prev) => ({
                    ...prev,
                    channel: e.target.value as typeof testNotification.channel,
                  }))
                }
                className="mt-2 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="inApp">In-App</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>

          <Button type="button" onClick={handleTestNotification}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Notificação de Teste
          </Button>
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


