"use client";

import { Button } from "@morina/ui";
import { Clock, ArrowLeft, Filter, Calendar, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { getAuthHeadersWithTenant } from "@/lib/api/base";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface UserAuditClientProps {
  userId: string;
}

export function UserAuditClient({ userId }: UserAuditClientProps) {
  const router = useRouter();
  const { user, loading: loadingUser, fetchUser } = useUser(userId);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  return (
    <AllowedGuard I="read" a="User" redirectTo={`/admin/users/${userId}`}>
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
                <Clock className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Audit Log do Usuário
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

        {/* Audit Log Panel - Filtered by User */}
        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
          <p className="text-white/60 text-center py-12">
            O Audit Log completo será exibido aqui. Use o componente AuditLogPanel com filtros para entityType="user" e entityId="{userId}".
          </p>
        </div>
      </div>
    </AllowedGuard>
  );
}
