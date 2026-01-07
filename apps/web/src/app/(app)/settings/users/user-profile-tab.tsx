"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { Button, Input, Label, cn } from "@morina/ui";
import {
    CreditCard,
    FileText,
    GitCompare,
    GraduationCap,
    Home,
    Lock,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    Settings,
    Upload,
    User,
    X
} from "lucide-react";
import { useState } from "react";

type UserProfileTabProps = {
  userId: string;
  user: {
    userId: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    status: "pending" | "active" | "suspended" | "inactive";
  };
  onUserUpdated: () => void;
};

type ProfileSection = "personal" | "contact" | "address" | "documents" | "professional" | "academic" | "financial" | "security" | "preferences";

export function UserProfileTab({ userId, user, onUserUpdated }: UserProfileTabProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [documentHistory, setDocumentHistory] = useState<Array<{
    id: string;
    documentType: string;
    fileName: string;
    version: number;
    uploadedBy: string;
    uploadedAt: string;
    fileUrl: string | null;
    fileSize: number | null;
    reason?: string | null;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});

  // Form state - Dados Pessoais
  const [personalData, setPersonalData] = useState({
    nomeCompleto: user.displayName || "",
    nomeSocial: "",
    cpf: "",
    rg: "",
    orgaoExpedidor: "",
    dataNascimento: "",
    genero: "",
    estadoCivil: "",
    nacionalidade: "Brasileira",
    naturalidadeCidade: "",
    naturalidadeEstado: "",
  });

  // Form state - Contato
  const [contactData, setContactData] = useState({
    emailCorporativo: user.email,
    emailsSecundarios: [] as string[],
    telefoneFixo: "",
    celular: "",
    whatsapp: "",
    telefoneEmergencia: "",
    contatoEmergenciaNome: "",
    contatoEmergenciaRelacao: "",
  });

  // Form state - Endereço
  const [addressData, setAddressData] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  });

  // Form state - Profissional
  const [professionalData, setProfessionalData] = useState({
    matricula: "",
    dataAdmissao: "",
    dataDesligamento: "",
    tipoContrato: "CLT",
    cargoId: "",
    setorId: "",
    departamentoId: "",
    filialId: "",
    supervisorId: "",
    equipeGrupo: "",
    salario: "",
    beneficios: "",
    horarioTrabalho: "",
    jornadaTrabalho: "",
  });

  // Form state - Acadêmico
  const [academicData, setAcademicData] = useState({
    escolaridade: "",
    instituicoes: [] as Array<{ nome: string; curso: string; anoConclusao: string }>,
    cursos: [] as string[],
    certificacoes: [] as Array<{ nome: string; arquivo?: File | null; url?: string }>,
    idiomas: [] as Array<{ idioma: string; nivel: string }>,
  });

  // Form state - Financeiro
  const [financialData, setFinancialData] = useState({
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "Corrente",
    pix: "",
    irpf: "",
  });

  // Form state - Segurança
  const [securityData, setSecurityData] = useState({
    statusConta: user.status,
    ultimoAcesso: "",
    ipUltimoAcesso: "",
    dispositivos: [] as Array<{ id: string; nome: string; ip: string; ultimaAtividade: string }>,
    sessoesAtivas: [] as Array<{ id: string; dispositivo: string; ip: string; inicio: string }>,
    historicoSenhas: [] as Array<{ data: string; ip: string }>,
    twoFactorEnabled: false,
    apiTokens: [] as Array<{ id: string; nome: string; criadoEm: string }>,
  });

  // Form state - Preferências
  const [preferencesData, setPreferencesData] = useState({
    idioma: "pt-BR",
    fusoHorario: "America/Sao_Paulo",
    formatoData: "DD/MM/YYYY",
    formatoHora: "24h",
    tema: "auto",
    notificacoesEmail: true,
    notificacoesPush: true,
    notificacoesInApp: true,
    assinaturaEmail: "",
  });

  const sections: { id: ProfileSection; label: string; icon: typeof User }[] = [
    { id: "personal", label: "Dados Pessoais", icon: User },
    { id: "contact", label: "Contato", icon: Phone },
    { id: "address", label: "Endereço", icon: MapPin },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "professional", label: "Profissional", icon: Home },
    { id: "academic", label: "Acadêmico", icon: GraduationCap },
    { id: "financial", label: "Financeiro", icon: CreditCard },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "preferences", label: "Preferências", icon: Settings },
  ];

  const handleSearchCep = async () => {
    const cep = addressData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setAddressData((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const payload = {
        personalData,
        contactData,
        addressData,
        professionalData,
        academicData,
        financialData,
        securityData,
        preferencesData,
      };

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Perfil atualizado com sucesso.",
        });
        onUserUpdated();
      } else {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Não foi possível atualizar o perfil.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao atualizar perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo muito grande",
        message: "A imagem deve ter no máximo 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = async (documentType: string, file: File | null) => {
    if (!file) return;

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo muito grande",
        message: "O arquivo deve ter no máximo 10MB.",
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      notificationCenter.add({
        type: "error",
        title: "Tipo de arquivo inválido",
        message: "Apenas arquivos PDF, JPG ou PNG são permitidos.",
      });
      return;
    }

    setUploadingDocuments((prev) => ({ ...prev, [documentType]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const headers = getAuthHeadersWithTenant() as any;
      delete headers["Content-Type"]; // Permitir que o browser defina o boundary

      const response = await fetch(`/api/users/${userId}/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Documento enviado",
          message: `${documentType} enviado com sucesso.`,
        });
        onUserUpdated();
        // Recarregar histórico se já estiver carregado
        if (documentHistory.length > 0) {
          const historyResponse = await fetch(`/api/users/${userId}/documents/history`, {
            headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          });
          if (historyResponse.ok) {
            const data = await historyResponse.json();
            setDocumentHistory(data.itens || []);
          }
        }
      } else {
        const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.error || "Não foi possível enviar o documento.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao enviar documento.",
      });
    } finally {
      setUploadingDocuments((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-6">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={user.displayName || user.email}
              className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-2xl font-bold text-white border-2 border-white/20">
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.8)] transition-colors"
          >
            <Upload className="h-4 w-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white">{personalData.nomeCompleto || user.displayName || "Sem nome"}</h4>
          <p className="text-sm text-white/50">{user.email}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex rounded px-2 py-1 text-xs font-mono uppercase tracking-wider",
                user.status === "active" &&
                "bg-green-500/20 text-green-400 border border-green-500/30",
                user.status === "pending" &&
                "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                user.status === "suspended" &&
                "bg-red-500/20 text-red-400 border border-red-500/30",
                user.status === "inactive" &&
                "bg-gray-500/20 text-gray-400 border border-gray-500/30",
              )}
            >
              {user.status === "active"
                ? "Ativo"
                : user.status === "pending"
                  ? "Pendente"
                  : user.status === "suspended"
                    ? "Suspenso"
                    : "Inativo"}
            </span>
          </div>
          {/* Tags/Interesses */}
          <div className="mt-3">
            <Label htmlFor="tags" className="text-xs text-white/70 mb-2 block">
              Tags/Interesses
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = tags.filter((_, i) => i !== idx);
                      setTags(newTags);
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTag.trim()) {
                    e.preventDefault();
                    setTags([...tags, newTag.trim()]);
                    setNewTag("");
                  }
                }}
                placeholder="Adicionar tag (Enter para adicionar)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newTag.trim()) {
                    setTags([...tags, newTag.trim()]);
                    setNewTag("");
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border",
                activeSection === section.id
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="min-h-[400px]">
        {activeSection === "personal" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Dados Pessoais</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="nome-completo">Nome Completo *</Label>
                <Input
                  id="nome-completo"
                  value={personalData.nomeCompleto}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, nomeCompleto: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="nome-social">Nome Social</Label>
                <Input
                  id="nome-social"
                  value={personalData.nomeSocial}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, nomeSocial: e.target.value }))}
                  placeholder="Nome social (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={personalData.cpf}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={personalData.rg}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, rg: e.target.value }))}
                  placeholder="00.000.000-0"
                />
              </div>

              <div>
                <Label htmlFor="orgao-expedidor">Órgão Expedidor</Label>
                <Input
                  id="orgao-expedidor"
                  value={personalData.orgaoExpedidor}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, orgaoExpedidor: e.target.value }))}
                  placeholder="SSP, IFP, etc."
                />
              </div>

              <div>
                <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                <Input
                  id="data-nascimento"
                  type="date"
                  value={personalData.dataNascimento}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, dataNascimento: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="genero">Gênero</Label>
                <select
                  id="genero"
                  value={personalData.genero}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, genero: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Não informar</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="nao-binario">Não-binário</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="estado-civil">Estado Civil</Label>
                <select
                  id="estado-civil"
                  value={personalData.estadoCivil}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, estadoCivil: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Não informar</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao-estavel">União Estável</option>
                </select>
              </div>

              <div>
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input
                  id="nacionalidade"
                  value={personalData.nacionalidade}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, nacionalidade: e.target.value }))}
                  placeholder="Brasileira"
                />
              </div>

              <div>
                <Label htmlFor="naturalidade-cidade">Naturalidade - Cidade</Label>
                <Input
                  id="naturalidade-cidade"
                  value={personalData.naturalidadeCidade}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, naturalidadeCidade: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label htmlFor="naturalidade-estado">Naturalidade - Estado</Label>
                <Input
                  id="naturalidade-estado"
                  value={personalData.naturalidadeEstado}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, naturalidadeEstado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Contato</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="email-corporativo">Email Corporativo (Principal) *</Label>
                <Input
                  id="email-corporativo"
                  type="email"
                  value={contactData.emailCorporativo}
                  onChange={(e) => setContactData((prev) => ({ ...prev, emailCorporativo: e.target.value }))}
                  placeholder="usuario@morina.com.br"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emails-secundarios">Emails Secundários</Label>
                <div className="space-y-2">
                  {contactData.emailsSecundarios.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...contactData.emailsSecundarios];
                          newEmails[idx] = e.target.value;
                          setContactData((prev) => ({ ...prev, emailsSecundarios: newEmails }));
                        }}
                        placeholder="email@exemplo.com"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newEmails = contactData.emailsSecundarios.filter((_, i) => i !== idx);
                          setContactData((prev) => ({ ...prev, emailsSecundarios: newEmails }));
                        }}
                        className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setContactData((prev) => ({
                        ...prev,
                        emailsSecundarios: [...prev.emailsSecundarios, ""],
                      }));
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Adicionar Email
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="telefone-fixo">Telefone Fixo</Label>
                <Input
                  id="telefone-fixo"
                  value={contactData.telefoneFixo}
                  onChange={(e) => setContactData((prev) => ({ ...prev, telefoneFixo: e.target.value }))}
                  placeholder="(11) 3333-3333"
                />
              </div>

              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={contactData.celular}
                  onChange={(e) => setContactData((prev) => ({ ...prev, celular: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={contactData.whatsapp}
                  onChange={(e) => setContactData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="telefone-emergencia">Telefone de Emergência</Label>
                <Input
                  id="telefone-emergencia"
                  value={contactData.telefoneEmergencia}
                  onChange={(e) => setContactData((prev) => ({ ...prev, telefoneEmergencia: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="contato-emergencia-nome">Contato de Emergência - Nome</Label>
                <Input
                  id="contato-emergencia-nome"
                  value={contactData.contatoEmergenciaNome}
                  onChange={(e) => setContactData((prev) => ({ ...prev, contatoEmergenciaNome: e.target.value }))}
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <Label htmlFor="contato-emergencia-relacao">Contato de Emergência - Relação</Label>
                <Input
                  id="contato-emergencia-relacao"
                  value={contactData.contatoEmergenciaRelacao}
                  onChange={(e) => setContactData((prev) => ({ ...prev, contatoEmergenciaRelacao: e.target.value }))}
                  placeholder="Ex: Cônjuge, Pai, Mãe, etc."
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "address" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Endereço</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={addressData.cep}
                    onChange={(e) => setAddressData((prev) => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                    maxLength={9}
                    onBlur={handleSearchCep}
                  />
                  <Button type="button" onClick={handleSearchCep}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={addressData.logradouro}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, logradouro: e.target.value }))}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={addressData.numero}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, numero: e.target.value }))}
                  placeholder="123"
                />
              </div>

              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={addressData.complemento}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, complemento: e.target.value }))}
                  placeholder="Apto, Sala, etc."
                />
              </div>

              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={addressData.bairro}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, bairro: e.target.value }))}
                  placeholder="Bairro"
                />
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={addressData.cidade}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={addressData.estado}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, estado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={addressData.pais}
                  onChange={(e) => setAddressData((prev) => ({ ...prev, pais: e.target.value }))}
                  placeholder="Brasil"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "documents" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Documentos</h5>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rg-files">RG (Frente e Verso)</Label>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                    <FileText className="h-5 w-5 text-white/40" />
                    <div className="flex-1">
                      <p className="text-sm text-white">RG Frente</p>
                      <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleDocumentUpload("RG Frente", file);
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDocuments["RG Frente"]}
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingDocuments["RG Frente"] ? "Enviando..." : "Enviar"}
                      </Button>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                    <FileText className="h-5 w-5 text-white/40" />
                    <div className="flex-1">
                      <p className="text-sm text-white">RG Verso</p>
                      <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleDocumentUpload("RG Verso", file);
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDocuments["RG Verso"]}
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingDocuments["RG Verso"] ? "Enviando..." : "Enviar"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="cpf-file">CPF</Label>
                <div className="mt-2 flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                  <FileText className="h-5 w-5 text-white/40" />
                  <div className="flex-1">
                    <p className="text-sm text-white">CPF</p>
                    <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleDocumentUpload("CPF", file);
                          e.target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDocuments["CPF"]}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingDocuments["CPF"] ? "Enviando..." : "Enviar"}
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="ctps-file">CTPS</Label>
                <div className="mt-2 flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                  <FileText className="h-5 w-5 text-white/40" />
                  <div className="flex-1">
                    <p className="text-sm text-white">CTPS</p>
                    <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleDocumentUpload("CTPS", file);
                          e.target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDocuments["CTPS"]}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingDocuments["CTPS"] ? "Enviando..." : "Enviar"}
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="comprovante-residencia">Comprovante de Residência</Label>
                <div className="mt-2 flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                  <FileText className="h-5 w-5 text-white/40" />
                  <div className="flex-1">
                    <p className="text-sm text-white">Comprovante de Residência</p>
                    <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleDocumentUpload("Comprovante de Residência", file);
                          e.target.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingDocuments["Comprovante de Residência"]}
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingDocuments["Comprovante de Residência"] ? "Enviando..." : "Enviar"}
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="certidoes-list">Certidões</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                    <FileText className="h-5 w-5 text-white/40" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Certidão de Nascimento</p>
                      <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleDocumentUpload("Certidão de Nascimento", file);
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDocuments["Certidão de Nascimento"]}
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingDocuments["Certidão de Nascimento"] ? "Enviando..." : "Enviar"}
                      </Button>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 border border-white/10 bg-white/5 p-3">
                    <FileText className="h-5 w-5 text-white/40" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Certidão de Casamento</p>
                      <p className="text-xs text-white/50">Nenhum arquivo enviado</p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void handleDocumentUpload("Certidão de Casamento", file);
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingDocuments["Certidão de Casamento"]}
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingDocuments["Certidão de Casamento"] ? "Enviando..." : "Enviar"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <Label htmlFor="document-history">Histórico de Documentos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setLoadingHistory(true);
                      try {
                        const headers = {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        };
                        const response = await fetch(`/api/users/${userId}/documents/history`, { headers });
                        if (response.ok) {
                          const data = await response.json();
                          setDocumentHistory(data.itens || []);
                        }
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setLoadingHistory(false);
                      }
                    }}
                  >
                    {loadingHistory ? "Carregando..." : "Carregar Histórico"}
                  </Button>
                </div>

                {documentHistory.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">
                    Nenhum histórico de documentos disponível. Clique em "Carregar Histórico" para ver as versões dos documentos.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {documentHistory.map((doc) => {
                      const isExpanded = selectedHistoryItem === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className={cn(
                            "border border-white/10 bg-white/5 p-3 cursor-pointer transition-colors",
                            isExpanded && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]",
                          )}
                          onClick={() => setSelectedHistoryItem(isExpanded ? null : doc.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <FileText className="h-5 w-5 text-white/40 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-white">{doc.documentType}</p>
                                  <span className="text-xs text-white/40">v{doc.version}</span>
                                  {doc.fileUrl && (
                                    <a
                                      href={doc.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-[hsl(var(--primary))] hover:underline"
                                    >
                                      Ver arquivo
                                    </a>
                                  )}
                                </div>
                                <p className="text-xs text-white/50">{doc.fileName}</p>
                                <p className="text-xs text-white/40 mt-1">
                                  Enviado por {doc.uploadedBy} em{" "}
                                  {new Date(doc.uploadedAt).toLocaleString("pt-BR")}
                                  {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(2)} KB`}
                                </p>

                                {isExpanded && doc.reason && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-xs text-white/50 mb-1">Motivo da Alteração</p>
                                    <div className="bg-white/5 border border-white/10 p-2 text-sm text-white">
                                      {doc.reason}
                                    </div>
                                  </div>
                                )}

                                {!isExpanded && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <GitCompare className="h-3 w-3 text-white/40" />
                                    <span className="text-xs text-white/50">
                                      {doc.reason ? "Clique para ver detalhes" : "Versão {doc.version}"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "professional" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Profissional</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="matricula">Matrícula/Funcional</Label>
                <Input
                  id="matricula"
                  value={professionalData.matricula}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, matricula: e.target.value }))}
                  placeholder="000000"
                />
              </div>

              <div>
                <Label htmlFor="data-admissao">Data de Admissão</Label>
                <Input
                  id="data-admissao"
                  type="date"
                  value={professionalData.dataAdmissao}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, dataAdmissao: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="tipo-contrato">Tipo de Contrato</Label>
                <select
                  id="tipo-contrato"
                  value={professionalData.tipoContrato}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, tipoContrato: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Estagiario">Estagiário</option>
                  <option value="Terceirizado">Terceirizado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="cargo">Cargo Atual</Label>
                <select
                  id="cargo"
                  value={professionalData.cargoId}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, cargoId: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um cargo</option>
                  {/* TODO: Carregar cargos */}
                </select>
              </div>

              <div>
                <Label htmlFor="setor">Setor</Label>
                <select
                  id="setor"
                  value={professionalData.setorId}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, setorId: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um setor</option>
                  {/* TODO: Carregar setores */}
                </select>
              </div>

              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <select
                  id="departamento"
                  value={professionalData.departamentoId}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, departamentoId: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um departamento</option>
                  {/* TODO: Carregar departamentos */}
                </select>
              </div>

              <div>
                <Label htmlFor="filial">Filial</Label>
                <select
                  id="filial"
                  value={professionalData.filialId}
                  onChange={(e) => setProfessionalData((prev) => ({ ...prev, filialId: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione uma filial</option>
                  {/* TODO: Carregar filiais */}
                </select>
              </div>

              <div>
                <Label htmlFor="supervisorId">Supervisor Imediato</Label>
                <Input
                  id="supervisorId"
                  value={professionalData.supervisorId}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, supervisorId: e.target.value }))
                  }
                  placeholder="ID do supervisor"
                />
              </div>

              <div>
                <Label htmlFor="equipeGrupo">Equipe/Grupo</Label>
                <Input
                  id="equipeGrupo"
                  value={professionalData.equipeGrupo}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, equipeGrupo: e.target.value }))
                  }
                  placeholder="Nome da equipe ou grupo de trabalho"
                />
                <p className="mt-1 text-xs text-white/50">
                  Ex: Equipe de Vendas, Grupo de Desenvolvimento, Time de Marketing
                </p>
              </div>

              <div>
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  value={professionalData.salario}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, salario: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="beneficios">Benefícios</Label>
                <textarea
                  id="beneficios"
                  value={professionalData.beneficios}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, beneficios: e.target.value }))
                  }
                  placeholder="Lista de benefícios (ex: Vale Alimentação, Plano de Saúde, etc.)"
                  className="flex min-h-[80px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="horario-trabalho">Horário de Trabalho</Label>
                <Input
                  id="horario-trabalho"
                  value={professionalData.horarioTrabalho}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, horarioTrabalho: e.target.value }))
                  }
                  placeholder="Ex: 08:00 - 18:00"
                />
              </div>

              <div>
                <Label htmlFor="jornada-trabalho">Jornada de Trabalho</Label>
                <Input
                  id="jornada-trabalho"
                  value={professionalData.jornadaTrabalho}
                  onChange={(e) =>
                    setProfessionalData((prev) => ({ ...prev, jornadaTrabalho: e.target.value }))
                  }
                  placeholder="Ex: 40 horas semanais"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "academic" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Acadêmico</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <select
                  id="escolaridade"
                  value={academicData.escolaridade}
                  onChange={(e) => setAcademicData((prev) => ({ ...prev, escolaridade: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="fundamental-incompleto">Fundamental Incompleto</option>
                  <option value="fundamental-completo">Fundamental Completo</option>
                  <option value="medio-incompleto">Médio Incompleto</option>
                  <option value="medio-completo">Médio Completo</option>
                  <option value="superior-incompleto">Superior Incompleto</option>
                  <option value="superior-completo">Superior Completo</option>
                  <option value="pos-graduacao">Pós-Graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="ensino-list">Instituições de Ensino</Label>
                <div className="space-y-2">
                  {academicData.instituicoes.map((inst, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-3">
                      <Input
                        value={inst.nome}
                        onChange={(e) => {
                          const newInst = [...academicData.instituicoes];
                          newInst[idx] = { ...newInst[idx]!, nome: e.target.value } as any;
                          setAcademicData((prev) => ({ ...prev, instituicoes: newInst }));
                        }}
                        placeholder="Nome da instituição"
                      />
                      <Input
                        value={inst.curso}
                        onChange={(e) => {
                          const newInst = [...academicData.instituicoes];
                          newInst[idx] = { ...newInst[idx]!, curso: e.target.value } as any;
                          setAcademicData((prev) => ({ ...prev, instituicoes: newInst }));
                        }}
                        placeholder="Curso"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={inst.anoConclusao}
                          onChange={(e) => {
                            const newInst = [...academicData.instituicoes];
                            newInst[idx] = { ...newInst[idx]!, anoConclusao: e.target.value } as any;
                            setAcademicData((prev) => ({ ...prev, instituicoes: newInst }));
                          }}
                          placeholder="Ano de conclusão"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newInst = academicData.instituicoes.filter((_, i) => i !== idx);
                            setAcademicData((prev) => ({ ...prev, instituicoes: newInst }));
                          }}
                          className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAcademicData((prev) => ({
                        ...prev,
                        instituicoes: [...prev.instituicoes, { nome: "", curso: "", anoConclusao: "" }],
                      }));
                    }}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Adicionar Instituição
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="cursos-list">Cursos/Especializações</Label>
                <div className="space-y-2">
                  {academicData.cursos.map((curso, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={curso}
                        onChange={(e) => {
                          const newCursos = [...academicData.cursos];
                          newCursos[idx] = e.target.value;
                          setAcademicData((prev) => ({ ...prev, cursos: newCursos }));
                        }}
                        placeholder="Nome do curso/especialização"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCursos = academicData.cursos.filter((_, i) => i !== idx);
                          setAcademicData((prev) => ({ ...prev, cursos: newCursos }));
                        }}
                        className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAcademicData((prev) => ({ ...prev, cursos: [...prev.cursos, ""] }));
                    }}
                  >
                    Adicionar Curso
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="certifications-list">Certificações</Label>
                <div className="space-y-2">
                  {academicData.certificacoes.map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={cert.nome}
                        onChange={(e) => {
                          const newCerts = [...academicData.certificacoes];
                          newCerts[idx] = { ...newCerts[idx], nome: e.target.value };
                          setAcademicData((prev) => ({ ...prev, certificacoes: newCerts }));
                        }}
                        placeholder="Nome da certificação"
                        className="flex-1"
                      />
                      <label
                        htmlFor={`cert-upload-${idx}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
                        title="Upload de certificado"
                      >
                        <Upload className="h-4 w-4" />
                        <input
                          id={`cert-upload-${idx}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newCerts = [...academicData.certificacoes];
                              newCerts[idx] = { ...newCerts[idx]!, arquivo: file } as any;
                              setAcademicData((prev) => ({ ...prev, certificacoes: newCerts }));
                            }
                          }}
                        />
                      </label>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                          title="Ver certificado"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newCerts = academicData.certificacoes.filter((_, i) => i !== idx);
                          setAcademicData((prev) => ({ ...prev, certificacoes: newCerts }));
                        }}
                        className="flex h-10 w-10 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAcademicData((prev) => ({
                        ...prev,
                        certificacoes: [...prev.certificacoes, { nome: "" }],
                      }));
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Certificação
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="languages-list">Idiomas</Label>
                <div className="space-y-2">
                  {academicData.idiomas.map((idioma, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-2">
                      <Input
                        value={idioma.idioma}
                        onChange={(e) => {
                          const newIdiomas = [...academicData.idiomas];
                          newIdiomas[idx] = { ...newIdiomas[idx]!, idioma: e.target.value } as any;
                          setAcademicData((prev) => ({ ...prev, idiomas: newIdiomas }));
                        }}
                        placeholder="Idioma"
                      />
                      <div className="flex gap-2">
                        <select
                          value={idioma.nivel}
                          onChange={(e) => {
                            const newIdiomas = [...academicData.idiomas];
                            newIdiomas[idx] = { ...newIdiomas[idx]!, nivel: e.target.value } as any;
                            setAcademicData((prev) => ({ ...prev, idiomas: newIdiomas }));
                          }}
                          className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                        >
                          <option value="">Nível</option>
                          <option value="basico">Básico</option>
                          <option value="intermediario">Intermediário</option>
                          <option value="avancado">Avançado</option>
                          <option value="fluente">Fluente</option>
                          <option value="nativo">Nativo</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const newIdiomas = academicData.idiomas.filter((_, i) => i !== idx);
                            setAcademicData((prev) => ({ ...prev, idiomas: newIdiomas }));
                          }}
                          className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAcademicData((prev) => ({
                        ...prev,
                        idiomas: [...prev.idiomas, { idioma: "", nivel: "" }],
                      }));
                    }}
                  >
                    Adicionar Idioma
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "financial" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Financeiro</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={financialData.banco}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, banco: e.target.value }))}
                  placeholder="Nome do banco"
                />
              </div>

              <div>
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={financialData.agencia}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, agencia: e.target.value }))}
                  placeholder="0000"
                />
              </div>

              <div>
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  value={financialData.conta}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, conta: e.target.value }))}
                  placeholder="00000-0"
                />
              </div>

              <div>
                <Label htmlFor="tipo-conta">Tipo de Conta</Label>
                <select
                  id="tipo-conta"
                  value={financialData.tipoConta}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, tipoConta: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="Corrente">Corrente</option>
                  <option value="Poupança">Poupança</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pix">PIX (Chave)</Label>
                <Input
                  id="pix"
                  value={financialData.pix}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, pix: e.target.value }))}
                  placeholder="Chave PIX"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="irpf">Informações de Imposto de Renda</Label>
                <textarea
                  id="irpf"
                  value={financialData.irpf}
                  onChange={(e) => setFinancialData((prev) => ({ ...prev, irpf: e.target.value }))}
                  placeholder="Informações adicionais sobre IRPF (opcional)"
                  className="flex min-h-[80px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Segurança</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="status-conta">Status da Conta</Label>
                <select
                  id="status-conta"
                  value={securityData.statusConta}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      statusConta: e.target.value as typeof securityData.statusConta,
                    }))
                  }
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              <div>
                <Label htmlFor="ultimo-acesso">Data de Último Acesso</Label>
                <Input
                  id="ultimo-acesso"
                  type="datetime-local"
                  value={securityData.ultimoAcesso}
                  onChange={(e) => setSecurityData((prev) => ({ ...prev, ultimoAcesso: e.target.value }))}
                  disabled
                  className="bg-white/5 text-white/50"
                />
              </div>

              <div>
                <Label htmlFor="ip-ultimo-acesso">IP de Último Acesso</Label>
                <Input
                  id="ip-ultimo-acesso"
                  value={securityData.ipUltimoAcesso}
                  onChange={(e) => setSecurityData((prev) => ({ ...prev, ipUltimoAcesso: e.target.value }))}
                  disabled
                  className="bg-white/5 text-white/50"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="connected-devices">Dispositivos Conectados</Label>
                <div className="space-y-2">
                  {securityData.dispositivos.length === 0 ? (
                    <p className="text-sm text-white/50">Nenhum dispositivo conectado</p>
                  ) : (
                    securityData.dispositivos.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{device.nome}</p>
                          <p className="text-xs text-white/50">{device.ip}</p>
                          <p className="text-xs text-white/40">
                            Última atividade: {new Date(device.ultimaAtividade).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Desconectar
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="active-sessions">Sessões Ativas</Label>
                <div className="space-y-2">
                  {securityData.sessoesAtivas.length === 0 ? (
                    <p className="text-sm text-white/50">Nenhuma sessão ativa</p>
                  ) : (
                    securityData.sessoesAtivas.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{session.dispositivo}</p>
                          <p className="text-xs text-white/50">{session.ip}</p>
                          <p className="text-xs text-white/40">
                            Início: {new Date(session.inicio).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Encerrar Sessão
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="password-history">Histórico de Senhas</Label>
                <div className="space-y-2">
                  {securityData.historicoSenhas.length === 0 ? (
                    <p className="text-sm text-white/50">Nenhum histórico disponível</p>
                  ) : (
                    securityData.historicoSenhas.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            Alterada em {new Date(hist.data).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs text-white/50">IP: {hist.ip}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between border border-white/10 bg-white/5 p-4">
                  <div>
                    <Label htmlFor="two-factor">Autenticação de Dois Fatores (2FA)</Label>
                    <p className="text-xs text-white/50">Adicione uma camada extra de segurança à sua conta</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      id="two-factor"
                      type="checkbox"
                      checked={securityData.twoFactorEnabled}
                      onChange={(e) =>
                        setSecurityData((prev) => ({ ...prev, twoFactorEnabled: e.target.checked }))
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-white/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/20 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[hsl(var(--primary))] peer-checked:after:translate-x-full peer-focus:outline-none" />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="api-tokens">Tokens de API</Label>
                <div className="space-y-2">
                  {securityData.apiTokens.length === 0 ? (
                    <p className="text-sm text-white/50">Nenhum token de API criado</p>
                  ) : (
                    securityData.apiTokens.map((token) => (
                      <div
                        key={token.id}
                        className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{token.nome}</p>
                          <p className="text-xs text-white/50">
                            Criado em {new Date(token.criadoEm).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Revogar
                        </Button>
                      </div>
                    ))
                  )}
                  <Button type="button" variant="outline">
                    Criar Novo Token
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "preferences" && (
          <div className="space-y-6">
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">Preferências</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="idioma">Idioma</Label>
                <select
                  id="idioma"
                  value={preferencesData.idioma}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, idioma: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tema">Tema</Label>
                <select
                  id="tema"
                  value={preferencesData.tema}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, tema: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="formato-data">Formato de Data</Label>
                <select
                  id="formato-data"
                  value={preferencesData.formatoData}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, formatoData: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="formato-hora">Formato de Hora</Label>
                <select
                  id="formato-hora"
                  value={preferencesData.formatoHora}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, formatoHora: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="24h">24 horas</option>
                  <option value="12h">12 horas (AM/PM)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="fuso-horario">Fuso Horário</Label>
                <select
                  id="fuso-horario"
                  value={preferencesData.fusoHorario}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, fusoHorario: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="America/Sao_Paulo">America/São_Paulo (UTC-3)</option>
                  <option value="America/Manaus">America/Manaus (UTC-4)</option>
                  <option value="America/Rio_Branco">America/Rio_Branco (UTC-5)</option>
                  <option value="America/Noronha">America/Noronha (UTC-2)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notification-settings">Notificações</Label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Notificações por Email</p>
                      <p className="text-xs text-white/50">Receba notificações importantes por email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesData.notificacoesEmail}
                      onChange={(e) =>
                        setPreferencesData((prev) => ({ ...prev, notificacoesEmail: e.target.checked }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                    />
                  </label>

                  <label className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Notificações Push</p>
                      <p className="text-xs text-white/50">Receba notificações no navegador</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesData.notificacoesPush}
                      onChange={(e) =>
                        setPreferencesData((prev) => ({ ...prev, notificacoesPush: e.target.checked }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                    />
                  </label>

                  <label className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Notificações In-App</p>
                      <p className="text-xs text-white/50">Receba notificações dentro do sistema</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesData.notificacoesInApp}
                      onChange={(e) =>
                        setPreferencesData((prev) => ({ ...prev, notificacoesInApp: e.target.checked }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="assinatura-email">Assinatura de Email</Label>
                <textarea
                  id="assinatura-email"
                  value={preferencesData.assinaturaEmail}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, assinaturaEmail: e.target.value }))}
                  placeholder="Assinatura que será adicionada aos seus emails"
                  className="flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => { }}>
            Descartar Alterações
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("Deseja salvar e enviar convite de ativação para o usuário?")) return;
              await handleSave();
              // TODO: Implementar envio de convite
              notificationCenter.add({
                type: "info",
                title: "Convite",
                message: "Funcionalidade de envio de convite será implementada em breve.",
              });
            }}
            disabled={saving}
          >
            Salvar e Enviar Convite
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("Deseja reenviar a senha temporária para o usuário?")) return;
              try {
                const headers = {
                  ...getAuthHeadersWithTenant(),
                  "Content-Type": "application/json",
                };
                const response = await fetch(`/api/users/${userId}/actions/resend-password`, {
                  method: "POST",
                  headers,
                });
                if (response.ok) {
                  notificationCenter.add({
                    type: "success",
                    title: "Senha Temporária",
                    message: "Senha temporária reenviada com sucesso.",
                  });
                  onUserUpdated();
                } else {
                  const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                  notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: error.error || "Não foi possível reenviar a senha temporária.",
                  });
                }
              } catch (e) {
                console.error(e);
                notificationCenter.add({
                  type: "error",
                  title: "Erro",
                  message: "Erro inesperado ao reenviar senha temporária.",
                });
              }
            }}
          >
            Reenviar Senha Temporária
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (
                !confirm(
                  "Tem certeza que deseja forçar o logout de todos os dispositivos? O usuário precisará fazer login novamente.",
                )
              )
                return;
              // TODO: Implementar forçar logout
              notificationCenter.add({
                type: "info",
                title: "Logout Forçado",
                message: "Funcionalidade de logout forçado será implementada em breve.",
              });
            }}
          >
            Forçar Logout de Todos os Dispositivos
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("Deseja suspender a conta deste usuário?")) return;
              try {
                const headers = {
                  ...getAuthHeadersWithTenant(),
                  "Content-Type": "application/json",
                };
                const response = await fetch(`/api/users/${userId}/actions/suspend`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({ reason: "Suspensão manual pelo administrador" }),
                });
                if (response.ok) {
                  notificationCenter.add({
                    type: "success",
                    title: "Conta Suspensa",
                    message: "Conta suspensa com sucesso.",
                  });
                  onUserUpdated();
                } else {
                  const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                  notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: error.error || "Não foi possível suspender a conta.",
                  });
                }
              } catch (e) {
                console.error(e);
                notificationCenter.add({
                  type: "error",
                  title: "Erro",
                  message: "Erro inesperado ao suspender conta.",
                });
              }
            }}
          >
            Suspender Conta
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!confirm("Deseja reativar a conta deste usuário?")) return;
              try {
                const headers = {
                  ...getAuthHeadersWithTenant(),
                  "Content-Type": "application/json",
                };
                const response = await fetch(`/api/users/${userId}/actions/reactivate`, {
                  method: "POST",
                  headers,
                });
                if (response.ok) {
                  notificationCenter.add({
                    type: "success",
                    title: "Conta Reativada",
                    message: "Conta reativada com sucesso.",
                  });
                  onUserUpdated();
                } else {
                  const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                  notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: error.error || "Não foi possível reativar a conta.",
                  });
                }
              } catch (e) {
                console.error(e);
                notificationCenter.add({
                  type: "error",
                  title: "Erro",
                  message: "Erro inesperado ao reativar conta.",
                });
              }
            }}
          >
            Reativar Conta
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              const reason = prompt("Digite o motivo da exclusão (obrigatório):");
              if (!reason || reason.trim() === "") {
                notificationCenter.add({
                  type: "error",
                  title: "Motivo obrigatório",
                  message: "É necessário informar o motivo da exclusão.",
                });
                return;
              }
              if (!confirm(`Tem certeza que deseja EXCLUIR esta conta? Esta ação é irreversível!\n\nMotivo: ${reason}`))
                return;
              try {
                const headers = {
                  ...getAuthHeadersWithTenant(),
                  "Content-Type": "application/json",
                };
                const response = await fetch(`/api/users/${userId}/actions/delete`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({ reason }),
                });
                if (response.ok) {
                  notificationCenter.add({
                    type: "success",
                    title: "Conta Excluída",
                    message: "Conta excluída com sucesso.",
                  });
                  onUserUpdated();
                } else {
                  const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                  notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: error.error || "Não foi possível excluir a conta.",
                  });
                }
              } catch (e) {
                console.error(e);
                notificationCenter.add({
                  type: "error",
                  title: "Erro",
                  message: "Erro inesperado ao excluir conta.",
                });
              }
            }}
          >
            Excluir Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
