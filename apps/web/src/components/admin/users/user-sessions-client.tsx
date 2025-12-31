"use client";

import { Button } from "@morina/ui";
import { LogOut, ArrowLeft, Monitor, MapPin, Clock, X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { useUserSessions } from "@/hooks/use-user-sessions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface UserSessionsClientProps {
  userId: string;
}

export function UserSessionsClient({ userId }: UserSessionsClientProps) {
  const router = useRouter();
  const { user, loading: loadingUser, fetchUser } = useUser(userId);
  const { sessions, loading, fetchSessions, revokeSession, revokeAllSessions } = useUserSessions(userId);

  // Revoke dialogs state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
      fetchSessions();
    }
  }, [userId, fetchUser, fetchSessions]);

  const handleRevokeSession = (sessionId: string) => {
    setSessionToRevoke(sessionId);
    setRevokeDialogOpen(true);
  };

  const confirmRevokeSession = async () => {
    if (!sessionToRevoke) return;
    setRevokeLoading(true);

    try {
      await revokeSession(sessionToRevoke);
      notificationCenter.add({
        type: "success",
        title: "Sessão Revogada",
        message: "A sessão foi revogada com sucesso",
      });
      setRevokeDialogOpen(false);
      setSessionToRevoke(null);
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível revogar a sessão",
      });
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleRevokeAll = () => {
    setRevokeAllDialogOpen(true);
  };

  const confirmRevokeAll = async () => {
    setRevokeLoading(true);

    try {
      await revokeAllSessions();
      notificationCenter.add({
        type: "success",
        title: "Sessões Revogadas",
        message: "Todas as sessões foram revogadas com sucesso",
      });
      setRevokeAllDialogOpen(false);
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível revogar as sessões",
      });
    } finally {
      setRevokeLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dia${days > 1 ? "s" : ""} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? "s" : ""} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? "s" : ""} atrás`;
    return "Agora";
  };

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
              <LogOut className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Sessões do Usuário
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
              {sessions.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[40px] px-4"
                    onClick={handleRevokeAll}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Revogar Todas
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando sessões...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <LogOut className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">Nenhuma sessão ativa</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <motion.div
              key={session.sessionId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Monitor className="h-5 w-5 text-white/60" />
                    <div>
                      <h3 className="text-base font-semibold text-white/90">
                        {session.device || "Dispositivo Desconhecido"}
                      </h3>
                      {session.isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30 mt-1">
                          Sessão Atual
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
                    {session.browser && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/50">Navegador:</span>
                        <span>{session.browser}</span>
                      </div>
                    )}
                    {session.os && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/50">Sistema:</span>
                        <span>{session.os}</span>
                      </div>
                    )}
                    {session.ipAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/50" />
                        <span>{session.ipAddress}</span>
                        {session.location && <span className="text-white/50">• {session.location}</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span>Criada: {formatDate(session.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span>Última atividade: {getRelativeTime(session.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
                    onClick={() => handleRevokeSession(session.sessionId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={revokeDialogOpen}
        onOpenChange={(open) => {
          setRevokeDialogOpen(open);
          if (!open) setSessionToRevoke(null);
        }}
        onConfirm={confirmRevokeSession}
        title="Revogar Sessão"
        description="Tem certeza que deseja revogar esta sessão? O dispositivo será desconectado imediatamente."
        confirmLabel="Revogar"
        variant="warning"
        isLoading={revokeLoading}
      />

      <ConfirmDialog
        open={revokeAllDialogOpen}
        onOpenChange={setRevokeAllDialogOpen}
        onConfirm={confirmRevokeAll}
        title="Revogar Todas as Sessões"
        description="Tem certeza que deseja revogar TODAS as sessões? O usuário será deslogado de todos os dispositivos imediatamente."
        confirmLabel="Revogar Todas"
        variant="destructive"
        isLoading={revokeLoading}
      />
    </div>
  );
}
