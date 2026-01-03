"use client";

import { Button } from "@morina/ui";
import {
  User,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser, type UpdateUserRequest } from "@/hooks/use-user";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { UserStatusBadge } from "./user-status-badge";
import { QRCodeBadge } from "./qr-code-badge";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

interface UsersEditClientProps {
  userId: string;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  departmentId?: string;
  sectorId?: string;
  positionId?: string;
}

export function UsersEditClient({ userId }: UsersEditClientProps) {
  const router = useRouter();
  const { user, loading: loadingUser, error, fetchUser, updateUser, loading: saving } = useUser(userId);

  // Form data
  const [formData, setFormData] = useState<UpdateUserRequest & {
    displayName: string;
    email: string;
    departmentId?: string;
    sectorId?: string;
  }>({
    displayName: "",
    email: "",
    status: "active",
    departmentId: "",
    sectorId: "",
    positionId: "",
  });

  // UI State
  const [errors, setErrors] = useState<FormErrors>({});

  // Organizational data
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [sectors, setSectors] = useState<Array<{ id: string; name: string; departmentId: string }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; name: string; sectorId: string }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Load user data
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        status: user.status || "active",
        departmentId: user.departmentId || "",
        sectorId: user.sectorId || "",
        positionId: user.positionId || "",
      });
    }
  }, [user]);

  // Load organizational data
  useEffect(() => {
    const loadData = async () => {
      setLoadingOrgs(true);
      try {
        const [deptsData, sectorsData, positionsData] = await Promise.all([
          organizationalStructureApi.getDepartments(),
          organizationalStructureApi.getSectors(),
          organizationalStructureApi.getPositions(),
        ]);
        setDepartments(Array.isArray(deptsData) ? deptsData : []);
        setSectors(Array.isArray(sectorsData) ? sectorsData : []);
        setPositions(Array.isArray(positionsData) ? positionsData : []);
      } catch (error) {
        console.error("Erro ao carregar dados organizacionais:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao Carregar",
          message: "Não foi possível carregar a estrutura organizacional",
        });
      } finally {
        setLoadingOrgs(false);
      }
    };
    loadData();
  }, []);

  // Filter sectors by department
  const filteredSectors = sectors.filter((s) => s.departmentId === formData.departmentId);

  // Filter positions by sector
  const filteredPositions = positions.filter((p) => p.sectorId === formData.sectorId);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.displayName?.trim()) {
      newErrors.displayName = "Nome completo é obrigatório";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
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
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        notificationCenter.add({
          type: "error",
          title: "Erro de Validação",
          message: "Por favor, corrija os erros no formulário",
        });
        return;
      }

      try {
        const userData: UpdateUserRequest = {
          displayName: formData.displayName,
          status: formData.status,
          departmentId: formData.departmentId,
          sectorId: formData.sectorId,
          positionId: formData.positionId,
        };

        await updateUser(userId, userData);

        notificationCenter.add({
          type: "success",
          title: "Usuário Atualizado",
          message: `Usuário ${formData.displayName} atualizado com sucesso!`,
        });

        router.push(`/admin/users/${userId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar usuário";
        notificationCenter.add({
          type: "error",
          title: "Erro ao Atualizar Usuário",
          message: errorMessage,
        });
      }
    },
    [formData, validateForm, updateUser, userId, router]
  );

  if (loadingUser) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Usuário não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AllowedGuard I="update" a="User" redirectTo="/admin/users">
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
            {/* Bordas decorativas */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-3">
                <User className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Editar Usuário
                  </h1>
                  <p className="text-sm text-white/60 font-medium mt-1">
                    Atualizar informações do usuário {user.displayName}
                  </p>
                </div>
                <UserStatusBadge status={user.status} />
              </div>
            </div>
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
              <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FuturisticInput
                  label="Nome Completo"
                  required
                  value={formData.displayName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, displayName: e.target.value }));
                    if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
                  }}
                  error={!!errors.displayName}
                  errorMessage={errors.displayName}
                />
                <FuturisticInput
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value.toLowerCase() }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={!!errors.email}
                  errorMessage={errors.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <FuturisticSelect
                  label="Status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active" className="bg-[#1a1f3a]">Ativo</option>
                  <option value="inactive" className="bg-[#1a1f3a]">Inativo</option>
                  <option value="suspended" className="bg-[#1a1f3a]">Suspenso</option>
                  <option value="pending" className="bg-[#1a1f3a]">Pendente</option>
                </FuturisticSelect>
              </div>
            </div>

            {/* Dados Organizacionais */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                Dados Organizacionais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FuturisticSelect
                  label="Departamento"
                  required
                  value={formData.departmentId}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                      sectorId: "",
                      positionId: "",
                    }));
                    if (errors.departmentId) setErrors((prev) => ({ ...prev, departmentId: undefined }));
                  }}
                  error={!!errors.departmentId}
                  errorMessage={errors.departmentId}
                  disabled={loadingOrgs}
                >
                  <option value="" className="bg-[#1a1f3a]">Selecione um departamento</option>
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
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      sectorId: e.target.value,
                      positionId: "",
                    }));
                    if (errors.sectorId) setErrors((prev) => ({ ...prev, sectorId: undefined }));
                  }}
                  error={!!errors.sectorId}
                  errorMessage={errors.sectorId}
                  disabled={!formData.departmentId || loadingOrgs}
                >
                  <option value="" className="bg-[#1a1f3a]">
                    {!formData.departmentId ? "Selecione um departamento primeiro" : "Selecione um setor"}
                  </option>
                  {filteredSectors.map((sector) => (
                    <option key={sector.id} value={sector.id} className="bg-[#1a1f3a]">
                      {sector.name}
                    </option>
                  ))}
                </FuturisticSelect>
                <FuturisticSelect
                  label="Cargo"
                  required
                  value={formData.positionId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, positionId: e.target.value }));
                    if (errors.positionId) setErrors((prev) => ({ ...prev, positionId: undefined }));
                  }}
                  error={!!errors.positionId}
                  errorMessage={errors.positionId}
                  disabled={!formData.sectorId || loadingOrgs}
                >
                  <option value="" className="bg-[#1a1f3a]">
                    {!formData.sectorId ? "Selecione um setor primeiro" : "Selecione um cargo"}
                  </option>
                  {filteredPositions.map((position) => (
                    <option key={position.id} value={position.id} className="bg-[#1a1f3a]">
                      {position.name}
                    </option>
                  ))}
                </FuturisticSelect>
              </div>
            </div>
          </motion.div>

          {/* Foto e Crachá */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Photo Upload */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                Foto de Perfil
              </h2>
              <PhotoUpload
                currentPhoto={user.photoUrl}
                userName={user.displayName}
                onPhotoChange={(file) => {
                  console.log("Photo selected:", file);
                  // Upload logic would go here
                }}
              />
            </div>

            {/* QR Code Badge */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                Crachá Digital
              </h2>
              <QRCodeBadge
                user={{
                  ...user,
                  name: user.displayName,
                  department: departments.find(d => d.id === formData.departmentId)?.name || "N/A",
                  position: positions.find(p => p.id === formData.positionId)?.name || "N/A",
                  branch: "Matriz",
                }}
              />
            </div>
          </motion.div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-6"
                onClick={() => router.push(`/admin/users/${userId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </motion.div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </AllowedGuard>
  );
}
