"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { StandardFormPage } from "@/components/templates";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { PageLoader } from "@/components/ui/PageLoader";
import { useCnpj } from "@/hooks/use-cnpj";
import { useFichaCusto, useFichasCusto } from "@/hooks/use-fichas-custo";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { CreateInsumoInput } from "@/lib/api/fichas-custo";
import { suppliersApi } from "@/lib/api/suppliers";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { Button } from "@morina/ui";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  CheckCheck,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  File,
  FileText,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

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

// Componentes FuturisticInput, FuturisticSelect e FuturisticTextarea agora importados de @/components/ui

type UnidadeMedida = "Metros" | "Jarda" | "Unidade" | "Grosa" | "Milheiro" | "";
type StatusFichaCustoCompleto = "aprovado" | "aguardando_insumos" | "reprovado" | "em_edicao" | "concluido" | "rascunho";
type Colecao = "verao" | "inverno" | "";
type NotaFiscal = "sim" | "nao" | "";
type FormaPagamento = "a_vista" | "boleto" | "";

interface InsumoCompleto {
  id: string;
  dataHora: string; // Data e hora automática
  fornecedor: string;
  fornecedorId?: string;
  descricaoInsumo: string; // Descrição do insumo
  unidade: UnidadeMedida;
  valorUnitario: number;
  valorBruto: number; // Valor bruto calculado
  desconto: number;
  quantidade: number;
  valorTotal: number;
  nfAnexo: string;
  aprovado: boolean; // Aprovação individual
  aprovadoPor?: string;
  aprovadoEm?: string;
  motivoReprovacao?: string;
}

// Função para validar CNPJ
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
  
  // Validar dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === Number(digitos.charAt(1));
};

// Função para formatar CNPJ
const formatarCNPJ = (cnpj: string): string => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length <= 14) {
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
};

