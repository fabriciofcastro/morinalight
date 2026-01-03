"use client";

import { useState } from "react";
import { ObjectAccessEntry } from "@morina/shared-kernel";
import { AclFormView } from "./acl-form-view";

interface AclFormProps {
    initialData?: Partial<ObjectAccessEntry>;
    onSave: (data: Partial<ObjectAccessEntry>) => void;
    onCancel: () => void;
}

/**
 * AclForm Container
 * 
 * Responsável por:
 * - Gerenciamento de estado (grantType, formData)
 * - Lógica de validação e submissão
 * - Preparação de dados para o Presenter
 */
export function AclForm({ initialData, onSave, onCancel }: AclFormProps) {
    const [grantType, setGrantType] = useState<"user" | "role">(initialData?.userId ? "user" : "role");
    const [formData, setFormData] = useState<Partial<ObjectAccessEntry>>({
        subject: initialData?.subject || "Product",
        subjectId: initialData?.subjectId || "",
        action: initialData?.action || "read",
        userId: initialData?.userId || "",
        roleId: initialData?.roleId || "",
        ...initialData
    });

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGrantTypeChange = (type: "user" | "role") => {
        setGrantType(type);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Lógica de negócio: Limpar o campo oposto ao tipo de concessão selecionado
        const data = { ...formData };
        if (grantType === "user") data.roleId = undefined;
        else data.userId = undefined;

        onSave(data);
    };

    return (
        <AclFormView
            formData={formData}
            grantType={grantType}
            isEditing={!!initialData?.id}
            onGrantTypeChange={handleGrantTypeChange}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    );
}

