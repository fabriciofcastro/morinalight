"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUploadZone, type UploadedFile } from "@/shared/ui/base/file-upload-zone";
import { FuturisticInput } from "@/shared/ui/base/futuristic-input";
import { branchDocumentsApi } from "@/lib/api/branch-documents";
import { notificationCenter } from "@/shared/ui/notification-center";
import {
    DocumentCategory,
    DOCUMENT_CATEGORY_LABELS,
    type BranchDocument,
} from "@/types/branch-documents";
import { FileText, Calendar, StickyNote, Download, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";

interface DocumentsTabProps {
    branchId?: string;
    isNewBranch?: boolean;
}

export function DocumentsTab({ branchId, isNewBranch = false }: DocumentsTabProps) {
    const [documents, setDocuments] = useState<BranchDocument[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
        DocumentCategory.CONTRATO_SOCIAL
    );
    const [expiresAt, setExpiresAt] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");

    // Delete confirm state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);

    // Carrega documentos existentes
    useEffect(() => {
        if (branchId && !isNewBranch) {
            loadDocuments();
        }
    }, [branchId, isNewBranch]);

    const loadDocuments = async () => {
        if (!branchId) return;

        try {
            const docs = await branchDocumentsApi.list(branchId);
            setDocuments(docs);
        } catch (error) {
            console.error("Erro ao carregar documentos:", error);
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Não foi possível carregar os documentos",
            });
        }
    };

    const handleFilesSelected = useCallback(
        async (files: File[]) => {
            if (!branchId) {
                notificationCenter.add({
                    type: "warning",
                    title: "Atenção",
                    message: "Salve a filial antes de fazer upload de documentos",
                });
                return;
            }

            setIsUploading(true);
            setUploadError("");

            try {
                // Upload de cada arquivo
                const uploadPromises = files.map((file) =>
                    branchDocumentsApi.upload({
                        branchId,
                        category: selectedCategory,
                        file,
                        expiresAt: expiresAt || undefined,
                        notes: notes || undefined,
                    })
                );

                const uploadedDocs = await Promise.all(uploadPromises);

                setDocuments((prev) => [...prev, ...uploadedDocs]);

                notificationCenter.add({
                    type: "success",
                    title: "Sucesso",
                    message: `${files.length} documento(s) enviado(s) com sucesso`,
                });

                // Limpa formulário
                setExpiresAt("");
                setNotes("");
            } catch (error) {
                console.error("Erro ao fazer upload:", error);
                setUploadError("Erro ao fazer upload dos documentos");
                notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: "Não foi possível fazer upload dos documentos",
                });
            } finally {
                setIsUploading(false);
            }
        },
        [branchId, selectedCategory, expiresAt, notes]
    );

    const handleDeleteClick = useCallback((documentId: string, documentName: string) => {
        setDocumentToDelete({ id: documentId, name: documentName });
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!branchId || !documentToDelete) return;

        setDeleteLoading(true);
        try {
            await branchDocumentsApi.delete(branchId, documentToDelete.id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));

            notificationCenter.add({
                type: "success",
                title: "Sucesso",
                message: "Documento excluído com sucesso",
            });

            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
        } catch (error) {
            console.error("Erro ao excluir documento:", error);
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Não foi possível excluir o documento",
            });
        } finally {
            setDeleteLoading(false);
        }
    }, [branchId, documentToDelete]);

    const handleDownload = useCallback(
        async (doc: BranchDocument) => {
            if (!branchId) return;

            try {
                const blob = await branchDocumentsApi.download(branchId, doc.id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = doc.originalName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Erro ao fazer download:", error);
                notificationCenter.add({
                    type: "error",
                    title: "Erro",
                    message: "Não foi possível fazer download do documento",
                });
            }
        },
        [branchId]
    );

    // Converte documentos para o formato do FileUploadZone
    const uploadedFiles: UploadedFile[] = documents.map((doc) => ({
        id: doc.id,
        name: doc.originalName,
        size: doc.fileSize,
        type: doc.fileType,
        url: doc.url,
        uploadedAt: doc.uploadedAt,
        category: DOCUMENT_CATEGORY_LABELS[doc.category],
    }));

    if (isNewBranch) {
        return (
            <div className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">
                    Salve a filial primeiro para fazer upload de documentos
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Categoria do documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                        Categoria do Documento <span className="text-red-400">*</span>
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value} className="bg-gray-900">
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <FuturisticInput
                    label="Data de Validade"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    helperText="Opcional - para documentos com prazo de validade"
                />
            </div>

            {/* Observações */}
            <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                    Observações
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Adicione observações sobre o documento..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
            </div>

            {/* Upload Zone */}
            <FileUploadZone
                onFilesSelected={handleFilesSelected}
                uploadedFiles={uploadedFiles}
                maxFiles={20}
                maxSizeMB={10}
                isUploading={isUploading}
                error={uploadError}
            />

            {/* Documentos por Categoria */}
            {documents.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documentos por Categoria
                    </h3>

                    {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([category, label]) => {
                        const categoryDocs = documents.filter((doc) => doc.category === category);
                        if (categoryDocs.length === 0) return null;

                        return (
                            <div key={category} className="space-y-2">
                                <h4 className="text-sm font-medium text-white/80">{label}</h4>
                                <div className="space-y-2">
                                    {categoryDocs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {doc.originalName}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span>
                                                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                                                    </span>
                                                    {doc.expiresAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-yellow-400">
                                                                Validade: {new Date(doc.expiresAt).toLocaleDateString("pt-BR")}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {doc.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                                        <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        {doc.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(doc.id, doc.originalName)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDocumentToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={documentToDelete?.name || ""}
                itemType="documento"
                isLoading={deleteLoading}
            />
        </div>
    );
}
