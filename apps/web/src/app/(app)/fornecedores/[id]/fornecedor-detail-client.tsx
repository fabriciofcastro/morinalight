"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import {
    useSupplier,
    useSupplierAlertas,
    useSupplierAuditoria,
    useSupplierAvaliacoes,
    useSupplierBoletos,
    useSupplierDocumentos,
    useSupplierEstatisticas,
    useSupplierFichasCusto,
    useSupplierHistoricoPrecos,
    useSupplierInsumos,
    useSupplierNotas,
    useSupplierTags,
    useSupplierTagsRelation,
    useSupplierVersoes
} from "@/hooks/use-suppliers";
import type { Supplier } from "@/lib/api/suppliers";
import { suppliersApi } from "@/lib/api/suppliers";
import { apiUrl } from "@/lib/env";
import { exportSupplierToPDF } from "@/lib/utils/export-suppliers";
import {
    Button, DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Copy,
    DollarSign,
    Download,
    Edit,
    ExternalLink,
    Eye,
    FileCheck,
    FileStack,
    FileText,
    Globe,
    History,
    Mail,
    MapPin,
    MessageSquare,
    MoreVertical,
    Package,
    Phone,
    Receipt,
    RefreshCw,
    Share2,
    Star,
    Trash2,
    TrendingUp,
    Upload,
    X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContatosTab } from "./contatos-tab";

interface FornecedorDetailClientProps {
  supplierId: string;
}

type TabType = "info" | "fichas" | "insumos" | "boletos" | "historico" | "versoes" | "documentos" | "notas" | "contatos" | "tags" | "avaliacoes" | "precos" | "alertas";

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "ativo":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "inativo":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "suspenso":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

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
        return orgs[0]!.organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

