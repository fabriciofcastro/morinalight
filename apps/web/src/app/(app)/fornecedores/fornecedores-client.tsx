"use client";

import { Button } from "@morina/ui";
import {
  Building2,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notificationCenter } from "@/components/notifications/notification-center";
import { suppliersApi, type Supplier, type CreateSupplierInput, type UpdateSupplierInput } from "@/lib/api/suppliers";
import { motion, AnimatePresence } from "framer-motion";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

// Helper para inputs futuristas com hover azul
let inputCounter = 0;
const FuturisticInput = ({ 
  label, 
  required = false,
  id,
  ...props 
}: { 
  label: string;
  required?: boolean;
  id?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputId = id || `input-${++inputCounter}`;
  return (
    <div className="group">
      <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
        <input
          id={inputId}
          {...props}
          className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300"
        />
      </div>
    </div>
  );
};

let selectCounter = 0;
const FuturisticSelect = ({ 
  label, 
  required = false,
  id,
  children, 
  ...props 
}: { 
  label: string;
  required?: boolean;
  id?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const selectId = id || `select-${++selectCounter}`;
  return (
    <div className="group">
      <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
        <select
          id={selectId}
          {...props}
          className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
        >
          {children}
        </select>
      </div>
    </div>
  );
};

let textareaCounter = 0;
const FuturisticTextarea = ({ 
  label, 
  required = false,
  id,
  ...props 
}: { 
  label: string;
  required?: boolean;
  id?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaId = id || `textarea-${++textareaCounter}`;
  return (
    <div className="group">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
        <textarea
          id={textareaId}
          {...props}
          className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );
};

export function FornecedoresClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [pending, startTransition] = useTransition();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateSupplierInput>({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    status: "ativo",
    notes: "",
  });

  // Carregar fornecedores
  const loadSuppliers = useCallback(async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const data = await suppliersApi.list(orgId, { busca: search || undefined });
      setSuppliers(data);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, search]);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  // Validar formulário
  const validarFormulario = useCallback((): { valido: boolean; erros: string[] } => {
    const erros: string[] = [];

    if (!formData.name?.trim()) {
      erros.push("Nome do fornecedor é obrigatório");
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.push("Email inválido");
    }

    if (formData.document && formData.document.length < 11) {
      erros.push("Documento deve ter pelo menos 11 caracteres");
    }

    return { valido: erros.length === 0, erros };
  }, [formData]);

  // Salvar fornecedor
  const salvarFornecedor = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: validacao.erros.join(", "),
      });
      return;
    }

    startTransition(async () => {
      try {
        if (editingSupplier) {
          await suppliersApi.update(orgId, editingSupplier.id, formData);
          notificationCenter.add({
            type: "success",
            title: "Fornecedor atualizado",
            message: `${formData.name} foi atualizado com sucesso.`,
          });
        } else {
          await suppliersApi.create(orgId, formData);
          notificationCenter.add({
            type: "success",
            title: "Fornecedor criado",
            message: `${formData.name} foi cadastrado com sucesso.`,
          });
        }

        setShowForm(false);
        setEditingSupplier(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          document: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          status: "ativo",
          notes: "",
        });
        void loadSuppliers();
      } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar",
          message: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    });
  };

  // Editar fornecedor
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      document: supplier.document || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      zipCode: supplier.zipCode || "",
      status: supplier.status,
      notes: supplier.notes || "",
    });
    setShowForm(true);
  };

  // Deletar fornecedor
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o fornecedor "${name}"?`)) {
      return;
    }

    try {
      await suppliersApi.delete(orgId, id);
      notificationCenter.add({
        type: "success",
        title: "Fornecedor excluído",
        message: `${name} foi excluído com sucesso.`,
      });
      void loadSuppliers();
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao excluir",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  // Filtrar fornecedores
  const filteredSuppliers = useMemo(() => {
    if (!search) return suppliers;
    const searchLower = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.document?.includes(searchLower)
    );
  }, [suppliers, search]);

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />
        
        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Fornecedores
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Gestão Completa de Fornecedores
                </p>
              </div>
            </div>
            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white/80">{suppliers.length} Fornecedores</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white/80">
                  {suppliers.filter((s) => s.status === "ativo").length} Ativos
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barra de Busca e Ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
          <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
            <Search className="h-4 w-4 text-white/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fornecedores..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
              onClick={() => {
                setEditingSupplier(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  document: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  status: "ativo",
                  notes: "",
                });
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-white/60">Carregando fornecedores...</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Building2 className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {search ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white/90 mb-1">{supplier.name}</h3>
                  <div className="flex items-center gap-2">
                    {supplier.status === "ativo" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-xs text-white/60 capitalize">{supplier.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
                      size="sm"
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-white/70">
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.document && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>{supplier.document}</span>
                  </div>
                )}
                {(supplier.address || supplier.city) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {[supplier.address, supplier.city, supplier.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent backdrop-blur-2xl"
            >
              <h2 className="text-2xl font-bold text-white/90 mb-6">
                {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FuturisticInput
                    label="Nome do Fornecedor"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                  <FuturisticInput
                    label="Email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FuturisticInput
                    label="Telefone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                  <FuturisticInput
                    label="Documento (CPF/CNPJ)"
                    value={formData.document || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, document: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>

                <FuturisticInput
                  label="Endereço"
                  value={formData.address || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, complemento"
                />

                <div className="grid grid-cols-3 gap-4">
                  <FuturisticInput
                    label="Cidade"
                    value={formData.city || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                  <FuturisticInput
                    label="Estado"
                    value={formData.state || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                  <FuturisticInput
                    label="CEP"
                    value={formData.zipCode || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>

                <FuturisticSelect
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="ativo" className="bg-[#1a1f3a]">Ativo</option>
                  <option value="inativo" className="bg-[#1a1f3a]">Inativo</option>
                </FuturisticSelect>

                <FuturisticTextarea
                  label="Observações"
                  rows={4}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o fornecedor..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSupplier(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
                    onClick={salvarFornecedor}
                    isLoading={pending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingSupplier ? "Atualizar" : "Salvar"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}









