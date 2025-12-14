"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import { AlertTriangle, Calendar, FileText, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";

interface Document {
  id: string;
  tipo: "contrato-social" | "alvara" | "certidao" | "outro";
  nome: string;
  arquivo: File | null;
  url?: string;
  dataUpload: Date;
  validade?: Date;
  versao: number;
}

export function CompanyDocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [alvaraValidade, setAlvaraValidade] = useState<string>("");

  const handleUpload = (tipo: Document["tipo"], file: File) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      tipo,
      nome: file.name,
      arquivo: file,
      dataUpload: new Date(),
      versao: 1,
      validade: tipo === "alvara" && alvaraValidade ? new Date(alvaraValidade) : undefined,
    };
    setDocuments([...documents, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  // Calcular status de expiração
  const getExpirationStatus = (validade?: Date) => {
    if (!validade) return null;
    const now = new Date();
    const daysUntilExpiration = Math.ceil((validade.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: "expired", days: Math.abs(daysUntilExpiration), message: "Documento expirado" };
    }
    if (daysUntilExpiration <= 30) {
      return { status: "warning", days: daysUntilExpiration, message: `Expira em ${daysUntilExpiration} dia(s)` };
    }
    if (daysUntilExpiration <= 60) {
      return { status: "info", days: daysUntilExpiration, message: `Expira em ${daysUntilExpiration} dia(s)` };
    }
    return { status: "ok", days: daysUntilExpiration, message: `Válido por mais ${daysUntilExpiration} dia(s)` };
  };

  // Documentos com alertas
  const documentsWithAlerts = useMemo(() => {
    return documents.filter((doc) => {
      const status = getExpirationStatus(doc.validade);
      return status && (status.status === "expired" || status.status === "warning");
    });
  }, [documents]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Alertas de Expiração */}
      {documentsWithAlerts.length > 0 && (
        <GlassCard className="border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-400">Atenção: Documentos Próximos da Expiração</h4>
              <ul className="mt-2 space-y-1 text-xs text-yellow-300/80">
                {documentsWithAlerts.map((doc) => {
                  const status = getExpirationStatus(doc.validade);
                  return (
                    <li key={doc.id}>
                      • <strong>{doc.nome}</strong> - {status?.message}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Contrato Social */}
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Contrato Social</h3>
        <div className="flex flex-col gap-4">
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
            <Upload className="h-6 w-6 text-white/40" />
            <span className="text-sm text-white/60">Clique para fazer upload</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUpload("contrato-social", file);
                }
              }}
            />
          </label>
          <p className="text-xs text-white/40">
            PDF, DOC ou DOCX. Máximo 10MB. Versões anteriores serão mantidas no histórico.
          </p>
        </div>
      </GlassCard>

      {/* Alvará de Funcionamento */}
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Alvará de Funcionamento</h3>
        <div className="flex flex-col gap-4">
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
            <Upload className="h-6 w-6 text-white/40" />
            <span className="text-sm text-white/60">Clique para fazer upload</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUpload("alvara", file);
                }
              }}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="alvaraValidade">Data de Validade</Label>
              <Input
                id="alvaraValidade"
                type="date"
                value={alvaraValidade}
                onChange={(e) => setAlvaraValidade(e.target.value)}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
              />
              {alvaraValidade && (() => {
                const validade = new Date(alvaraValidade);
                const status = getExpirationStatus(validade);
                if (status && status.status === "expired") {
                  return (
                    <p className="mt-1 text-xs text-red-400">
                      ⚠️ Este documento já está expirado!
                    </p>
                  );
                }
                if (status && status.status === "warning") {
                  return (
                    <p className="mt-1 text-xs text-yellow-400">
                      ⚠️ Este documento expira em {status.days} dia(s)!
                    </p>
                  );
                }
                if (status && status.status === "info") {
                  return (
                    <p className="mt-1 text-xs text-blue-400">
                      ℹ️ Este documento expira em {status.days} dia(s)
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <p className="text-xs text-white/40">
            Você será notificado 30 dias antes da expiração. Alertas visuais aparecerão quando o documento estiver próximo do vencimento.
          </p>
        </div>
      </GlassCard>

      {/* Certidões */}
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Certidões</h3>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Certidão Negativa de Débitos (Federal)</Label>
              <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                <Upload className="h-5 w-5 text-white/40" />
                <span className="text-xs text-white/60">Upload</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload("certidao", file);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <Label>Certidão Negativa de Débitos (Estadual)</Label>
              <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                <Upload className="h-5 w-5 text-white/40" />
                <span className="text-xs text-white/60">Upload</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload("certidao", file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Histórico de Documentos */}
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Histórico de Documentos</h3>
        {documents.length === 0 ? (
          <div className="py-8 text-center text-white/50">
            <FileText className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-2 text-sm">Nenhum documento enviado ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-white/40" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{doc.nome}</span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
                        {doc.tipo === "contrato-social"
                          ? "Contrato Social"
                          : doc.tipo === "alvara"
                            ? "Alvará"
                            : doc.tipo === "certidao"
                              ? "Certidão"
                              : "Outro"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-white/40">
                      <span>Versão {doc.versao}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.dataUpload.toLocaleDateString("pt-BR")}
                      </div>
                      {doc.validade && (() => {
                        const status = getExpirationStatus(doc.validade);
                        return (
                          <>
                            <span>•</span>
                            <span className={cn(
                              "flex items-center gap-1",
                              status?.status === "expired" && "text-red-400",
                              status?.status === "warning" && "text-yellow-400",
                              status?.status === "info" && "text-blue-400",
                            )}>
                              {status?.status === "expired" && <AlertTriangle className="h-3 w-3" />}
                              {status?.status === "warning" && <AlertTriangle className="h-3 w-3" />}
                              Válido até {doc.validade.toLocaleDateString("pt-BR")}
                              {status && ` (${status.message})`}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                      title="Visualizar"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Descartar Alterações
        </Button>
        <Button type="button">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}

