"use client";

import { Button } from "@morina/ui";
import { Edit, Mail, Phone, Star, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { useSupplierContatos } from "@/hooks/use-suppliers";
import type { SupplierContact, CreateContatoInput, UpdateContatoInput } from "@/lib/api/suppliers";

// Função para formatar telefone
const formatarTelefone = (telefone: string): string => {
  const telLimpo = telefone.replace(/[^\d]/g, "");
  if (telLimpo.length <= 10) {
    return telLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (telLimpo.length <= 11) {
    return telLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return telefone;
};

export function ContatosTab({ supplierId }: { supplierId: string }) {
  const { contatos, loading, error, buscar, criar, atualizar, deletar, setPrincipal } = useSupplierContatos(supplierId);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cargo, setCargo] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrincipal, setIsPrincipal] = useState(false);

  const handleCriar = async () => {
    if (!name.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "O nome do contato é obrigatório",
      });
      return;
    }

    try {
      await criar({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        cargo: cargo.trim() || null,
        notes: notes.trim() || null,
        isPrincipal,
      });
      setName("");
      setEmail("");
      setPhone("");
      setCargo("");
      setNotes("");
      setIsPrincipal(false);
      setMostrarForm(false);
      notificationCenter.add({
        type: "success",
        title: "Contato criado",
        message: "O contato foi criado com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível criar o contato.",
      });
    }
  };

  const handleEditar = (contato: SupplierContact) => {
    setEditandoId(contato.id);
    setName(contato.name);
    setEmail(contato.email || "");
    setPhone(contato.phone || "");
    setCargo(contato.cargo || "");
    setNotes(contato.notes || "");
    setIsPrincipal(contato.isPrincipal);
    setMostrarForm(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editandoId || !name.trim()) return;

    try {
      await atualizar(editandoId, {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        cargo: cargo.trim() || null,
        notes: notes.trim() || null,
        isPrincipal,
      });
      setEditandoId(null);
      setName("");
      setEmail("");
      setPhone("");
      setCargo("");
      setNotes("");
      setIsPrincipal(false);
      setMostrarForm(false);
      notificationCenter.add({
        type: "success",
        title: "Contato atualizado",
        message: "O contato foi atualizado com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível atualizar o contato.",
      });
    }
  };

  const handleDeletar = async (contactId: string) => {
    if (!confirm("Deseja realmente deletar este contato?")) return;

    try {
      await deletar(contactId);
      notificationCenter.add({
        type: "success",
        title: "Contato deletado",
        message: "O contato foi deletado com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível deletar o contato.",
      });
    }
  };

  const handleSetPrincipal = async (contactId: string) => {
    try {
      await setPrincipal(contactId);
      notificationCenter.add({
        type: "success",
        title: "Contato principal",
        message: "O contato foi definido como principal.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível definir o contato principal.",
      });
    }
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setName("");
    setEmail("");
    setPhone("");
    setCargo("");
    setNotes("");
    setIsPrincipal(false);
    setMostrarForm(false);
  };

  if (loading && contatos.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white/90">Contatos do Fornecedor</h3>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
            onClick={() => {
              if (mostrarForm) {
                handleCancelar();
              } else {
                setMostrarForm(true);
              }
            }}
          >
            {mostrarForm ? "Cancelar" : "Novo Contato"}
          </Button>
          <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {mostrarForm && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <h4 className="text-white font-medium mb-4">
            {editandoId ? "Editar Contato" : "Novo Contato"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                placeholder="Nome do contato"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d]/g, "");
                    const formatado = formatarTelefone(valor);
                    setPhone(formatado);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                placeholder="Ex: Gerente, Diretor..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Informações adicionais sobre o contato..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrincipal"
                checked={isPrincipal}
                onChange={(e) => setIsPrincipal(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <label htmlFor="isPrincipal" className="text-sm text-white/80">
                Contato Principal
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
                onClick={editandoId ? handleSalvarEdicao : handleCriar}
              >
                {editandoId ? "Salvar" : "Criar"}
              </Button>
              <Button className="bg-white/10 hover:bg-white/20" onClick={handleCancelar}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {contatos.length === 0 && !loading ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Phone className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">Nenhum contato cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contatos.map((contato) => (
            <div
              key={contato.id}
              className={`p-4 rounded-lg border ${contato.isPrincipal ? "border-yellow-500/50 bg-yellow-500/10" : "border-white/10 bg-white/[0.03]"} backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{contato.name}</h4>
                    {contato.isPrincipal && (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400">
                        Principal
                      </span>
                    )}
                  </div>
                  {contato.cargo && (
                    <p className="text-sm text-white/60 mb-2">{contato.cargo}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!contato.isPrincipal && (
                    <Button
                      className="bg-white/10 hover:bg-white/20 p-2"
                      onClick={() => handleSetPrincipal(contato.id)}
                      title="Definir como principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    className="bg-white/10 hover:bg-white/20 p-2"
                    onClick={() => handleEditar(contato)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 p-2"
                    onClick={() => handleDeletar(contato.id)}
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {contato.email && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${contato.email}`} className="hover:text-[hsl(var(--primary))]">
                      {contato.email}
                    </a>
                  </div>
                )}
                {contato.phone && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${contato.phone}`} className="hover:text-[hsl(var(--primary))]">
                      {contato.phone}
                    </a>
                  </div>
                )}
                {contato.notes && (
                  <p className="text-sm text-white/60 mt-2">{contato.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

