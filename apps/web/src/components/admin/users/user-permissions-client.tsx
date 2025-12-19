"use client";

import { Button } from "@morina/ui";
import { Shield, ArrowLeft, CheckCircle2, XCircle, Building2, Briefcase, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { notificationCenter } from "@/components/notifications/notification-center";

interface UserPermissionsClientProps {
  userId: string;
}

export function UserPermissionsClient({ userId }: UserPermissionsClientProps) {
  const router = useRouter();
  const { user, loading: loadingUser, fetchUser } = useUser(userId);
  const { permissions, effectivePermissions, loading, fetchPermissions, assignPermission, removePermission } =
    useUserPermissions(userId);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
      fetchPermissions();
    }
  }, [userId, fetchUser, fetchPermissions]);

  const handleTogglePermission = async (permissionId: string, granted: boolean) => {
    try {
      if (granted) {
        await assignPermission({ permissionId, granted: true });
      } else {
        await removePermission(permissionId);
      }
      notificationCenter.add({
        type: "success",
        title: "Permissão Atualizada",
        message: "Permissão atualizada com sucesso",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível atualizar a permissão",
      });
    }
  };

  // Group permissions by module
  const permissionsByModule = effectivePermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof effectivePermissions>);

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Permissões do Usuário
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {user?.displayName || "Carregando..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => router.push(`/admin/users/${userId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Permissions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando permissões...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(permissionsByModule).map(([module, perms]) => (
            <motion.div
              key={module}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
            >
              <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                {module}
              </h2>
              <div className="space-y-3">
                {perms.map((perm) => (
                  <div
                    key={perm.permissionId}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-medium text-white/90">{perm.permissionName}</h3>
                        {perm.granted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-white/50">{perm.permissionCode}</p>
                      {perm.sources.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          {perm.sources.map((source, idx) => {
                            const Icon =
                              source.type === "department"
                                ? Building2
                                : source.type === "sector"
                                  ? Briefcase
                                  : source.type === "position"
                                    ? User
                                    : Shield;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              >
                                <Icon className="h-3 w-3" />
                                {source.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perm.granted}
                        onChange={(e) => handleTogglePermission(perm.permissionId, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/30" />
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
