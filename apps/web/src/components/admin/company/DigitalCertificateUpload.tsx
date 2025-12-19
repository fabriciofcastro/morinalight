"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Shield, Lock, Calendar, FileText, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { formatFileSize } from "../../../lib/utils/image-processing";

interface DigitalCertificateData {
  type: "A1" | "A3";
  serialNumber?: string;
  issuer?: string;
  validFrom?: string;
  validUntil?: string;
  subject?: string;
  password?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isActive: boolean;
  validationStatus: "VALID" | "EXPIRED" | "INVALID" | "PENDING";
}

interface DigitalCertificateUploadProps {
  value?: DigitalCertificateData | null;
  onChange?: (value: DigitalCertificateData | null) => void;
  className?: string;
}

export function DigitalCertificateUpload({
  value,
  onChange,
  className,
}: DigitalCertificateUploadProps) {
  const [certificateType, setCertificateType] = useState<"A1" | "A3">(value?.type || "A1");
  const [password, setPassword] = useState(value?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<Partial<DigitalCertificateData>>(value || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateCertificateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Validar extensão
    const validExtensions = [".pfx", ".p12"];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(extension)) {
      return {
        valid: false,
        error: "Formato inválido. Use arquivo .pfx ou .p12",
      };
    }

    // Validar tamanho (máximo 1MB para certificados)
    if (file.size > 1024 * 1024) {
      return {
        valid: false,
        error: "Arquivo muito grande. Máximo 1MB",
      };
    }

    return { valid: true };
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        // Validar arquivo
        const validation = validateCertificateFile(file);
        if (!validation.valid) {
          setError(validation.error || "Arquivo inválido");
          setUploading(false);
          return;
        }

        // Validar senha
        if (!password) {
          setError("Senha do certificado é obrigatória");
          setUploading(false);
          return;
        }

        // Simular upload e validação do certificado
        // Em produção, isso seria uma chamada à API que valida o certificado
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simular extração de informações do certificado
        const mockCertificateInfo: DigitalCertificateData = {
          type: certificateType,
          serialNumber: "1234567890123456789012345678901234567890",
          issuer: "Autoridade Certificadora",
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
          subject: "CN=Empresa Teste, O=Organização, L=Cidade, ST=Estado, C=BR",
          password,
          fileName: file.name,
          fileSize: file.size,
          isActive: true,
          validationStatus: "VALID",
        };

        setCertificateInfo(mockCertificateInfo);
        onChange?.(mockCertificateInfo);

        // Simular delay para feedback visual
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar certificado");
      } finally {
        setUploading(false);
      }
    },
    [certificateType, password, validateCertificateFile, onChange],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(() => {
    if (!window.confirm("Tem certeza que deseja remover o certificado digital? Esta ação não pode ser desfeita.")) {
      return;
    }
    setCertificateInfo({});
    setPassword("");
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALID":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "EXPIRED":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "INVALID":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VALID":
        return "Válido";
      case "EXPIRED":
        return "Expirado";
      case "INVALID":
        return "Inválido";
      default:
        return "Pendente";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
          Certificado Digital
        </h3>
        <p className="text-sm text-zinc-400">
          Upload e configuração de certificado digital para emissão de NF-e/NFC-e
        </p>
      </div>

      {/* Tipo de Certificado */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Tipo de Certificado</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCertificateType("A1")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              certificateType === "A1"
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                : "border-white/10 bg-white/5 hover:border-white/20",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="font-semibold text-white">Certificado A1</span>
            </div>
            <p className="text-xs text-zinc-400">
              Armazenado no computador. Válido por 1 ano.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setCertificateType("A3")}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              certificateType === "A3"
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                : "border-white/10 bg-white/5 hover:border-white/20",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="font-semibold text-white">Certificado A3</span>
            </div>
            <p className="text-xs text-zinc-400">
              Armazenado em token ou cartão. Válido por 3 anos.
            </p>
          </button>
        </div>
      </div>

      {/* Senha do Certificado */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Senha do Certificado
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha do certificado"
            className="w-full px-4 py-3 pr-10 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          A senha será criptografada e armazenada com segurança
        </p>
      </div>

      <AnimatePresence mode="wait">
        {certificateInfo.fileName ? (
          <motion.div
            key="certificate-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4"
          >
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">Certificado Carregado</span>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  getStatusColor(certificateInfo.validationStatus || "PENDING"),
                )}
              >
                {getStatusLabel(certificateInfo.validationStatus || "PENDING")}
              </div>
            </div>

            {/* Informações do Certificado */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-400 mb-1">Arquivo</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {certificateInfo.fileName}
                </p>
              </div>
              {certificateInfo.fileSize && (
                <div>
                  <p className="text-zinc-400 mb-1">Tamanho</p>
                  <p className="text-white font-medium">{formatFileSize(certificateInfo.fileSize)}</p>
                </div>
              )}
              {certificateInfo.serialNumber && (
                <div className="col-span-2">
                  <p className="text-zinc-400 mb-1">Número de Série</p>
                  <p className="text-white font-mono text-xs break-all">
                    {certificateInfo.serialNumber}
                  </p>
                </div>
              )}
              {certificateInfo.validFrom && certificateInfo.validUntil && (
                <>
                  <div>
                    <p className="text-zinc-400 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Válido de
                    </p>
                    <p className="text-white font-medium">
                      {new Date(certificateInfo.validFrom).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Válido até
                    </p>
                    <p className="text-white font-medium">
                      {new Date(certificateInfo.validUntil).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary))]/90 transition-colors"
              >
                Alterar Certificado
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Remover
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition-all hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[hsl(var(--primary))]/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Upload de Certificado Digital
                </p>
                <p className="text-xs text-white/60">
                  Arquivo .pfx ou .p12 • Máximo 1MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !password}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                  uploading || !password
                    ? "bg-zinc-600 cursor-not-allowed"
                    : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90",
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 inline mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pfx,.p12"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensagens de erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

