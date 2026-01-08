import { useSmartForm } from "@/hooks/use-smart-form";
import { BaseForm } from "@/components/common/forms/BaseForm";
import { DepartmentSchema, Department } from "@morina/organizational-structure-domain";
import { FuturisticInput, FuturisticSelect } from "@/shared/ui/base/futuristic-ui";
import { Building2, Code, FileText } from "lucide-react";

type DepartmentFormProps = {
    initialData?: Department;
    onSubmit: (data: Department) => Promise<void>;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export function DepartmentForm({ initialData, onSubmit, onSuccess, onCancel }: DepartmentFormProps) {
    const { formData, errors, submitting, setValue, handleSubmit } = useSmartForm<Department>({
        schema: DepartmentSchema,
        defaultValues: initialData || {
            name: "",
            code: "",
            description: "",
            active: true,
        },
        onSubmit,
        onSuccess,
        successMessage: initialData ? "Departamento atualizado com sucesso!" : "Departamento criado com sucesso!",
    });

    return (
        <BaseForm
            title={initialData ? "Editar Departamento" : "Novo Departamento"}
            subtitle="Gerencie as informações do departamento"
            onBack={onCancel}
            onSubmit={handleSubmit}
            submitting={submitting}
        >
            <div className="grid gap-6 md:grid-cols-2">
                <FuturisticInput
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setValue("name", e.target.value)}
                    error={!!errors.name}
                    startIcon={<Building2 className="h-4 w-4" />}
                    placeholder="Ex: Recursos Humanos"
                    required
                />
                <FuturisticInput
                    label="Código"
                    value={formData.code}
                    onChange={(e) => setValue("code", e.target.value)}
                    error={!!errors.code}
                    startIcon={<Code className="h-4 w-4" />}
                    placeholder="Ex: RH-01"
                    required
                />
                <div className="md:col-span-2">
                    <FuturisticInput
                        label="Descrição"
                        value={formData.description || ""}
                        onChange={(e) => setValue("description", e.target.value)}
                        error={!!errors.description}
                        startIcon={<FileText className="h-4 w-4" />}
                        placeholder="Descrição das atividades do departamento"
                    />
                </div>
                <FuturisticSelect
                    label="Status"
                    value={formData.active ? "ativo" : "inativo"}
                    onChange={(e) => setValue("active", e.target.value === "ativo")}
                    options={[
                        { value: "ativo", label: "Ativo" },
                        { value: "inativo", label: "Inativo" },
                    ]}
                />
            </div>
        </BaseForm>
    );
}
