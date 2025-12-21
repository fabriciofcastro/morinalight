"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, FormField, FormSelect, FormTextarea, Input, Wizard, type Step } from "@morina/ui";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { buscarCnpj } from "@/lib/integrations/cnpj";
import { buscarEnderecoPorCep } from "@/lib/integrations/viacep";
import { Loader2, History } from "lucide-react";
import { useDraftHistory } from "@/hooks/use-draft-history";
import { DraftHistoryModal } from "./draft-history-modal";
import { useSmartSuggestions, type SmartSuggestion } from "@/hooks/use-smart-suggestions";
import { SmartSuggestionsPanel } from "./smart-suggestions-panel";
import { TagsInput, type Tag } from "./tags-input";
import { useClienteTags } from "@/hooks/use-cliente-tags";
import { validateRG, formatRG, getRGFormatDescription, type EstadoUF } from "@/lib/validators/rg";
import { validateIE, formatIE, getIEFormatDescription } from "@/lib/validators/inscricao-estadual";
import { formatCPF, formatCNPJ } from "@/lib/validators/brazilian";
import { formatPhone, formatCEP } from "@/lib/validators/brazilian";

type ClienteFormData = {
  nome: string;
  nomeSocial: string;
  razaoSocial: string;
  nomeFantasia: string;
  tipo: "fisica" | "juridica";
  documento: string;
  documentoValidade: string;
  situacaoCadastral: string;
  fotoUrl: string;
  rg: string;
  orgaoEmissor: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidadeCidade: string;
  naturalidadeEstado: string;
  tituloEleitor: string;
  certidaoNascimento: string;
  certidaoCasamento: string;
  nomeMae: string;
  nomePai: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  celular: string;
  website: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  tags?: Tag[];
};

interface ClienteFormWizardProps {
  initialData?: Partial<ClienteFormData>;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  clienteId?: string;
}

// Funções utilitárias
const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
};

const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const formatCEP = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
};

const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === parseInt(cleaned.charAt(10));
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

