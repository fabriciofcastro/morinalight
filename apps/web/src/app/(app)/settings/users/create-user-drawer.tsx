"use client";

import { Button, GlassCard, Input, Label } from "@morina/ui";
import { Copy, RefreshCw, Upload, X } from "lucide-react";
import { useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type CreateUserDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
};

export function CreateUserDrawer({ open, onClose, onUserCreated }: CreateUserDrawerProps) {
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [sendInvite, setSendInvite] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!open) return null;

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password: generated, confirmPassword: generated }));
    notificationCenter.add({
      type: "success",
      title: "Senha gerada",
      message: "Senha temporária gerada com sucesso. Copie e envie ao usuário.",
    });
  };

  const copyPassword = () => {
    if (formData.password) {
      void navigator.clipboard.writeText(formData.password);
      notificationCenter.add({
        type: "success",
        title: "Copiado",
        message: "Senha copiada para a área de transferência.",
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo muito grande",
        message: "A imagem deve ter no máximo 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.displayName || !formData.password) {
      notificationCenter.add({
        type: "error",
        title: "Campos obrigatórios",
        message: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      notificationCenter.add({
        type: "error",
        title: "Senhas não coincidem",
        message: "As senhas devem ser iguais.",
      });
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password,
          sendInvite,
          avatarUrl: avatarPreview,
        }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: `Usuário criado com sucesso.${sendInvite ? " Convite enviado por email." : ""}`,
        });
        setFormData({
          email: "",
          displayName: "",
          password: "",
          confirmPassword: "",
        });
        setAvatarPreview(null);
        setSendInvite(true);
        setShowConfirmation(false);
        onUserCreated();
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao criar usuário" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível criar o usuário.",
        });
        setShowConfirmation(false);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar usuário.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="relative w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Novo Usuário</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-2xl font-bold text-white border-2 border-white/20">
                  {formData.displayName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.8)] transition-colors"
              >
                <Upload className="h-3 w-3" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/70">Foto de Perfil (opcional)</p>
              <p className="text-xs text-white/50">JPG, PNG ou GIF. Máx. 5MB</p>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@morina.com.br"
              required
            />
          </div>

          <div>
            <Label htmlFor="displayName">Nome Completo *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Nome do usuário"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="password">Senha Temporária *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Gerar
                </Button>
                {formData.password && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyPassword}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                )}
              </div>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-white/50">
              A senha será enviada por email se "Enviar convite" estiver marcado.
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="checkbox"
              id="send-invite"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <Label htmlFor="send-invite" className="cursor-pointer text-sm text-white/70">
              Enviar convite por email com senha temporária
            </Label>
          </div>

          {showConfirmation && (
            <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3">
              <p className="text-sm text-yellow-400">
                Confirme os dados antes de criar o usuário. Esta ação não pode ser desfeita.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                onClose();
              }}
              disabled={busy}
            >
              Cancelar
            </Button>
            {showConfirmation ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={busy}
                >
                  Voltar
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Criando..." : "Confirmar Criação"}
                </Button>
              </>
            ) : (
              <Button type="submit" disabled={busy}>
                {busy ? "Validando..." : "Criar Usuário"}
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}