export function FornecedorDetailClient({ supplierId }: FornecedorDetailClientProps) {
  const router = useRouter();
  const { supplier, loading, error, buscarPorId } = useSupplier();
  const { estatisticas, loading: loadingEstatisticas, buscar: buscarEstatisticas } =
    useSupplierEstatisticas(supplierId);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (supplierId) {
      void buscarPorId(supplierId);
      void buscarEstatisticas();
    }
  }, [supplierId, buscarPorId, buscarEstatisticas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([buscarPorId(supplierId), buscarEstatisticas()]);
      notificationCenter.add({
        type: "success",
        title: "Atualizado",
        message: "Dados do fornecedor atualizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyAddress = () => {
    if (!supplier) return;
    const address = [
      supplier.address,
      supplier.city,
      supplier.state,
      supplier.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
    
    navigator.clipboard.writeText(address);
    notificationCenter.add({
      type: "success",
      title: "Copiado",
      message: "Endereço copiado para a área de transferência",
    });
  };

  const handleShare = () => {
    if (!supplier) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    notificationCenter.add({
      type: "success",
      title: "Link copiado",
      message: "Link do fornecedor copiado para compartilhar",
    });
  };

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando fornecedor...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Fornecedor não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/fornecedores/list")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info" as TabType, label: "Informações", icon: FileText },
    { id: "fichas" as TabType, label: "Fichas de Custo", icon: Receipt },
    { id: "insumos" as TabType, label: "Insumos", icon: Package },
    { id: "boletos" as TabType, label: "Boletos", icon: FileCheck },
    { id: "tags" as TabType, label: "Tags", icon: Star },
    { id: "avaliacoes" as TabType, label: "Avaliações", icon: Star },
    { id: "precos" as TabType, label: "Histórico Preços", icon: TrendingUp },
    { id: "historico" as TabType, label: "Histórico", icon: History },
    { id: "versoes" as TabType, label: "Versões", icon: RefreshCw },
    { id: "documentos" as TabType, label: "Documentos", icon: FileText },
    { id: "alertas" as TabType, label: "Alertas", icon: Bell },
    { id: "notas" as TabType, label: "Notas", icon: MessageSquare },
    { id: "contatos" as TabType, label: "Contatos", icon: Phone },
  ];

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
          {/* Bordas decorativas tech */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {supplier.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(supplier.status)}`}>
                    {supplier.status}
                  </span>
                  <span className="text-sm text-white/60">
                    Última atualização: {formatDate(supplier.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={() => router.push(`/fornecedores/${supplierId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </motion.div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1f3a] border-white/20">
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const orgId = getCurrentOrgId();
                      if (!orgId) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro",
                          message: "Organização não encontrada",
                        });
                        return;
                      }
                      const novoSupplier = await suppliersApi.duplicate(orgId, supplierId);
                      notificationCenter.add({
                        type: "success",
                        title: "Fornecedor duplicado",
                        message: "O fornecedor foi duplicado com sucesso.",
                      });
                      router.push(`/fornecedores/${novoSupplier.id}`);
                    } catch (error) {
                      notificationCenter.add({
                        type: "error",
                        title: "Erro",
                        message: "Não foi possível duplicar o fornecedor",
                      });
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!supplier) return;
                    try {
                      exportSupplierToPDF(supplier);
                      notificationCenter.add({
                        type: "info",
                        title: "Exportação PDF",
                        message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
                      });
                    } catch (error) {
                      notificationCenter.add({
                        type: "error",
                        title: "Erro ao exportar",
                        message: error instanceof Error ? error.message : "Erro desconhecido",
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="h-5 w-5 text-blue-400" />
            {loadingEstatisticas ? (
              <div className="animate-pulse h-8 w-12 bg-white/10 rounded" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {estatisticas?.totalFichasCusto ?? 0}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">Fichas de Custo</p>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-5 w-5 text-green-400" />
            {loadingEstatisticas ? (
              <div className="animate-pulse h-8 w-12 bg-white/10 rounded" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {estatisticas?.totalInsumos ?? 0}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">Insumos Fornecidos</p>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            {loadingEstatisticas ? (
              <div className="animate-pulse h-8 w-16 bg-white/10 rounded" />
            ) : (
              <span className="text-lg font-bold text-white">
                {estatisticas?.valorTotal ? formatCurrency(estatisticas.valorTotal) : formatCurrency(0)}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">Valor Total</p>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <FileCheck className="h-5 w-5 text-purple-400" />
            {loadingEstatisticas ? (
              <div className="animate-pulse h-8 w-12 bg-white/10 rounded" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {estatisticas?.totalBoletos ?? 0}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">Boletos</p>
        </div>
      </motion.div>

      {/* Última Compra */}
      {estatisticas?.ultimaCompra && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="p-4 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-white/60">Última Compra</p>
              <p className="text-sm font-medium text-white">
                {formatDate(estatisticas.ultimaCompra)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="flex items-center gap-2 border-b border-white/10 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo das Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "info" && <InfoTab supplier={supplier} onCopyAddress={handleCopyAddress} />}
            {activeTab === "fichas" && <FichasTab supplierId={supplierId} />}
            {activeTab === "insumos" && <InsumosTab supplierId={supplierId} />}
            {activeTab === "boletos" && <BoletosTab supplierId={supplierId} />}
            {activeTab === "tags" && <TagsTab supplierId={supplierId} />}
            {activeTab === "avaliacoes" && <AvaliacoesTab supplierId={supplierId} />}
            {activeTab === "precos" && <PrecosTab supplierId={supplierId} />}
            {activeTab === "historico" && <HistoricoTab supplierId={supplierId} />}
            {activeTab === "versoes" && <VersoesTab supplierId={supplierId} />}
            {activeTab === "documentos" && <DocumentosTab supplierId={supplierId} />}
            {activeTab === "alertas" && <AlertasTab supplierId={supplierId} />}
            {activeTab === "notas" && <NotasTab supplierId={supplierId} />}
            {activeTab === "contatos" && <ContatosTab supplierId={supplierId} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Componente da Tab de Informações
function InfoTab({ supplier, onCopyAddress }: { supplier: Supplier; onCopyAddress: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dados Cadastrais */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
          Dados Cadastrais
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-1">Nome/Razão Social</p>
            <p className="text-white/90 font-medium">{supplier.name}</p>
          </div>
          {supplier.document && (
            <div>
              <p className="text-sm text-white/60 mb-1">CPF/CNPJ</p>
              <p className="text-white/90 font-medium">{supplier.document}</p>
            </div>
          )}
          {supplier.email && (
            <div>
              <p className="text-sm text-white/60 mb-1">Email</p>
              <a
                href={`mailto:${supplier.email}`}
                className="text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {supplier.email}
              </a>
            </div>
          )}
          {supplier.phone && (
            <div>
              <p className="text-sm text-white/60 mb-1">Telefone</p>
              <a
                href={`tel:${supplier.phone}`}
                className="text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {supplier.phone}
              </a>
            </div>
          )}
          {supplier.website && (
            <div>
              <p className="text-sm text-white/60 mb-1">Website</p>
              <a
                href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {supplier.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Endereço */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[hsl(var(--accent))]" />
          Endereço
        </h3>
        {supplier.address || supplier.city ? (
          <div className="space-y-3">
            {supplier.address && (
              <div>
                <p className="text-sm text-white/60 mb-1">Endereço</p>
                <p className="text-white/90 font-medium">{supplier.address}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {supplier.city && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Cidade</p>
                  <p className="text-white/90 font-medium">{supplier.city}</p>
                </div>
              )}
              {supplier.state && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Estado</p>
                  <p className="text-white/90 font-medium">{supplier.state}</p>
                </div>
              )}
            </div>
            {supplier.zipCode && (
              <div>
                <p className="text-sm text-white/60 mb-1">CEP</p>
                <p className="text-white/90 font-medium">{supplier.zipCode}</p>
              </div>
            )}
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer mt-4"
              onClick={onCopyAddress}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Endereço
            </Button>
            {(supplier.address || supplier.city) && (
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer mt-2 ml-2"
                onClick={() => {
                  const address = encodeURIComponent(
                    `${supplier.address || ""} ${supplier.city || ""} ${supplier.state || ""}`.trim()
                  );
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver no Maps
              </Button>
            )}
          </div>
        ) : (
          <p className="text-white/60 italic">Endereço não cadastrado</p>
        )}
      </div>

      {/* Informações Comerciais */}
      {(supplier.tipoFornecedor || supplier.ramoAtividade || supplier.contatoPrincipal || supplier.cargoContato || supplier.prazoPagamento || supplier.condicaoPagamento || supplier.limiteCredito) && (
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm md:col-span-2">
          <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[hsl(var(--accent))]" />
            Informações Comerciais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplier.tipoFornecedor && (
              <div>
                <p className="text-sm text-white/60 mb-1">Tipo de Fornecedor</p>
                <p className="text-white/90 font-medium">{supplier.tipoFornecedor}</p>
              </div>
            )}
            {supplier.ramoAtividade && (
              <div>
                <p className="text-sm text-white/60 mb-1">Ramo de Atividade</p>
                <p className="text-white/90 font-medium">{supplier.ramoAtividade}</p>
              </div>
            )}
            {supplier.contatoPrincipal && (
              <div>
                <p className="text-sm text-white/60 mb-1">Contato Principal</p>
                <p className="text-white/90 font-medium">{supplier.contatoPrincipal}</p>
              </div>
            )}
            {supplier.cargoContato && (
              <div>
                <p className="text-sm text-white/60 mb-1">Cargo do Contato</p>
                <p className="text-white/90 font-medium">{supplier.cargoContato}</p>
              </div>
            )}
            {supplier.prazoPagamento !== null && supplier.prazoPagamento !== undefined && (
              <div>
                <p className="text-sm text-white/60 mb-1">Prazo de Pagamento</p>
                <p className="text-white/90 font-medium">{supplier.prazoPagamento} dias</p>
              </div>
            )}
            {supplier.condicaoPagamento && (
              <div>
                <p className="text-sm text-white/60 mb-1">Condição de Pagamento</p>
                <p className="text-white/90 font-medium">{supplier.condicaoPagamento}</p>
              </div>
            )}
            {supplier.limiteCredito !== null && supplier.limiteCredito !== undefined && (
              <div>
                <p className="text-sm text-white/60 mb-1">Limite de Crédito</p>
                <p className="text-white/90 font-medium">{formatCurrency(supplier.limiteCredito)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      {supplier.notes && (
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm md:col-span-2">
          <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
            Observações
          </h3>
          <p className="text-white/80 whitespace-pre-wrap">{supplier.notes}</p>
        </div>
      )}
    </div>
  );
}

// Tabs implementadas
function FichasTab({ supplierId }: { supplierId: string }) {
  const { fichas, loading, error, buscar } = useSupplierFichasCusto(supplierId);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    void buscar({ pagina, status: filtroStatus || undefined });
  }, [supplierId, pagina, filtroStatus]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; style: string }> = {
      rascunho: { label: "Rascunho", style: "bg-gray-500/20 text-gray-400" },
      enviada_para_conferencia: { label: "Em Conferência", style: "bg-yellow-500/20 text-yellow-400" },
      aprovada: { label: "Aprovada", style: "bg-green-500/20 text-green-400" },
      reprovada: { label: "Reprovada", style: "bg-red-500/20 text-red-400" },
    };
    return badges[status] || { label: status, style: "bg-blue-500/20 text-blue-400" };
  };

  if (loading && !fichas) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando fichas de custo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button className="mt-4 bg-white/10 hover:bg-white/20" onClick={() => buscar({ pagina, status: filtroStatus || undefined })}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <select
          value={filtroStatus}
          onChange={(e) => {
            setFiltroStatus(e.target.value);
            setPagina(1);
          }}
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="enviada_para_conferencia">Em Conferência</option>
          <option value="aprovada">Aprovada</option>
          <option value="reprovada">Reprovada</option>
        </select>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar({ pagina, status: filtroStatus || undefined })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {!fichas || fichas.itens.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Receipt className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhuma ficha de custo encontrada</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {fichas.itens.map((ficha) => {
              const statusBadge = getStatusBadge(ficha.status);
              return (
                <div
                  key={ficha.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors cursor-pointer"
                  onClick={() => window.open(`/fichas-custo/${ficha.id}`, "_blank")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-white">#{ficha.numeroSequencial}</span>
                        <span className={`text-xs px-2 py-1 rounded ${statusBadge.style}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <h4 className="text-white/90 font-medium mb-1">{ficha.nomePeca}</h4>
                      <p className="text-sm text-white/60 mb-2">{ficha.referenciaPeca}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60">
                          Valor fornecedor: <span className="text-white font-medium">{formatCurrency(ficha.valorFornecedor)}</span>
                        </span>
                        <span className="text-white/60">
                          Total: <span className="text-white font-medium">{formatCurrency(ficha.custoFinalPeca)}</span>
                        </span>
                        <span className="text-white/40">{formatDate(ficha.createdAt)}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/40" />
                  </div>
                </div>
              );
            })}
          </div>
          {fichas.totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                className="bg-white/10 hover:bg-white/20"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <span className="text-white/60">
                Página {pagina} de {fichas.totalPaginas}
              </span>
              <Button
                className="bg-white/10 hover:bg-white/20"
                onClick={() => setPagina((p) => Math.min(fichas.totalPaginas, p + 1))}
                disabled={pagina === fichas.totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InsumosTab({ supplierId }: { supplierId: string }) {
  const { insumos, loading, error, buscar } = useSupplierInsumos(supplierId);

  useEffect(() => {
    void buscar();
  }, [supplierId]);

  if (loading && !insumos) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando insumos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button className="mt-4 bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {!insumos || insumos.insumos.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Package className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhum insumo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insumos.insumos.map((insumo, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white/90 font-medium mb-1">{insumo.descricao}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                    {insumo.tipo}
                  </span>
                </div>
                <Button
                  className="bg-white/10 hover:bg-white/20 text-xs"
                  onClick={() =>
                    window.open(`/fichas-custo/${insumo.fichaMaisRecente.id}`, "_blank")
                  }
                >
                  Ver Ficha
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-white/60 mb-1">Preço Médio</p>
                  <p className="text-white font-medium">{formatCurrency(insumo.precoMedio)}</p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Mín/Máx</p>
                  <p className="text-white font-medium">
                    {formatCurrency(insumo.precoMinimo)} / {formatCurrency(insumo.precoMaximo)}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Quantidade Total</p>
                  <p className="text-white font-medium">{insumo.quantidadeTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-white/60 mb-1">Valor Total</p>
                  <p className="text-white font-medium">{formatCurrency(insumo.valorTotal)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50">
                <span>Total de compras: {insumo.totalCompras}</span>
                <span className="mx-2">•</span>
                <span>Última compra: {formatDate(insumo.ultimaCompra)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoletosTab({ supplierId }: { supplierId: string }) {
  const { boletos, loading, error, buscar } = useSupplierBoletos(supplierId);
  const [filtroStatus, setFiltroStatus] = useState<string>("");

  useEffect(() => {
    void buscar({ status: filtroStatus || undefined });
  }, [supplierId, filtroStatus]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; style: string }> = {
      pendente: { label: "Pendente", style: "bg-yellow-500/20 text-yellow-400" },
      pago: { label: "Pago", style: "bg-green-500/20 text-green-400" },
      vencido: { label: "Vencido", style: "bg-red-500/20 text-red-400" },
      cancelado: { label: "Cancelado", style: "bg-gray-500/20 text-gray-400" },
    };
    return badges[status] || { label: status, style: "bg-blue-500/20 text-blue-400" };
  };

  if (loading && !boletos) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando boletos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button className="mt-4 bg-white/10 hover:bg-white/20" onClick={() => buscar({ status: filtroStatus || undefined })}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar({ status: filtroStatus || undefined })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {!boletos || boletos.boletos.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <FileCheck className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhum boleto encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {boletos.boletos.map((boleto) => {
            const statusBadge = getStatusBadge(boleto.status);
            const isVencido = boleto.status === "vencido" || (boleto.status === "pendente" && new Date(boleto.dataVencimento) < new Date());
            return (
              <div
                key={boleto.id}
                className={`p-4 rounded-lg border backdrop-blur-sm ${
                  isVencido
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-white/10 bg-white/[0.03]"
                } hover:bg-white/[0.05] transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${statusBadge.style}`}>
                        {statusBadge.label}
                      </span>
                      <span className="text-white/60 text-sm">
                        Vencimento: {formatDate(boleto.dataVencimento)}
                      </span>
                    </div>
                    <h4 className="text-white/90 font-medium mb-1">
                      Valor: {formatCurrency(boleto.valorBoleto)}
                    </h4>
                    <p className="text-sm text-white/60">
                      Ficha #{boleto.fichaCusto.numeroSequencial} - {boleto.fichaCusto.nomePeca}
                    </p>
                    {boleto.dataPagamento && (
                      <p className="text-xs text-green-400 mt-1">
                        Pago em: {formatDate(boleto.dataPagamento)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {boleto.arquivoUrl && (
                      <Button
                        className="bg-white/10 hover:bg-white/20 text-xs"
                        onClick={() => window.open(boleto.arquivoUrl || "", "_blank")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    )}
                    <Button
                      className="bg-white/10 hover:bg-white/20 text-xs"
                      onClick={() => window.open(`/fichas-custo/${boleto.fichaCusto.id}`, "_blank")}
                    >
                      Ver Ficha
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
                {boleto.linhaDigitavel && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/50 mb-1">Linha digitável:</p>
                    <p className="text-xs font-mono text-white/70 break-all">
                      {boleto.linhaDigitavel}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoricoTab({ supplierId }: { supplierId: string }) {
  const { auditoria, loading, error, buscar } = useSupplierAuditoria(supplierId);
  const [filtroAcao, setFiltroAcao] = useState<string>("");

  useEffect(() => {
    void buscar({ limite: 50, acao: filtroAcao || undefined });
  }, [supplierId, filtroAcao]);

  const getAcaoLabel = (acao: string) => {
    const labels: Record<string, string> = {
      criar: "Criado",
      atualizar: "Atualizado",
      deletar: "Deletado",
      restaurar: "Restaurado",
    };
    return labels[acao] || acao;
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case "criar":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "atualizar":
        return <Edit className="h-4 w-4 text-blue-400" />;
      case "deletar":
        return <Trash2 className="h-4 w-4 text-red-400" />;
      case "restaurar":
        return <RefreshCw className="h-4 w-4 text-yellow-400" />;
      default:
        return <History className="h-4 w-4 text-white/40" />;
    }
  };

  if (loading && auditoria.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button
          className="mt-4 bg-white/10 hover:bg-white/20"
          onClick={() => buscar({ limite: 50, acao: filtroAcao || undefined })}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <select
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas as ações</option>
          <option value="criar">Criar</option>
          <option value="atualizar">Atualizar</option>
          <option value="deletar">Deletar</option>
          <option value="restaurar">Restaurar</option>
        </select>
        <Button
          className="bg-white/10 hover:bg-white/20"
          onClick={() => buscar({ limite: 50, acao: filtroAcao || undefined })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Timeline */}
      {auditoria.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <History className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhum histórico encontrado</p>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical da timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

          <div className="space-y-6">
            {auditoria.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Ícone */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-sm">
                  {getAcaoIcon(item.acao)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 pb-6">
                  <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{getAcaoLabel(item.acao)}</span>
                        {item.campo && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                            {item.campo}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/40">
                        {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-2">
                      Por: <span className="text-white/80">{item.actorId}</span>
                    </p>
                    {item.justificativa && (
                      <p className="text-sm text-white/70 mt-2 italic">{item.justificativa}</p>
                    )}
                    {item.campo && item.estadoAnterior !== null && item.estadoNovo !== null && (
                      <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-white/60 hover:text-white/80">
                          Ver alterações
                        </summary>
                        <div className="mt-2 p-3 rounded bg-white/5 border border-white/10 space-y-2">
                          <div>
                            <span className="text-red-400">Antes:</span>
                            <pre className="text-xs text-white/70 mt-1">
                              {JSON.stringify(item.estadoAnterior, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-green-400">Depois:</span>
                            <pre className="text-xs text-white/70 mt-1">
                              {JSON.stringify(item.estadoNovo, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VersoesTab({ supplierId }: { supplierId: string }) {
  const { versoes, loading, error, buscar } = useSupplierVersoes(supplierId);
  const [versaoSelecionada, setVersaoSelecionada] = useState<number | null>(null);
  const [versaoComparacao, setVersaoComparacao] = useState<number | null>(null);

  useEffect(() => {
    void buscar();
  }, [supplierId]);

  if (loading && versoes.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando versões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button className="mt-4 bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const versaoAtual = versoes.find((v) => v.versao === Math.max(...versoes.map((v) => v.versao)));

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            className="bg-white/10 hover:bg-white/20"
            onClick={() => setVersaoComparacao(null)}
            disabled={versaoComparacao === null}
          >
            Limpar comparação
          </Button>
        </div>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Lista de versões */}
      {versoes.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <RefreshCw className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhuma versão encontrada</p>
          <p className="text-sm text-white/40 mt-2">
            Versões são criadas automaticamente quando o fornecedor é atualizado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versoes
            .sort((a, b) => b.versao - a.versao)
            .map((versao) => (
              <div
                key={versao.id}
                className={`p-4 rounded-lg border backdrop-blur-sm ${
                  versao.versao === versaoAtual?.versao
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-white">Versão {versao.versao}</span>
                    {versao.versao === versaoAtual?.versao && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                        Atual
                      </span>
                    )}
                    <span className="text-xs text-white/40">
                      {new Date(versao.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-white/10 hover:bg-white/20 text-xs"
                      onClick={() =>
                        setVersaoSelecionada(
                          versaoSelecionada === versao.versao ? null : versao.versao
                        )
                      }
                    >
                      {versaoSelecionada === versao.versao ? "Ocultar" : "Ver"} Snapshot
                    </Button>
                    {versaoComparacao === null ? (
                      <Button
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs"
                        onClick={() => setVersaoComparacao(versao.versao)}
                      >
                        Comparar
                      </Button>
                    ) : versaoComparacao !== versao.versao ? (
                      <Button
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs"
                        onClick={() => {
                          // Lógica de comparação seria implementada aqui
                          notificationCenter.add({
                            type: "info",
                            title: "Comparação",
                            message: `Comparando versão ${versaoComparacao} com versão ${versao.versao}`,
                          });
                        }}
                      >
                        Comparar com v{versaoComparacao}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {versao.motivoAlteracao && (
                  <p className="text-sm text-white/70 mb-2">
                    <span className="text-white/50">Motivo:</span> {versao.motivoAlteracao}
                  </p>
                )}
                <p className="text-xs text-white/50">
                  Criado por: <span className="text-white/70">{versao.criadoPor}</span>
                </p>
                {versaoSelecionada === versao.versao && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80">
                      Ver snapshot completo
                    </summary>
                    <div className="mt-2 p-3 rounded bg-white/5 border border-white/10">
                      <pre className="text-xs text-white/70 overflow-auto max-h-96">
                        {JSON.stringify(versao.dadosSnapshot, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function DocumentosTab({ supplierId }: { supplierId: string }) {
  const { documentos, loading, error, buscar, criar, deletar } = useSupplierDocumentos(supplierId);
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>("outros");
  const [descricao, setDescricao] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void buscar();
  }, [supplierId]);

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      foto_peca: "Foto da Peça",
      nota_fiscal: "Nota Fiscal",
      boleto: "Boleto",
      comprovante_pagamento: "Comprovante de Pagamento",
      outros: "Outros",
    };
    return labels[tipo] || tipo;
  };

  const handleUpload = async () => {
    if (!arquivoSelecionado) return;

    // Validações
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];

    // Validar tamanho
    if (arquivoSelecionado.size > MAX_FILE_SIZE) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo muito grande",
        message: `O arquivo deve ter no máximo ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`,
      });
      return;
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(arquivoSelecionado.type)) {
      const extensao = arquivoSelecionado.name.split(".").pop()?.toLowerCase();
      if (!extensao || !ALLOWED_EXTENSIONS.includes(`.${extensao}`)) {
        notificationCenter.add({
          type: "error",
          title: "Tipo de arquivo não permitido",
          message: `Apenas arquivos ${ALLOWED_EXTENSIONS.join(", ")} são permitidos.`,
        });
        return;
      }
    }

    setUploading(true);
    try {
      const orgId = getCurrentOrgId();
      if (!orgId) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Organização não encontrada",
        });
        setUploading(false);
        return;
      }

      // Converter arquivo para base64 e enviar para o endpoint de upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1]; // Remove data:type;base64,
          
          // Usar novo endpoint de upload
          const response = await fetch(`${apiUrl}/suppliers/${supplierId}/documentos/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
              "x-org-id": orgId,
            },
            body: JSON.stringify({
              tipo: tipoDocumento,
              nomeArquivo: arquivoSelecionado.name,
              arquivoBase64: base64Data,
              mimeType: arquivoSelecionado.type,
              descricao: descricao || null,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Erro ao fazer upload" }));
            throw new Error(error.message || "Erro ao fazer upload");
          }

          notificationCenter.add({
            type: "success",
            title: "Documento adicionado",
            message: "O documento foi adicionado com sucesso.",
          });

          setArquivoSelecionado(null);
          setDescricao("");
          setMostrarUpload(false);
          void buscar(); // Atualizar lista
        } catch (error) {
          notificationCenter.add({
            type: "error",
            title: "Erro ao adicionar documento",
            message: error instanceof Error ? error.message : "Não foi possível adicionar o documento.",
          });
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        notificationCenter.add({
          type: "error",
          title: "Erro ao ler arquivo",
          message: "Não foi possível ler o arquivo selecionado.",
        });
        setUploading(false);
      };
      reader.readAsDataURL(arquivoSelecionado);
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao processar arquivo",
        message: error instanceof Error ? error.message : "Não foi possível processar o arquivo.",
      });
      setUploading(false);
    }
  };

  const handleDeletar = async (docId: string, nomeArquivo: string) => {
    if (!confirm(`Deseja realmente deletar o documento "${nomeArquivo}"?`)) return;

    try {
      await deletar(docId);
      notificationCenter.add({
        type: "success",
        title: "Documento deletado",
        message: "O documento foi deletado com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao deletar documento",
        message: "Não foi possível deletar o documento.",
      });
    }
  };

  if (loading && !documentos) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-400">{error}</p>
        <Button className="mt-4 bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
          onClick={() => setMostrarUpload(!mostrarUpload)}
        >
          <Upload className="h-4 w-4 mr-2" />
          {mostrarUpload ? "Cancelar" : "Adicionar Documento"}
        </Button>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {mostrarUpload && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <h4 className="text-white font-medium mb-4">Adicionar Documento</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Tipo de Documento</label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="foto_peca">Foto da Peça</option>
                <option value="nota_fiscal">Nota Fiscal</option>
                <option value="boleto">Boleto</option>
                <option value="comprovante_pagamento">Comprovante de Pagamento</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Arquivo</label>
              <input
                type="file"
                onChange={(e) => setArquivoSelecionado(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[hsl(var(--primary))] file:text-white file:cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Descrição (opcional)</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Adicione uma descrição para o documento..."
              />
            </div>
            <Button
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-white w-full"
              onClick={handleUpload}
              disabled={!arquivoSelecionado || uploading}
            >
              {uploading ? "Enviando..." : "Enviar Documento"}
            </Button>
          </div>
        </div>
      )}

      {!documentos || documentos.documentos.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <FileStack className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhum documento encontrado</p>
          <p className="text-sm text-white/40 mt-2">Clique em "Adicionar Documento" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.documentos.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h4 className="text-white/90 font-medium">{doc.nomeArquivo}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      {getTipoLabel(doc.tipo)}
                    </span>
                  </div>
                  {doc.descricao && (
                    <p className="text-sm text-white/60 mb-2">{doc.descricao}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>{formatarTamanho(doc.tamanhoBytes)}</span>
                    <span>•</span>
                    <span>{doc.mimeType}</span>
                    <span>•</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {doc.arquivoUrl && (
                    <Button
                      className="bg-white/10 hover:bg-white/20 text-xs"
                      onClick={() => window.open(doc.arquivoUrl, "_blank")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
                    onClick={() => handleDeletar(doc.id, doc.nomeArquivo)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// TAGS TAB
// ============================================
function TagsTab({ supplierId }: { supplierId: string }) {
  const orgId = getCurrentOrgId();
  const { tags: allTags, buscar: buscarTags, criar: criarTag } = useSupplierTags(orgId || undefined);
  const { tags: supplierTags, buscar: buscarSupplierTags, adicionar, remover } = useSupplierTagsRelation(supplierId, orgId || undefined);
  const [mostrarCriarTag, setMostrarCriarTag] = useState(false);
  const [novaTagNome, setNovaTagNome] = useState("");
  const [novaTagCor, setNovaTagCor] = useState("#3b82f6");

  useEffect(() => {
    void buscarTags();
    void buscarSupplierTags();
  }, [supplierId]);

  const handleCriarTag = async () => {
    if (!novaTagNome.trim()) return;
    try {
      await criarTag({ name: novaTagNome, color: novaTagCor });
      setNovaTagNome("");
      setMostrarCriarTag(false);
      notificationCenter.add({
        type: "success",
        title: "Tag criada",
        message: "A tag foi criada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível criar a tag.",
      });
    }
  };

  const handleAdicionarTag = async (tagId: string) => {
    try {
      await adicionar(tagId);
      notificationCenter.add({
        type: "success",
        title: "Tag adicionada",
        message: "A tag foi adicionada ao fornecedor.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível adicionar a tag.",
      });
    }
  };

  const handleRemoverTag = async (tagId: string) => {
    try {
      await remover(tagId);
      notificationCenter.add({
        type: "success",
        title: "Tag removida",
        message: "A tag foi removida do fornecedor.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível remover a tag.",
      });
    }
  };

  const supplierTagIds = new Set(supplierTags.map((t) => t.id));
  const tagsDisponiveis = allTags.filter((t) => !supplierTagIds.has(t.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
          onClick={() => setMostrarCriarTag(!mostrarCriarTag)}
        >
          {mostrarCriarTag ? "Cancelar" : "Criar Tag"}
        </Button>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => { void buscarTags(); void buscarSupplierTags(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {mostrarCriarTag && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <h4 className="text-white font-medium mb-4">Criar Nova Tag</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Nome</label>
              <input
                type="text"
                value={novaTagNome}
                onChange={(e) => setNovaTagNome(e.target.value)}
                placeholder="Ex: Eletrônicos, Têxtil, Premium"
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Cor</label>
              <input
                type="color"
                value={novaTagCor}
                onChange={(e) => setNovaTagCor(e.target.value)}
                className="w-full h-10 rounded-lg border border-white/20 bg-white/5"
              />
            </div>
            <Button
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-white w-full"
              onClick={handleCriarTag}
              disabled={!novaTagNome.trim()}
            >
              Criar Tag
            </Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-white font-medium mb-3">Tags do Fornecedor</h4>
        {supplierTags.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-white/10 bg-white/[0.03]">
            <Star className="h-8 w-8 mx-auto text-white/30 mb-2" />
            <p className="text-white/60">Nenhuma tag atribuída</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {supplierTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.03] backdrop-blur-sm"
                style={{ borderColor: tag.color || undefined }}
              >
                <span className="text-sm text-white" style={{ color: tag.color || undefined }}>
                  {tag.name}
                </span>
                <button
                  onClick={() => handleRemoverTag(tag.id)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {tagsDisponiveis.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">Tags Disponíveis</h4>
          <div className="flex flex-wrap gap-2">
            {tagsDisponiveis.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAdicionarTag(tag.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
                style={{ borderColor: tag.color || undefined }}
              >
                <span className="text-sm text-white" style={{ color: tag.color || undefined }}>
                  {tag.name}
                </span>
                <span className="text-white/40">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// AVALIAÇÕES TAB
// ============================================
function AvaliacoesTab({ supplierId }: { supplierId: string }) {
  const orgId = getCurrentOrgId();
  const { avaliacoes, stats, loading, error, buscar, criar, deletar } = useSupplierAvaliacoes(supplierId, orgId || undefined);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    void buscar();
  }, [supplierId]);

  const handleCriarAvaliacao = async () => {
    try {
      await criar({ nota, comentario: comentario || null });
      setNota(5);
      setComentario("");
      setMostrarForm(false);
      notificationCenter.add({
        type: "success",
        title: "Avaliação criada",
        message: "Sua avaliação foi registrada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível criar a avaliação.",
      });
    }
  };

  if (loading && !avaliacoes) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium mb-1">Avaliação Média</h4>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i <= Math.round(stats.average) ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
                />
              ))}
            </div>
            <span className="text-white/60">
              {stats.average.toFixed(1)} ({stats.count} avaliações)
            </span>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? "Cancelar" : "Avaliar"}
        </Button>
      </div>

      {mostrarForm && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <h4 className="text-white font-medium mb-4">Sua Avaliação</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Nota</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNota(i)}
                    className={`h-10 w-10 rounded-lg border transition-colors ${
                      i <= nota
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                        : "bg-white/5 border-white/20 text-white/40"
                    }`}
                  >
                    <Star className={`h-5 w-5 mx-auto ${i <= nota ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Comentário (opcional)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Deixe um comentário sobre este fornecedor..."
              />
            </div>
            <Button
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-white w-full"
              onClick={handleCriarAvaliacao}
            >
              Enviar Avaliação
            </Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-white font-medium mb-3">Avaliações ({avaliacoes.length})</h4>
        {avaliacoes.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-white/10 bg-white/[0.03]">
            <Star className="h-8 w-8 mx-auto text-white/30 mb-2" />
            <p className="text-white/60">Nenhuma avaliação ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {avaliacoes.map((av) => (
              <div key={av.id} className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i <= av.nota ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">{formatDate(av.createdAt)}</span>
                </div>
                {av.comentario && (
                  <p className="text-sm text-white/70 mt-2">{av.comentario}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// HISTÓRICO DE PREÇOS TAB
// ============================================
function PrecosTab({ supplierId }: { supplierId: string }) {
  const orgId = getCurrentOrgId();
  const { historicos, stats, loading, error, buscar, buscarStats } = useSupplierHistoricoPrecos(supplierId, orgId || undefined);
  const [filtroInsumo, setFiltroInsumo] = useState("");

  useEffect(() => {
    void buscar();
    void buscarStats();
  }, [supplierId]);

  if (loading && !historicos) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando histórico de preços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <div>
            <p className="text-xs text-white/60 mb-1">Preço Mínimo</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(stats.min)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Preço Máximo</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(stats.max)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Preço Médio</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(stats.avg)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Total de Registros</p>
            <p className="text-lg font-bold text-white">{stats.count}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <input
          type="text"
          value={filtroInsumo}
          onChange={(e) => setFiltroInsumo(e.target.value)}
          placeholder="Filtrar por insumo..."
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
        />
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => { void buscar(); void buscarStats(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {historicos.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-white/10 bg-white/[0.03]">
          <TrendingUp className="h-8 w-8 mx-auto text-white/30 mb-2" />
          <p className="text-white/60">Nenhum histórico de preços</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historicos
            .filter((h) => !filtroInsumo || h.insumoNome.toLowerCase().includes(filtroInsumo.toLowerCase()))
            .map((h) => (
              <div key={h.id} className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{h.insumoNome}</h4>
                    <p className="text-sm text-white/60">{formatDate(h.dataCompra)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatCurrency(h.preco)}</p>
                    {h.quantidade && (
                      <p className="text-xs text-white/60">
                        {h.quantidade} {h.unidade || "un"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// ALERTAS TAB
// ============================================
function AlertasTab({ supplierId }: { supplierId: string }) {
  const orgId = getCurrentOrgId();
  const { alertas, unreadCount, loading, error, buscar, buscarUnreadCount, marcarComoLido } = useSupplierAlertas(orgId || undefined);
  const [filtroStatus, setFiltroStatus] = useState<string>("");

  useEffect(() => {
    void buscar({ supplierId, lido: filtroStatus === "lido" ? true : filtroStatus === "nao-lido" ? false : undefined });
    void buscarUnreadCount(supplierId);
  }, [supplierId, filtroStatus]);

  const handleMarcarComoLido = async (alertaId: string) => {
    try {
      await marcarComoLido(alertaId);
      notificationCenter.add({
        type: "success",
        title: "Alerta marcado como lido",
        message: "O alerta foi marcado como lido.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível marcar o alerta como lido.",
      });
    }
  };

  const getPrioridadeStyle = (prioridade: string) => {
    switch (prioridade) {
      case "critica":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "alta":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "media":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (loading && !alertas) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium mb-1">Alertas</h4>
          {unreadCount > 0 && (
            <p className="text-sm text-red-400">
              {unreadCount} não lido{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="nao-lido">Não Lidos</option>
            <option value="lido">Lidos</option>
          </select>
          <Button className="bg-white/10 hover:bg-white/20" onClick={() => { void buscar({ supplierId }); void buscarUnreadCount(supplierId); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-white/10 bg-white/[0.03]">
          <Bell className="h-8 w-8 mx-auto text-white/30 mb-2" />
          <p className="text-white/60">Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`p-4 rounded-lg border backdrop-blur-sm ${
                !alerta.lido ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded border ${getPrioridadeStyle(alerta.prioridade)}`}>
                      {alerta.prioridade}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      {alerta.tipo}
                    </span>
                    {!alerta.lido && (
                      <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                        Não lido
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-medium">{alerta.titulo}</h4>
                  <p className="text-sm text-white/70 mt-1">{alerta.mensagem}</p>
                  {alerta.dataVencimento && (
                    <p className="text-xs text-white/50 mt-2">
                      Vencimento: {formatDate(alerta.dataVencimento)}
                    </p>
                  )}
                </div>
                {!alerta.lido && (
                  <Button
                    className="bg-white/10 hover:bg-white/20 text-xs"
                    onClick={() => handleMarcarComoLido(alerta.id)}
                  >
                    Marcar como lido
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotasTab({ supplierId }: { supplierId: string }) {
  const orgId = getCurrentOrgId();
  const { notas, loading, error, buscar, criar, atualizar, deletar } = useSupplierNotas(supplierId, orgId || undefined);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<string>("nota");
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [buscaTexto, setBuscaTexto] = useState("");

  useEffect(() => {
    void buscar({ 
      tipo: filtroTipo || undefined,
      busca: buscaTexto.trim() || undefined,
    });
  }, [supplierId, filtroTipo, buscaTexto, buscar]);

  const handleCriar = async () => {
    if (!conteudo.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "O conteúdo da nota é obrigatório",
      });
      return;
    }

    try {
      await criar({ titulo: titulo.trim() || null, conteudo: conteudo.trim(), tipo });
      setTitulo("");
      setConteudo("");
      setTipo("nota");
      setMostrarForm(false);
      notificationCenter.add({
        type: "success",
        title: "Nota criada",
        message: "A nota foi criada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível criar a nota.",
      });
    }
  };

  const handleEditar = (nota: { id: string; titulo: string | null; conteudo: string; tipo: string }) => {
    setEditandoId(nota.id);
    setTitulo(nota.titulo || "");
    setConteudo(nota.conteudo);
    setTipo(nota.tipo);
    setMostrarForm(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editandoId || !conteudo.trim()) return;

    try {
      await atualizar(editandoId, { titulo: titulo.trim() || null, conteudo: conteudo.trim(), tipo });
      setEditandoId(null);
      setTitulo("");
      setConteudo("");
      setTipo("nota");
      setMostrarForm(false);
      notificationCenter.add({
        type: "success",
        title: "Nota atualizada",
        message: "A nota foi atualizada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível atualizar a nota.",
      });
    }
  };

  const handleDeletar = async (notaId: string) => {
    if (!confirm("Deseja realmente deletar esta nota?")) return;

    try {
      await deletar(notaId);
      notificationCenter.add({
        type: "success",
        title: "Nota deletada",
        message: "A nota foi deletada com sucesso.",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível deletar a nota.",
      });
    }
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setTitulo("");
    setConteudo("");
    setTipo("nota");
    setMostrarForm(false);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      nota: "Nota",
      lembrete: "Lembrete",
      observacao: "Observação",
    };
    return labels[tipo] || tipo;
  };

  const getTipoStyle = (tipo: string) => {
    const styles: Record<string, string> = {
      nota: "bg-blue-500/20 text-blue-400",
      lembrete: "bg-yellow-500/20 text-yellow-400",
      observacao: "bg-purple-500/20 text-purple-400",
    };
    return styles[tipo] || "bg-gray-500/20 text-gray-400";
  };

  // Notas já vêm filtradas do backend quando há buscaTexto
  const notasFiltradas = notas;

  if (loading && notas.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/60">Carregando notas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            placeholder="Buscar notas..."
            className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="nota">Nota</option>
            <option value="lembrete">Lembrete</option>
            <option value="observacao">Observação</option>
          </select>
        </div>
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
          {mostrarForm ? "Cancelar" : "Nova Nota"}
        </Button>
        <Button className="bg-white/10 hover:bg-white/20" onClick={() => buscar({ 
          tipo: filtroTipo || undefined,
          busca: buscaTexto.trim() || undefined,
        })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {mostrarForm && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <h4 className="text-white font-medium mb-4">
            {editandoId ? "Editar Nota" : "Nova Nota"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="nota">Nota</option>
                <option value="lembrete">Lembrete</option>
                <option value="observacao">Observação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Título (opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Reunião importante, Contato urgente..."
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Conteúdo *</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                rows={5}
                placeholder="Digite o conteúdo da nota..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-white flex-1"
                onClick={editandoId ? handleSalvarEdicao : handleCriar}
                disabled={!conteudo.trim()}
              >
                {editandoId ? "Salvar Alterações" : "Criar Nota"}
              </Button>
              <Button
                className="bg-white/10 hover:bg-white/20 flex-1"
                onClick={handleCancelar}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {notasFiltradas.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <MessageSquare className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {buscaTexto || filtroTipo ? "Nenhuma nota encontrada com os filtros aplicados" : "Nenhuma nota ainda"}
          </p>
          {!buscaTexto && !filtroTipo && (
            <p className="text-sm text-white/40 mt-2">Clique em "Nova Nota" para começar</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {notasFiltradas.map((nota) => (
            <div
              key={nota.id}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${getTipoStyle(nota.tipo)}`}>
                      {getTipoLabel(nota.tipo)}
                    </span>
                    {nota.titulo && (
                      <h4 className="text-white font-medium">{nota.titulo}</h4>
                    )}
                  </div>
                  <p className="text-sm text-white/70 whitespace-pre-wrap">{nota.conteudo}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                    <span>{formatDate(nota.createdAt)}</span>
                    {nota.updatedAt !== nota.createdAt && (
                      <>
                        <span>•</span>
                        <span>Editado em {formatDate(nota.updatedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-white/10 hover:bg-white/20 text-xs"
                    onClick={() => handleEditar(nota)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
                    onClick={() => handleDeletar(nota.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