export function ClienteFormWizard({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  clienteId,
}: ClienteFormWizardProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: initialData?.nome || "",
    nomeSocial: initialData?.nomeSocial || "",
    razaoSocial: initialData?.razaoSocial || "",
    nomeFantasia: initialData?.nomeFantasia || "",
    tipo: initialData?.tipo || "fisica",
    documento: initialData?.documento || "",
    documentoValidade: initialData?.documentoValidade || "",
    situacaoCadastral: initialData?.situacaoCadastral || "",
    fotoUrl: initialData?.fotoUrl || "",
    rg: initialData?.rg || "",
    orgaoEmissor: initialData?.orgaoEmissor || "",
    dataNascimento: initialData?.dataNascimento || "",
    sexo: initialData?.sexo || "",
    estadoCivil: initialData?.estadoCivil || "",
    nacionalidade: initialData?.nacionalidade || "",
    naturalidadeCidade: initialData?.naturalidadeCidade || "",
    naturalidadeEstado: initialData?.naturalidadeEstado || "",
    tituloEleitor: initialData?.tituloEleitor || "",
    certidaoNascimento: initialData?.certidaoNascimento || "",
    certidaoCasamento: initialData?.certidaoCasamento || "",
    nomeMae: initialData?.nomeMae || "",
    nomePai: initialData?.nomePai || "",
    inscricaoEstadual: initialData?.inscricaoEstadual || "",
    inscricaoMunicipal: initialData?.inscricaoMunicipal || "",
    email: initialData?.email || "",
    emailSecundario: initialData?.emailSecundario || "",
    emailCorporativo: initialData?.emailCorporativo || "",
    telefone: initialData?.telefone || "",
    telefoneComercial: initialData?.telefoneComercial || "",
    celular: initialData?.celular || "",
    whatsapp: initialData?.whatsapp || "",
    telegram: initialData?.telegram || "",
    website: initialData?.website || "",
    linkedin: initialData?.linkedin || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    twitter: initialData?.twitter || "",
    youtube: initialData?.youtube || "",
    blog: initialData?.blog || "",
    endereco: initialData?.endereco || "",
    pontoReferencia: initialData?.pontoReferencia || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    codigoIBGE: initialData?.codigoIBGE || "",
    codigoMunicipio: initialData?.codigoMunicipio || "",
    regiao: initialData?.regiao || "",
    zona: initialData?.zona || "",
    horarioPreferencialContato: initialData?.horarioPreferencialContato || "",
    idiomaPreferido: initialData?.idiomaPreferido || "",
    formaPreferidaComunicacao: initialData?.formaPreferidaComunicacao || "",
    numero: initialData?.numero || "",
    complemento: initialData?.complemento || "",
    bairro: initialData?.bairro || "",
    cidade: initialData?.cidade || "",
    estado: initialData?.estado || "",
    cep: initialData?.cep || "",
    observacoes: initialData?.observacoes || "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDraftHistory, setShowDraftHistory] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.tags || []);

  // Hook para gerenciar tags
  const { availableTags, loading: loadingTags, createTag, loadClienteTags } = useClienteTags();

  // Carregar tags do cliente se estiver editando
  useEffect(() => {
    if (isEditing && clienteId) {
      loadClienteTags(clienteId).then((tags) => {
        setSelectedTags(tags);
      });
    }
  }, [isEditing, clienteId, loadClienteTags]);

  // Histórico de rascunhos
  const {
    currentData: draftData,
    setCurrentData: setDraftData,
    versions,
    currentVersionId,
    isSaving,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearHistory,
  } = useDraftHistory<ClienteFormData>(formData, {
    storageKey: `cliente-draft-${isEditing ? "edit" : "new"}`,
    maxVersions: 10,
    autoSaveInterval: 30000,
    onVersionChange: (version) => {
      setFormData(version.data);
    },
  });

  // Sincronizar formData com draftData
  useEffect(() => {
    setDraftData(formData);
  }, [formData, setDraftData]);

  // Carregar último rascunho ao montar (se não estiver editando)
  useEffect(() => {
    if (isEditing || initialData) return;

    if (versions.length > 0) {
      const latestVersion = versions[0];
      const savedAt = latestVersion.savedAt;
      const now = new Date();
      const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        const shouldRestore = confirm(
          `Encontramos um rascunho salvo em ${savedAt.toLocaleString("pt-BR")}. Deseja restaurar?`
        );
        if (shouldRestore) {
          restoreVersion(latestVersion.id);
          notificationCenter.add({
            type: "success",
            title: "Rascunho restaurado",
            message: "Seus dados foram restaurados com sucesso",
          });
        }
      }
    }
  }, []); // Apenas ao montar

  // Limpar rascunho após salvar com sucesso
  const clearDraft = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  // Sugestões inteligentes
  const { suggestions, isLoading: isLoadingSuggestions, applySuggestion } =
    useSmartSuggestions(formData, {
      enabled: !isEditing,
      minConfidence: 0.3,
    });

  // Filtrar sugestões descartadas
  const activeSuggestions = suggestions.filter(
    (s) => !dismissedSuggestions.has(`${s.field}-${s.value}`)
  );

  const handleApplySuggestion = useCallback((suggestion: SmartSuggestion) => {
    const value = applySuggestion(suggestion);
    setFormData((prev) => ({
      ...prev,
      [suggestion.field]: value,
    }));
    setDismissedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${suggestion.field}-${suggestion.value}`);
      return newSet;
    });
  }, [applySuggestion]);

  const handleDismissSuggestion = useCallback((suggestion: SmartSuggestion) => {
    setDismissedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${suggestion.field}-${suggestion.value}`);
      return newSet;
    });
  }, []);

  const steps: Step[] = [
    {
      id: "dados-basicos",
      label: "Dados Básicos",
      description: "Identificação principal",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "contato",
      label: "Contato",
      description: "Informações de contato",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: "endereco",
      label: "Endereço",
      description: "Localização",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: "dados-pessoais",
      label: "Dados Pessoais",
      description: "Informações adicionais (PF)",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "observacoes",
      label: "Observações",
      description: "Informações adicionais",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "tags",
      label: "Tags",
      description: "Categorização",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      id: "preview",
      label: "Revisão",
      description: "Confirme os dados",
      icon: <Eye className="h-5 w-5" />,
    },
  ];

  // Validação por etapa
  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      const errors: Record<string, string> = {};

      switch (stepIndex) {
        case 0: // Dados Básicos
          if (!formData.nome?.trim()) {
            errors.nome = "Nome é obrigatório";
          }
          const documentoLimpo = formData.documento.replace(/\D/g, "");
          if (!documentoLimpo) {
            errors.documento = "Documento é obrigatório";
          } else if (formData.tipo === "fisica") {
            if (documentoLimpo.length !== 11 || !validateCPF(documentoLimpo)) {
              errors.documento = "CPF inválido";
            }
          } else if (formData.tipo === "juridica") {
            if (documentoLimpo.length !== 14 || !validateCNPJ(documentoLimpo)) {
              errors.documento = "CNPJ inválido";
            }
          }
          break;

        case 1: // Contato
          if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Email inválido";
          }
          if (formData.website && formData.website.trim() !== "") {
            const website = formData.website.trim();
            if (!website.startsWith("http://") && !website.startsWith("https://")) {
              errors.website = "Website deve começar com http:// ou https://";
            }
          }
          break;

        case 2: // Endereço
          if (formData.cep) {
            const cepLimpo = formData.cep.replace(/\D/g, "");
            if (cepLimpo.length !== 8) {
              errors.cep = "CEP deve ter 8 dígitos";
            }
          }
          if (formData.estado && formData.estado.length !== 2) {
            errors.estado = "Estado deve ter 2 caracteres (UF)";
          }
          break;
      }

      setErrosValidacao(errors);
      return Object.keys(errors).length === 0;
    },
    [formData]
  );

  // Buscar dados por CNPJ
  const buscarPorCNPJ = useCallback(async () => {
    const documentoLimpo = formData.documento.replace(/\D/g, "");
    if (formData.tipo !== "juridica" || documentoLimpo.length !== 14) {
      notificationCenter.add({
        type: "warning",
        title: "Atenção",
        message: "Digite um CNPJ válido para buscar os dados",
      });
      return;
    }

    if (!validateCNPJ(documentoLimpo)) {
      notificationCenter.add({
        type: "error",
        title: "CNPJ inválido",
        message: "Por favor, insira um CNPJ válido antes de buscar.",
      });
      return;
    }

    setBuscandoCNPJ(true);
    try {
      const resultado = await buscarCnpj(documentoLimpo);
      if (resultado) {
        setFormData((prev) => ({
          ...prev,
          nome: resultado.razaoSocial || prev.nome,
          razaoSocial: resultado.razaoSocial || prev.razaoSocial,
          nomeFantasia: resultado.nomeFantasia || prev.nomeFantasia,
          endereco: resultado.endereco?.logradouro || prev.endereco,
          numero: resultado.endereco?.numero || prev.numero,
          complemento: resultado.endereco?.complemento || prev.complemento,
          bairro: resultado.endereco?.bairro || prev.bairro,
          cidade: resultado.endereco?.cidade || prev.cidade,
          estado: resultado.endereco?.estado || prev.estado,
          cep: resultado.endereco?.cep || prev.cep,
          telefone: resultado.telefone || prev.telefone,
        }));
        notificationCenter.add({
          type: "success",
          title: "Dados encontrados",
          message: "Dados do CNPJ preenchidos automaticamente",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao buscar dados do CNPJ",
      });
    } finally {
      setBuscandoCNPJ(false);
    }
  }, [formData.documento, formData.tipo]);

  // Buscar endereço por CEP
  const buscarPorCEP = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCEP(true);
    try {
      const resultado = await buscarEnderecoPorCep(cepLimpo);
      if (resultado) {
        setFormData((prev) => ({
          ...prev,
          endereco: resultado.logradouro || prev.endereco,
          bairro: resultado.bairro || prev.bairro,
          complemento: resultado.complemento || prev.complemento,
          cidade: resultado.cidade || prev.cidade,
          estado: resultado.estado || prev.estado,
          cep: resultado.cep || prev.cep,
        }));
        notificationCenter.add({
          type: "success",
          title: "CEP encontrado",
          message: "Endereço preenchido automaticamente",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao buscar endereço. Tente novamente.",
      });
    } finally {
      setBuscandoCEP(false);
    }
  }, []);

  const handleFinish = useCallback(async () => {
    // Validação final completa
    const validacao = validateStep(0) && validateStep(1) && validateStep(2) && (formData.tipo === "juridica" || validateStep(3));
    if (!validacao) {
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: "Por favor, corrija os erros antes de finalizar.",
      });
      return;
    }

    // Limpar rascunho após salvar com sucesso
    clearDraft();
    
    // Incluir tags nos dados
    const dataWithTags = { ...formData, tags: selectedTags };
    await onSubmit(dataWithTags);
  }, [formData, selectedTags, validateStep, onSubmit, clearDraft]);

  // Renderizar conteúdo de cada etapa
  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Dados Básicos
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect
              label="Tipo"
              id="tipo"
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value as "fisica" | "juridica" })
              }
              required
            >
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </FormSelect>

            <FormField
              label={formData.tipo === "fisica" ? "CPF" : "CNPJ"}
              required
              fieldId="documento"
            >
              <div className="flex gap-2">
                <Input
                  id="documento"
                  value={
                    formData.tipo === "fisica"
                      ? formatCPF(formData.documento)
                      : formatCNPJ(formData.documento)
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, documento: value });
                    if (errosValidacao.documento) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.documento;
                        return novo;
                      });
                    }
                  }}
                  maxLength={formData.tipo === "fisica" ? 14 : 18}
                  required
                  className={errosValidacao.documento ? "border-red-500 border-2" : ""}
                />
                {formData.tipo === "juridica" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={buscarPorCNPJ}
                    disabled={buscandoCNPJ || !formData.documento}
                    className="gap-2 whitespace-nowrap"
                  >
                    {buscandoCNPJ ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    Buscar
                  </Button>
                )}
              </div>
              {errosValidacao.documento && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.documento}</p>
              )}
            </FormField>

            <FormField label="Nome" required fieldId="nome" className="md:col-span-2">
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  if (errosValidacao.nome) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.nome;
                      return novo;
                    });
                  }
                }}
                placeholder={formData.tipo === "fisica" ? "Ex: João Silva" : "Ex: Empresa ABC Ltda"}
                required
                autoFocus
                className={errosValidacao.nome ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.nome && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.nome}</p>
              )}
            </FormField>

            {formData.tipo === "juridica" && (
              <>
                <FormField label="Razão Social" fieldId="razaoSocial">
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    placeholder="Ex: Empresa ABC Comércio e Serviços Ltda"
                  />
                </FormField>
                <FormField label="Nome Fantasia" fieldId="nomeFantasia">
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                    placeholder="Ex: ABC Store"
                  />
                </FormField>
                <FormField label="Inscrição Estadual (IE)" fieldId="inscricaoEstadual">
                  <Input
                    id="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, inscricaoEstadual: value });
                      // Validar IE se tiver estado
                      if (formData.estado && value && value !== "ISENTO") {
                        const cleaned = value.replace(/\D/g, "");
                        const isValid = validateIE(cleaned, formData.estado as EstadoUF);
                        if (!isValid && cleaned.length > 0) {
                          setErrosValidacao((prev) => ({
                            ...prev,
                            inscricaoEstadual: `IE inválida para ${formData.estado}. ${getIEFormatDescription(formData.estado as EstadoUF)}`,
                          }));
                        } else {
                          setErrosValidacao((prev) => {
                            const novo = { ...prev };
                            delete novo.inscricaoEstadual;
                            return novo;
                          });
                        }
                      }
                    }}
                    placeholder="Ex: 123.456.789.012 ou ISENTO"
                    className={errosValidacao.inscricaoEstadual ? "border-red-500 border-2" : ""}
                  />
                  {errosValidacao.inscricaoEstadual && (
                    <p className="text-xs text-red-500 mt-1">{errosValidacao.inscricaoEstadual}</p>
                  )}
                  {formData.estado && !errosValidacao.inscricaoEstadual && (
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-1">
                      Formato esperado para {formData.estado}: {getIEFormatDescription(formData.estado as EstadoUF)} ou ISENTO
                    </p>
                  )}
                </FormField>
                <FormField label="Inscrição Municipal (IM)" fieldId="inscricaoMunicipal">
                  <Input
                    id="inscricaoMunicipal"
                    value={formData.inscricaoMunicipal}
                    onChange={(e) =>
                      setFormData({ ...formData, inscricaoMunicipal: e.target.value })
                    }
                    placeholder="Ex: 987654321"
                  />
                </FormField>
              </>
            )}
          </div>
        );

      case 1: // Contato
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Email" fieldId="email">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errosValidacao.email) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.email;
                      return novo;
                    });
                  }
                }}
                placeholder="Ex: contato@empresa.com.br"
                className={errosValidacao.email ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.email && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.email}</p>
              )}
            </FormField>

            <FormField label="Telefone" fieldId="telefone">
              <Input
                id="telefone"
                value={formatPhone(formData.telefone)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, telefone: value });
                }}
                placeholder="Ex: (11) 3456-7890"
                maxLength={14}
              />
            </FormField>

            <FormField label="Celular" fieldId="celular">
              <Input
                id="celular"
                value={formatPhone(formData.celular)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, celular: value });
                }}
                placeholder="Ex: (11) 98765-4321"
                maxLength={15}
              />
            </FormField>

            <FormField label="Email Secundário" fieldId="emailSecundario">
              <Input
                id="emailSecundario"
                type="email"
                value={formData.emailSecundario}
                onChange={(e) => {
                  setFormData({ ...formData, emailSecundario: e.target.value });
                  if (errosValidacao.emailSecundario) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.emailSecundario;
                      return novo;
                    });
                  }
                }}
                placeholder="Ex: contato2@empresa.com.br"
                className={errosValidacao.emailSecundario ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.emailSecundario && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.emailSecundario}</p>
              )}
            </FormField>

            <FormField label="Email Corporativo" fieldId="emailCorporativo">
              <Input
                id="emailCorporativo"
                type="email"
                value={formData.emailCorporativo}
                onChange={(e) => {
                  setFormData({ ...formData, emailCorporativo: e.target.value });
                  if (errosValidacao.emailCorporativo) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.emailCorporativo;
                      return novo;
                    });
                  }
                }}
                placeholder="Ex: empresa@corporativo.com.br"
                className={errosValidacao.emailCorporativo ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.emailCorporativo && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.emailCorporativo}</p>
              )}
            </FormField>

            <FormField label="Telefone Comercial" fieldId="telefoneComercial">
              <Input
                id="telefoneComercial"
                value={formatPhone(formData.telefoneComercial)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, telefoneComercial: value });
                }}
                placeholder="Ex: (11) 3456-7890"
              />
            </FormField>

            <FormField label="WhatsApp Business" fieldId="whatsapp">
              <Input
                id="whatsapp"
                value={formatPhone(formData.whatsapp)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, whatsapp: value });
                }}
                placeholder="Ex: (11) 98765-4321"
              />
              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-1">
                Número do WhatsApp Business
              </p>
            </FormField>

            <FormField label="Telegram" fieldId="telegram">
              <Input
                id="telegram"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                placeholder="Ex: @usuario ou +5511987654321"
              />
              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-1">
                Username do Telegram ou número de telefone
              </p>
            </FormField>

            <FormField label="Website" fieldId="website" className="md:col-span-2">
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => {
                  setFormData({ ...formData, website: e.target.value });
                  if (errosValidacao.website) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.website;
                      return novo;
                    });
                  }
                }}
                placeholder="https://www.exemplo.com.br"
                className={errosValidacao.website ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.website && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.website}</p>
              )}
            </FormField>

            <FormField label="LinkedIn" fieldId="linkedin">
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/usuario"
              />
            </FormField>

            <FormField label="Facebook" fieldId="facebook">
              <Input
                id="facebook"
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/empresa"
              />
            </FormField>

            <FormField label="Instagram" fieldId="instagram">
              <Input
                id="instagram"
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/empresa"
              />
            </FormField>

            <FormField label="Twitter/X" fieldId="twitter">
              <Input
                id="twitter"
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/empresa"
              />
            </FormField>

            <FormField label="YouTube" fieldId="youtube">
              <Input
                id="youtube"
                type="url"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/@empresa"
              />
            </FormField>

            <FormField label="Blog" fieldId="blog">
              <Input
                id="blog"
                type="url"
                value={formData.blog}
                onChange={(e) => setFormData({ ...formData, blog: e.target.value })}
                placeholder="https://blog.empresa.com.br"
              />
            </FormField>

            <FormField label="Horário Preferencial de Contato" fieldId="horarioPreferencialContato">
              <Input
                id="horarioPreferencialContato"
                value={formData.horarioPreferencialContato}
                onChange={(e) => setFormData({ ...formData, horarioPreferencialContato: e.target.value })}
                placeholder="Ex: 08:00-18:00 ou Segunda a Sexta, 9h às 17h"
              />
            </FormField>

            <FormField label="Idioma Preferido" fieldId="idiomaPreferido">
              <FormSelect
                id="idiomaPreferido"
                value={formData.idiomaPreferido}
                onChange={(e) => setFormData({ ...formData, idiomaPreferido: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">Inglês (EUA)</option>
                <option value="es-ES">Espanhol</option>
                <option value="fr-FR">Francês</option>
              </FormSelect>
            </FormField>

            <FormField label="Forma Preferida de Comunicação" fieldId="formaPreferidaComunicacao">
              <FormSelect
                id="formaPreferidaComunicacao"
                value={formData.formaPreferidaComunicacao}
                onChange={(e) => setFormData({ ...formData, formaPreferidaComunicacao: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="email">Email</option>
                <option value="telefone">Telefone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="presencial">Presencial</option>
              </FormSelect>
            </FormField>
          </div>
        );

      case 2: // Endereço
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="CEP" fieldId="cep">
              <Input
                id="cep"
                value={formatCEP(formData.cep)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, cep: value });
                  if (errosValidacao.cep) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.cep;
                      return novo;
                    });
                  }
                }}
                onBlur={async () => {
                  if (formData.cep) {
                    await buscarPorCEP(formData.cep);
                  }
                }}
                maxLength={9}
                placeholder="00000-000"
                className={errosValidacao.cep ? "border-red-500 border-2" : ""}
                disabled={buscandoCEP}
              />
              {buscandoCEP && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Buscando endereço...
                </p>
              )}
              {errosValidacao.cep && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.cep}</p>
              )}
            </FormField>

            <FormField label="Endereço (Logradouro)" fieldId="endereco" className="md:col-span-2">
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Ex: Rua das Flores, Avenida Paulista"
              />
            </FormField>

            <FormField label="Número" fieldId="numero">
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ex: 123, S/N"
              />
            </FormField>

            <FormField label="Complemento" fieldId="complemento">
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                placeholder="Ex: Apto 101, Sala 203"
              />
            </FormField>

            <FormField label="Bairro" fieldId="bairro">
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                placeholder="Ex: Centro, Jardim das Flores"
              />
            </FormField>

            <FormField label="Cidade" fieldId="cidade">
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                placeholder="Ex: São Paulo, Rio de Janeiro"
              />
            </FormField>

            <FormField label="Estado (UF)" fieldId="estado">
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => {
                  setFormData({ ...formData, estado: e.target.value.toUpperCase().slice(0, 2) });
                  if (errosValidacao.estado) {
                    setErrosValidacao((prev) => {
                      const novo = { ...prev };
                      delete novo.estado;
                      return novo;
                    });
                  }
                }}
                maxLength={2}
                placeholder="Ex: SP, RJ, MG"
                className={errosValidacao.estado ? "border-red-500 border-2" : ""}
              />
              {errosValidacao.estado && (
                <p className="text-xs text-red-500 mt-1">{errosValidacao.estado}</p>
              )}
            </FormField>

            <FormField label="Ponto de Referência" fieldId="pontoReferencia" className="md:col-span-2">
              <Input
                id="pontoReferencia"
                value={formData.pontoReferencia}
                onChange={(e) => setFormData({ ...formData, pontoReferencia: e.target.value })}
                placeholder="Ex: Próximo ao shopping, em frente à padaria"
              />
            </FormField>

            <FormField label="Latitude (GPS)" fieldId="latitude">
              <Input
                id="latitude"
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="Ex: -23.5505199"
              />
            </FormField>

            <FormField label="Longitude (GPS)" fieldId="longitude">
              <Input
                id="longitude"
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="Ex: -46.6333094"
              />
            </FormField>

            <FormField label="Código IBGE" fieldId="codigoIBGE">
              <Input
                id="codigoIBGE"
                value={formData.codigoIBGE}
                onChange={(e) => setFormData({ ...formData, codigoIBGE: e.target.value })}
                placeholder="Ex: 3550308"
              />
            </FormField>

            <FormField label="Código do Município" fieldId="codigoMunicipio">
              <Input
                id="codigoMunicipio"
                value={formData.codigoMunicipio}
                onChange={(e) => setFormData({ ...formData, codigoMunicipio: e.target.value })}
                placeholder="Ex: 0308"
              />
            </FormField>

            <FormField label="Região" fieldId="regiao">
              <FormSelect
                id="regiao"
                value={formData.regiao}
                onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="Norte">Norte</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Centro-Oeste">Centro-Oeste</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Sul">Sul</option>
              </FormSelect>
            </FormField>

            <FormField label="Zona" fieldId="zona">
              <FormSelect
                id="zona"
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="urbana">Urbana</option>
                <option value="rural">Rural</option>
              </FormSelect>
            </FormField>
          </div>
        );

      case 3: // Dados Pessoais (apenas PF)
        if (formData.tipo !== "fisica") {
          return (
            <div className="text-center py-8 text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
              <p>Esta etapa é apenas para Pessoa Física.</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Sexo/Gênero" fieldId="sexo">
              <FormSelect
                id="sexo"
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="nao_informar">Prefiro não informar</option>
              </FormSelect>
            </FormField>

            <FormField label="Estado Civil" fieldId="estadoCivil">
              <FormSelect
                id="estadoCivil"
                value={formData.estadoCivil}
                onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União Estável</option>
              </FormSelect>
            </FormField>

            <FormField label="Nacionalidade" fieldId="nacionalidade" className="md:col-span-2">
              <Input
                id="nacionalidade"
                value={formData.nacionalidade}
                onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                placeholder="Ex: Brasileira, Portuguesa, etc."
              />
            </FormField>

            <FormField label="Cidade de Naturalidade" fieldId="naturalidadeCidade">
              <Input
                id="naturalidadeCidade"
                value={formData.naturalidadeCidade}
                onChange={(e) => setFormData({ ...formData, naturalidadeCidade: e.target.value })}
                placeholder="Ex: São Paulo"
              />
            </FormField>

            <FormField label="Estado de Naturalidade (UF)" fieldId="naturalidadeEstado">
              <Input
                id="naturalidadeEstado"
                value={formData.naturalidadeEstado}
                onChange={(e) =>
                  setFormData({ ...formData, naturalidadeEstado: e.target.value.toUpperCase().slice(0, 2) })
                }
                placeholder="Ex: SP"
                maxLength={2}
              />
            </FormField>

            <FormField label="Título de Eleitor" fieldId="tituloEleitor">
              <Input
                id="tituloEleitor"
                value={formData.tituloEleitor}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, tituloEleitor: value });
                }}
                placeholder="Ex: 123456789012"
                maxLength={12}
              />
            </FormField>

            <FormField label="Certidão de Nascimento" fieldId="certidaoNascimento">
              <Input
                id="certidaoNascimento"
                value={formData.certidaoNascimento}
                onChange={(e) => setFormData({ ...formData, certidaoNascimento: e.target.value })}
                placeholder="Ex: Livro 123, Folha 456, Termo 789"
              />
            </FormField>

            <FormField label="Certidão de Casamento" fieldId="certidaoCasamento">
              <Input
                id="certidaoCasamento"
                value={formData.certidaoCasamento}
                onChange={(e) => setFormData({ ...formData, certidaoCasamento: e.target.value })}
                placeholder="Ex: Livro 123, Folha 456, Termo 789"
              />
            </FormField>

            <FormField label="Nome da Mãe" fieldId="nomeMae" className="md:col-span-2">
              <Input
                id="nomeMae"
                value={formData.nomeMae}
                onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
                placeholder="Ex: Maria Silva"
              />
            </FormField>

            <FormField label="Nome do Pai" fieldId="nomePai" className="md:col-span-2">
              <Input
                id="nomePai"
                value={formData.nomePai}
                onChange={(e) => setFormData({ ...formData, nomePai: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </FormField>
          </div>
        );

      case 4: // Observações
        return (
          <div>
            <FormTextarea
              label="Observações"
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: Cliente preferencial, paga sempre em dia, preferência por contato via WhatsApp..."
              rows={6}
            />
          </div>
        );

      case 5: // Tags
        return (
          <div>
            <TagsInput
              tags={selectedTags}
              availableTags={availableTags}
              onTagsChange={setSelectedTags}
              onCreateTag={createTag}
              placeholder="Digite para criar ou selecionar uma tag..."
              className="w-full"
            />
            <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-2">
              Adicione tags para categorizar e organizar seus clientes. Você pode criar novas tags ou usar as existentes.
            </p>
          </div>
        );

      case 6: // Preview
        return (
          <div className="space-y-6">
            <div className="bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)] rounded-lg p-6 border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                    Tipo
                  </p>
                  <p className="font-medium">
                    {formData.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                    {formData.tipo === "fisica" ? "CPF" : "CNPJ"}
                  </p>
                  <p className="font-medium">
                    {formData.tipo === "fisica"
                      ? formatCPF(formData.documento)
                      : formatCNPJ(formData.documento)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                    Nome
                  </p>
                  <p className="font-medium">{formData.nome}</p>
                </div>
                {formData.tipo === "juridica" && (
                  <>
                    {formData.razaoSocial && (
                      <div>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                          Razão Social
                        </p>
                        <p className="font-medium">{formData.razaoSocial}</p>
                      </div>
                    )}
                    {formData.nomeFantasia && (
                      <div>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                          Nome Fantasia
                        </p>
                        <p className="font-medium">{formData.nomeFantasia}</p>
                      </div>
                    )}
                  </>
                )}
                {formData.email && (
                  <div>
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                      Email
                    </p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                )}
                {(formData.telefone || formData.celular) && (
                  <div>
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                      Telefone
                    </p>
                    <p className="font-medium">
                      {formData.celular ? formatPhone(formData.celular) : formatPhone(formData.telefone)}
                    </p>
                  </div>
                )}
                {formData.endereco && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                      Endereço
                    </p>
                    <p className="font-medium">
                      {formData.endereco}
                      {formData.numero && `, ${formData.numero}`}
                      {formData.complemento && ` - ${formData.complemento}`}
                      {formData.bairro && `, ${formData.bairro}`}
                      {formData.cidade && `, ${formData.cidade}`}
                      {formData.estado && ` - ${formData.estado}`}
                      {formData.cep && ` (${formatCEP(formData.cep)})`}
                    </p>
                  </div>
                )}
                {formData.observacoes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                      Observações
                    </p>
                    <p className="font-medium whitespace-pre-wrap">{formData.observacoes}</p>
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: tag.color
                              ? `${tag.color}20`
                              : "var(--muted-soft)",
                            color: tag.color || "inherit",
                            border: `1px solid ${tag.color ? `${tag.color}40` : "transparent"}`,
                          }}
                        >
                          <Tag className="h-3 w-3" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {Object.keys(errosValidacao).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Erros encontrados
                    </p>
                    <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {Object.values(errosValidacao).map((erro, index) => (
                        <li key={index}>{erro}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Indicador de auto-save e histórico */}
      {!isEditing && (
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDraftHistory(true)}
            className="gap-2"
            disabled={versions.length === 0}
          >
            <History className="h-4 w-4" />
            Histórico ({versions.length})
          </Button>
          {(isSaving || (versions.length > 0 && !isEditing)) && (
            <div className="flex items-center gap-2 text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Salvando rascunho...</span>
                </>
              ) : versions.length > 0 ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>
                    Último rascunho: {versions[0]?.savedAt.toLocaleTimeString("pt-BR")}
                  </span>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Painel de sugestões inteligentes */}
      {!isEditing && activeSuggestions && activeSuggestions.length > 0 && (
        <div className="mb-4">
          <SmartSuggestionsPanel
            suggestions={activeSuggestions}
            isLoading={isLoadingSuggestions}
            onApply={handleApplySuggestion}
            onDismiss={handleDismissSuggestion}
            getFieldLabel={(key) => {
              const labels: Record<string, string> = {
                nome: "Nome",
                cidade: "Cidade",
                estado: "Estado",
                email: "Email",
                telefone: "Telefone",
                celular: "Celular",
              };
              return labels[key] || key;
            }}
          />
        </div>
      )}

      <Wizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onFinish={handleFinish}
        validateStep={validateStep}
        className="w-full"
      >
        {renderStepContent}
      </Wizard>

      {/* Modal de histórico de rascunhos */}
      <DraftHistoryModal
        isOpen={showDraftHistory}
        onClose={() => setShowDraftHistory(false)}
        versions={versions}
        currentVersionId={currentVersionId}
        currentData={formData}
        onRestore={restoreVersion}
        onDelete={deleteVersion}
        onClear={clearHistory}
        formatLabel={(version) => {
          const hasName = version.data.nome;
          const hasDoc = version.data.documento;
          if (hasName) return `Rascunho: ${version.data.nome}`;
          if (hasDoc) return `Rascunho: ${version.data.documento}`;
          return `Rascunho de ${version.savedAt.toLocaleString("pt-BR")}`;
        }}
        getFieldLabel={(key) => {
          const labels: Record<string, string> = {
            nome: "Nome",
            razaoSocial: "Razão Social",
            nomeFantasia: "Nome Fantasia",
            tipo: "Tipo",
            documento: "Documento",
            inscricaoEstadual: "Inscrição Estadual",
            inscricaoMunicipal: "Inscrição Municipal",
            email: "Email",
            telefone: "Telefone",
            celular: "Celular",
            website: "Website",
            endereco: "Endereço",
            numero: "Número",
            complemento: "Complemento",
            bairro: "Bairro",
            cidade: "Cidade",
            estado: "Estado",
            cep: "CEP",
            observacoes: "Observações",
          };
          return labels[key] || key;
        }}
        formatValue={(key, value) => {
          if (!value || value === "") return "-";
          if (key === "tipo") return value === "fisica" ? "Pessoa Física" : "Pessoa Jurídica";
          return String(value);
        }}
      />
    </div>
  );
}