export function FichasCustoClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [pending, startTransition] = useTransition();
  const { criar, buscar: buscarFicha } = useFichaCusto(orgId);
  const { listar } = useFichasCusto(orgId);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [numeroFicha, setNumeroFicha] = useState<number | null>(null);
  const { buscar: buscarCnpj, loading: buscandoCNPJ } = useCnpj();

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

  // Form data principal
  const [formData, setFormData] = useState({
    idFicha: "",
    numeroCorte: "",
    colecao: "" as Colecao,
    referenciaPeca: "",
    nomePeca: "",
    categoria: "",
    dataAbertura: new Date().toISOString().split("T")[0],
    dataCorte: "",
    dataLiberacaoCorte: "",
    quantidadePecas: 0,
    notaFiscal: "" as NotaFiscal,
    formaPagamento: "" as FormaPagamento,
    status: "em_edicao" as StatusFichaCustoCompleto,
    departmentId: "",
    sectorId: "",
    fotoPecaUrl: "",
    observacoesGerais: "",
  });


  // Insumos
  const [insumos, setInsumos] = useState<InsumoCompleto[]>([]);
  
  // Formulário de novo insumo (separado da lista)
  const [novoInsumo, setNovoInsumo] = useState<Partial<InsumoCompleto> | null>(null);
  const [mostrarFormularioInsumo, setMostrarFormularioInsumo] = useState(false);

  // Modal de visualização de documento
  const [documentoVisualizacao, setDocumentoVisualizacao] = useState<{
    url: string;
    nome: string;
  } | null>(null);

  // Carregar fichas e gerar número sequencial automático
  useEffect(() => {
    if (!orgId) {
      setIsInitialLoading(false);
      return;
    }
    setIsInitialLoading(true);
    void listar({ pagina: 1, tamanhoPagina: 1000 })
      .then((resultado) => {
        // Gerar próximo número sequencial
        if (resultado) {
          const maiorNumero = resultado.itens.reduce((max, ficha) => {
            return Math.max(max, ficha.numeroSequencial || 0);
          }, 0);
          setNumeroFicha(maiorNumero + 1);
        } else {
          setNumeroFicha(1);
        }
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Erro ao carregar fichas de custo.";
        notificationCenter.add({
          type: "error",
          title: "Erro ao carregar fichas",
          message,
        });
        // Mesmo com erro, definir número inicial
        setNumeroFicha(1);
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, [orgId, listar]);

  // Gerar referência automática quando categoria mudar (opcional)
  useEffect(() => {
    if (formData.categoria && !formData.referenciaPeca) {
      const anoAtual = new Date().getFullYear();
      const referencia = gerarReferenciaPorAno(anoAtual);
      setFormData((prev) => ({ ...prev, referenciaPeca: referencia }));
    }
  }, [formData.categoria, formData.referenciaPeca, gerarReferenciaPorAno]);

  // Carregar dados para duplicação (se vier da lista)
  useEffect(() => {
    const dadosDuplicacao = sessionStorage.getItem("duplicar_ficha");
    if (!dadosDuplicacao) return;

    // Obter orgId no momento da duplicação
    const currentOrgId = getCurrentOrgId();
    if (!currentOrgId) return;

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
            categoria: fichaOriginal.categoria || prev.categoria,
            nomePeca: fichaOriginal.nomePeca || prev.nomePeca,
            fotoPecaUrl: options.manterFornecedores
              ? fichaOriginal.fotoPecaUrl || prev.fotoPecaUrl
              : prev.fotoPecaUrl,
            departmentId: fichaOriginal.departmentId || prev.departmentId,
            sectorId: fichaOriginal.sectorId || prev.sectorId,
          }));
        }

        // Copiar insumos se necessário
        if (fichaOriginal.insumos && fichaOriginal.insumos.length > 0) {
          const agora = new Date();
          const dataHora = `${agora.toISOString().split("T")[0]}T${agora.toTimeString().split(" ")[0]}`;
          const insumosDuplicados: InsumoCompleto[] = fichaOriginal.insumos.map((insumo) => {
            const quantidade = options.resetarValores ? 0 : insumo.quantidade || 0;
            const valorUnitario = options.resetarValores ? 0 : insumo.custoUnitario || 0;
            const valorBruto = quantidade * valorUnitario;
            const valorTotal = valorBruto; // Sem desconto inicial
            
            return {
              id: `insumo-${Date.now()}-${Math.random()}`,
              dataHora: insumo.notaFiscalData || dataHora,
              fornecedor: options.manterFornecedores ? insumo.fornecedorNome || "" : "",
              fornecedorId: undefined,
              descricaoInsumo: insumo.descricao || "",
              nfAnexo: "",
              unidade: (insumo.unidadeMedida || "Unidade") as UnidadeMedida,
              valorUnitario,
              valorBruto,
              desconto: 0,
              quantidade,
              valorTotal,
              aprovado: false,
            };
          });
          setInsumos(insumosDuplicados);
        }

        notificationCenter.add({
          type: "success",
          title: "Ficha duplicada",
          message:
            "Os dados da ficha original foram carregados. Revise e ajuste conforme necessário.",
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
  }, [buscarFicha]);

  // Converter quantidade para unidade base (Unidade) conforme a unidade de medida
  const converterParaUnidadeBase = useCallback(
    (quantidade: number, unidade: UnidadeMedida): number => {
      if (!unidade) {
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
    },
    [],
  );

  // Calcular valores dos insumos (memoizado) - considerando unidade de medida
  const calcularInsumo = useCallback(
    (insumo: InsumoCompleto) => {
      if (!insumo.unidade) {
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
    },
    [converterParaUnidadeBase],
  );

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

    // Custo por peça (sem quantidade de peças, usa valor total)
    const custoPorPeca = valorComDescontoTotal;
    const custoComPerda = custoPorPeca * 1.15; // +15% de perda

    return {
      valorBrutoTotal: Math.round(valorBrutoTotal * 100) / 100,
      valorComDescontoTotal: Math.round(valorComDescontoTotal * 100) / 100,
      custoPorPeca: Math.round(custoPorPeca * 100) / 100,
      custoComPerda: Math.round(custoComPerda * 100) / 100,
    };
  }, [insumos, calcularInsumo]);

  // Abrir formulário para adicionar novo insumo
  const adicionarInsumo = () => {
    const agora = new Date();
    const dataHora = `${agora.toISOString().split("T")[0]}T${agora.toTimeString().split(" ")[0]}`;
    
    setNovoInsumo({
      dataHora,
      fornecedor: "",
      fornecedorId: undefined,
      descricaoInsumo: "",
      nfAnexo: "",
      unidade: "",
      valorUnitario: 0,
      valorBruto: 0,
      desconto: 0,
      quantidade: 0,
      valorTotal: 0,
      aprovado: false,
    });
    setMostrarFormularioInsumo(true);
  };

  // Validar se novo insumo está completo
  const novoInsumoValido = useMemo(() => {
    if (!novoInsumo) return false;
    return !!(
      novoInsumo.dataHora?.trim() &&
      novoInsumo.fornecedor?.trim() &&
      novoInsumo.descricaoInsumo?.trim() &&
      novoInsumo.unidade &&
      (novoInsumo.quantidade ?? 0) > 0 &&
      (novoInsumo.valorUnitario ?? 0) > 0
    );
  }, [novoInsumo]);

  // Inserir novo insumo na lista
  const inserirNovoInsumo = () => {
    if (!novoInsumo || !novoInsumoValido) return;

    const insumoCompleto: InsumoCompleto = {
      id: `insumo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataHora: novoInsumo.dataHora || "",
      fornecedor: novoInsumo.fornecedor || "",
      fornecedorId: novoInsumo.fornecedorId,
      descricaoInsumo: novoInsumo.descricaoInsumo || "",
      nfAnexo: novoInsumo.nfAnexo || "",
      unidade: novoInsumo.unidade || "",
      valorUnitario: novoInsumo.valorUnitario || 0,
      valorBruto: novoInsumo.valorBruto || 0,
      desconto: novoInsumo.desconto || 0,
      quantidade: novoInsumo.quantidade || 0,
      valorTotal: novoInsumo.valorTotal || 0,
      aprovado: false,
    };

    setInsumos([...insumos, insumoCompleto]);
    setNovoInsumo(null);
    setMostrarFormularioInsumo(false);

    notificationCenter.add({
      type: "success",
      title: "Insumo adicionado",
      message: "O insumo foi adicionado à lista com sucesso.",
    });
  };

  // Cancelar inserção de novo insumo
  const cancelarNovoInsumo = () => {
    setNovoInsumo(null);
    setMostrarFormularioInsumo(false);
  };

  // Atualizar novo insumo
  const atualizarNovoInsumo = useCallback((campo: keyof InsumoCompleto, valor: string | number | boolean) => {
    setNovoInsumo((prev) => {
      if (!prev) return prev;
      const atualizado = { ...prev, [campo]: valor };
      
      // Recalcular valores se necessário
      if (campo === "quantidade" || campo === "valorUnitario" || campo === "desconto" || campo === "unidade") {
        const { valorBruto, valorTotal } = calcularInsumo({
          id: "temp",
          dataHora: atualizado.dataHora || "",
          fornecedor: atualizado.fornecedor || "",
          fornecedorId: atualizado.fornecedorId,
          descricaoInsumo: atualizado.descricaoInsumo || "",
          nfAnexo: atualizado.nfAnexo || "",
          unidade: (atualizado.unidade || "") as UnidadeMedida,
          valorUnitario: atualizado.valorUnitario || 0,
          valorBruto: 0,
          desconto: atualizado.desconto || 0,
          quantidade: atualizado.quantidade || 0,
          valorTotal: 0,
          aprovado: false,
        });
        return { ...atualizado, valorBruto, valorTotal };
      }
      return atualizado;
    });
  }, [calcularInsumo]);

  // Buscar fornecedor por CNPJ
  const buscarFornecedorPorCNPJ = useCallback(async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpjLimpo)) {
      return;
    }

    try {
      // Primeiro, buscar no sistema
      const response = await suppliersApi.list(orgId, { documento: cnpjLimpo });
      if (response?.itens && response.itens.length > 0) {
        const supplier = response.itens![0];
        if (!supplier) return;
        atualizarNovoInsumo("fornecedor", supplier.name);
        atualizarNovoInsumo("fornecedorId", supplier.id);
        notificationCenter.add({
          type: "success",
          title: "Fornecedor encontrado",
          message: `${supplier.name} foi selecionado.`,
        });
        return;
      }

      // Se não encontrou, buscar na SEFAZ
      const resultado = await buscarCnpj(cnpj);
      if (resultado) {
        const nomeFornecedor = resultado.nomeFantasia || resultado.razaoSocial;
        atualizarNovoInsumo("fornecedor", nomeFornecedor);
        notificationCenter.add({
          type: "info",
          title: "CNPJ encontrado na SEFAZ",
          message: `Dados encontrados: ${nomeFornecedor}. Você pode criar o fornecedor clicando no botão "+".`,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedor por CNPJ:", error);
    }
  }, [orgId, buscarCnpj, atualizarNovoInsumo]);

  // Editar insumo (abre o formulário de edição)
  const iniciarEdicaoInsumo = (insumoId: string) => {
    // Scroll para o insumo sendo editado
    const elemento = document.getElementById(`insumo-form-${insumoId}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "center" });
      // Adicionar destaque visual temporário
      elemento.classList.add("ring-2", "ring-blue-500/50");
      setTimeout(() => {
        elemento.classList.remove("ring-2", "ring-blue-500/50");
      }, 2000);
    }
    notificationCenter.add({
      type: "info",
      title: "Editar Insumo",
      message: "Edite os campos do insumo diretamente no formulário acima.",
    });
  };

  // Remover insumo
  const removerInsumo = (insumoId: string) => {
    setInsumos(insumos.filter((insumo) => insumo.id !== insumoId));
  };

  // Atualizar insumo
  const atualizarInsumo = (insumoId: string, campo: string, valor: string | number | boolean) => {
    const novosInsumos = insumos.map((insumo) => {
      if (insumo.id === insumoId) {
        const atualizado = { ...insumo, [campo]: valor };
        // Recalcular valor bruto e total
        const { valorBruto, valorTotal } = calcularInsumo(atualizado);
        return { ...atualizado, valorBruto, valorTotal };
      }
      return insumo;
    });

    setInsumos(novosInsumos);
  };

  // Aprovar insumo individualmente
  const aprovarInsumo = (insumoId: string) => {
    const agora = new Date().toISOString();
    const novosInsumos = insumos.map((insumo) => {
      if (insumo.id === insumoId) {
        return {
          ...insumo,
          aprovado: true,
          aprovadoEm: agora,
          aprovadoPor: "current-user-id", // TODO: Buscar ID do usuário atual
        };
      }
      return insumo;
    });
    setInsumos(novosInsumos);
    
    notificationCenter.add({
      type: "success",
      title: "Insumo aprovado",
      message: "O insumo foi aprovado e o financeiro foi notificado.",
    });
  };

  // Reprovar insumo individualmente
  const reprovarInsumo = (insumoId: string, motivo?: string) => {
    const novosInsumos = insumos.map((insumo) => {
      if (insumo.id === insumoId) {
        return {
          ...insumo,
          aprovado: false,
          motivoReprovacao: motivo || "Reprovado manualmente",
          aprovadoPor: undefined,
          aprovadoEm: undefined,
        };
      }
      return insumo;
    });
    setInsumos(novosInsumos);
    
    notificationCenter.add({
      type: "warning",
      title: "Insumo reprovado",
      message: "O insumo foi reprovado e o departamento responsável foi notificado.",
    });
  };

  // Abrir fornecedor em nova aba
  const abrirFornecedor = (fornecedorId?: string, fornecedorNome?: string) => {
    if (fornecedorId) {
      window.open(`/fornecedores/${fornecedorId}`, "_blank");
    } else if (fornecedorNome) {
      // Buscar fornecedor por nome e abrir
      window.open(`/fornecedores/new?nome=${encodeURIComponent(fornecedorNome)}`, "_blank");
    } else {
      window.open("/fornecedores/new", "_blank");
    }
  };

  // Validar formulário (melhorado) - retorna erros por campo
  const validarFormulario = useCallback((): {
    valido: boolean;
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    // Validações do cabeçalho - apenas campos que existem no schema
    if (!formData.referenciaPeca?.trim()) {
      erros.push("Referência da peça é obrigatória");
      camposErro.referenciaPeca = "Referência da peça é obrigatória";
    } else if (formData.referenciaPeca.length !== 5) {
      erros.push("Referência deve ter exatamente 5 caracteres");
      camposErro.referenciaPeca = "Referência deve ter exatamente 5 caracteres";
    }

    if (!formData.nomePeca?.trim()) {
      erros.push("Nome da peça é obrigatório");
      camposErro.nomePeca = "Nome da peça é obrigatório";
    }

    // Validações de insumos - OBRIGATÓRIO
    if (insumos.length === 0) {
      erros.push("Adicione pelo menos um insumo ou aviamento");
      camposErro.insumos = "Adicione pelo menos um insumo ou aviamento";
    } else {
      insumos.forEach((insumo, index) => {
        const numeroInsumo = index + 1;
        const prefixo = `insumo-${insumo.id}`;

        if (!insumo.dataHora?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Data e hora são obrigatórias`);
          camposErro[`${prefixo}-dataHora`] = "Data e hora são obrigatórias";
        }

        if (!insumo.fornecedor?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Fornecedor é obrigatório`);
          camposErro[`${prefixo}-fornecedor`] = "Fornecedor é obrigatório";
        }

        if (!insumo.descricaoInsumo?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Descrição do insumo é obrigatória`);
          camposErro[`${prefixo}-descricaoInsumo`] = "Descrição do insumo é obrigatória";
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

    // Validações do cabeçalho - apenas campos que existem no schema
    if (!formData.referenciaPeca?.trim()) {
      erros.push("Referência da peça é obrigatória");
      camposErro.referenciaPeca = "Referência da peça é obrigatória";
    } else if (formData.referenciaPeca.length !== 5) {
      erros.push("Referência deve ter exatamente 5 caracteres");
      camposErro.referenciaPeca = "Referência deve ter exatamente 5 caracteres";
    }

    if (!formData.nomePeca?.trim()) {
      erros.push("Nome da peça é obrigatório");
      camposErro.nomePeca = "Nome da peça é obrigatório";
    }

    // Validações de insumos - OBRIGATÓRIO
    if (insumos.length === 0) {
      erros.push("Adicione pelo menos um insumo ou aviamento");
      camposErro.insumos = "Adicione pelo menos um insumo ou aviamento";
    } else {
      insumos.forEach((insumo, index) => {
        const numeroInsumo = index + 1;
        const prefixo = `insumo-${insumo.id}`;

        if (!insumo.dataHora?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Data e hora são obrigatórias`);
          camposErro[`${prefixo}-dataHora`] = "Data e hora são obrigatórias";
        }

        if (!insumo.fornecedor?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Fornecedor é obrigatório`);
          camposErro[`${prefixo}-fornecedor`] = "Fornecedor é obrigatório";
        }

        if (!insumo.descricaoInsumo?.trim()) {
          erros.push(`Insumo ${numeroInsumo}: Descrição do insumo é obrigatória`);
          camposErro[`${prefixo}-descricaoInsumo`] = "Descrição do insumo é obrigatória";
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
  }, [formData.referenciaPeca, formData.nomePeca, insumos]);

  const formularioValido = validacaoCompleta.valido;

  useEffect(() => {
    setErrosValidacao(validacaoCompleta.camposErro);
  }, [validacaoCompleta.camposErro]);

  // Salvar ficha (melhorado com tratamento de erros)
  const salvarFicha = useCallback(async () => {
    // Obter orgId no momento do save (pode ter sido selecionado depois)
    const currentOrgId = getCurrentOrgId();
    if (!currentOrgId) {
      notificationCenter.add({
        type: "error",
        title: "Organização não selecionada",
        message: "Selecione uma organização antes de salvar a ficha.",
      });
      return;
    }

    const validacao = validarFormulario();
    if (!validacao.valido) {
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message:
          validacao.erros.length === 1
            ? validacao.erros[0] || ""
            : `${validacao.erros.length} erros encontrados: ${validacao.erros.slice(0, 3).join(", ")}${validacao.erros.length > 3 ? "..." : ""}`,
      });
      return;
    }

    startTransition(async () => {
      try {
        const insumosInput: CreateInsumoInput[] = insumos.map((insumo) => ({
          descricao: insumo.descricaoInsumo || `${insumo.fornecedor || "Fornecedor"} - ${insumo.unidade}`,
          tipo: "aviamento",
          fornecedorId: insumo.fornecedorId || null,
          fornecedorNome: insumo.fornecedor || null,
          notaFiscalNumero: insumo.nfAnexo || null,
          notaFiscalData: insumo.dataHora ? new Date(insumo.dataHora).toISOString() : null,
          quantidade: Number(insumo.quantidade),
          unidadeMedida: insumo.unidade,
          custoUnitario: Number(insumo.valorUnitario),
          observacoes: [
            insumo.desconto > 0 ? `Desconto: ${insumo.desconto}%` : null,
            insumo.aprovado ? `Aprovado em ${insumo.aprovadoEm}` : null,
            insumo.motivoReprovacao ? `Reprovado: ${insumo.motivoReprovacao}` : null,
          ].filter(Boolean).join(" | ") || null,
        }));

        await criar({
          referenciaPeca: formData.referenciaPeca.trim(),
          nomePeca: formData.nomePeca.trim(),
          categoria: formData.categoria || formData.colecao || null,
          departmentId: formData.departmentId || null,
          sectorId: formData.sectorId || null,
          fotoPecaUrl: formData.fotoPecaUrl?.trim() || null,
          insumos: insumosInput,
        });

        notificationCenter.add({
          type: "success",
          title: "Ficha salva com sucesso",
          message: `Ficha ${formData.referenciaPeca} foi salva e está pronta para uso.`,
        });

        // Limpar alterações não salvas
        markClean();

        // Resetar formulário
        setFormData({
          idFicha: "",
          numeroCorte: "",
          colecao: "",
          referenciaPeca: "",
          nomePeca: "",
          categoria: "",
          dataAbertura: new Date().toISOString().split("T")[0],
          dataCorte: "",
          dataLiberacaoCorte: "",
          quantidadePecas: 0,
          notaFiscal: "",
          formaPagamento: "",
          status: "em_edicao",
          departmentId: "",
          sectorId: "",
          fotoPecaUrl: "",
          observacoesGerais: "",
        });
        setInsumos([]);
        // Incrementar número da ficha
        setNumeroFicha((prev) => (prev ? prev + 1 : 1));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido ao salvar ficha de custo";

        console.error("Erro ao salvar ficha:", error);

        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar ficha",
          message: errorMessage,
        });
      }
    });
  }, [formData, insumos, validarFormulario, criar]);

  // Função para cancelar e voltar para lista
  const handleCancelar = () => {
    router.push("/fichas-custo/list");
  };

  // Estado para upload de foto
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estado para upload de documentos por insumo
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  // Auto-save usando hook padronizado
  const { status: autoSaveStatus, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
    onSave: async () => {
      if (!formularioValido) return;
      await salvarFicha();
    },
    intervalMs: 30000, // 30 segundos
    requireValid: true,
    isValid: () => formularioValido,
    onAutoSaveComplete: () => {
      // Auto-save concluído
    },
  });

  // Marcar dirty quando formData ou insumos mudam
  useEffect(() => {
    if (formData.referenciaPeca || formData.nomePeca || insumos.length > 0) {
      markDirty();
    }
  }, [formData, insumos, markDirty]);

  // Atalhos de teclado
  const handleSaveShortcut = useCallback(() => {
    if (formularioValido) {
      void salvarFicha();
    }
  }, [formularioValido, salvarFicha]);

  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      action: handleSaveShortcut,
      description: "Salvar ficha",
      preventDefault: true,
    },
  ]);

  const handleOnSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      await salvarFicha();
    },
    [salvarFicha],
  );

  // Mostrar loader durante carregamento inicial
  if (isInitialLoading) {
    return <PageLoader message="Carregando dados da ficha..." />;
  }

  return (
    <StandardFormPage
      title="Nova Ficha de Custo de Aviamento"
      subtitle="Sistema Avançado de Gestão e Controle de Custos"
      icon={<FileText className="h-8 w-8" />}
      onSave={handleOnSubmit}
      backUrl="/fichas-custo/list"
      isValid={formularioValido}
      autoSaveStatus={autoSaveStatus}
      hasUnsavedChanges={hasUnsavedChanges}
      loading={pending || isInitialLoading}
      headerActions={
        <div className="flex flex-col items-end gap-2 min-w-[140px]">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Número da Ficha
                </span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent drop-shadow-lg">
                  {numeroFicha ?? "..."}
                </span>
            {numeroFicha && (
              <div className="w-1 h-8 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full opacity-60" />
                )}
              </div>
          </div>
      }
      showSaveButton={false}
    >

      {/* Formulário Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl"
      >
        {/* Tech corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
        {/* CABEÇALHO - Campos Principais - Layout Melhorado */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
            Dados da Ficha
          </h2>

          <div className=" space-y-4">
            {/* Foto da Peça */}
            <div className="flex gap-4">
              <div className="">
                <label
                  htmlFor="foto-peca-input"
                  className="block text-sm font-semibold text-white/90 mb-2"
                >
                  Foto da Peça
                </label>
                <div className="">
                  <div className="w-full aspect-square max-w-[200px] rounded-lg border-2 border-blue-500/30 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    {formData.fotoPecaUrl ? (
                      <div className="relative w-full h-full group/photo">
                        { }
                        <Image
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

                            const validTypes = [
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                              "image/webp",
                            ];
                            if (!validTypes.includes(file.type)) {
                              notificationCenter.add({
                                type: "error",
                                title: "Erro",
                                message: "Formato não suportado. Use JPEG, PNG ou WebP",
                              });
                              return;
                            }

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

                              const currentOrgId = getCurrentOrgId();
                              if (!currentOrgId) {
                                notificationCenter.add({
                                  type: "error",
                                  title: "Erro",
                                  message:
                                    "Organização não selecionada. Selecione uma organização antes de fazer upload.",
                                });
                                return;
                              }
                              const response = await fetch(
                                `/api/organizations/${currentOrgId}/fichas-custo/upload`,
                                {
                                  method: "POST",
                                  headers: {
                                    "x-upload-type": "foto",
                                  },
                                  body: uploadFormData,
                                },
                              );

                              if (!response.ok) {
                                const error = await response
                                  .json()
                                  .catch(() => ({ message: "Erro ao fazer upload" }));
                                throw new Error(error.message || "Erro ao fazer upload da foto");
                              }

                              const data = await response.json();
                              setFormData((prev) => ({ ...prev, fotoPecaUrl: data.url }));

                              // Feedback visual de sucesso
                              notificationCenter.add({
                                type: "success",
                                title: "Foto carregada com sucesso",
                                message: `Imagem "${file.name}" foi anexada com sucesso.`,
                              });
                            } catch (error) {
                              notificationCenter.add({
                                type: "error",
                                title: "Erro",
                                message:
                                  error instanceof Error
                                    ? error.message
                                    : "Erro ao fazer upload da foto",
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
              <div className="flex flex-col gap-4 flex-1">
                {/* Primeira linha: Coleção, Status, Referência */}
                <div className="grid grid-cols-3 gap-4">
                  <FuturisticSelect
                    label="Coleção"
                    required
                    value={formData.colecao}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, colecao: e.target.value as Colecao }))
                    }
                    error={!!errosValidacao.colecao}
                    errorMessage={errosValidacao.colecao}
                  >
                    <option value="" className="bg-[#1a1f3a]">
                      Selecione...
                    </option>
                    <option value="verao" className="bg-[#1a1f3a]">
                      Verão
                    </option>
                    <option value="inverno" className="bg-[#1a1f3a]">
                      Inverno
                    </option>
                  </FuturisticSelect>
                  <FuturisticSelect
                    label="Status"
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value as StatusFichaCustoCompleto }))
                    }
                  >
                    <option value="em_edicao" className="bg-[#1a1f3a]">
                      Em edição
                    </option>
                    <option value="concluido" className="bg-[#1a1f3a]">
                      Concluído
                    </option>
                    <option value="aguardando_insumos" className="bg-[#1a1f3a]">
                      Aguardando insumos
                    </option>
                    <option value="aprovado" className="bg-[#1a1f3a]">
                      Aprovado
                    </option>
                    <option value="reprovado" className="bg-[#1a1f3a]">
                      Reprovado
                    </option>
                  </FuturisticSelect>
                  <FuturisticInput
                    label="Referência da Peça"
                    required
                    value={formData.referenciaPeca}
                    onChange={(e) => {
                      const valor = e.target.value.slice(0, 5);
                      setFormData((prev) => ({ ...prev, referenciaPeca: valor }));
                    }}
                    placeholder="5 caracteres"
                    maxLength={5}
                    error={!!errosValidacao.referenciaPeca}
                    errorMessage={errosValidacao.referenciaPeca}
                  />
                </div>
                {/* Segunda linha: Número do Corte, Data Liberação, Data Corte */}
                <div className="grid grid-cols-3 gap-4">
                  <FuturisticInput
                    label="Número do Corte"
                    value={formData.numeroCorte}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numeroCorte: e.target.value }))
                    }
                    placeholder="Ex: CUT-001"
                  />
                  <FuturisticInput
                    label="Data da Liberação do Corte"
                    type="date"
                    value={formData.dataLiberacaoCorte}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dataLiberacaoCorte: e.target.value }))
                    }
                  />
                  <FuturisticInput
                    label="Data do Corte"
                    type="date"
                    value={formData.dataCorte}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dataCorte: e.target.value }))
                    }
                  />
                </div>
                {/* Terceira linha: Descrição da Peça */}
                <div>
                  <FuturisticInput
                    label="Descrição da Peça"
                    required
                    value={formData.nomePeca}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nomePeca: e.target.value }))
                    }
                    placeholder="Digite a descrição da peça"
                    error={!!errosValidacao.nomePeca}
                    errorMessage={errosValidacao.nomePeca}
                  />
                </div>
              </div>
            </div>

            {/* Quarta linha: Quantidade, Nota Fiscal, Forma de Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FuturisticInput
                label="Quantidade de Corte"
                required
                type="number"
                min="0"
                value={formData.quantidadePecas}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantidadePecas: Number(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
              <FuturisticSelect
                label="Nota Fiscal"
                required
                value={formData.notaFiscal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notaFiscal: e.target.value as NotaFiscal }))
                }
                error={!!errosValidacao.notaFiscal}
                errorMessage={errosValidacao.notaFiscal}
              >
                <option value="" className="bg-[#1a1f3a]">
                  Selecione...
                </option>
                <option value="sim" className="bg-[#1a1f3a]">
                  Sim
                </option>
                <option value="nao" className="bg-[#1a1f3a]">
                  Não
                </option>
              </FuturisticSelect>
              <FuturisticSelect
                label="Forma de Pagamento"
                required
                value={formData.formaPagamento}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, formaPagamento: e.target.value as FormaPagamento }))
                }
                error={!!errosValidacao.formaPagamento}
                errorMessage={errosValidacao.formaPagamento}
              >
                <option value="" className="bg-[#1a1f3a]">
                  Selecione...
                </option>
                <option value="a_vista" className="bg-[#1a1f3a]">
                  À vista
                </option>
                <option value="boleto" className="bg-[#1a1f3a]">
                  Boleto
                </option>
              </FuturisticSelect>
            </div>
          </div>
        </div>

        {/* SEPARAÇÃO VISUAL */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* INSUMOS E AVIAMENTOS */}
        <div className="mb-8 relative">
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--accent)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--accent)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--accent)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--accent)/0.6)]" />

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white/90 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-[hsl(var(--accent))]" />
                Insumos e Aviamentos
              </h2>
              {!mostrarFormularioInsumo && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                    onClick={adicionarInsumo}
                    type="button"
                    aria-label="Adicionar novo insumo ou aviamento"
                  >
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Adicionar Insumo
                  </Button>
                </motion.div>
              )}
            </div>

          {/* FORMULÁRIO DE NOVO INSUMO */}
          {mostrarFormularioInsumo && novoInsumo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 rounded-xl border border-white/10 bg-white/[0.08] backdrop-blur-sm shadow-lg relative"
              role="form"
              aria-labelledby="novo-insumo-title"
            >
              {/* Tech corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/60" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/60" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/60" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/60" />
              <div className="flex items-center justify-between mb-4">
                <h3 id="novo-insumo-title" className="text-lg font-bold text-white/90 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  Novo Insumo
                </h3>
                <button
                  type="button"
                  onClick={cancelarNovoInsumo}
                  className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  aria-label="Cancelar adição de insumo"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Primeira linha: Data/Hora, Fornecedor, Descrição */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FuturisticInput
                    label="Data"
                    required
                    type="date"
                    value={novoInsumo.dataHora ? novoInsumo.dataHora.slice(0, 10) : ""}
                    readOnly
                    className="opacity-75 cursor-not-allowed"
                  />
                  <div className="group relative">
                    <label htmlFor="fornecedor-novo-insumo" className="block text-sm font-semibold text-white/90 mb-2">
                      Fornecedor <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                        <div className="relative flex items-center">
                          <Search className="absolute left-4 h-4 w-4 text-white/60 z-10" />
                          <input
                            id="fornecedor-novo-insumo"
                            type="text"
                            value={novoInsumo.fornecedor || ""}
                            onChange={(e) => {
                              const valor = e.target.value;
                              // Se parece CNPJ (14 dígitos), formatar
                              const docLimpo = valor.replace(/[^\d]/g, "");
                              let formatado = valor;
                              if (docLimpo.length <= 14 && docLimpo.length > 0) {
                                formatado = formatarCNPJ(docLimpo);
                              }
                              atualizarNovoInsumo("fornecedor", formatado);
                            }}
                            onBlur={(e) => {
                              const docLimpo = e.target.value.replace(/[^\d]/g, "");
                              if (docLimpo.length === 14) {
                                void buscarFornecedorPorCNPJ(docLimpo);
                              }
                            }}
                            placeholder="Nome do fornecedor ou CNPJ (00.000.000/0000-00)"
                            className={`relative w-full pl-10 pr-4 py-3 rounded-lg border ${!novoInsumo.fornecedor && novoInsumoValido === false ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                            maxLength={18}
                            aria-invalid={!novoInsumo.fornecedor && novoInsumoValido === false}
                          />
                          {buscandoCNPJ && (
                            <div className="absolute right-4 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                          )}
                          {novoInsumo.fornecedor && !buscandoCNPJ && (novoInsumo.fornecedor.replace(/[^\d]/g, "").length === 14) && (
                            <button
                              type="button"
                              onClick={() => {
                                const docLimpo = novoInsumo.fornecedor?.replace(/[^\d]/g, "") || "";
                                if (docLimpo.length === 14) {
                                  void buscarFornecedorPorCNPJ(docLimpo);
                                }
                              }}
                              className="absolute right-4 text-blue-400 hover:text-blue-300"
                              title="Buscar dados do CNPJ"
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const fornecedorNome = novoInsumo.fornecedor || "";
                          const fornecedorDoc = fornecedorNome.replace(/[^\d]/g, "").length === 14 ? fornecedorNome : "";
                          const url = `/fornecedores/new${fornecedorNome ? `?nome=${encodeURIComponent(fornecedorNome)}${fornecedorDoc ? `&documento=${encodeURIComponent(fornecedorDoc)}` : ""}` : ""}`;
                          window.open(url, "_blank");
                        }}
                        className="px-3 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm transition-all flex items-center justify-center"
                        type="button"
                        title="Como cadastrar um novo fornecedor"
                        aria-label="Cadastrar novo fornecedor"
                      >
                        <Plus className="h-5 w-5" />
                      </motion.button>
                    </div>
                    {!novoInsumo.fornecedor && novoInsumoValido === false && (
                      <p className="mt-1 text-sm text-red-400">Fornecedor é obrigatório</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FuturisticInput
                          label="Descrição do Insumo"
                          required
                          value={novoInsumo.descricaoInsumo || ""}
                          onChange={(e) => atualizarNovoInsumo("descricaoInsumo", e.target.value)}
                          placeholder="Digite a descrição do insumo"
                          aria-required="true"
                          aria-invalid={!novoInsumo.descricaoInsumo}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          window.open("/insumos/new", "_blank");
                        }}
                        className="px-3 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 transition-all flex items-center justify-center"
                        type="button"
                        title="Como cadastrar um novo insumo"
                        aria-label="Cadastrar novo insumo"
                      >
                        <Plus className="h-5 w-5" aria-hidden="true" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Segunda linha: Unidade, Anexar NF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FuturisticSelect
                    label="Unidade"
                    required
                    value={novoInsumo.unidade || ""}
                    onChange={(e) => atualizarNovoInsumo("unidade", e.target.value as UnidadeMedida)}
                    aria-required="true"
                    aria-invalid={!novoInsumo.unidade}
                  >
                    <option value="" className="bg-[#1a1f3a]">
                      Selecione a unidade...
                    </option>
                    <option value="Unidade" className="bg-[#1a1f3a]">
                      Unidade
                    </option>
                    <option value="Grosa" className="bg-[#1a1f3a]">
                      Grosa
                    </option>
                    <option value="Jarda" className="bg-[#1a1f3a]">
                      Jarda
                    </option>
                    <option value="Milheiro" className="bg-[#1a1f3a]">
                      Milheiro
                    </option>
                    <option value="Metros" className="bg-[#1a1f3a]">
                      Metros
                    </option>
                  </FuturisticSelect>
                  <div className="group">
                    <label
                      htmlFor="nf-novo-insumo"
                      className="block text-sm font-semibold text-white/90 mb-2"
                    >
                      Anexar NF-e / Cupom
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-none h-[48px]">
                        {novoInsumo.nfAnexo ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                            <span className="text-sm text-white/70 flex-1 truncate" title={novoInsumo.nfAnexo}>
                              {novoInsumo.nfAnexo.split("/").pop() || "Documento anexado"}
                            </span>
                            <button
                              type="button"
                              onClick={() => atualizarNovoInsumo("nfAnexo", "")}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label="Remover documento"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="nf-novo-insumo" className="flex items-center gap-2 flex-1 cursor-pointer">
                            <input
                              id="nf-novo-insumo"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) {
                                  e.target.value = "";
                                  return;
                                }

                                // Validar tipo de arquivo
                                const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
                                const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
                                const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
                                
                                if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Formato inválido",
                                    message: "Apenas arquivos PDF, JPG ou PNG são permitidos",
                                  });
                                  e.target.value = "";
                                  return;
                                }

                                // Validar tamanho (10MB)
                                const maxSize = 10 * 1024 * 1024;
                                if (file.size > maxSize) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Arquivo muito grande",
                                    message: `Tamanho máximo: 10MB. Arquivo selecionado: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
                                  });
                                  e.target.value = "";
                                  return;
                                }

                                setUploadingDocs((prev) => ({ ...prev, "novo-insumo": true }));
                                
                                const currentOrgId = getCurrentOrgId();
                                if (!currentOrgId) {
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro",
                                    message: "Organização não selecionada. Recarregue a página.",
                                  });
                                  setUploadingDocs((prev) => ({ ...prev, "novo-insumo": false }));
                                  e.target.value = "";
                                  return;
                                }

                                try {
                                  const uploadFormData = new FormData();
                                  uploadFormData.append("file", file);

                                  const response = await fetch(
                                    `/api/organizations/${currentOrgId}/fichas-custo/upload`,
                                    {
                                      method: "POST",
                                      headers: { "x-upload-type": "documento" },
                                      body: uploadFormData,
                                    },
                                  );

                                  if (!response.ok) {
                                    let errorMessage = "Erro ao fazer upload";
                                    try {
                                      const errorData = await response.json();
                                      errorMessage = errorData.message || errorData.error || errorMessage;
                                    } catch {
                                      // Se não conseguir parsear JSON, usar status
                                      errorMessage = `Erro ${response.status}: ${response.statusText}`;
                                    }
                                    throw new Error(errorMessage);
                                  }

                                  const data = await response.json();
                                  
                                  if (!data || !data.url) {
                                    throw new Error("Resposta inválida do servidor: URL não encontrada");
                                  }

                                  atualizarNovoInsumo("nfAnexo", data.url);

                                  notificationCenter.add({
                                    type: "success",
                                    title: "Documento anexado",
                                    message: `"${file.name}" foi anexado com sucesso.`,
                                  });
                                } catch (error) {
                                  console.error("Erro no upload:", error);
                                  notificationCenter.add({
                                    type: "error",
                                    title: "Erro ao anexar",
                                    message: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload",
                                  });
                                } finally {
                                  setUploadingDocs((prev) => ({ ...prev, "novo-insumo": false }));
                                  // Resetar input para permitir anexar o mesmo arquivo novamente
                                  e.target.value = "";
                                }
                              }}
                              aria-label="Anexar nota fiscal ou cupom"
                            />
                            <span className="text-sm text-white/60 flex-1">
                              {uploadingDocs["novo-insumo"] ? "Carregando..." : "Clique para anexar"}
                            </span>
                            {uploadingDocs["novo-insumo"] ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/60 inline-block" title="Carregando documento" />
                            ) : (
                              <Upload className="h-4 w-4 text-white/60" aria-hidden="true" />
                            )}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terceira linha: Quantidade, Valor Unitário, Valor Bruto, Desconto */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FuturisticInput
                    label="Quantidade"
                    required
                    type="text"
                    inputMode="decimal"
                    value={novoInsumo.quantidade && novoInsumo.quantidade > 0 ? novoInsumo.quantidade.toString().replace(".", ",") : ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove tudo exceto números e vírgula/ponto
                      value = value.replace(/[^\d,.]/g, "");
                      // Garante apenas uma vírgula ou ponto
                      const parts = value.split(/[,.]/);
                      if (parts.length > 2) {
                        value = parts[0] + "," + parts.slice(1).join("");
                      }
                      // Converte para número
                      const numValue = parseFloat(value.replace(",", ".")) || 0;
                      atualizarNovoInsumo("quantidade", numValue);
                    }}
                    placeholder="0,0000"
                    aria-required="true"
                    aria-invalid={!novoInsumo.quantidade || novoInsumo.quantidade <= 0}
                  />
                  <div className="group relative">
                    <label htmlFor="valor-unitario-novo" className="block text-sm font-semibold text-white/90 mb-2">
                      Valor Unitário <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-white/60" aria-hidden="true">R$</span>
                        <input
                          id="valor-unitario-novo"
                          type="text"
                          inputMode="decimal"
                          value={
                            novoInsumo.valorUnitario && novoInsumo.valorUnitario > 0
                              ? novoInsumo.valorUnitario.toFixed(2).replace(".", ",")
                              : ""
                          }
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove tudo exceto números e vírgula
                            value = value.replace(/[^\d,]/g, "");
                            // Garante apenas uma vírgula
                            const parts = value.split(",");
                            if (parts.length > 2) {
                              value = parts[0] + "," + parts.slice(1).join("");
                            }
                            // Limita a 2 casas decimais após a vírgula
                            if (parts.length === 2 && (parts[1]?.length ?? 0) > 2) {
                              value = parts[0] + "," + parts[1]!.substring(0, 2);
                            }
                            // Converte para número (substitui vírgula por ponto)
                            const numValue = parseFloat(value.replace(",", ".")) || 0;
                            atualizarNovoInsumo("valorUnitario", numValue);
                          }}
                          placeholder="0,00"
                          className="relative w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                          aria-required="true"
                          aria-invalid={!novoInsumo.valorUnitario || novoInsumo.valorUnitario <= 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="group">
                    <label htmlFor="valor-bruto-novo" className="block text-sm font-semibold text-white/90 mb-2">
                      Valor Bruto
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 to-blue-400/20 rounded-lg blur-sm" />
                      <output
                        id="valor-bruto-novo"
                        className="relative px-4 py-3 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm block"
                        aria-live="polite"
                      >
                        <span className="text-lg font-bold text-blue-400">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(novoInsumo.valorBruto || 0)}
                        </span>
                      </output>
                    </div>
                  </div>
                  <div className="group relative">
                    <label htmlFor="desconto-novo" className="block text-sm font-semibold text-white/90 mb-2">
                      Desconto %
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                      <div className="relative flex items-center">
                        <input
                          id="desconto-novo"
                          type="text"
                          inputMode="decimal"
                          value={
                            novoInsumo.desconto && novoInsumo.desconto > 0
                              ? novoInsumo.desconto.toFixed(2).replace(".", ",")
                              : ""
                          }
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove tudo exceto números e vírgula
                            value = value.replace(/[^\d,]/g, "");
                            // Garante apenas uma vírgula
                            const parts = value.split(",");
                            if (parts.length > 2) {
                              value = parts[0] + "," + parts.slice(1).join("");
                            }
                            // Limita a 2 casas decimais após a vírgula
                            if (parts.length === 2 && (parts[1]?.length ?? 0) > 2) {
                              value = parts[0] + "," + parts[1]!.substring(0, 2);
                            }
                            // Converte e limita entre 0 e 100
                            const numValue = Math.min(100, Math.max(0, parseFloat(value.replace(",", ".")) || 0));
                            atualizarNovoInsumo("desconto", numValue);
                          }}
                          placeholder="0,00"
                          className="relative w-full px-4 pr-8 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                          aria-label="Desconto em percentual"
                        />
                        <span className="absolute right-4 text-white/60" aria-hidden="true">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarta linha: Valor Total e Botões */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label htmlFor="valor-total-novo" className="block text-sm font-semibold text-white/90 mb-2">
                      Valor Total
                    </label>
                    <div className="relative">
                      <div className="absolute -inset-px bg-linear-to-r from-green-500/20 to-green-400/20 rounded-lg blur-sm" />
                      <output
                        id="valor-total-novo"
                        className="relative px-4 py-3 rounded-lg border border-green-500/30 bg-green-500/10 backdrop-blur-sm block"
                        aria-live="polite"
                      >
                        <span className="text-lg font-bold text-green-400">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(novoInsumo.valorTotal || 0)}
                        </span>
                      </output>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <motion.button
                      whileHover={{ scale: novoInsumoValido ? 1.02 : 1 }}
                      whileTap={{ scale: novoInsumoValido ? 0.98 : 1 }}
                      onClick={cancelarNovoInsumo}
                      className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                      type="button"
                      aria-label="Cancelar adição de insumo"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: novoInsumoValido ? 1.02 : 1 }}
                      whileTap={{ scale: novoInsumoValido ? 0.98 : 1 }}
                      onClick={inserirNovoInsumo}
                      disabled={!novoInsumoValido}
                      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 ${
                        novoInsumoValido
                          ? "bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400 cursor-pointer focus:ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                          : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed opacity-50"
                      }`}
                      type="button"
                      aria-label={novoInsumoValido ? "Inserir insumo na lista" : "Preencha todos os campos obrigatórios para inserir"}
                      aria-disabled={!novoInsumoValido}
                    >
                      <CheckCheck className="h-4 w-4 inline mr-2" aria-hidden="true" />
                      Inserir
                    </motion.button>
                  </div>
                </div>

                {/* Mensagem de validação */}
                {!novoInsumoValido && (
                  <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30" role="alert" aria-live="polite">
                    <p className="text-sm text-yellow-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      Preencha todos os campos obrigatórios para inserir o insumo
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* LISTA DE INSUMOS INSERIDOS */}
          {insumos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden="true" />
                Insumos Inseridos ({insumos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insumos.map((insumo) => (
                  <motion.div
                    key={insumo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:border-white/20 transition-all relative"
                >
                  {/* Tech corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white/90 mb-1">
                        {insumo.descricaoInsumo || "Sem descrição"}
                      </h3>
                      <p className="text-sm text-white/60">{insumo.fornecedor || "Sem fornecedor"}</p>
                    </div>
                    {insumo.aprovado ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 border border-green-500/30">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400">Aprovado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">Pendente</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Quantidade:</span>
                      <span className="text-white/90 font-medium">
                        {insumo.quantidade} {insumo.unidade}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Valor Unitário:</span>
                      <span className="text-white/90 font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(insumo.valorUnitario)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Valor Total:</span>
                      <span className="text-green-400 font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(insumo.valorTotal)}
                      </span>
                    </div>
                    {insumo.aprovadoEm && (
                      <div className="text-xs text-white/50 pt-2 border-t border-white/10">
                        Aprovado em: {new Date(insumo.aprovadoEm).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    {!insumo.aprovado && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => aprovarInsumo(insumo.id)}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-sm font-medium transition-all flex items-center justify-center gap-1"
                        type="button"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Aprovar
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => iniciarEdicaoInsumo(insumo.id)}
                      className="px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-all"
                      type="button"
                      title="Editar insumo"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removerInsumo(insumo.id)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all"
                      type="button"
                      title="Excluir insumo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                    {insumo.fornecedor && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => abrirFornecedor(insumo.fornecedorId, insumo.fornecedor)}
                        className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 transition-all"
                        type="button"
                        title="Abrir fornecedor"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando não há insumos */}
          {insumos.length === 0 && !mostrarFormularioInsumo && (
            <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm relative">
              {/* Tech corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />
              <Package className="h-16 w-16 mx-auto text-white/20 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-white/70 mb-2">
                Nenhum insumo adicionado
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Clique no botão &quot;Adicionar Insumo&quot; acima para começar a cadastrar os insumos desta ficha de custo.
              </p>
              {errosValidacao.insumos && (
                <p className="text-red-400 text-sm font-semibold mt-2" role="alert">
                  {errosValidacao.insumos}
                </p>
              )}
            </div>
          )}
          </div>
        </div>

        {/* SEPARAÇÃO VISUAL */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* CÁLCULOS */}
        <div className="mb-8 relative">
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-[hsl(var(--primary))]" />
              Cálculos
            </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="group">
              <label
                htmlFor="valor-bruto-total"
                className="block text-sm font-semibold text-white/90 mb-2"
              >
                Valor Bruto Total
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 to-blue-400/20 rounded-lg blur-sm" />
                <div
                  id="valor-bruto-total"
                  className="relative px-4 py-4 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm"
                >
                  <span className="text-2xl font-bold text-blue-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      totaisCalculados.valorBrutoTotal,
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="group">
              <label
                htmlFor="valor-desconto-total"
                className="block text-sm font-semibold text-white/90 mb-2"
              >
                Valor com Desconto Total
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-purple-500/20 to-purple-400/20 rounded-lg blur-sm" />
                <div
                  id="valor-desconto-total"
                  className="relative px-4 py-4 rounded-lg border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm"
                >
                  <span className="text-2xl font-bold text-purple-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      totaisCalculados.valorComDescontoTotal,
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="group">
              <label
                htmlFor="custo-peca-perda"
                className="block text-sm font-semibold text-white/90 mb-2"
              >
                Custo por Peça + 15% de Perda
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-green-500/20 to-green-400/20 rounded-lg blur-sm" />
                <div
                  id="custo-peca-perda"
                  className="relative px-4 py-4 rounded-lg border border-green-500/30 bg-green-500/10 backdrop-blur-sm"
                >
                  <span className="text-2xl font-bold text-green-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      totaisCalculados.custoComPerda,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* SEPARAÇÃO VISUAL */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* OBSERVAÇÕES GERAIS */}
        <div className="mb-8 relative">
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
              Observações Gerais
            </h2>
          <FuturisticTextarea
            label="Observações"
            value={formData.observacoesGerais}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, observacoesGerais: e.target.value }))
            }
            placeholder="Digite observações gerais sobre a ficha de custo..."
            rows={6}
          />
          </div>
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
                    nomePeca: "",
                    categoria: "",
                    dataAbertura: new Date().toISOString().split("T")[0],
                    dataCorte: "",
                    dataLiberacaoCorte: "",
                    quantidadePecas: 0,
                    notaFiscal: "",
                    formaPagamento: "",
                    status: "em_edicao",
                    departmentId: "",
                    sectorId: "",
                    fotoPecaUrl: "",
                    observacoesGerais: "",
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
              {documentoVisualizacao.url.endsWith(".pdf") ? (
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
    </StandardFormPage>
  );
}
