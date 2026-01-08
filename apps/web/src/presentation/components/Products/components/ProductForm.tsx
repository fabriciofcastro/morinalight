import { Button, FormField, FormTextarea, GlassCard, Input } from "@morina/ui";
import React, { useState } from "react";

interface ProductFormProps {
  initialData: { name: string; description: string };
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  buttonLabel: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  buttonLabel,
}: ProductFormProps) {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Nome do Produto" required fieldId="name">
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />
        </FormField>

        <FormTextarea
          label="Descrição"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : buttonLabel}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
