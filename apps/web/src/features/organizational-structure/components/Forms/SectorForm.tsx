import { useSmartForm } from "@/hooks/use-smart-form";
import { BaseForm } from "@/components/common/forms/BaseForm";
import { SectorSchema, Sector } from "@morina/organizational-structure-domain";
import { FuturisticInput, FuturisticSelect } from "@/components/ui/futuristic-ui";
import { Code, FileText, Layers } from "lucide-react";

type SectorFormProps = {
    initialData?: Sector;
    departmentId?: string; // Pre-filled if creating from a department
    onSubmit: (data: Sector) => Promise<void>;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function SectorForm({ initialData, departmentId, onSubmit, onSuccess, onCancel }: SectorFormProps) {
    const { formData, errors, submitting, setValue, handleSubmit } = useSmartForm<Sector>({
        schema: SectorSchema,
        defaultValues: initialData || {
            name: "",
            code: "",
            description: "",
            departmentId: departmentId || "",
            active: true,
        },
        onSubmit,
        onSuccess,
        successMessage: initialData ? "Setor atualizado com sucesso!" : "Setor criado com sucesso!",
    });

    return (
        <BaseForm
            title={initialData ? "Editar Setor" : "Novo Setor"}
            subtitle="Gerencie as informações do setor"
            onBack={onCancel}
            onSubmit={handleSubmit}
            submitting={submitting}
        >
            <div className="grid gap-6 md:grid-cols-2">
                <FuturisticInput
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setValue("name", e.target.value)}
                    error={errors.name}
                    startIcon={<Layers className="h-4 w-4" />}
                    placeholder="Ex: Desenvolvimento Backend"
                    required
                />
                <FuturisticInput
                    label="Código"
                    value={formData.code}
                    onChange={(e) => setValue("code", e.target.value)}
                    error={errors.code}
                    startIcon={<Code className="h-4 w-4" />}
                    placeholder="Ex: DEV-BE"
                    required
                />
                <div className="md:col-span-2">
                    <FuturisticInput
                        label="Descrição"
                        value={formData.description || ""}
                        onChange={(e) => setValue("description", e.target.value)}
                        error={errors.description}
                        startIcon={<FileText className="h-4 w-4" />}
                        placeholder="Descrição das responsabilidades do setor"
                    />
                </div>
                <FuturisticSelect
                    label="Status"
                    value={formData.active ? "ativo" : "inativo"}
                    onChange={(val) => setValue("active", val === "ativo")}
                    options={[
                        { value: "ativo", label: "Ativo" },
                        { value: "inativo", label: "Inativo" },
                    ]}
                />
            </div>
        </BaseForm>
    );
}
