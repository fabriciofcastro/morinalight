"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Send,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";

export function ProfileTab() {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Foto e Identificação
    displayName: "Usuário",
    socialName: "",
    email: "usuario@morina.com.br",
    phone: "",
    bio: "",

    // Dados Pessoais
    fullName: "",
    cpf: "",
    rg: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    cityOfBirth: "",
    stateOfBirth: "",

    // Profissional
    position: "Cargo",
    sector: "Setor",
    department: "Departamento",
    supervisor: "",
    team: "",
    skills: [] as string[],
    objectives: "",

    // Acadêmico
    education: "",
    institutions: [] as string[],
    courses: [] as string[],
    certifications: [] as Array<{ nome: string; arquivo?: File | null; url?: string }>,
    languages: [] as Array<{ language: string; proficiency: string }>,

    // Social
    linkedin: "",
    github: "",
    portfolio: "",
    otherNetworks: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "basic" });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implementar salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Perfil atualizado com sucesso.",
    });
    setSaving(false);
  };

  const handleRequestPositionChange = () => {
    // TODO: Implementar workflow de solicitação
    notificationCenter.add({
      type: "info",
      title: "Solicitação de Mudança",
      message: "Workflow de solicitação será implementado em breve.",
    });
  };

  const handleRequestDataChange = () => {
    // TODO: Implementar workflow de solicitação
    notificationCenter.add({
      type: "info",
      title: "Solicitação de Alteração",
      message: "Workflow de solicitação será implementado em breve.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Foto e Identificação */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Foto e Identificação</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden border-2 border-white/20 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {formData.displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Alterar Foto
              </Button>
              <p className="mt-1 text-xs text-white/50">JPG, PNG ou GIF. Máx. 5MB</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="display-name">Nome Completo *</Label>
              <Input
                id="display-name"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="social-name">Nome Social</Label>
              <Input
                id="social-name"
                value={formData.socialName}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialName: e.target.value }))}
                placeholder="Nome social (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
              <p className="mt-1 text-xs text-white/50">Email verificado ✓</p>
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio/Descrição Pessoal</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                className="flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags/Interesses</Label>
              <div className="mt-2 flex flex-wrap gap-2 mb-2">
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
      </GlassCard>

      {/* Dados Pessoais */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Dados Pessoais</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="full-name">Nome Completo</Label>
            <Input
              id="full-name"
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => setFormData((prev) => ({ ...prev, rg: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="birth-date">Data de Nascimento</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="birth-date"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gênero</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
              className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="prefer-not-to-say">Prefiro não informar</option>
            </select>
          </div>

          <div>
            <Label htmlFor="marital-status">Estado Civil</Label>
            <select
              id="marital-status"
              value={formData.maritalStatus}
              onChange={(e) => setFormData((prev) => ({ ...prev, maritalStatus: e.target.value }))}
              className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="">Selecione</option>
              <option value="single">Solteiro(a)</option>
              <option value="married">Casado(a)</option>
              <option value="divorced">Divorciado(a)</option>
              <option value="widowed">Viúvo(a)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidade</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData((prev) => ({ ...prev, nationality: e.target.value }))}
              placeholder="Brasileira"
            />
          </div>

          <div>
            <Label htmlFor="city-of-birth">Naturalidade (Cidade/Estado)</Label>
            <Input
              id="city-of-birth"
              value={`${formData.cityOfBirth}${formData.stateOfBirth ? `/${formData.stateOfBirth}` : ""}`}
              onChange={(e) => {
                const parts = e.target.value.split("/");
                setFormData((prev) => ({
                  ...prev,
                  cityOfBirth: parts[0] || "",
                  stateOfBirth: parts[1] || "",
                }));
              }}
              placeholder="São Paulo/SP"
            />
          </div>
        </div>
      </GlassCard>

      {/* Profissional */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Profissional</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Cargo Atual</Label>
              <div className="flex items-center gap-2">
                <Input value={formData.position} readOnly className="bg-white/5" />
                <Button type="button" variant="outline" size="sm" onClick={handleRequestPositionChange}>
                  <Send className="h-4 w-4" />
                  Solicitar Mudança
                </Button>
              </div>
            </div>

            <div>
              <Label>Setor</Label>
              <Input value={formData.sector} readOnly className="bg-white/5" />
            </div>

            <div>
              <Label>Departamento</Label>
              <Input value={formData.department} readOnly className="bg-white/5" />
            </div>

            <div>
              <Label>Supervisor</Label>
              <div className="flex items-center gap-2">
                <Input value={formData.supervisor || "Não definido"} readOnly className="bg-white/5" />
                {formData.supervisor && (
                  <Button type="button" variant="outline" size="sm">
                    Ver Perfil
                  </Button>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Equipe/Grupo</Label>
              <Input
                value={formData.team}
                onChange={(e) => setFormData((prev) => ({ ...prev, team: e.target.value }))}
                placeholder="Nome da equipe ou grupo"
              />
            </div>
          </div>

          <div>
            <Label>Competências/Habilidades</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-white/50 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Adicionar habilidade"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                    setNewSkill("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newSkill.trim()) {
                    setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                    setNewSkill("");
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="objectives">Objetivos Pessoais</Label>
            <textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
              placeholder="Descreva seus objetivos profissionais..."
              className="flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
            />
          </div>
        </div>
      </GlassCard>

      {/* Acadêmico */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Acadêmico</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="education">Escolaridade</Label>
            <select
              id="education"
              className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="">Selecione</option>
              <option value="elementary">Ensino Fundamental</option>
              <option value="high-school">Ensino Médio</option>
              <option value="technical">Técnico</option>
              <option value="bachelor">Superior</option>
              <option value="postgraduate">Pós-graduação</option>
              <option value="master">Mestrado</option>
              <option value="phd">Doutorado</option>
            </select>
          </div>

          <div>
            <Label>Instituições de Ensino</Label>
            <div className="mt-2 space-y-2">
              {formData.institutions.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={inst} readOnly className="bg-white/5" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        institutions: prev.institutions.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="Nome da instituição"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newInstitution.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        institutions: [...prev.institutions, newInstitution.trim()],
                      }));
                      setNewInstitution("");
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Certificações</Label>
            <div className="mt-2 space-y-2">
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={cert} readOnly className="bg-white/5" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        certifications: prev.certifications.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Nome da certificação"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newCertification.trim()) {
                      setFormData((prev) => ({
                        ...prev,
                        certifications: [...prev.certifications, newCertification.trim()],
                      }));
                      setNewCertification("");
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Social */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Redes Sociais</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                className="pl-10"
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="github">GitHub</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="github"
                type="url"
                value={formData.github}
                onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                className="pl-10"
                placeholder="https://github.com/seu-usuario"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="portfolio">Portfolio</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolio: e.target.value }))}
                className="pl-10"
                placeholder="https://seu-portfolio.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="other-networks">Outras Redes</Label>
            <Input
              id="other-networks"
              value={formData.otherNetworks}
              onChange={(e) => setFormData((prev) => ({ ...prev, otherNetworks: e.target.value }))}
              placeholder="Instagram, Twitter, etc."
            />
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleRequestDataChange}>
          <Send className="mr-2 h-4 w-4" />
          Solicitar Alteração de Dados
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}


