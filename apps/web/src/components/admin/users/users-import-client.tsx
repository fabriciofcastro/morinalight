"use client";

import { Button } from "@morina/ui";
import { Upload, ArrowLeft, FileSpreadsheet, FileText, Download, CheckCircle2, XCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/api/base";

export function UsersImportClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    details?: Array<{ line: number; error: string }>;
  } | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        notificationCenter.add({
          type: "error",
          title: "Arquivo Inválido",
          message: "Por favor, selecione um arquivo CSV",
        });
      }
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) {
      notificationCenter.add({
        type: "error",
        title: "Arquivo Necessário",
        message: "Por favor, selecione um arquivo CSV para importar",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers = getAuthHeadersWithTenant();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers["Content-Type"];

      const response = await fetch("/api/users/import", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao importar usuários" }));
        throw new Error(errorData.message || "Não foi possível importar os usuários.");
      }

      const result = (await response.json()) as typeof importResult;
      setImportResult(result);

      notificationCenter.add({
        type: result.errors === 0 ? "success" : "warning",
        title: "Importação Concluída",
        message: `${result.success} usuário(s) importado(s) com sucesso${result.errors > 0 ? `. ${result.errors} erro(s) encontrado(s).` : "."}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao importar usuários.";
      notificationCenter.add({
        type: "error",
        title: "Erro ao Importar",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [file]);

  const downloadTemplate = useCallback(() => {
    const csvContent = "Nome Completo,Email,CPF,Telefone,Departamento,Setor,Cargo,Status\nJoão Silva,joao@example.com,123.456.789-00,(11) 99999-9999,TI,Desenvolvimento,Desenvolvedor,active";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template-importacao-usuarios.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
              <Upload className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Importar Usuários
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Importe múltiplos usuários através de arquivo CSV
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => router.push("/admin/users")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Instruções
        </h2>
        <ol className="space-y-2 text-sm text-white/70 list-decimal list-inside">
          <li>Baixe o template CSV clicando no botão abaixo</li>
          <li>Preencha o arquivo com os dados dos usuários</li>
          <li>Certifique-se de que os dados estão corretos e completos</li>
          <li>Faça upload do arquivo preenchido</li>
        </ol>
        <div className="mt-4">
          <Button
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Template CSV
          </Button>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-8 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload do Arquivo
        </h2>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300" />
            <div className="relative border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-blue-500/50 transition-all">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <FileSpreadsheet className="h-12 w-12 mx-auto text-white/40 mb-4" />
              <p className="text-white/80 mb-2">
                {file ? file.name : "Clique para selecionar ou arraste um arquivo CSV"}
              </p>
              <p className="text-xs text-white/50">Apenas arquivos CSV são aceitos</p>
            </div>
          </div>
          {file && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white/90">{file.name}</p>
                  <p className="text-xs text-white/50">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[32px] px-3"
                onClick={() => setFile(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar Usuários
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Import Results */}
      {importResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
            {importResult.errors === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-400" />
            )}
            Resultado da Importação
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white/80">
                {importResult.success} usuário(s) importado(s) com sucesso
              </span>
            </div>
            {importResult.errors > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-white/80">
                  {importResult.errors} erro(s) encontrado(s)
                </span>
              </div>
            )}
            {importResult.details && importResult.details.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-white/60 uppercase">Detalhes dos Erros:</p>
                {importResult.details.map((detail, idx) => (
                  <div key={idx} className="p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">
                      Linha {detail.line}: {detail.error}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
