"use client";

import { CnpjLookup } from "@/components/admin/company/CnpjLookup";
import { notificationCenter } from "@/components/notifications/notification-center";
import { suppliersApi, type Supplier } from "@/lib/api/suppliers";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Loader2, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SupplierSearchFieldProps {
  value: string;
  onChange: (supplierName: string) => void;
  orgId: string;
  onSupplierSelect?: (supplier: Supplier) => void;
  error?: boolean;
  errorMessage?: string;
}

export function SupplierSearchField({
  value,
  onChange,
  orgId,
  onSupplierSelect,
  error = false,
  errorMessage,
}: SupplierSearchFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierCnpj, setNewSupplierCnpj] = useState("");

  // Buscar fornecedores
  const searchSuppliers = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSuppliers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await suppliersApi.list(orgId, { busca: term });
      setSuppliers(results as any);
      setShowDropdown(true);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        void searchSuppliers(searchTerm);
      } else {
        setSuppliers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchSuppliers]);

  // Selecionar fornecedor
  const handleSelectSupplier = (supplier: Supplier) => {
    onChange(supplier.name);
    onSupplierSelect?.(supplier);
    setShowDropdown(false);
    setSearchTerm("");
  };

  // Criar fornecedor rápido
  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Nome do fornecedor é obrigatório",
      });
      return;
    }

    setCreating(true);
    try {
      const supplier = await suppliersApi.create(orgId, {
        name: newSupplierName.trim(),
        document: newSupplierCnpj || null,
        status: "ativo",
      });

      onChange(supplier.name);
      onSupplierSelect?.(supplier);
      setShowCreateModal(false);
      setNewSupplierName("");
      setNewSupplierCnpj("");

      notificationCenter.add({
        type: "success",
        title: "Fornecedor criado",
        message: `${supplier.name} foi cadastrado com sucesso.`,
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao criar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setCreating(false);
    }
  };

  // Formatar CNPJ enquanto digita
  const formatCnpjInput = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  // Buscar CNPJ e preencher dados
  const handleCnpjFound = (data: any) => {
    setNewSupplierName(data.name || data.legal_name || "");
    // Formatar o CNPJ retornado
    const cnpjFormatted = formatCnpjInput(data.cnpj || "");
    setNewSupplierCnpj(cnpjFormatted);
  };

  return (
    <div className="relative">
      <div className="group">
        <label className="block text-sm font-semibold text-white/90 mb-2">
          Fornecedor <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-white/60 z-10" />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setSearchTerm(e.target.value);
                  if (e.target.value.length >= 2) {
                    setShowDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (suppliers.length > 0) {
                    setShowDropdown(true);
                  }
                  setShowTooltip(error && !!errorMessage);
                }}
                onBlur={() => setShowTooltip(false)}
                placeholder="Buscar ou digite o nome do fornecedor..."
                className={`relative w-full pl-10 pr-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                aria-invalid={error}
                aria-describedby={error && errorMessage ? "supplier-error" : undefined}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm transition-all flex items-center justify-center"
            type="button"
            title="Como cadastrar um novo fornecedor"
            aria-label="Cadastrar novo fornecedor"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
          {error && errorMessage && (
            <div
              id="supplier-error"
              role="tooltip"
              className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${showTooltip ? "opacity-100 visible" : "opacity-0 invisible"} transition-opacity duration-200`}
              style={{ bottom: "100%", left: 0 }}
            >
              {errorMessage}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {showDropdown && suppliers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 rounded-lg border border-white/20 bg-white/[0.12] backdrop-blur-xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {loading && (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-white/60" />
              </div>
            )}
            {!loading && suppliers.map((supplier) => (
              <button
                key={supplier.id}
                onClick={() => handleSelectSupplier(supplier)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white/90 font-medium">{supplier.name}</p>
                    {supplier.document && (
                      <p className="text-xs text-white/60">{supplier.document}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de criação rápida */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md p-6 rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent backdrop-blur-2xl"
            >
              <h3 className="text-xl font-bold text-white/90 mb-4">
                Cadastrar Fornecedor Rápido
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Buscar por CNPJ (opcional)
                  </label>
                  <CnpjLookup onDataFound={handleCnpjFound} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Nome do Fornecedor <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Nome completo do fornecedor"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    CNPJ (será preenchido automaticamente se buscar acima)
                  </label>
                  <input
                    type="text"
                    value={newSupplierCnpj}
                    onChange={(e) => {
                      const formatted = formatCnpjInput(e.target.value);
                      setNewSupplierCnpj(formatted);
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSupplierName("");
                    setNewSupplierCnpj("");
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSupplier}
                  disabled={creating || !newSupplierName.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

