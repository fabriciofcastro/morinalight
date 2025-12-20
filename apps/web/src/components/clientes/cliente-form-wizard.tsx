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
} from "lucide-react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { buscarCnpj } from "@/lib/integrations/cnpj";
import { buscarEnderecoPorCep } from "@/lib/integrations/viacep";
import { Loader2 } from "lucide-react";

type ClienteFormData = {
  nome: string;
  razaoSocial: string;
  nomeFantasia: string;
  tipo: "fisica" | "juridica";
  documento: string;
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
};

interface ClienteFormWizardProps {
  initialData?: Partial<ClienteFormData>;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
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
}: ClienteFormWizardProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: initialData?.nome || "",
    razaoSocial: initialData?.razaoSocial || "",
    nomeFantasia: initialData?.nomeFantasia || "",
    tipo: initialData?.tipo || "fisica",
    documento: initialData?.documento || "",
    inscricaoEstadual: initialData?.inscricaoEstadual || "",
    inscricaoMunicipal: initialData?.inscricaoMunicipal || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    celular: initialData?.celular || "",
    website: initialData?.website || "",
    endereco: initialData?.endereco || "",
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Auto-save de rascunho
  useEffect(() => {
    if (isEditing) return; // Não salvar rascunho ao editar

    const autoSaveInterval = setInterval(() => {
      // Verificar se há dados para salvar
      const hasData = formData.nome || formData.documento || formData.email;
      if (!hasData) return;

      setIsSavingDraft(true);
      try {
        const draftKey = `cliente-draft-${isEditing ? 'edit' : 'new'}`;
        localStorage.setItem(draftKey, JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(new Date());
        notificationCenter.add({
          type: "info",
          title: "Rascunho salvo",
          message: "Seus dados foram salvos automaticamente",
          duration: 2000,
        });
      } catch (error) {
        console.error("Erro ao salvar rascunho:", error);
      } finally {
        setIsSavingDraft(false);
      }
    }, 30000); // Salvar a cada 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [formData, isEditing]);

  // Carregar rascunho ao montar
  useEffect(() => {
    if (isEditing) return; // Não carregar rascunho ao editar

    try {
      const draftKey = `cliente-draft-new`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && !initialData) {
        const draft = JSON.parse(savedDraft);
        // Verificar se o rascunho é recente (menos de 24 horas)
        const savedAt = new Date(draft.savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          const shouldRestore = confirm(
            `Encontramos um rascunho salvo em ${savedAt.toLocaleString("pt-BR")}. Deseja restaurar?`
          );
          if (shouldRestore) {
            setFormData({
              nome: draft.nome || "",
              razaoSocial: draft.razaoSocial || "",
              nomeFantasia: draft.nomeFantasia || "",
              tipo: draft.tipo || "fisica",
              documento: draft.documento || "",
              inscricaoEstadual: draft.inscricaoEstadual || "",
              inscricaoMunicipal: draft.inscricaoMunicipal || "",
              email: draft.email || "",
              telefone: draft.telefone || "",
              celular: draft.celular || "",
              website: draft.website || "",
              endereco: draft.endereco || "",
              numero: draft.numero || "",
              complemento: draft.complemento || "",
              bairro: draft.bairro || "",
              cidade: draft.cidade || "",
              estado: draft.estado || "",
              cep: draft.cep || "",
              observacoes: draft.observacoes || "",
            });
            notificationCenter.add({
              type: "success",
              title: "Rascunho restaurado",
              message: "Seus dados foram restaurados com sucesso",
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar rascunho:", error);
    }
  }, []);

  // Limpar rascunho após salvar com sucesso
  const clearDraft = useCallback(() => {
    try {
      const draftKey = `cliente-draft-${isEditing ? 'edit' : 'new'}`;
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error("Erro ao limpar rascunho:", error);
    }
  }, [isEditing]);

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
      id: "observacoes",
      label: "Observações",
      description: "Informações adicionais",
      icon: <FileText className="h-5 w-5" />,
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
    const validacao = validateStep(0) && validateStep(1) && validateStep(2);
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
    await onSubmit(formData);
  }, [formData, validateStep, onSubmit, clearDraft]);

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
                    onChange={(e) =>
                      setFormData({ ...formData, inscricaoEstadual: e.target.value })
                    }
                    placeholder="Ex: 123.456.789.012 ou ISENTO"
                  />
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
          </div>
        );

      case 3: // Observações
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

      case 4: // Preview
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
  );
}

