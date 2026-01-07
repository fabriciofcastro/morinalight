"use client";

import { Button, GlassCard, Input, Label } from "@morina/ui";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Contact {
  id: string;
  tipo: "email" | "telefone" | "whatsapp" | "emergencia";
  valor: string;
  principal: boolean;
}

interface CompanyContactsForm {
  emailPrincipal: string;
  emailsSecundarios: string[];
  telefoneFixo: string;
  telefoneCelular: string;
  whatsapp: string;
  telefoneEmergencia: string;
  contatoEmergencia: string;
  linkedin: string;
  instagram: string;
  facebook: string;
}

export function CompanyContactsTab() {
  const [emailsSecundarios, setEmailsSecundarios] = useState<string[]>([]);
  const [novoEmail, setNovoEmail] = useState("");

  const form = useForm<CompanyContactsForm>({
    defaultValues: {
      emailPrincipal: "",
      emailsSecundarios: [],
      telefoneFixo: "",
      telefoneCelular: "",
      whatsapp: "",
      telefoneEmergencia: "",
      contatoEmergencia: "",
      linkedin: "",
      instagram: "",
      facebook: "",
    },
  });

  const addEmailSecundario = () => {
    if (novoEmail && !emailsSecundarios.includes(novoEmail)) {
      const updated = [...emailsSecundarios, novoEmail];
      setEmailsSecundarios(updated);
      form.setValue("emailsSecundarios", updated);
      setNovoEmail("");
    }
  };

  const removeEmailSecundario = (email: string) => {
    const updated = emailsSecundarios.filter((e) => e !== email);
    setEmailsSecundarios(updated);
    form.setValue("emailsSecundarios", updated);
  };

  const onSubmit = async (data: CompanyContactsForm) => {
    // TODO: Salvar contatos via API
    console.log("Salvando contatos:", data);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* E-mails */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">E-mails</h3>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="emailPrincipal">E-mail Corporativo Principal *</Label>
              <Input
                id="emailPrincipal"
                type="email"
                {...form.register("emailPrincipal", { required: "E-mail principal é obrigatório" })}
                placeholder="contato@morina.com.br"
              />
            </div>

            <div>
              <Label htmlFor="emailsSecundarios">E-mails Secundários</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmailSecundario();
                    }
                  }}
                />
                <Button type="button" onClick={addEmailSecundario}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {emailsSecundarios.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {emailsSecundarios.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmailSecundario(email)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Telefones */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Telefones</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="telefoneFixo">Telefone Fixo</Label>
              <Input
                id="telefoneFixo"
                {...form.register("telefoneFixo")}
                placeholder="(11) 3333-3333"
              />
            </div>

            <div>
              <Label htmlFor="telefoneCelular">Celular</Label>
              <Input
                id="telefoneCelular"
                {...form.register("telefoneCelular")}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...form.register("whatsapp")}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="telefoneEmergencia">Telefone de Emergência</Label>
              <Input
                id="telefoneEmergencia"
                {...form.register("telefoneEmergencia")}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="contatoEmergencia">Contato de Emergência (Nome e Relação)</Label>
              <Input
                id="contatoEmergencia"
                {...form.register("contatoEmergencia")}
                placeholder="Ex: João Silva - Gerente"
              />
            </div>
          </div>
        </GlassCard>

        {/* Redes Sociais */}
        <GlassCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Redes Sociais</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                {...form.register("linkedin")}
                placeholder="https://linkedin.com/company/morina"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                {...form.register("instagram")}
                placeholder="https://instagram.com/morina"
              />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                {...form.register("facebook")}
                placeholder="https://facebook.com/morina"
              />
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Descartar Alterações
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}

