"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, ArrowLeft } from "lucide-react";
import { Button, GlassCard } from "@morina/ui";
import { suppliersImportApi, type ImportPreview, type SupplierImportRow, type ImportResult } from "@/lib/api/suppliers-import";
import { notificationCenter } from "@/components/notifications/notification-center";
import { UploadStep } from "./components/upload-step";
import { PreviewStep } from "./components/preview-step";
import { ResultStep } from "./components/result-step";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

type Step = "upload" | "preview" | "result";

export function SupplierImportClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId();
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!selectedFile || !orgId) return;

    setLoading(true);
    try {
      const previewData = await suppliersImportApi.validate(selectedFile, orgId);
      setPreview(previewData);
      setCurrentStep("preview");
      notificationCenter.add({
        type: "success",
        title: "Arquivo validado",
        message: `${previewData.validRows} de ${previewData.totalRows} fornecedores válidos`,
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao validar arquivo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedFile, orgId]);

  const handleImport = useCallback(async () => {
    if (!preview || !orgId) return;

    setLoading(true);
    try {
      // Get only valid rows
      const validRows = preview.rows
        .filter((r) => r.validation.isValid)
        .map((r) => r.data);

      const result = await suppliersImportApi.execute(validRows, orgId);
      setImportResult(result);
      setCurrentStep("result");

      if (result.success > 0) {
        notificationCenter.add({
          type: "success",
          title: "Importação concluída",
          message: `${result.success} fornecedor(es) importado(s) com sucesso`,
        });
      }

      if (result.failed > 0) {
        notificationCenter.add({
          type: "warning",
          title: "Importação parcial",
          message: `${result.failed} fornecedor(es) falharam na importação`,
        });
      }
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao importar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  }, [preview, orgId]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await suppliersImportApi.downloadTemplate();
      notificationCenter.add({
        type: "success",
        title: "Template baixado",
        message: "Arquivo template_fornecedores.csv baixado com sucesso",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao baixar template",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
    setCurrentStep("upload");
  }, []);

  if (!orgId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <GlassCard className="max-w-md p-8 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-white">Organização não selecionada</h2>
          <p className="mb-4 text-white/70">Selecione uma organização para continuar</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Importação em Massa de Fornecedores</h1>
          <p className="mt-2 text-white/70">Importe múltiplos fornecedores de uma vez via CSV ou Excel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/fornecedores")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Baixar Template
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${currentStep === "upload" ? "text-blue-400" : currentStep === "preview" || currentStep === "result" ? "text-green-400" : "text-white/50"}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentStep === "upload" ? "border-blue-400 bg-blue-400/10" : currentStep === "preview" || currentStep === "result" ? "border-green-400 bg-green-400/10" : "border-white/30 bg-white/5"}`}>
            {currentStep === "preview" || currentStep === "result" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>
          <span className="font-medium">1. Upload</span>
        </div>

        <div className={`h-1 w-16 ${currentStep === "preview" || currentStep === "result" ? "bg-green-400" : "bg-white/20"}`} />

        <div className={`flex items-center gap-2 ${currentStep === "preview" ? "text-blue-400" : currentStep === "result" ? "text-green-400" : "text-white/50"}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentStep === "preview" ? "border-blue-400 bg-blue-400/10" : currentStep === "result" ? "border-green-400 bg-green-400/10" : "border-white/30 bg-white/5"}`}>
            {currentStep === "result" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <FileSpreadsheet className="h-5 w-5" />
            )}
          </div>
          <span className="font-medium">2. Preview</span>
        </div>

        <div className={`h-1 w-16 ${currentStep === "result" ? "bg-green-400" : "bg-white/20"}`} />

        <div className={`flex items-center gap-2 ${currentStep === "result" ? "text-green-400" : "text-white/50"}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentStep === "result" ? "border-green-400 bg-green-400/10" : "border-white/30 bg-white/5"}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="font-medium">3. Resultado</span>
        </div>
      </div>

      {/* Step Content */}
      <GlassCard className="p-8">
        {currentStep === "upload" && (
          <UploadStep
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onValidate={handleValidate}
            loading={loading}
          />
        )}

        {currentStep === "preview" && preview && (
          <PreviewStep
            preview={preview}
            onImport={handleImport}
            onBack={() => setCurrentStep("upload")}
            loading={loading}
          />
        )}

        {currentStep === "result" && importResult && (
          <ResultStep
            result={importResult}
            onReset={handleReset}
            onBack={() => router.push("/fornecedores")}
          />
        )}
      </GlassCard>
    </div>
  );
}



