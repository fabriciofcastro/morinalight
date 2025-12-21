"use client";

import { Button } from "@morina/ui";
import {
  Tag,
  ArrowLeft,
  Edit,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { organizationalStructureApi, type BusinessSegment } from "@/lib/api/organizational-structure";

interface SegmentDetailClientProps {
  segmentId: string;
}

export function SegmentDetailClient({ segmentId }: SegmentDetailClientProps) {
  const router = useRouter();
  const [segment, setSegment] = useState<BusinessSegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const seg = await organizationalStructureApi.getBusinessSegment(segmentId);
        setSegment(seg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar segmento");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [segmentId]);

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando segmento...</p>
        </div>
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Segmento não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/admin/business-segments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
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
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Tag className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    {segment.code}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                      segment.active
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {segment.active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </>
                    )}
                  </span>
                </div>
                {segment.description && (
                  <p className="text-sm text-white/60 font-medium">{segment.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => router.push("/admin/business-segments")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px] px-4"
                  onClick={() => router.push(`/admin/business-segments/${segmentId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </motion.div>
              <div className="relative">
                <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Informações */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Dados Básicos</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/50 mb-1">Código</p>
                  <p className="text-base font-medium text-white font-mono">{segment.code}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      segment.active
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {segment.active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Informações</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/50 mb-1">Data de Criação</p>
                  <p className="text-base font-medium text-white">
                    {new Date(segment.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {new Date(segment.createdAt).toLocaleTimeString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Última Atualização</p>
                  <p className="text-base font-medium text-white">
                    {new Date(segment.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {new Date(segment.updatedAt).toLocaleTimeString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {segment.description && (
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/60" />
                Descrição
              </h3>
              <p className="text-base text-white/80 whitespace-pre-wrap">{segment.description}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}



