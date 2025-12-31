"use client";

import { Button } from "@morina/ui";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Grid,
  List as ListIcon,
  X,
  UserCheck,
  UserX,
  Clock,
  MoreVertical,
  Lock,
  Smartphone,
  Sparkles,
  CheckCircle2,
  FileText,
  Camera,
  QrCode,
  ArrowLeft,
  ExternalLink,
  Download
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUsers, type User } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import { UserStatusBadge } from "./user-status-badge";
import { UserSkeleton } from "./UserSkeleton";
import { useBulkActions } from "@/hooks/use-bulk-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  Input,
  Label
} from "@morina/ui";
import { usersApi } from "@/lib/api/users";
import { PhotoUpload } from "./photo-upload";
import { QRCodeBadge } from "./qr-code-badge";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";


type StatusFilter = "all" | "active" | "inactive" | "suspended" | "pending";

function CircularProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

export function UsersListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [search, setSearch] = useState(searchParams?.get("busca") || "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>((searchParams?.get("status") as StatusFilter) || "all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(Number(searchParams?.get("page")) || 1);
  const [limit] = useState(Number(searchParams?.get("limit")) || 20);

  const debouncedSearch = useDebounce(search, 400);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());

    if (debouncedSearch) params.set("busca", debouncedSearch);
    else params.delete("busca");

    if (statusFilter !== "all") params.set("status", statusFilter);
    else params.delete("status");

    if (page > 1) params.set("page", page.toString());
    else params.delete("page");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, statusFilter, page, pathname, router, searchParams]);


  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filters Memoized
  const userQueryParams = useMemo(() => ({
    busca: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit,
  }), [debouncedSearch, statusFilter, page, limit]);

  const { users, loading, total, refetch } = useUsers(userQueryParams);

  const { activateUsers, deactivateUsers, suspendUsers, deleteUsers } = useBulkActions(
    useMemo(() => ({
      onSuccess: () => {
        setSelectedUserIds(new Set());
        refetch();
      },
    }), [refetch])
  );

  const stats = useMemo(() => ({
    total: total || 0,
    active: users?.filter((u) => u.status === "active").length || 0,
    inactive: users?.filter((u) => u.status === "inactive").length || 0,
    pending: users?.filter((u) => u.status === "pending").length || 0,
  }), [users, total]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await usersApi.resetPassword(userId);
      showNotification("Reset de senha enviado com sucesso!", "success");
    } catch {
      showNotification("Erro ao resetar senha.", "error");
    }
  };

  const handleToggle2FA = async (user: User) => {
    try {
      if (user.has2FA) {
        await usersApi.disable2FA(user.userId);
        showNotification("2FA Desativado.", "success");
      } else {
        await usersApi.enable2FA(user.userId);
        showNotification("2FA Ativado.", "success");
      }
      refetch();
    } catch {
      showNotification("Erro ao alterar 2FA.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard title="Total" value={stats.total} total={stats.total} color="#60a5fa" />
        <StatCard title="Ativos" value={stats.active} total={stats.total} color="#4ade80" />
        <StatCard title="Inativos" value={stats.inactive} total={stats.total} color="#9ca3af" />
        <StatCard title="Pendentes" value={stats.pending} total={stats.total} color="#facc15" />
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[hsl(var(--primary))]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[hsl(var(--primary)/0.5)] transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>

          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />

          <Button onClick={() => router.push("/admin/users/new")} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white gap-2">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <UserSkeleton variant={viewMode} count={8} />
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4">
          <Users className="h-16 w-16 opacity-20" />
          <p>Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
          {users.map((user) => (
            <UserCard
              key={user.userId}
              user={user}
              viewMode={viewMode}
              isSelected={selectedUserIds.has(user.userId)}
              onSelect={() => toggleUserSelection(user.userId)}
              onView={() => setSelectedUser(user)}
              onEdit={() => router.push(`/admin/users/${user.userId}/edit`)}
              onResetPassword={() => handleResetPassword(user.userId)}
              onToggle2FA={() => handleToggle2FA(user)}
            />
          ))}
        </div>
      )}

      {/* Drawers & Modals */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onResetPassword={() => handleResetPassword(selectedUser.userId)}
            onEdit={() => router.push(`/admin/users/${selectedUser.userId}/edit`)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3 z-50 border ${notification.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
          >
            {notification.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, total, color }: { title: string; value: number; total: number; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div>
        <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">{title}</h4>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
      </div>
      <CircularProgress value={value} max={total} color={color} size={48} />
    </div>
  );
}

function UserCard({ user, viewMode, isSelected, onSelect, onView, onEdit, onResetPassword, onToggle2FA }: any) {
  const router = useRouter();

  const Actions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0A0D14] border-white/10 text-white">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="mr-2 h-4 w-4" /> Detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onResetPassword(); }}>
          <Lock className="mr-2 h-4 w-4" /> Resetar Senha
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggle2FA(); }}>
          <Smartphone className="mr-2 h-4 w-4" /> {user.has2FA ? "Desativar 2FA" : "Ativar 2FA"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onView}
        className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20"
          }`}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded border-white/20 bg-white/5 cursor-pointer accent-[hsl(var(--primary))]" />
        </div>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white/80 font-bold border border-white/10">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : user.displayName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <div className="font-semibold text-white/90 truncate">{user.displayName}</div>
            <div className="text-xs text-white/50 truncate">{user.email}</div>
          </div>
          <div className="hidden md:block">
            <UserStatusBadge status={user.status} />
          </div>
          <div className="hidden md:block text-sm text-white/60 truncate">
            {user.departmentName || <span className="text-white/20">Sem depto</span>}
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar Rápido</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Actions />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onView}
      className={`group relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-2xl ${isSelected ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1"
        }`}
    >
      <div className="absolute top-4 right-4 z-10">
        <Actions />
      </div>
      <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded border-white/20 bg-white/5 cursor-pointer accent-[hsl(var(--primary))]" />
      </div>

      <div className="flex flex-col items-center flex-1 pt-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/10 flex items-center justify-center text-xl font-bold text-white mb-3 shadow-lg">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : user.displayName.charAt(0)}
        </div>
        <h3 className="font-bold text-white text-center truncate w-full px-2">{user.displayName}</h3>
        <p className="text-xs text-white/50 mb-3 truncate w-full text-center">{user.email}</p>
        <UserStatusBadge status={user.status} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm text-white/60">
        <div className="flex justify-between">
          <span>Cargo</span>
          <span className="text-white/80">{user.positionName || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>Depto</span>
          <span className="text-white/80">{user.departmentName || "-"}</span>
        </div>
      </div>
    </motion.div>
  );
}

function UserDrawer({ user, onClose, onResetPassword, onEdit }: any) {
  const [activeTab, setActiveTab] = useState<"info" | "photo" | "qrcode" | "resume">("info");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handlePhotoChange = (file: File | null) => {
    // TODO: Implement actual upload logic to API
    console.log("Photo changed:", file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === id
        ? "bg-white/10 text-white"
        : "text-white/40 hover:text-white hover:bg-white/5"
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0A0D14] border-l border-white/10 shadow-2xl flex flex-col"
      >
        <div className="relative h-32 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
          <div className="absolute top-4 left-4">
            {activeTab !== "info" && (
              <Button variant="ghost" size="icon" onClick={() => setActiveTab("info")} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 -mt-12 flex flex-col flex-1 overflow-y-auto pb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-[#0A0D14] bg-gray-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl relative group cursor-pointer" onClick={() => setActiveTab("photo")}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : user.displayName.charAt(0)}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white text-center">{user.displayName}</h2>
            <p className="text-white/50">{user.email}</p>
            <div className="mt-2">
              <UserStatusBadge status={user.status} />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 gap-2 mb-6 bg-white/5 p-1 rounded-xl">
            <TabButton id="info" icon={Eye} label="Detalhes" />
            <TabButton id="photo" icon={Camera} label="Foto" />
            <TabButton id="qrcode" icon={QrCode} label="Crachá" />
            <TabButton id="resume" icon={FileText} label="Currículo" />
          </div>

          <div className="space-y-6">
            {activeTab === "info" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Quick Actions for Info */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white h-auto py-3 flex flex-col gap-2" onClick={onEdit}>
                    <Edit className="h-5 w-5 opacity-70" />
                    <span className="text-xs">Editar Dados</span>
                  </Button>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white h-auto py-3 flex flex-col gap-2" onClick={onResetPassword}>
                    <Lock className="h-5 w-5 opacity-70" />
                    <span className="text-xs">Resetar Senha</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">Informações Profissionais</h3>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Departamento</span>
                      <span className="text-white">{user.departmentName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Cargo</span>
                      <span className="text-white">{user.positionName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Admissão</span>
                      <span className="text-white">{user.admissionDate ? new Date(user.admissionDate).toLocaleDateString() : "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">Acesso e Segurança</h3>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">2FA</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${user.has2FA ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {user.has2FA ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Último Login</span>
                      <span className="text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Nunca"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "photo" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 className="text-lg font-bold text-white mb-4 text-center">Atualizar Foto de Perfil</h3>
                <PhotoUpload
                  currentPhoto={user.avatarUrl}
                  userName={user.displayName}
                  onPhotoChange={handlePhotoChange}
                />
              </motion.div>
            )}

            {activeTab === "qrcode" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <h3 className="text-lg font-bold text-white mb-4 text-center">Identidade Digital</h3>
                <QRCodeBadge
                  userId={user.userId}
                  name={user.displayName}
                  email={user.email}
                  position={user.positionName}
                  department={user.departmentName}
                  photo={user.avatarUrl}
                />
              </motion.div>
            )}

            {activeTab === "resume" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Currículo Profissional</h3>

                <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleResumeChange}
                  />
                  <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-medium mb-1">
                    {resumeFile ? resumeFile.name : "Clique para fazer upload"}
                  </h4>
                  <p className="text-white/40 text-sm">
                    PDF ou DOCX (Max. 10MB)
                  </p>
                </div>

                {resumeFile && (
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Salvar Currículo
                    </Button>
                  </div>
                )}

                {!resumeFile && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 text-white/50">
                      <InfoIcon className="h-5 w-5" />
                      <span className="text-sm">Nenhum currículo anexado ainda.</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
}








