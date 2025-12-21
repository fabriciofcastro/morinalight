"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit, Trash2, Mail, Phone, User, Star, Building2 } from "lucide-react";
import { Button, Input, FormField, FormSelect } from "@morina/ui";
import { notificationCenter } from "@/components/notifications/notification-center";

export interface ClienteContact {
  id?: string;
  clienteId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  celular?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  tipo?: string;
  isPrincipal?: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactsManagerProps {
  clienteId: string;
  onContactsChange?: (contacts: ClienteContact[]) => void;
  readOnly?: boolean;
  className?: string;
}

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export function ContactsManager({
  clienteId,
  onContactsChange,
  readOnly = false,
  className = "",
}: ContactsManagerProps) {
  const [contacts, setContacts] = useState<ClienteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ClienteContact | null>(null);
  const [formData, setFormData] = useState<ClienteContact>({
    name: "",
    email: "",
    phone: "",
    celular: "",
    cargo: "",
    departamento: "",
    tipo: "geral",
    isPrincipal: false,
    notes: "",
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clientes/${clienteId}/contatos`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contatos || []);
        if (onContactsChange) {
          onContactsChange(data.contatos || []);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      void loadContacts();
    }
  }, [clienteId]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Nome do contato é obrigatório",
      });
      return;
    }

    try {
      if (editingContact?.id) {
        // Atualizar
        const response = await fetch(
          `/api/clientes/${clienteId}/contatos/${editingContact.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name.trim(),
              email: formData.email?.trim() || null,
              phone: formData.phone?.trim() || null,
              celular: formData.celular?.trim() || null,
              cargo: formData.cargo?.trim() || null,
              departamento: formData.departamento?.trim() || null,
              tipo: formData.tipo || "geral",
              isPrincipal: formData.isPrincipal || false,
              notes: formData.notes?.trim() || null,
            }),
          },
        );

        if (response.ok) {
          notificationCenter.add({
            type: "success",
            title: "Contato atualizado",
            message: "Contato atualizado com sucesso",
          });
          void loadContacts();
          handleCancel();
        } else {
          const error = await response.json();
          notificationCenter.add({
            type: "error",
            title: "Erro",
            message: error.message || "Erro ao atualizar contato",
          });
        }
      } else {
        // Criar
        const response = await fetch(`/api/clientes/${clienteId}/contatos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email?.trim() || null,
            phone: formData.phone?.trim() || null,
            celular: formData.celular?.trim() || null,
            cargo: formData.cargo?.trim() || null,
            departamento: formData.departamento?.trim() || null,
            tipo: formData.tipo || "geral",
            isPrincipal: formData.isPrincipal || false,
            notes: formData.notes?.trim() || null,
          }),
        });

        if (response.ok) {
          notificationCenter.add({
            type: "success",
            title: "Contato criado",
            message: "Contato adicionado com sucesso",
          });
          void loadContacts();
          handleCancel();
        } else {
          const error = await response.json();
          notificationCenter.add({
            type: "error",
            title: "Erro",
            message: error.message || "Erro ao criar contato",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar contato. Tente novamente.",
      });
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) {
      return;
    }

    try {
      const response = await fetch(`/api/clientes/${clienteId}/contatos/${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Contato excluído",
          message: "Contato removido com sucesso",
        });
        void loadContacts();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Erro ao excluir contato",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao excluir contato. Tente novamente.",
      });
    }
  };

  const handleEdit = (contact: ClienteContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      celular: contact.celular || "",
      cargo: contact.cargo || "",
      departamento: contact.departamento || "",
      tipo: contact.tipo || "geral",
      isPrincipal: contact.isPrincipal || false,
      notes: contact.notes || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      celular: "",
      cargo: "",
      departamento: "",
      tipo: "geral",
      isPrincipal: false,
      notes: "",
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-sm text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
          Carregando contatos...
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Contatos Adicionais</h3>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Contato
          </Button>
        )}
      </div>

      {/* Formulário de adicionar/editar */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)] rounded-lg p-4 border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nome *" fieldId="name" className="md:col-span-2">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  required
                />
              </FormField>

              <FormField label="Email" fieldId="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </FormField>

              <FormField label="Telefone" fieldId="phone">
                <Input
                  id="phone"
                  value={formatPhone(formData.phone || "")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="(00) 0000-0000"
                  maxLength={14}
                />
              </FormField>

              <FormField label="Celular" fieldId="celular">
                <Input
                  id="celular"
                  value={formatPhone(formData.celular || "")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, celular: value });
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </FormField>

              <FormField label="Cargo" fieldId="cargo">
                <Input
                  id="cargo"
                  value={formData.cargo || ""}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Gerente de Vendas"
                />
              </FormField>

              <FormField label="Departamento" fieldId="departamento">
                <Input
                  id="departamento"
                  value={formData.departamento || ""}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  placeholder="Ex: Vendas, Financeiro"
                />
              </FormField>

              <FormSelect
                label="Tipo"
                id="tipo"
                value={formData.tipo || "geral"}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="geral">Geral</option>
                <option value="comercial">Comercial</option>
                <option value="financeiro">Financeiro</option>
                <option value="suporte">Suporte</option>
                <option value="tecnico">Técnico</option>
              </FormSelect>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="isPrincipal"
                  checked={formData.isPrincipal || false}
                  onChange={(e) => setFormData({ ...formData, isPrincipal: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPrincipal" className="text-sm">
                  Contato principal
                </label>
              </div>

              <FormField label="Observações" fieldId="notes" className="md:col-span-2">
                <Input
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o contato"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                {editingContact ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de contatos */}
      {contacts.length === 0 ? (
        <div className="text-center py-8 text-sm text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
          Nenhum contato adicional cadastrado
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)]"
            >
              <div className="p-2 rounded-lg bg-[color-mix(in oklab,var(--primary)_10%,transparent)]">
                {contact.isPrincipal ? (
                  <Star className="h-4 w-4 text-[var(--primary)] fill-[var(--primary)]" />
                ) : (
                  <User className="h-4 w-4 text-[var(--primary)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{contact.name}</span>
                  {contact.isPrincipal && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)]">
                      Principal
                    </span>
                  )}
                  {contact.tipo && contact.tipo !== "geral" && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                      {contact.tipo}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  {contact.cargo && (
                    <p className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      {contact.cargo}
                      {contact.departamento && ` - ${contact.departamento}`}
                    </p>
                  )}
                  {contact.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </p>
                  )}
                  {(contact.phone || contact.celular) && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {contact.celular
                        ? formatPhone(contact.celular)
                        : contact.phone
                          ? formatPhone(contact.phone)
                          : ""}
                    </p>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-1.5 rounded hover:bg-[color-mix(in oklab,var(--muted-soft)_10%,transparent)] transition-colors"
                    title="Editar contato"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => contact.id && handleDelete(contact.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                    title="Excluir contato"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


