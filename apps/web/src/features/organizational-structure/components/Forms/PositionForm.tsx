"use client";

import { useSmartForm } from "@/hooks/use-smart-form";
import { BaseForm } from "@/components/common/forms/BaseForm";
import { Position, PositionSchema } from "@morina/organizational-structure-domain";
import { Input, Label } from "@morina/ui";

type PositionFormProps = {
    initialData?: Position;
    sectorId?: string; // Pre-filled if creating from a sector
    onSubmit: (data: Position) => Promise<void>;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function PositionForm({ initialData, sectorId, onSubmit, onSuccess, onCancel }: PositionFormProps) {
    const { formData, errors, submitting, setValue, handleSubmit, register } = useSmartForm<Position>({
        schema: PositionSchema,
        defaultValues: initialData || {
            name: "",
            code: "",
            description: "",
            sectorId: sectorId || "",
            active: true,
            responsabilidades: "",
            requisitos: "",
            salarioMin: 0,
            salarioMax: 0,
        },
        onSubmit,
        onSuccess,
        successMessage: initialData?.id
            ? "Cargo atualizado com sucesso"
            : "Cargo criado com sucesso",
    });

    return (
        <BaseForm
            title={initialData?.id ? "Editar Cargo" : "Novo Cargo"}
            subtitle={initialData?.id ? "Atualize os dados do cargo" : "Preencha os dados do cargo"}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            submitting={submitting}
        >
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        id="name"
                        {...register("name")}
                        className="mt-1"
                        placeholder="Ex: Desenvolvedor Senior"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="code">Código</Label>
                    <Input
                        id="code"
                        {...register("code")}
                        className="mt-1"
                        placeholder="Ex: DEV-SR"
                    />
                    {errors.code && (
                        <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                    )}
                </div>

                {!initialData?.id && !sectorId && (
                    <div>
                        <Label htmlFor="sectorId">ID do Setor</Label>
                        <Input
                            id="sectorId"
                            {...register("sectorId")}
                            className="mt-1"
                            placeholder="UUID do setor"
                        />
                        {errors.sectorId && (
                            <p className="text-sm text-red-500 mt-1">{errors.sectorId.message}</p>
                        )}
                    </div>
                )}

                <div>
                    <Label htmlFor="seniority">Senioridade</Label>
                    <select
                        id="seniority"
                        {...register("seniority")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                        <option value="Junior">Junior</option>
                        <option value="Pleno">Pleno</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Principal">Principal</option>
                    </select>
                    {errors.seniority && (
                        <p className="text-sm text-red-500 mt-1">{errors.seniority.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="active"
                        {...register("active")}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="active">Ativo</Label>
                </div>
            </div>
        </BaseForm>
    );
}
