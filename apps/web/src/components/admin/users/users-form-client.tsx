"use client";

import { Button } from "@morina/ui";
import {
  UserPlus,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Building2,
  Mail,
  User,
  Upload,
  X,
  Key,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Shield,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, type CreateUserRequest } from "@/hooks/use-user";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { notificationCenter } from "@/components/notifications/notification-center";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";
import { permissionsApi } from "@/lib/api/permissions";
import { companySettingsAPI } from "@/lib/api/company-settings";

interface Department {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
  departmentId: string;
}

interface Position {
  id: string;
  name: string;
  sectorId?: string;
  code?: string;
}

interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  module: string;
}

export function UsersFormClient() {
  const router = useRouter();
  const { createUser, loading: creatingUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateUserRequest & {
    displayName: string;
    confirmPassword: string;
    cpf: string;
    phone: string;
    birthDate: string;
    admissionDate: string;
    observations: string;
    requirePasswordChange: boolean;
    sendWelcomeEmail: boolean;
    photoUrl?: string;
    initialPermissions: string[];
  }>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    status: "pending",
    departmentId: "",
    sectorId: "",
    positionId: "",
    cpf: "",
    phone: "",
    birthDate: "",
    admissionDate: "",
    observations: "",
    requirePasswordChange: false,
    sendWelcomeEmail: true,
    photoUrl: "",
    initialPermissions: [],
  });

  // Photo upload state
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);
  const [searchingCPF, setSearchingCPF] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Organizational data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await organizationalStructureApi.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error("Erro ao carregar departamentos:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    void loadDepartments();
  }, []);

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      if (!permissionsExpanded) return;
      
      setLoadingPermissions(true);
      try {
        const data = await permissionsApi.getPermissions();
        setPermissions(data);
      } catch (err) {
        console.error("Erro ao carregar permissões:", err);
      } finally {
        setLoadingPermissions(false);
      }
    };
    void loadPermissions();
  }, [permissionsExpanded]);

  // Load sectors when department is selected
  useEffect(() => {
    if (!formData.departmentId) {
      setSectors([]);
      setFormData((prev) => ({ ...prev, sectorId: "", positionId: "" }));
      return;
    }

    const loadSectors = async () => {
      setLoadingSectors(true);
      try {
        const data = await organizationalStructureApi.getSectors();
        const filtered = data.filter((s) => s.departmentId === formData.departmentId);
        setSectors(filtered);
        if (formData.sectorId && !filtered.find((s) => s.id === formData.sectorId)) {
          setFormData((prev) => ({ ...prev, sectorId: "", positionId: "" }));
        }
      } catch (err) {
        console.error("Erro ao carregar setores:", err);
      } finally {
        setLoadingSectors(false);
      }
    };
    void loadSectors();
  }, [formData.departmentId, formData.sectorId]);

  // Load positions when sector is selected
  useEffect(() => {
    if (!formData.sectorId) {
      setPositions([]);
      setFormData((prev) => ({ ...prev, positionId: "" }));
      return;
    }

    const loadPositions = async () => {
      setLoadingPositions(true);
      try {
        const data = await organizationalStructureApi.getPositions();
        const filtered = data.filter((p) => (p as { sectorId?: string }).sectorId === formData.sectorId);
        setPositions(filtered);
        // Reset positionId if current selection is not in filtered list
        setFormData((prev) => {
          if (prev.positionId && !filtered.find((p) => p.id === prev.positionId)) {
            return { ...prev, positionId: "" };
          }
          return prev;
        });
      } catch (err) {
        console.error("Erro ao carregar cargos:", err);
      } finally {
        setLoadingPositions(false);
      }
    };
    void loadPositions();
  }, [formData.sectorId, formData.positionId]);

  // CPF mask
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  // Phone mask
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  // Validate CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Generate email suggestion from name
  const generateEmailSuggestion = (name: string): string => {
    if (!name.trim()) return "";
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .join(".");
    return `${normalized}@empresa.com.br`;
  };

  // Generate random password
  const generatePassword = (): string => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    
    // Ensure at least one of each required type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%&*"[Math.floor(Math.random() * 7)];
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle
    return password.split("").sort(() => Math.random() - 0.5).join("");
  };

  // Search CPF via BrasilAPI
  const searchCPF = useCallback(async (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || !validateCPF(cpf)) {
      notificationCenter.add({
        type: "error",
        title: "CPF inválido",
        message: "Digite um CPF válido para buscar informações",
      });
      return;
    }

    setSearchingCPF(true);
    try {
      // Note: BrasilAPI não tem endpoint público para CPF por questões de privacidade
      // Esta é uma simulação - em produção, você pode usar uma API apropriada
      notificationCenter.add({
        type: "info",
        title: "Busca de CPF",
        message: "Funcionalidade em desenvolvimento. Por questões de privacidade, a busca de CPF requer API específica.",
      });
    } catch (err) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao buscar CPF",
        message: "Não foi possível buscar informações do CPF",
      });
    } finally {
      setSearchingCPF(false);
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (file: File) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo inválido",
        message: "Por favor, selecione uma imagem",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo muito grande",
        message: "A imagem deve ter no máximo 5MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploadingPhoto(true);
    try {
      const response = await companySettingsAPI.uploadFile(file, "document", "Foto de perfil do usuário");
      setFormData((prev) => ({ ...prev, photoUrl: response.url }));
      notificationCenter.add({
        type: "success",
        title: "Foto enviada",
        message: "Foto de perfil enviada com sucesso!",
      });
    } catch (err) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao enviar foto",
        message: "Não foi possível enviar a foto. Tente novamente.",
      });
      setPhotoPreview("");
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  // Remove photo
  const removePhoto = useCallback(() => {
    setPhotoPreview("");
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setFormData((prev) => {
      const hasPermission = prev.initialPermissions.includes(permissionId);
      return {
        ...prev,
        initialPermissions: hasPermission
          ? prev.initialPermissions.filter((id) => id !== permissionId)
          : [...prev.initialPermissions, permissionId],
      };
    });
  };

  // Password strength
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Fraca", color: "text-red-400" };
    if (strength <= 4) return { strength, label: "Média", color: "text-yellow-400" };
    return { strength, label: "Forte", color: "text-green-400" };
  };

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Nome completo é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Departamento é obrigatório";
    }

    if (!formData.sectorId) {
      newErrors.sectorId = "Setor é obrigatório";
    }

    if (!formData.positionId) {
      newErrors.positionId = "Cargo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent, createAnother = false) => {
      e.preventDefault();

      if (!validateForm()) {
        notificationCenter.add({
          type: "error",
          title: "Erro de validação",
          message: "Por favor, corrija os erros no formulário",
        });
        return;
      }

      try {
        // Extract only the fields needed for CreateUserRequest
        const userData: CreateUserRequest = {
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          status: formData.status,
          departmentId: formData.departmentId || undefined,
          sectorId: formData.sectorId || undefined,
          positionId: formData.positionId || undefined,
        };
        await createUser(userData);

        notificationCenter.add({
          type: "success",
          title: "Usuário criado",
          message: `Usuário ${formData.displayName} criado com sucesso!`,
        });

        if (createAnother) {
          // Reset form but keep organizational structure
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            displayName: "",
            status: "pending",
            departmentId: formData.departmentId,
            sectorId: formData.sectorId,
            positionId: formData.positionId,
            cpf: "",
            phone: "",
            birthDate: "",
            admissionDate: "",
            observations: "",
            requirePasswordChange: false,
            sendWelcomeEmail: true,
            photoUrl: "",
            initialPermissions: [],
          });
          setPhotoPreview("");
          setErrors({});
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          router.push("/admin/users");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar usuário";
        notificationCenter.add({
          type: "error",
          title: "Erro ao criar usuário",
          message: errorMessage,
        });
      }
    },
    [formData, validateForm, createUser, router]
  );

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-linear-to-br from-white/5 via-white/2 to-transparent backdrop-blur-xl shadow-2xl">
          {/* Bordas decorativas */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <UserPlus className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Criar Novo Usuário
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">Cadastre um novo usuário no sistema</p>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
        >
          {/* Dados Pessoais */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-bold text-white/90">Dados Pessoais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FuturisticInput
                label="Nome Completo"
                required
                value={formData.displayName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, displayName: e.target.value }));
                  if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: "" }));
                }}
                error={!!errors.displayName}
                errorMessage={errors.displayName}
                placeholder="Digite o nome completo"
              />
              <div>
                <FuturisticInput
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value.toLowerCase() }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  error={!!errors.email}
                  errorMessage={errors.email}
                  placeholder="usuario@exemplo.com"
                />
                {!formData.email && formData.displayName && (
                  <button
                    type="button"
                    onClick={() => {
                      const suggested = generateEmailSuggestion(formData.displayName);
                      setFormData((prev) => ({ ...prev, email: suggested }));
                    }}
                    className="mt-2 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))/0.8)] flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    Sugerir email
                  </button>
                )}
              </div>
              <div>
                <FuturisticInput
                  label="CPF"
                  required
                  value={formData.cpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    setFormData((prev) => ({ ...prev, cpf: formatted }));
                    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: "" }));
                  }}
                  error={!!errors.cpf}
                  errorMessage={errors.cpf}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {formData.cpf.replace(/\D/g, "").length === 11 && validateCPF(formData.cpf) && (
                  <button
                    type="button"
                    onClick={() => searchCPF(formData.cpf)}
                    disabled={searchingCPF}
                    className="mt-2 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))/0.8)] flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Search className="h-3 w-3" />
                    {searchingCPF ? "Buscando..." : "Buscar informações"}
                  </button>
                )}
              </div>
              <FuturisticInput
                label="Telefone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData((prev) => ({ ...prev, phone: formatted }));
                }}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <FuturisticInput
                label="Data de Nascimento"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
              />
              {/* Foto do Perfil */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Foto do Perfil <span className="text-white/40 text-xs">(Opcional)</span>
                </label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-lg border-2 border-white/20 bg-white/5 overflow-hidden">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 p-1 bg-red-500/90 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                        <User className="h-8 w-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(file);
                        }
                      }}
                      className="hidden"
                    />
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {photoPreview ? "Alterar Foto" : "Adicionar Foto"}
                        </>
                      )}
                    </motion.button>
                    <p className="mt-1 text-xs text-white/50">
                      Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dados de Acesso */}
          <div className="mb-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-bold text-white/90">Dados de Acesso</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FuturisticInput
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, password: e.target.value }));
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  error={!!errors.password}
                  errorMessage={errors.password}
                  placeholder="Mínimo 8 caracteres"
                />
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formData.password && (
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      Força: {passwordStrength.label}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newPassword = generatePassword();
                      setFormData((prev) => ({
                        ...prev,
                        password: newPassword,
                        confirmPassword: newPassword,
                      }));
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                      notificationCenter.add({
                        type: "success",
                        title: "Senha gerada",
                        message: "Uma senha segura foi gerada automaticamente",
                      });
                    }}
                    className="text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))/0.8)] flex items-center gap-1 transition-colors"
                  >
                    <Key className="h-3 w-3" />
                    Gerar senha
                  </button>
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.password);
                        notificationCenter.add({
                          type: "success",
                          title: "Senha copiada",
                          message: "Senha copiada para a área de transferência",
                        });
                      }}
                      className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </button>
                  )}
                </div>
              </div>
              <div>
                <FuturisticInput
                  label="Confirmar Senha"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  error={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword}
                  placeholder="Digite a senha novamente"
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <FuturisticSelect
                label="Status"
                required
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as typeof formData.status }))}
              >
                <option value="pending" className="bg-[#1a1f3a]">Pendente</option>
                <option value="active" className="bg-[#1a1f3a]">Ativo</option>
                <option value="inactive" className="bg-[#1a1f3a]">Inativo</option>
              </FuturisticSelect>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requirePasswordChange}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requirePasswordChange: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                  />
                  <span className="text-sm text-white/80">Requer troca de senha</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                  />
                  <span className="text-sm text-white/80">Enviar email de boas-vindas</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dados Organizacionais */}
          <div className="mb-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-bold text-white/90">Dados Organizacionais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FuturisticSelect
                label="Departamento"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value, sectorId: "", positionId: "" }))}
                error={!!errors.departmentId}
                errorMessage={errors.departmentId}
                disabled={loadingDepartments}
              >
                <option value="" className="bg-[#1a1f3a]">
                  {loadingDepartments ? "Carregando..." : "Selecione um departamento"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-[#1a1f3a]">
                    {dept.name}
                  </option>
                ))}
              </FuturisticSelect>
              <FuturisticSelect
                label="Setor"
                required
                value={formData.sectorId}
                onChange={(e) => setFormData((prev) => ({ ...prev, sectorId: e.target.value, positionId: "" }))}
                error={!!errors.sectorId}
                errorMessage={errors.sectorId}
                disabled={!formData.departmentId || loadingSectors}
              >
                <option value="" className="bg-[#1a1f3a]">
                  {loadingSectors ? "Carregando..." : formData.departmentId ? "Selecione um setor" : "Selecione primeiro o departamento"}
                </option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id} className="bg-[#1a1f3a]">
                    {sector.name}
                  </option>
                ))}
              </FuturisticSelect>
              <FuturisticSelect
                label="Cargo"
                required
                value={formData.positionId}
                onChange={(e) => setFormData((prev) => ({ ...prev, positionId: e.target.value }))}
                error={!!errors.positionId}
                errorMessage={errors.positionId}
                disabled={!formData.sectorId || loadingPositions}
              >
                <option value="" className="bg-[#1a1f3a]">
                  {loadingPositions ? "Carregando..." : formData.sectorId ? "Selecione um cargo" : "Selecione primeiro o setor"}
                </option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id} className="bg-[#1a1f3a]">
                    {position.name}
                  </option>
                ))}
              </FuturisticSelect>
              <FuturisticInput
                label="Data de Admissão"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, admissionDate: e.target.value }))}
              />
              <div className="md:col-span-2">
                <FuturisticTextarea
                  label="Observações"
                  value={formData.observations}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
                  placeholder="Observações adicionais sobre o usuário..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Permissões Iniciais (Colapsável) */}
          <div className="mb-8 pt-8 border-t border-white/10">
            <motion.button
              type="button"
              onClick={() => setPermissionsExpanded(!permissionsExpanded)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white/90">Permissões Iniciais</h2>
                  <p className="text-xs text-white/60">
                    {formData.initialPermissions.length > 0
                      ? `${formData.initialPermissions.length} permissão(ões) selecionada(s)`
                      : "Opcional - Configure permissões iniciais para o usuário"}
                  </p>
                </div>
              </div>
              {permissionsExpanded ? (
                <ChevronUp className="h-5 w-5 text-white/60" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white/60" />
              )}
            </motion.button>

            <AnimatePresence>
              {permissionsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5">
                    {loadingPermissions ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
                      </div>
                    ) : permissions.length === 0 ? (
                      <p className="text-white/60 text-center py-4">Nenhuma permissão disponível</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                          <div key={module} className="space-y-2">
                            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                              {module}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                              {modulePermissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.initialPermissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm text-white/80">{permission.name}</span>
                                    {permission.description && (
                                      <p className="text-xs text-white/50">{permission.description}</p>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Ações */}
        <div className="flex items-center justify-between gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-6"
              onClick={() => router.push("/admin/users")}
            >
              Cancelar
            </Button>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={creatingUser}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Salvar e Criar Outro
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={creatingUser}
                className="bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
