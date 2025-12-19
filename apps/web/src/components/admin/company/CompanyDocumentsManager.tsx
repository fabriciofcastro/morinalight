"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Calendar, X, CheckCircle2, AlertCircle, Download, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { formatFileSize } from "../../../lib/utils/image-processing";
import { notificationCenter } from "../../notifications/notification-center";

interface CompanyDocument {
  id: string;
  type: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
}

interface CompanyDocumentsManagerProps {
  documents?: CompanyDocument[];
  onDocumentsChange?: (documents: CompanyDocument[]) => void;
  className?: string;
}

const DOCUMENT_TYPES = [
  { value: "CONTRATO_SOCIAL", label: "Contrato Social", icon: "📄" },
  { value: "ATA_ASSEMBLEIA", label: "Ata de Assembleia", icon: "📋" },
  { value: "CERTIDAO_FEDERAL", label: "Certidão Negativa (Federal)", icon: "🏛️" },
  { value: "CERTIDAO_ESTADUAL", label: "Certidão Negativa (Estadual)", icon: "🏛️" },
  { value: "CERTIDAO_MUNICIPAL", label: "Certidão Negativa (Municipal)", icon: "🏛️" },
  { value: "ALVARA_FUNCIONAMENTO", label: "Alvará de Funcionamento", icon: "📜" },
  { value: "INSCRICAO_ESTADUAL", label: "Inscrição Estadual", icon: "📝" },
  { value: "INSCRICAO_MUNICIPAL", label: "Inscrição Municipal", icon: "📝" },
  { value: "OUTROS", label: "Outros", icon: "📎" },
] as const;

export function CompanyDocumentsManager({
  documents = [],
  onDocumentsChange,
  className,
}: CompanyDocumentsManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(DOCUMENT_TYPES[0].value);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validar tipo de arquivo
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        notificationCenter.add({
          type: "error",
          title: "Formato inválido",
          message: "Apenas PDF e imagens são permitidos",
        });
        return;
      }

      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        notificationCenter.add({
          type: "error",
          title: "Arquivo muito grande",
          message: "Tamanho máximo: 10MB",
        });
        return;
      }

      setUploading(true);

      try {
        // Converter para base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];

          // TODO: Substituir por chamada real à API
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const newDocument: CompanyDocument = {
            id: `doc-${Date.now()}`,
            type: selectedType,
            name: DOCUMENT_TYPES.find((t) => t.value === selectedType)?.label || "Documento",
            fileUrl: reader.result as string,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            expiresAt: expiresAt || undefined,
            isActive: true,
            description: description || undefined,
          };

          const updatedDocuments = [...documents, newDocument];
          onDocumentsChange?.(updatedDocuments);

          notificationCenter.add({
            type: "success",
            title: "Documento adicionado",
            message: `${newDocument.name} foi adicionado com sucesso`,
          });

          setUploading(false);
          setDescription("");
          setExpiresAt("");
        };

        reader.readAsDataURL(file);
      } catch (error) {
        notificationCenter.add({
          type: "error",
          title: "Erro ao fazer upload",
          message: error instanceof Error ? error.message : "Erro desconhecido",
        });
        setUploading(false);
      }
    },
    [selectedType, expiresAt, description, documents, onDocumentsChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (!window.confirm("Tem certeza que deseja remover este documento?")) {
        return;
      }

      const updatedDocuments = documents.filter((doc) => doc.id !== id);
      onDocumentsChange?.(updatedDocuments);

      notificationCenter.add({
        type: "success",
        title: "Documento removido",
        message: "O documento foi removido com sucesso",
      });
    },
    [documents, onDocumentsChange],
  );

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload de Documento */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h4 className="text-sm font-semibold text-white">Adicionar Novo Documento</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white mb-2">Tipo de Documento</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-2">Data de Expiração (opcional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-2">Descrição (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do documento"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer">
          <Upload className="h-8 w-8 text-[hsl(var(--primary))]" />
          <span className="text-sm font-medium text-white">
            {uploading ? "Enviando..." : "Clique para fazer upload"}
          </span>
          <span className="text-xs text-zinc-400">PDF ou imagem • Máximo 10MB</span>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Lista de Documentos */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Documentos Cadastrados</h4>

        {documents.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
            <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Nenhum documento cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all",
                    isExpired(doc.expiresAt)
                      ? "border-red-500/30 bg-red-500/10"
                      : isExpiringSoon(doc.expiresAt)
                        ? "border-amber-500/30 bg-amber-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20",
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">{doc.name}</span>
                        {isExpired(doc.expiresAt) && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            Expirado
                          </span>
                        )}
                        {isExpiringSoon(doc.expiresAt) && !isExpired(doc.expiresAt) && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Expirando em breve
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                        </span>
                        {doc.expiresAt && (
                          <span className="flex items-center gap-1">
                            Válido até: {new Date(doc.expiresAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-zinc-500 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = doc.fileUrl;
                        link.download = doc.fileName;
                        link.click();
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(doc.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

