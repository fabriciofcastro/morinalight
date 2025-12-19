"use client";

import { Button } from "@morina/ui";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Upload,
  Calculator,
  Settings,
  Edit,
  X,
  Eye,
  File,
  Search,
  GripVertical,
  ExternalLink,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notificationCenter } from "@/components/notifications/notification-center";
import { useFichasCusto, useFichaCusto } from "@/hooks/use-fichas-custo";
import type { StatusFichaCusto, CreateInsumoInput } from "@/lib/api/fichas-custo";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SupplierSearchField } from "@/components/fichas-custo/SupplierSearchField";
import { PageLoader } from "@/components/ui/PageLoader";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { statusCustomizadoApi, type StatusCustomizado } from "@/lib/api/status-customizado-ficha-custo";

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
  error = false,
  errorMessage,
  ...props 
}: { 
  label: string;
  required?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputId = id || `input-${++inputCounter}`;
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="group relative">
      <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <input
          id={inputId}
          {...props}
          onFocus={() => {
            setShowTooltip(error && !!errorMessage);
            // Remover shadow no focus
          }}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
        />
        {error && errorMessage && (
          <div
            id={`${inputId}-error`}
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
  );
};

let selectCounter = 0;
const FuturisticSelect = ({ 
  label, 
  required = false,
  id,
  error = false,
  errorMessage,
  children, 
  ...props 
}: { 
  label: string;
  required?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const selectId = id || `select-${++selectCounter}`;
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="group relative">
      <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <select
          id={selectId}
          {...props}
          onFocus={() => setShowTooltip(error && !!errorMessage)}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${selectId}-error` : undefined}
        >
          {children}
        </select>
        {error && errorMessage && (
          <div
            id={`${selectId}-error`}
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
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <textarea
          id={textareaId}
          {...props}
          className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );
};

type UnidadeMedida = "Metros" | "Jarda" | "Unidade" | "Grosa" | "Milheiro" | "";

export function FichasCustoClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [pending, startTransition] = useTransition();
  const { criar, buscar: buscarFicha } = useFichaCusto(orgId);
  const { fichas, listar, loading: loadingFichas } = useFichasCusto(orgId);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Função para gerar referência baseada no ano
  const gerarReferenciaPorAno = useCallback((ano: number): string => {
    // 2026: 56333 (5 caracteres)
    // 2027: 57333 (5 caracteres)
    // 2028: 58333 (5 caracteres)
    // 2029: 59333 (5 caracteres)
    // 2030+: 105036 (6 caracteres) - formato: 1 + ano + sequencial
    if (ano >= 2030) {
      // A partir de 2030: 6 caracteres começando com 1
      const base = 100000; // Base para 6 dígitos
      const sequencial = (ano - 2030) * 1000 + 36; // Incremento por ano
      return String(base + sequencial);
    } else {
      // 2026-2029: 5 caracteres começando com 5
      const base = 50000; // Base para 5 dígitos
      const sequencial = (ano - 2026) * 1000 + 333; // Incremento por ano
      return String(base + sequencial).padStart(5, "0");
    }
  }, []);

  // Gerar ID automático baseado no último número sequencial
  const gerarIdFicha = useCallback((fichas: Array<{ numeroSequencial?: number }>): string => {
    if (fichas.length === 0) {
      return "FC-001";
    }
    const ultimoNumero = Math.max(...fichas.map((f) => f.numeroSequencial || 0));
    const proximoNumero = ultimoNumero + 1;
    return `FC-${String(proximoNumero).padStart(3, "0")}`;
  }, []);

  // Form data principal
  const [formData, setFormData] = useState({
    idFicha: "",
    numeroCorte: "",
    colecao: "",
    referenciaPeca: "",
    dataAbertura: new Date().toISOString().split("T")[0],
    status: "rascunho" as StatusFichaCusto,
    dataCorte: "",
    descricaoPeca: "",
    quantidadePecas: 0,
    fotoPecaUrl: "",
    observacoes: "",
  });

  // Insumos
  const [insumos, setInsumos] = useState<Array<{
    id: string;
    data: string;
    fornecedor: string;
    nfAnexo: string;
    unidade: UnidadeMedida;
    valorUnitario: number;
    desconto: number;
    quantidade: number;
    valorTotal: number;
  }>>([]);

  // Status customizados (carregados da API)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusCustomizados, setStatusCustomizados] = useState<StatusCustomizado[]>([]);
  const [loadingStatusCustomizados, setLoadingStatusCustomizados] = useState(false);
  const [editandoStatus, setEditandoStatus] = useState<string | null>(null);
  const [novoStatusNome, setNovoStatusNome] = useState("");
  const [novoStatusCor, setNovoStatusCor] = useState("#3b82f6");
  const [novoStatusDescricao, setNovoStatusDescricao] = useState("");
  const [buscaStatus, setBuscaStatus] = useState("");
  const [ordenacaoStatus, setOrdenacaoStatus] = useState<"nome" | "cor" | "data">("nome");
  
  // Modal de visualização de documento
  const [documentoVisualizacao, setDocumentoVisualizacao] = useState<{ url: string; nome: string } | null>(null);

  // Carregar fichas e gerar ID automático
  useEffect(() => {
    if (orgId) {
      setIsInitialLoading(true);
      void listar({ pagina: 1, tamanhoPagina: 1000 }).finally(() => {
        setIsInitialLoading(false);
      });
    }
  }, [orgId, listar]);

  // Carregar status customizados do banco
  const carregarStatusCustomizados = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoadingStatusCustomizados(true);
      const response = await statusCustomizadoApi.listar(orgId, { ativo: true, tamanhoPagina: 100 });
      setStatusCustomizados(response.status);
    } catch (error) {
      console.error("Erro ao carregar status customizados:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao carregar status customizados",
      });
    } finally {
      setLoadingStatusCustomizados(false);
    }
  }, [orgId]);

  // Carregar status quando modal abrir
  useEffect(() => {
    if (showStatusModal) {
      void carregarStatusCustomizados();
    }
  }, [showStatusModal, carregarStatusCustomizados]);

  // Gerar ID automático quando fichas carregarem
  useEffect(() => {
    if (fichas.length > 0 && !formData.idFicha) {
      const novoId = gerarIdFicha(fichas);
      setFormData((prev) => ({ ...prev, idFicha: novoId }));
    } else if (fichas.length === 0 && !formData.idFicha) {
      setFormData((prev) => ({ ...prev, idFicha: "FC-001" }));
    }
  }, [fichas, gerarIdFicha, formData.idFicha]);

  // Gerar referência automática quando coleção mudar
  useEffect(() => {
    if (formData.colecao && !formData.referenciaPeca) {
      const anoAtual = new Date().getFullYear();
      const referencia = gerarReferenciaPorAno(anoAtual);
      setFormData((prev) => ({ ...prev, referenciaPeca: referencia }));
    }
  }, [formData.colecao, formData.referenciaPeca, gerarReferenciaPorAno]);

  // Carregar dados para duplicação (se vier da lista)
  useEffect(() => {
    const dadosDuplicacao = sessionStorage.getItem("duplicar_ficha");
    if (!dadosDuplicacao || !orgId) return;

    const processarDuplicacao = async () => {
      try {
        const options = JSON.parse(dadosDuplicacao);
        sessionStorage.removeItem("duplicar_ficha");

        // Buscar a ficha original
        const fichaOriginal = await buscarFicha(options.fichaId);
        if (!fichaOriginal) {
          notificationCenter.add({
            type: "error",
            title: "Erro",
            message: "Ficha original não encontrada.",
          });
          return;
        }

        // Aplicar opções de duplicação
        if (options.copiarEstrutura) {
          setFormData((prev) => ({
            ...prev,
            colecao: fichaOriginal.categoria || prev.colecao,
            descricaoPeca: fichaOriginal.nomePeca || prev.descricaoPeca,
            fotoPecaUrl: options.manterFornecedores ? (fichaOriginal.fotoPecaUrl || prev.fotoPecaUrl) : prev.fotoPecaUrl,
            observacoes: prev.observacoes,
          }));
        }

        // Copiar insumos se necessário
        if (fichaOriginal.insumos && fichaOriginal.insumos.length > 0) {
          const insumosDuplicados = fichaOriginal.insumos.map((insumo) => ({
            id: `insumo-${Date.now()}-${Math.random()}`,
            data: insumo.notaFiscalData || new Date().toISOString().split("T")[0],
            fornecedor: options.manterFornecedores ? (insumo.fornecedorNome || "") : "",
            nfAnexo: "",
            unidade: (insumo.unidadeMedida || "Unidade") as UnidadeMedida,
            valorUnitario: options.resetarValores ? 0 : (insumo.custoUnitario || 0),
            desconto: 0,
            quantidade: options.resetarValores ? 0 : (insumo.quantidade || 0),
            valorTotal: 0,
          }));
          setInsumos(insumosDuplicados);
        }

        notificationCenter.add({
          type: "success",
          title: "Ficha duplicada",
          message: "Os dados da ficha original foram carregados. Revise e ajuste conforme necessário.",
        });
      } catch (error) {
        console.error("Erro ao processar duplicação:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao duplicar",
          message: error instanceof Error ? error.message : "Erro desconhecido ao duplicar ficha.",
        });
      }
    };

    void processarDuplicacao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Converter quantidade para unidade base (Unidade) conforme a unidade de medida
  const converterParaUnidadeBase = useCallback((quantidade: number, unidade: UnidadeMedida): number => {
    if (!unidade || unidade === "") {
      return quantidade; // Se não tiver unidade selecionada, retorna o valor direto
    }
    switch (unidade) {
      case "Metros":
        // Metros: cálculo direto (1 metro = 1 unidade base)
        return quantidade;
      case "Jarda":
        // Jarda: 1 jarda = 0.9144 metros
        return quantidade * 0.9144;
      case "Unidade":
        // Unidade: cálculo direto
        return quantidade;
      case "Grosa":
        // Grosa: 1 grosa = 144 unidades
        return quantidade * 144;
      case "Milheiro":
        // Milheiro: 1 milheiro = 1000 unidades
        return quantidade * 1000;
      default:
        return quantidade;
    }
  }, []);

  // Calcular valores dos insumos (memoizado) - considerando unidade de medida
  const calcularInsumo = useCallback((insumo: typeof insumos[0]) => {
    if (!insumo.unidade || insumo.unidade === "") {
      // Se não tiver unidade, calcular diretamente
      const valorBruto = Number(insumo.valorUnitario) * Number(insumo.quantidade);
      const descontoValor = (valorBruto * Number(insumo.desconto)) / 100;
      const valorTotal = Math.max(0, valorBruto - descontoValor);
      return { valorBruto, valorTotal };
    }

    // Converter quantidade para unidade base
    const quantidadeBase = converterParaUnidadeBase(Number(insumo.quantidade), insumo.unidade);
    
    // Calcular valor bruto
    // O valor unitário já deve estar na unidade base (ex: R$ por metro, R$ por unidade, etc.)
    const valorBruto = Number(insumo.valorUnitario) * quantidadeBase;
    const descontoValor = (valorBruto * Number(insumo.desconto)) / 100;
    const valorTotal = Math.max(0, valorBruto - descontoValor);
    return { valorBruto, valorTotal };
  }, [converterParaUnidadeBase]);

  // Calcular totais (memoizado para performance)
  const totaisCalculados = useMemo(() => {
    const valorBrutoTotal = insumos.reduce((sum, insumo) => {
      const { valorBruto } = calcularInsumo(insumo);
      return sum + valorBruto;
    }, 0);

    const valorComDescontoTotal = insumos.reduce((sum, insumo) => {
      const { valorTotal } = calcularInsumo(insumo);
      return sum + valorTotal;
    }, 0);

    const quantidadePecas = Number(formData.quantidadePecas) || 0;
    const custoPorPeca = quantidadePecas > 0 
      ? valorComDescontoTotal / quantidadePecas 
      : 0;
    const custoComPerda = custoPorPeca * 1.15; // +15% de perda

    return {
      valorBrutoTotal: Math.round(valorBrutoTotal * 100) / 100,
      valorComDescontoTotal: Math.round(valorComDescontoTotal * 100) / 100,
      custoPorPeca: Math.round(custoPorPeca * 100) / 100,
      custoComPerda: Math.round(custoComPerda * 100) / 100,
    };
  }, [insumos, formData.quantidadePecas, calcularInsumo]);

  // Adicionar insumo
  const adicionarInsumo = () => {
    setInsumos([
      ...insumos,
      {
        id: `insumo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: new Date().toISOString().split("T")[0],
        fornecedor: "",
        nfAnexo: "",
        unidade: "",
        valorUnitario: 0,
        desconto: 0,
        quantidade: 0,
        valorTotal: 0,
      },
    ]);
  };

  // Remover insumo
  const removerInsumo = (insumoId: string) => {
    setInsumos(insumos.filter((insumo) => insumo.id !== insumoId));
  };

  // Atualizar insumo
  const atualizarInsumo = (insumoId: string, campo: string, valor: string | number) => {
    const novosInsumos = insumos.map((insumo) => {
      if (insumo.id === insumoId) {
        const atualizado = { ...insumo, [campo]: valor };
        // Recalcular valor total
        const { valorTotal } = calcularInsumo(atualizado);
        return { ...atualizado, valorTotal };
      }
      return insumo;
    });
    
    setInsumos(novosInsumos);
  };

  // Validar formulário (melhorado) - retorna erros por campo
  const validarFormulario = useCallback((): { 
    valido: boolean; 
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    // Validações do cabeçalho
    if (!formData.idFicha?.trim()) {
      erros.push("ID da ficha é obrigatório");
      camposErro.idFicha = "ID da ficha é obrigatório";
    }
    
    if (!formData.referenciaPeca?.trim()) {
      erros.push("Referência da peça é obrigatória");
      camposErro.referenciaPeca = "Referência da peça é obrigatória";
    } else {
      const anoAtual = new Date().getFullYear();
      const tamanhoEsperado = anoAtual >= 2030 ? 6 : 5;
      if (formData.referenciaPeca.length !== tamanhoEsperado) {
        erros.push(`Referência deve ter exatamente ${tamanhoEsperado} caracteres`);
        camposErro.referenciaPeca = `Referência deve ter exatamente ${tamanhoEsperado} caracteres`;
      }
    }
    
    if (!formData.colecao?.trim()) {
      erros.push("Coleção é obrigatória");
      camposErro.colecao = "Coleção é obrigatória";
    }
    
    if (!formData.descricaoPeca?.trim()) {
      erros.push("Descrição da peça é obrigatória");
      camposErro.descricaoPeca = "Descrição da peça é obrigatória";
    }
    
    if (!formData.dataAbertura) {
      erros.push("Data de abertura é obrigatória");
      camposErro.dataAbertura = "Data de abertura é obrigatória";
    }
    
    if (formData.quantidadePecas <= 0) {
      erros.push("Quantidade de peças deve ser maior que zero");
      camposErro.quantidadePecas = "Quantidade de peças deve ser maior que zero";
    }

    // Validações de insumos - OBRIGATÓRIO
    if (insumos.length === 0) {
      erros.push("Adicione pelo menos um insumo ou aviamento");
      camposErro.insumos = "Adicione pelo menos um insumo ou aviamento";
    } else {
      insumos.forEach((insumo, index) => {
        const numeroInsumo = index + 1;
        const prefixo = `insumo-${insumo.id}`;
        
        if (!insumo.data?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Data é obrigatória`);
          camposErro[`${prefixo}-data`] = "Data é obrigatória";
        }
        
        if (!insumo.fornecedor?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Fornecedor é obrigatório`);
          camposErro[`${prefixo}-fornecedor`] = "Fornecedor é obrigatório";
        }
        
        if (!insumo.unidade) {
          erros.push(`Insumo ${numeroInsumo}: Unidade é obrigatória`);
          camposErro[`${prefixo}-unidade`] = "Unidade é obrigatória";
        }
        
        const valorUnitario = Number(insumo.valorUnitario);
        if (Number.isNaN(valorUnitario) || valorUnitario <= 0) {
          erros.push(`Insumo ${numeroInsumo}: Valor unitário deve ser maior que zero`);
          camposErro[`${prefixo}-valorUnitario`] = "Valor unitário deve ser maior que zero";
        }
        
        const quantidade = Number(insumo.quantidade);
        if (Number.isNaN(quantidade) || quantidade <= 0) {
          erros.push(`Insumo ${numeroInsumo}: Quantidade deve ser maior que zero`);
          camposErro[`${prefixo}-quantidade`] = "Quantidade deve ser maior que zero";
        }
        
        const desconto = Number(insumo.desconto);
        if (Number.isNaN(desconto) || desconto < 0 || desconto > 100) {
          erros.push(`Insumo ${numeroInsumo}: Desconto deve estar entre 0% e 100%`);
          camposErro[`${prefixo}-desconto`] = "Desconto deve estar entre 0% e 100%";
        }
      });
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData, insumos]);

  // Estado para erros de validação
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  
  // Validar em tempo real e verificar se formulário é válido
  const validacaoCompleta = useMemo(() => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    // Validações do cabeçalho
    if (!formData.idFicha?.trim()) {
      erros.push("ID da ficha é obrigatório");
      camposErro.idFicha = "ID da ficha é obrigatório";
    }
    
    if (!formData.referenciaPeca?.trim()) {
      erros.push("Referência da peça é obrigatória");
      camposErro.referenciaPeca = "Referência da peça é obrigatória";
    } else {
      const anoAtual = new Date().getFullYear();
      const tamanhoEsperado = anoAtual >= 2030 ? 6 : 5;
      if (formData.referenciaPeca.length !== tamanhoEsperado) {
        erros.push(`Referência deve ter exatamente ${tamanhoEsperado} caracteres`);
        camposErro.referenciaPeca = `Referência deve ter exatamente ${tamanhoEsperado} caracteres`;
      }
    }
    
    if (!formData.colecao?.trim()) {
      erros.push("Coleção é obrigatória");
      camposErro.colecao = "Coleção é obrigatória";
    }
    
    if (!formData.descricaoPeca?.trim()) {
      erros.push("Descrição da peça é obrigatória");
      camposErro.descricaoPeca = "Descrição da peça é obrigatória";
    }
    
    if (!formData.dataAbertura) {
      erros.push("Data de abertura é obrigatória");
      camposErro.dataAbertura = "Data de abertura é obrigatória";
    }
    
    if (formData.quantidadePecas <= 0) {
      erros.push("Quantidade de peças deve ser maior que zero");
      camposErro.quantidadePecas = "Quantidade de peças deve ser maior que zero";
    }

    // Validações de insumos - OBRIGATÓRIO
    if (insumos.length === 0) {
      erros.push("Adicione pelo menos um insumo ou aviamento");
      camposErro.insumos = "Adicione pelo menos um insumo ou aviamento";
    } else {
      insumos.forEach((insumo, index) => {
        const numeroInsumo = index + 1;
        const prefixo = `insumo-${insumo.id}`;
        
        if (!insumo.data?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Data é obrigatória`);
          camposErro[`${prefixo}-data`] = "Data é obrigatória";
        }
        
        if (!insumo.fornecedor?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Fornecedor é obrigatório`);
          camposErro[`${prefixo}-fornecedor`] = "Fornecedor é obrigatório";
        }
        
        if (!insumo.unidade) {
          erros.push(`Insumo ${numeroInsumo}: Unidade é obrigatória`);
          camposErro[`${prefixo}-unidade`] = "Unidade é obrigatória";
        }
        
        const valorUnitario = Number(insumo.valorUnitario);
        if (Number.isNaN(valorUnitario) || valorUnitario <= 0) {
          erros.push(`Insumo ${numeroInsumo}: Valor unitário deve ser maior que zero`);
          camposErro[`${prefixo}-valorUnitario`] = "Valor unitário deve ser maior que zero";
        }
        
        const quantidade = Number(insumo.quantidade);
        if (Number.isNaN(quantidade) || quantidade <= 0) {
          erros.push(`Insumo ${numeroInsumo}: Quantidade deve ser maior que zero`);
          camposErro[`${prefixo}-quantidade`] = "Quantidade deve ser maior que zero";
        }
        
        const desconto = Number(insumo.desconto);
        if (Number.isNaN(desconto) || desconto < 0 || desconto > 100) {
          erros.push(`Insumo ${numeroInsumo}: Desconto deve estar entre 0% e 100%`);
          camposErro[`${prefixo}-desconto`] = "Desconto deve estar entre 0% e 100%";
        }
      });
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData.idFicha, formData.referenciaPeca, formData.colecao, formData.descricaoPeca, formData.dataAbertura, formData.quantidadePecas, insumos]);
  
  const formularioValido = validacaoCompleta.valido;
  
  useEffect(() => {
    setErrosValidacao(validacaoCompleta.camposErro);
  }, [validacaoCompleta.camposErro]);

  // Salvar ficha (melhorado com tratamento de erros)
  const salvarFicha = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: validacao.erros.length === 1 
          ? validacao.erros[0] 
          : `${validacao.erros.length} erros encontrados: ${validacao.erros.slice(0, 3).join(", ")}${validacao.erros.length > 3 ? "..." : ""}`,
      });
      return;
    }

    startTransition(async () => {
      try {
        const insumosInput: CreateInsumoInput[] = insumos.map((insumo) => ({
          descricao: `${insumo.fornecedor || "Fornecedor"} - ${insumo.unidade}`,
          tipo: "aviamento",
          fornecedorNome: insumo.fornecedor || null,
          notaFiscalNumero: insumo.nfAnexo || null,
          notaFiscalData: insumo.data || null,
          quantidade: Number(insumo.quantidade),
          unidadeMedida: insumo.unidade,
          custoUnitario: Number(insumo.valorUnitario),
          observacoes: insumo.desconto > 0 ? `Desconto: ${insumo.desconto}%` : null,
        }));

        await criar({
          referenciaPeca: formData.referenciaPeca.trim(),
          nomePeca: formData.descricaoPeca.trim(),
          categoria: formData.colecao,
          fotoPecaUrl: formData.fotoPecaUrl?.trim() || null,
          insumos: insumosInput,
        });

        notificationCenter.add({
          type: "success",
          title: "Ficha salva com sucesso",
          message: `Ficha ${formData.idFicha} foi salva e está pronta para uso.`,
        });

        // Resetar formulário
        setFormData({
          idFicha: "",
          numeroCorte: "",
          colecao: "",
          referenciaPeca: "",
          dataAbertura: new Date().toISOString().split("T")[0],
          status: "rascunho",
          dataCorte: "",
          descricaoPeca: "",
          quantidadePecas: 0,
          fotoPecaUrl: "",
          observacoes: "",
        });
        setInsumos([]);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Erro desconhecido ao salvar ficha de custo";
        
        console.error("Erro ao salvar ficha:", error);
        
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar ficha",
          message: errorMessage,
        });
      }
    });
  };

  // Função para cancelar e voltar para lista
  const handleCancelar = () => {
    router.push("/fichas-custo/list");
  };

  // Estado para upload de foto
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estado para upload de documentos por insumo
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  // Estado de auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Detectar mudanças no formulário
  useEffect(() => {
    if ((formData.idFicha || formData.referenciaPeca || formData.descricaoPeca || insumos.length > 0) && formularioValido) {
      setHasUnsavedChanges(true);
    }
  }, [formData, insumos, formularioValido]);

  // Auto-save a cada 30 segundos se houver alterações válidas
  useEffect(() => {
    if (!hasUnsavedChanges || !formularioValido) return;

    const autoSaveInterval = setInterval(() => {
      setAutoSaveStatus("saving");
      salvarFicha().finally(() => {
        setAutoSaveStatus("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      });
    }, 30000); // 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, formularioValido]);

  // Atalhos de teclado
  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      action: () => {
        if (formularioValido) {
          void salvarFicha();
        }
      },
      description: "Salvar ficha",
      preventDefault: true,
    },
    {
      key: "Escape",
      action: () => {
        if (showStatusModal) {
          setShowStatusModal(false);
        }
      },
      description: "Fechar modal",
    },
  ]);

  // Mostrar loader durante carregamento inicial
  if (isInitialLoading) {
    return <PageLoader message="Carregando dados da ficha..." />;
  }

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
              <FileText className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Ficha de Custo de Aviamento
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Avançado de Gestão e Controle de Custos
                </p>
                {autoSaveStatus !== "idle" && (
                  <div className="flex items-center gap-2 mt-2">
                    {autoSaveStatus === "saving" && (
                      <>
                        <div className="h-2 w-2 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                        <span className="text-xs text-white/50">Salvando...</span>
                      </>
                    )}
                    {autoSaveStatus === "saved" && (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-green-400">Salvo automaticamente</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Formulário Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl"
      >
        {/* CABEÇALHO - Campos Principais */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
            Dados da Ficha
          </h2>
          
          <div className="grid grid-cols-4 gap-4">
            <FuturisticInput
              label="ID da Ficha"
              required
              value={formData.idFicha}
              onChange={(e) => setFormData((prev) => ({ ...prev, idFicha: e.target.value }))}
              placeholder="Gerado automaticamente"
              error={!!errosValidacao.idFicha}
              errorMessage={errosValidacao.idFicha}
              readOnly
              className="cursor-not-allowed opacity-75"
            />
            <FuturisticInput
              label="Número do Corte"
              value={formData.numeroCorte}
              onChange={(e) => setFormData((prev) => ({ ...prev, numeroCorte: e.target.value }))}
              placeholder="Ex: 10769"
            />
            <FuturisticSelect
              label="Coleção"
              required
              value={formData.colecao}
              onChange={(e) => setFormData((prev) => ({ ...prev, colecao: e.target.value }))}
              error={!!errosValidacao.colecao}
              errorMessage={errosValidacao.colecao}
            >
              <option value="" className="bg-[#1a1f3a]">Selecione...</option>
              <option value="inverno" className="bg-[#1a1f3a]">Inverno</option>
              <option value="verao" className="bg-[#1a1f3a]">Verão</option>
            </FuturisticSelect>
            <FuturisticInput
              label="Referência da Peça"
              required
              value={formData.referenciaPeca}
              onChange={(e) => {
                const anoAtual = new Date().getFullYear();
                const maxLength = anoAtual >= 2030 ? 6 : 5;
                const valor = e.target.value.slice(0, maxLength);
                setFormData((prev) => ({ ...prev, referenciaPeca: valor }));
              }}
              placeholder={new Date().getFullYear() >= 2030 ? "6 caracteres" : "5 caracteres"}
              maxLength={new Date().getFullYear() >= 2030 ? 6 : 5}
              minLength={new Date().getFullYear() >= 2030 ? 6 : 5}
              error={!!errosValidacao.referenciaPeca}
              errorMessage={errosValidacao.referenciaPeca}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <FuturisticInput
              label="Data de Abertura"
              required
              type="date"
              value={formData.dataAbertura}
              onChange={(e) => setFormData((prev) => ({ ...prev, dataAbertura: e.target.value }))}
              readOnly
              error={!!errosValidacao.dataAbertura}
              errorMessage={errosValidacao.dataAbertura}
            />
            <div className="group">
              <label htmlFor="status-select" className="block text-sm font-semibold text-white/90 mb-2">
                Status <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 items-end">
                <div className="relative flex-1 group">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    id="status-select"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as StatusFichaCusto }))}
                    className={`relative w-full px-4 py-3 rounded-lg border ${errosValidacao.status ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
                    aria-invalid={!!errosValidacao.status}
                  >
                    <optgroup label="Status Padrão" className="bg-[#1a1f3a]">
                      <option value="rascunho" className="bg-[#1a1f3a]">Rascunho</option>
                      <option value="enviada_para_conferencia" className="bg-[#1a1f3a]">Enviada para Conferência</option>
                      <option value="aprovada" className="bg-[#1a1f3a]">Aprovada</option>
                      <option value="reprovada" className="bg-[#1a1f3a]">Reprovada</option>
                    </optgroup>
                    {statusCustomizados.length > 0 && (
                      <optgroup label="Status Customizados" className="bg-[#1a1f3a]">
                        {statusCustomizados
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((status) => (
                            <option key={status.id} value={status.id} className="bg-[#1a1f3a]">
                              {status.nome}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm h-[48px] cursor-pointer"
                    onClick={() => setShowStatusModal(true)}
                    type="button"
                    aria-label="Gerenciar status"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
            <FuturisticInput
              label="Data do Corte"
              type="date"
              value={formData.dataCorte}
              onChange={(e) => setFormData((prev) => ({ ...prev, dataCorte: e.target.value }))}
            />
            <FuturisticInput
              label="Quantidade de Peças"
              type="number"
              min="0"
              value={formData.quantidadePecas}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantidadePecas: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              error={!!errosValidacao.quantidadePecas}
              errorMessage={errosValidacao.quantidadePecas}
            />
          </div>

          {/* Layout com foto no lado esquerdo */}
          <div className="grid grid-cols-[200px_1fr] gap-6 mt-4 items-start">
            {/* Foto - Quadrado no lado esquerdo */}
            <div className="group">
              <label htmlFor="foto-peca-input" className="block text-sm font-semibold text-white/90 mb-2">Foto da Peça</label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative aspect-square rounded-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
                  {formData.fotoPecaUrl ? (
                    <div className="relative w-full h-full group/photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.fotoPecaUrl} 
                        alt="Foto da peça" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, fotoPecaUrl: "" }))}
                          className="text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg border border-red-500/30 transition-all"
                          aria-label="Remover foto"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-full cursor-pointer p-4">
                      <input
                        id="foto-peca-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validar tipo
                          const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                          if (!validTypes.includes(file.type)) {
                            notificationCenter.add({
                              type: "error",
                              title: "Erro",
                              message: "Formato não suportado. Use JPEG, PNG ou WebP",
                            });
                            return;
                          }

                          // Validar tamanho (5MB)
                          const maxSize = 5 * 1024 * 1024;
                          if (file.size > maxSize) {
                            notificationCenter.add({
                              type: "error",
                              title: "Erro",
                              message: "Arquivo muito grande. Tamanho máximo: 5MB",
                            });
                            return;
                          }

                          setUploadingPhoto(true);
                          try {
                            const uploadFormData = new FormData();
                            uploadFormData.append("file", file);

                            const response = await fetch(`/api/organizations/${orgId}/fichas-custo/upload`, {
                              method: "POST",
                              headers: {
                                "x-upload-type": "foto",
                              },
                              body: uploadFormData,
                            });

                            if (!response.ok) {
                              const error = await response.json().catch(() => ({ message: "Erro ao fazer upload" }));
                              throw new Error(error.message || "Erro ao fazer upload da foto");
                            }

                            const data = await response.json();
                            setFormData((prev) => ({ ...prev, fotoPecaUrl: data.url }));

                            notificationCenter.add({
                              type: "success",
                              title: "Foto carregada",
                              message: "Foto da peça carregada com sucesso",
                            });
                          } catch (error) {
                            notificationCenter.add({
                              type: "error",
                              title: "Erro",
                              message: error instanceof Error ? error.message : "Erro ao fazer upload da foto",
                            });
                          } finally {
                            setUploadingPhoto(false);
                          }
                        }}
                      />
                      {uploadingPhoto ? (
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                      ) : (
                        <Upload className="h-8 w-8 text-white/60" />
                      )}
                      <span className="text-xs text-white/60 text-center">
                        {uploadingPhoto ? "Carregando..." : "Clique para anexar"}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição da Peça */}
            <div>
              <FuturisticInput
                label="Descrição da Peça"
                required
                value={formData.descricaoPeca}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricaoPeca: e.target.value }))}
                placeholder="Ex: Colete suede violette"
                error={!!errosValidacao.descricaoPeca}
                errorMessage={errosValidacao.descricaoPeca}
              />
            </div>
          </div>
        </div>

        {/* INSUMOS E AVIAMENTOS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white/90 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-[hsl(var(--accent))]" />
              Insumos e Aviamentos
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={adicionarInsumo}
                type="button"
                aria-label="Adicionar insumo ou aviamento"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Insumo
              </Button>
            </motion.div>
          </div>

          <div className="space-y-4">
            {insumos.map((insumo) => (
              <motion.div
                key={insumo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">
                    Insumo {insumos.findIndex((i) => i.id === insumo.id) + 1}
                  </h3>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer"
                      size="sm"
                      onClick={() => removerInsumo(insumo.id)}
                      type="button"
                      aria-label={`Remover insumo ${insumos.findIndex((i) => i.id === insumo.id) + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FuturisticInput
                    label="Data"
                    required
                    type="date"
                    value={insumo.data}
                    onChange={(e) => atualizarInsumo(insumo.id, "data", e.target.value)}
                    error={!!errosValidacao[`insumo-${insumo.id}-data`]}
                    errorMessage={errosValidacao[`insumo-${insumo.id}-data`]}
                  />
                  <SupplierSearchField
                    value={insumo.fornecedor}
                    onChange={(value) => atualizarInsumo(insumo.id, "fornecedor", value)}
                    orgId={orgId}
                    onSupplierSelect={(supplier) => {
                      atualizarInsumo(insumo.id, "fornecedor", supplier.name);
                    }}
                    error={!!errosValidacao[`insumo-${insumo.id}-fornecedor`]}
                    errorMessage={errosValidacao[`insumo-${insumo.id}-fornecedor`]}
                  />
                  <div className="group">
                    <label htmlFor={`nf-${insumo.id}`} className="block text-sm font-semibold text-white/90 mb-2">Anexar NF-e / Cupom</label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-none h-[48px]">
                        {insumo.nfAnexo ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-white/70 flex-1 truncate" title={insumo.nfAnexo}>
                              {insumo.nfAnexo.split('/').pop() || 'Documento anexado'}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setDocumentoVisualizacao({ url: insumo.nfAnexo, nome: `NF-e/Cupom - Insumo ${insumos.findIndex((i) => i.id === insumo.id) + 1}` })}
                                className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                                title="Visualizar documento"
                                aria-label="Visualizar documento"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <a
                                href={insumo.nfAnexo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                                title="Abrir em nova aba"
                                aria-label="Abrir documento em nova aba"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => atualizarInsumo(insumo.id, "nfAnexo", "")}
                                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                                title="Remover documento"
                                aria-label="Remover documento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 flex-1 cursor-pointer">
                            <input
                              id={`nf-${insumo.id}`}
                              type="file"
                              accept="application/pdf,image/jpeg,image/jpg,image/png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Validar tipo
                                const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
                                if (!validTypes.includes(file.type)) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro",
                                    message: "Formato não suportado. Use PDF, JPG ou PNG",
                                  });
                                  return;
                                }

                                // Validar tamanho (10MB)
                                const maxSize = 10 * 1024 * 1024;
                                if (file.size > maxSize) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro",
                                    message: "Arquivo muito grande. Tamanho máximo: 10MB",
                                  });
                                  return;
                                }

                                setUploadingDocs((prev) => ({ ...prev, [insumo.id]: true }));
                                try {
                                  const uploadFormData = new FormData();
                                  uploadFormData.append("file", file);

                                  const response = await fetch(`/api/organizations/${orgId}/fichas-custo/upload`, {
                                    method: "POST",
                                    headers: {
                                      "x-upload-type": "documento",
                                    },
                                    body: uploadFormData,
                                  });

                                  if (!response.ok) {
                                    const error = await response.json().catch(() => ({ message: "Erro ao fazer upload" }));
                                    throw new Error(error.message || "Erro ao fazer upload do documento");
                                  }

                                  const data = await response.json();
                                  atualizarInsumo(insumo.id, "nfAnexo", data.url);

                                  notificationCenter.add({
                                    type: "success",
                                    title: "Documento carregado",
                                    message: "NF-e/Cupom carregado com sucesso",
                                  });
                                } catch (error) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro",
                                    message: error instanceof Error ? error.message : "Erro ao fazer upload do documento",
                                  });
                                } finally {
                                  setUploadingDocs((prev) => ({ ...prev, [insumo.id]: false }));
                                }
                              }}
                            />
                            <span className="text-sm text-white/60 flex-1">
                              {uploadingDocs[insumo.id] ? "Carregando..." : "Clique para anexar"}
                            </span>
                            {uploadingDocs[insumo.id] ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                            ) : (
                              <Upload className="h-4 w-4 text-white/60" />
                            )}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  <FuturisticSelect
                    label="Unidade"
                    required
                    value={insumo.unidade}
                    onChange={(e) => atualizarInsumo(insumo.id, "unidade", e.target.value as UnidadeMedida)}
                    error={!!errosValidacao[`insumo-${insumo.id}-unidade`]}
                    errorMessage={errosValidacao[`insumo-${insumo.id}-unidade`]}
                  >
                    <option value="" className="bg-[#1a1f3a]">Selecione a unidade...</option>
                    <option value="Metros" className="bg-[#1a1f3a]">Metros</option>
                    <option value="Jarda" className="bg-[#1a1f3a]">Jarda</option>
                    <option value="Unidade" className="bg-[#1a1f3a]">Unidade</option>
                    <option value="Grosa" className="bg-[#1a1f3a]">Grosa</option>
                    <option value="Milheiro" className="bg-[#1a1f3a]">Milheiro</option>
                  </FuturisticSelect>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <FuturisticInput
                    label="Quantidade"
                    required
                    type="number"
                    min="0"
                    step="0.0001"
                    value={insumo.quantidade}
                    onChange={(e) => atualizarInsumo(insumo.id, "quantidade", parseFloat(e.target.value) || 0)}
                    placeholder="0.0000"
                    error={!!errosValidacao[`insumo-${insumo.id}-quantidade`]}
                    errorMessage={errosValidacao[`insumo-${insumo.id}-quantidade`]}
                  />
                  <div className="group relative">
                    <label htmlFor={`valor-unitario-${insumo.id}`} className="block text-sm font-semibold text-white/90 mb-2">
                      Valor Unitário <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-white/60">R$</span>
                        <input
                          id={`valor-unitario-${insumo.id}`}
                          type="text"
                          value={insumo.valorUnitario > 0 ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(insumo.valorUnitario) : ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                            const numValue = parseFloat(value) || 0;
                            atualizarInsumo(insumo.id, "valorUnitario", numValue);
                          }}
                          placeholder="0,00"
                          className={`relative w-full pl-10 pr-4 py-3 rounded-lg border ${errosValidacao[`insumo-${insumo.id}-valorUnitario`] ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                          aria-invalid={!!errosValidacao[`insumo-${insumo.id}-valorUnitario`]}
                          onFocus={() => {}}
                        />
                      </div>
                      {errosValidacao[`insumo-${insumo.id}-valorUnitario`] && (
                        <div
                          role="tooltip"
                          className="absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-200"
                          style={{ bottom: "100%", left: 0 }}
                        >
                          {errosValidacao[`insumo-${insumo.id}-valorUnitario`]}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="group relative">
                    <label htmlFor={`desconto-${insumo.id}`} className="block text-sm font-semibold text-white/90 mb-2">Desconto %</label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center">
                        <input
                          id={`desconto-${insumo.id}`}
                          type="text"
                          value={insumo.desconto > 0 ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(insumo.desconto) : ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                            const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
                            atualizarInsumo(insumo.id, "desconto", numValue);
                          }}
                          placeholder="0,00"
                          className={`relative w-full px-4 pr-8 py-3 rounded-lg border ${errosValidacao[`insumo-${insumo.id}-desconto`] ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                          aria-invalid={!!errosValidacao[`insumo-${insumo.id}-desconto`]}
                          onFocus={() => {}}
                        />
                        <span className="absolute right-4 text-white/60">%</span>
                      </div>
                      {errosValidacao[`insumo-${insumo.id}-desconto`] && (
                        <div
                          role="tooltip"
                          className="absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-200"
                          style={{ bottom: "100%", left: 0 }}
                        >
                          {errosValidacao[`insumo-${insumo.id}-desconto`]}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="group">
                    <label htmlFor={`valor-total-${insumo.id}`} className="block text-sm font-semibold text-white/90 mb-2">Valor Total</label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-green-500/20 to-green-400/20 rounded-lg blur-sm" />
                      <div id={`valor-total-${insumo.id}`} className="relative px-4 py-3 rounded-lg border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                        <span className="text-lg font-bold text-green-400">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(insumo.valorTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {insumos.length === 0 && (
              <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
                <Calculator className="h-12 w-12 mx-auto text-white/30 mb-4" />
                <p className="text-white/60 mb-2">Nenhum insumo adicionado. Clique em &quot;Adicionar Insumo&quot; para começar.</p>
                {errosValidacao.insumos && (
                  <p className="text-red-400 text-sm font-semibold mt-2">{errosValidacao.insumos}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CÁLCULOS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-[hsl(var(--primary))]" />
            Cálculos
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="group">
              <label htmlFor="valor-bruto-total" className="block text-sm font-semibold text-white/90 mb-2">Valor Bruto Total</label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 to-blue-400/20 rounded-lg blur-sm" />
                <div id="valor-bruto-total" className="relative px-4 py-4 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-blue-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totaisCalculados.valorBrutoTotal)}
                  </span>
                </div>
              </div>
            </div>
            <div className="group">
              <label htmlFor="valor-desconto-total" className="block text-sm font-semibold text-white/90 mb-2">Valor com Desconto Total</label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-purple-500/20 to-purple-400/20 rounded-lg blur-sm" />
                <div id="valor-desconto-total" className="relative px-4 py-4 rounded-lg border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-purple-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totaisCalculados.valorComDescontoTotal)}
                  </span>
                </div>
              </div>
            </div>
            <div className="group">
              <label htmlFor="custo-peca-perda" className="block text-sm font-semibold text-white/90 mb-2">Custo por Peça + 15% de Perda</label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-green-500/20 to-green-400/20 rounded-lg blur-sm" />
                <div id="custo-peca-perda" className="relative px-4 py-4 rounded-lg border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-green-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totaisCalculados.custoComPerda)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="mb-8">
          <FuturisticTextarea
            label="Observações Gerais"
            rows={6}
            value={formData.observacoes}
            onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Digite observações gerais sobre a ficha de custo..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center gap-3 pt-6 border-t border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white backdrop-blur-sm cursor-pointer"
              onClick={handleCancelar}
              type="button"
              aria-label="Cancelar e voltar para lista"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar e Voltar
            </Button>
          </motion.div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => {
                  setFormData({
                    idFicha: "",
                    numeroCorte: "",
                    colecao: "",
                    referenciaPeca: "",
                    dataAbertura: new Date().toISOString().split("T")[0],
                    status: "rascunho",
                    dataCorte: "",
                    descricaoPeca: "",
                    quantidadePecas: 0,
                    fotoPecaUrl: "",
                    observacoes: "",
                  });
                  setInsumos([]);
                  setErrosValidacao({});
                }}
                type="button"
                aria-label="Limpar formulário"
              >
                Limpar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                className={`bg-gradient-to-r from-[hsl(var(--primary)/0.85)] to-[hsl(var(--accent)/0.85)] hover:from-[hsl(var(--primary)/0.95)] hover:to-[hsl(var(--accent)/0.95)] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${pending ? "opacity-50 cursor-wait" : ""}`}
                onClick={salvarFicha}
                disabled={!formularioValido || pending}
                type="button"
                aria-label="Salvar ficha de custo"
                title={!formularioValido ? "Preencha todos os campos obrigatórios" : "Salvar ficha"}
              >
                {pending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Ficha
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Visualização de Documento */}
      {documentoVisualizacao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent backdrop-blur-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                <File className="h-5 w-5 text-blue-400" />
                {documentoVisualizacao.nome}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={documentoVisualizacao.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 p-2 rounded transition-colors"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setDocumentoVisualizacao(null)}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Fechar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {documentoVisualizacao.url.endsWith('.pdf') ? (
                <iframe
                  src={documentoVisualizacao.url}
                  className="w-full h-[600px] rounded-lg border border-white/10"
                  title="Visualização do documento"
                />
              ) : (
                <div className="flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={documentoVisualizacao.url}
                    alt={documentoVisualizacao.nome}
                    className="max-w-full max-h-[600px] rounded-lg border border-white/10"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Gerenciamento de Status - VERSÃO INSANA */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl p-8 rounded-3xl border-2 border-white/20 bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-transparent backdrop-blur-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.3), inset 0 0 60px rgba(59, 130, 246, 0.1)",
            }}
          >
            {/* Efeitos de brilho futurista */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-50 blur-3xl -z-10" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
            
            {/* Header futurista */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full" />
                  <Settings className="h-8 w-8 text-blue-400 relative z-10" style={{ animation: "spin 8s linear infinite" }} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Gerenciar Status
                  </h3>
                  <p className="text-sm text-white/50 mt-1">Configure e personalize os status do sistema</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  setEditandoStatus(null);
                  setNovoStatusNome("");
                  setNovoStatusCor("#3b82f6");
                  setNovoStatusDescricao("");
                  setBuscaStatus("");
                }}
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Fechar modal"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Busca e Filtros */}
            {statusCustomizados.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar status..."
                    value={buscaStatus}
                    onChange={(e) => setBuscaStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60">Ordenar por:</span>
                  <select
                    value={ordenacaoStatus}
                    onChange={(e) => setOrdenacaoStatus(e.target.value as "nome" | "cor" | "data")}
                    className="px-3 py-1 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer text-sm"
                  >
                    <option value="nome" className="bg-[#1a1f3a]">Nome</option>
                    <option value="cor" className="bg-[#1a1f3a]">Cor</option>
                    <option value="data" className="bg-[#1a1f3a]">Data de criação</option>
                  </select>
                </div>
              </div>
            )}

            {/* Status Padrão - Versão Insana */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h4 className="text-lg font-bold text-white/90">Status Padrão do Sistema</h4>
                <div className="h-1 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { nome: "Rascunho", descricao: "Ficha em edição", cor: "#3b82f6", id: "rascunho", icon: "📝" },
                  { nome: "Enviada para Conferência", descricao: "Aguardando aprovação", cor: "#eab308", id: "enviada_para_conferencia", icon: "⏳" },
                  { nome: "Aprovada", descricao: "Ficha aprovada e finalizada", cor: "#22c55e", id: "aprovada", icon: "✅" },
                  { nome: "Reprovada", descricao: "Ficha reprovada, requer ajustes", cor: "#ef4444", id: "reprovada", icon: "❌" },
                ].map((status) => (
                  <motion.div
                    key={status.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 transition-all group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${status.cor}20, ${status.cor}10)` }} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="absolute inset-0 blur-md opacity-50" style={{ backgroundColor: status.cor }} />
                          <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${status.cor}20` }}>
                            {status.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white/90 text-lg mb-1">{status.nome}</p>
                          <p className="text-xs text-white/60">{status.descricao}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20 backdrop-blur-sm">
                        Padrão
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Status Customizados */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[36px] px-3 text-sm"
                    onClick={() => {
                      setEditandoStatus("novo");
                      setNovoStatusNome("");
                      setNovoStatusCor("#3b82f6");
                      setNovoStatusDescricao("");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Status
                  </Button>
                </motion.div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm"
                      onClick={() => router.push("/fichas-custo/status-customizados")}
                    >
                      Tela Completa
                    </Button>
                  </motion.div>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm"
                    onClick={() => {
                      setShowStatusModal(false);
                      setEditandoStatus(null);
                      setNovoStatusNome("");
                      setNovoStatusCor("#3b82f6");
                      setNovoStatusDescricao("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              {/* Mensagem quando não há status customizados */}
              {statusCustomizados.length === 0 && editandoStatus !== "novo" && !statusCustomizados.some((s) => editandoStatus === s.id) && (
                <div className="text-center py-8 px-4 rounded-lg border border-white/10 bg-white/5">
                  <p className="text-sm text-white/50 mb-2">Nenhum status customizado criado ainda.</p>
                  <p className="text-xs text-white/40">Clique em "Novo Status" acima para criar um.</p>
                </div>
              )}

              {/* Lista de Status Customizados - Sempre mostrar quando há status, exceto quando está criando novo */}
              {statusCustomizados.length > 0 && (() => {
                // Filtrar e ordenar status
                let statusFiltrados = statusCustomizados.filter((status) => {
                  if (!buscaStatus.trim()) return true;
                  const busca = buscaStatus.toLowerCase();
                  return (
                    status.nome.toLowerCase().includes(busca) ||
                    status.descricao.toLowerCase().includes(busca) ||
                    status.cor.toLowerCase().includes(busca)
                  );
                });

                // Ordenar
                statusFiltrados = [...statusFiltrados].sort((a, b) => {
                  switch (ordenacaoStatus) {
                    case "nome":
                      return a.nome.localeCompare(b.nome);
                    case "cor":
                      return a.cor.localeCompare(b.cor);
                    case "data":
                      return b.id.localeCompare(a.id); // IDs mais recentes primeiro
                    default:
                      return 0;
                  }
                });

                return (
                  <div className="space-y-3">
                    {statusFiltrados.length === 0 ? (
                      <div className="text-center py-8 px-4 rounded-lg border border-white/10 bg-white/5">
                        <p className="text-sm text-white/50">Nenhum status encontrado com a busca "{buscaStatus}"</p>
                      </div>
                    ) : (
                      statusFiltrados.map((status) => (
                  <div key={status.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    {editandoStatus === status.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                        <div className="group relative">
                          <label htmlFor={`edit-status-nome-${status.id}`} className="block text-xs font-semibold text-white/70 mb-1">Nome <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                            <input
                              id={`edit-status-nome-${status.id}`}
                              type="text"
                              value={novoStatusNome}
                              onChange={(e) => setNovoStatusNome(e.target.value)}
                              className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                              placeholder="Nome do status"
                            />
                            </div>
                          </div>
                          <div className="group relative">
                            <label htmlFor={`edit-status-cor-${status.id}`} className="block text-xs font-semibold text-white/70 mb-1">Cor <span className="text-red-400">*</span></label>
                            <div className="relative">
                              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                              <div className="relative flex items-center gap-2 min-w-0">
                                <input
                                  id={`edit-status-cor-picker-${status.id}`}
                                  type="color"
                                  value={novoStatusCor}
                                  onChange={(e) => setNovoStatusCor(e.target.value)}
                                  className="w-12 h-12 rounded border border-white/20 cursor-pointer flex-shrink-0"
                                  title="Selecione uma cor"
                                />
                                <input
                                  id={`edit-status-cor-${status.id}`}
                                  type="text"
                                  value={novoStatusCor}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                      setNovoStatusCor(value);
                                    }
                                  }}
                                  className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                                  placeholder="#3b82f6"
                                  maxLength={7}
                                  pattern="^#[0-9A-Fa-f]{6}$"
                                />
                                <div 
                                  className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
                                  style={{ backgroundColor: novoStatusCor || "#3b82f6" }}
                                  title="Preview da cor"
                                />
                              </div>
                              {novoStatusCor && !/^#[0-9A-Fa-f]{6}$/.test(novoStatusCor) && (
                                <p className="mt-1 text-xs text-red-400">Cor deve ser um código hexadecimal válido (ex: #3b82f6)</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="group relative">
                          <label htmlFor={`edit-status-desc-${status.id}`} className="block text-xs font-semibold text-white/70 mb-1">Descrição</label>
                          <div className="relative">
                            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                            <input
                              id={`edit-status-desc-${status.id}`}
                              type="text"
                              value={novoStatusDescricao}
                              onChange={(e) => setNovoStatusDescricao(e.target.value)}
                              className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                              placeholder="Descrição do status (opcional)"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm flex-1"
                            onClick={async () => {
                              if (!orgId) return;
                              if (!novoStatusNome.trim()) {
                                notificationCenter.add({
                                  type: "error",
                                  title: "Erro",
                                  message: "Nome do status é obrigatório",
                                });
                                return;
                              }
                              if (!novoStatusCor.trim() || !/^#[0-9A-Fa-f]{6}$/.test(novoStatusCor)) {
                                notificationCenter.add({
                                  type: "error",
                                  title: "Erro",
                                  message: "Cor deve ser um código hexadecimal válido (ex: #3b82f6)",
                                });
                                return;
                              }
                              try {
                                await statusCustomizadoApi.atualizar(orgId, status.id, {
                                  nome: novoStatusNome.trim(),
                                  cor: novoStatusCor,
                                  descricao: novoStatusDescricao.trim() || null,
                                });
                                
                                // Recarregar lista
                                const response = await statusCustomizadoApi.listar(orgId, { ativo: true, tamanhoPagina: 100 });
                                setStatusCustomizados(response.status);
                                
                                setEditandoStatus(null);
                                setNovoStatusNome("");
                                setNovoStatusCor("#3b82f6");
                                setNovoStatusDescricao("");
                                notificationCenter.add({
                                  type: "success",
                                  title: "Status atualizado",
                                  message: `Status "${novoStatusNome.trim()}" foi atualizado com sucesso.`,
                                });
                              } catch (error) {
                                notificationCenter.add({
                                  type: "error",
                                  title: "Erro",
                                  message: error instanceof Error ? error.message : "Erro ao atualizar status",
                                });
                              }
                            }}
                          >
                            Salvar
                          </Button>
                          <Button
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm"
                            onClick={() => {
                              setEditandoStatus(null);
                              setNovoStatusNome("");
                              setNovoStatusCor("#3b82f6");
                              setNovoStatusDescricao("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-5 h-5 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: status.cor }} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white/90 truncate">{status.nome}</p>
                            {status.descricao && (
                              <p className="text-xs text-white/60 truncate">{status.descricao}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0 flex items-center justify-center"
                              onClick={() => {
                                setEditandoStatus(status.id);
                                setNovoStatusNome(status.nome);
                                setNovoStatusCor(status.cor);
                                setNovoStatusDescricao(status.descricao || "");
                              }}
                              aria-label={`Editar status ${status.nome}`}
                              title={`Editar status "${status.nome}"`}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0 flex items-center justify-center"
                              onClick={async () => {
                                if (!orgId) return;
                                if (!window.confirm(`Tem certeza que deseja excluir o status "${status.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
                                  return;
                                }
                                try {
                                  await statusCustomizadoApi.deletar(orgId, status.id);
                                  void carregarStatusCustomizados();
                                  notificationCenter.add({
                                    type: "success",
                                    title: "Status excluído",
                                    message: `Status "${status.nome}" foi excluído com sucesso.`,
                                  });
                                } catch (error) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro",
                                    message: error instanceof Error ? error.message : "Erro ao excluir status",
                                  });
                                }
                              }}
                              aria-label={`Excluir status ${status.nome}`}
                              title={`Excluir status "${status.nome}"`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                      ))
                    )}
                  </div>
                );
              })()}

              {/* Formulário para Novo Status */}
              {editandoStatus === "novo" && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 border-dashed">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group relative">
                          <label htmlFor="novo-status-nome" className="block text-xs font-semibold text-white/70 mb-1">Nome <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                            <input
                              id="novo-status-nome"
                              type="text"
                              value={novoStatusNome}
                              onChange={(e) => setNovoStatusNome(e.target.value)}
                              className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                              placeholder="Nome do status"
                            />
                          </div>
                        </div>
                        <div className="group relative">
                          <label htmlFor="novo-status-cor" className="block text-xs font-semibold text-white/70 mb-1">Cor <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                            <div className="relative flex items-center gap-2 min-w-0">
                              <input
                                id="novo-status-cor-picker"
                                type="color"
                                value={novoStatusCor}
                                onChange={(e) => setNovoStatusCor(e.target.value)}
                                className="w-12 h-12 rounded border border-white/20 cursor-pointer flex-shrink-0"
                                title="Selecione uma cor"
                              />
                              <input
                                id="novo-status-cor"
                                type="text"
                                value={novoStatusCor}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                    setNovoStatusCor(value);
                                  }
                                }}
                                className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                                placeholder="#3b82f6"
                                maxLength={7}
                                pattern="^#[0-9A-Fa-f]{6}$"
                              />
                              <div 
                                className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
                                style={{ backgroundColor: novoStatusCor || "#3b82f6" }}
                                title="Preview da cor"
                              />
                            </div>
                            {novoStatusCor && !/^#[0-9A-Fa-f]{6}$/.test(novoStatusCor) && (
                              <p className="mt-1 text-xs text-red-400">Cor deve ser um código hexadecimal válido (ex: #3b82f6)</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="group relative">
                        <label htmlFor="novo-status-desc" className="block text-xs font-semibold text-white/70 mb-1">Descrição</label>
                        <div className="relative">
                          <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                          <input
                            id="novo-status-desc"
                            type="text"
                            value={novoStatusDescricao}
                            onChange={(e) => setNovoStatusDescricao(e.target.value)}
                            className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 h-[48px]"
                            placeholder="Descrição do status (opcional)"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm flex-1"
                          onClick={async () => {
                            if (!orgId) return;
                            if (!novoStatusNome.trim()) {
                              notificationCenter.add({
                                type: "error",
                                title: "Erro",
                                message: "Nome do status é obrigatório",
                              });
                              return;
                            }
                            if (!novoStatusCor.trim() || !/^#[0-9A-Fa-f]{6}$/.test(novoStatusCor)) {
                              notificationCenter.add({
                                type: "error",
                                title: "Erro",
                                message: "Cor deve ser um código hexadecimal válido (ex: #3b82f6)",
                              });
                              return;
                            }
                            try {
                              await statusCustomizadoApi.criar(orgId, {
                                nome: novoStatusNome.trim(),
                                cor: novoStatusCor,
                                descricao: novoStatusDescricao.trim() || null,
                                ordem: statusCustomizados.length,
                                ativo: true,
                              });
                              
                              // Recarregar lista
                              const response = await statusCustomizadoApi.listar(orgId, { ativo: true, tamanhoPagina: 100 });
                              setStatusCustomizados(response.status);
                              
                              setEditandoStatus(null);
                              setNovoStatusNome("");
                              setNovoStatusCor("#3b82f6");
                              setNovoStatusDescricao("");
                              notificationCenter.add({
                                type: "success",
                                title: "Status criado",
                                message: `Status "${novoStatusNome.trim()}" foi criado com sucesso.`,
                              });
                            } catch (error) {
                              notificationCenter.add({
                                type: "error",
                                title: "Erro",
                                message: error instanceof Error ? error.message : "Erro ao criar status",
                              });
                            }
                          }}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Criar Status
                        </Button>
                        <Button
                          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-3 text-sm"
                          onClick={() => {
                            setEditandoStatus(null);
                            setNovoStatusNome("");
                            setNovoStatusCor("#3b82f6");
                            setNovoStatusDescricao("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <div className="text-sm text-white/60 flex items-center">
                {statusCustomizados.length > 0 && (
                  <span>{statusCustomizados.length} status customizado{statusCustomizados.length > 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
