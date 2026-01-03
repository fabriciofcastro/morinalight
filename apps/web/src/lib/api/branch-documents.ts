import { apiClient } from "./client";
import type {
    BranchDocument,
    CreateBranchDocumentInput,
    UpdateBranchDocumentInput,
} from "@/types/branch-documents";

export const branchDocumentsApi = {
    /**
     * Lista todos os documentos de uma filial
     */
    async list(branchId: string): Promise<BranchDocument[]> {
        const response = await apiClient.get<BranchDocument[]>(
            `/branches/${branchId}/documents`
        );
        return response.data;
    },

    /**
     * Faz upload de um novo documento
     */
    async upload(input: CreateBranchDocumentInput): Promise<BranchDocument> {
        const formData = new FormData();
        formData.append("file", input.file);
        formData.append("category", input.category);
        if (input.expiresAt) {
            formData.append("expiresAt", input.expiresAt);
        }
        if (input.notes) {
            formData.append("notes", input.notes);
        }

        const response = await apiClient.post<BranchDocument>(
            `/branches/${input.branchId}/documents`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    /**
     * Atualiza metadados de um documento
     */
    async update(
        branchId: string,
        documentId: string,
        input: UpdateBranchDocumentInput
    ): Promise<BranchDocument> {
        const response = await apiClient.patch<BranchDocument>(
            `/branches/${branchId}/documents/${documentId}`,
            input
        );
        return response.data;
    },

    /**
     * Exclui um documento
     */
    async delete(branchId: string, documentId: string): Promise<void> {
        await apiClient.delete(`/branches/${branchId}/documents/${documentId}`);
    },

    /**
     * Faz download de um documento
     */
    async download(branchId: string, documentId: string): Promise<Blob> {
        const response = await apiClient.get(
            `/branches/${branchId}/documents/${documentId}/download`,
            {
                responseType: "blob",
            }
        );
        return response.data;
    },
};
