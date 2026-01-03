export enum DocumentCategory {
    CONTRATO_SOCIAL = "contrato_social",
    ALVARA = "alvara",
    INSCRICAO_ESTADUAL = "inscricao_estadual",
    CERTIDAO_NEGATIVA = "certidao_negativa",
    CERTIFICADO_DIGITAL = "certificado_digital",
    OUTROS = "outros",
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
    [DocumentCategory.CONTRATO_SOCIAL]: "Contrato Social",
    [DocumentCategory.ALVARA]: "Alvará de Funcionamento",
    [DocumentCategory.INSCRICAO_ESTADUAL]: "Inscrição Estadual",
    [DocumentCategory.CERTIDAO_NEGATIVA]: "Certidão Negativa",
    [DocumentCategory.CERTIFICADO_DIGITAL]: "Certificado Digital",
    [DocumentCategory.OUTROS]: "Outros Documentos",
};

export interface BranchDocument {
    id: string;
    branchId: string;
    name: string;
    originalName: string;
    category: DocumentCategory;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    expiresAt?: string;
    notes?: string;
}

export interface CreateBranchDocumentInput {
    branchId: string;
    category: DocumentCategory;
    file: File;
    expiresAt?: string;
    notes?: string;
}

export interface UpdateBranchDocumentInput {
    category?: DocumentCategory;
    expiresAt?: string;
    notes?: string;
}
