"use client";

import { Button } from "@morina/ui";
import { Activity, ArrowLeft, Clock, Filter, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useUserActivity } from "@/hooks/use-user-activity";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface UserActivityClientProps {
  userId: string;
}

export function UserActivityClient({ userId }: UserActivityClientProps) {
  const router = useRouter();
  const { user, loading: loadingUser, fetchUser } = useUser(userId);
  const { activities, loading, total, fetchActivities } = useUserActivity(userId, {
    page: 1,
    limit: 50,
  });

  const [filterAction, setFilterAction] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
      fetchActivities();
    }
  }, [userId, fetchUser, fetchActivities]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                <Activity className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Atividades do Usuário
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

        {/* Filters */}
        <div className="p-4 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                  <Filter className="h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    placeholder="Filtrar por ação..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                  <Calendar className="h-4 w-4 text-white/60" />
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-white/60">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
            <Activity className="h-12 w-12 mx-auto text-white/30 mb-4" />
            <p className="text-white/60">Nenhuma atividade registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-white/90">{activity.action}</h3>
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {activity.ipAddress || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.timestamp)}
                      </div>
                      {activity.userAgent && (
                        <span className="truncate max-w-md">{activity.userAgent}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AllowedGuard>
  );
}
