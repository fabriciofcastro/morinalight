"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    Loader2,
    MapPin,
    Phone,
    Save
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BranchesHeader } from "../../../../components/admin/branches/BranchesHeader";
import { notificationCenter } from "../../../../components/notifications/notification-center";
import { FuturisticInput } from "../../../../components/ui/futuristic-input";
import { FuturisticSelect } from "../../../../components/ui/futuristic-select";
import { FuturisticTextarea } from "../../../../components/ui/futuristic-textarea";
import { buscarEnderecoPorCep, formatarCep } from "../../../../lib/integrations/viacep";

// Schema de Validação
const branchSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    code: z.string().min(2, "Código é obrigatório"),
    description: z.string().optional(),
    cnpj: z.string().optional(),
    status: z.enum(["ativo", "inativo", "arquivado"]),

    // Endereço
    address: z.object({
        zipCode: z.string().min(8, "CEP inválido"),
        street: z.string().min(3, "Logradouro obrigatório"),
        number: z.string().min(1, "Número obrigatório"),
        complement: z.string().optional(),
        neighborhood: z.string().min(2, "Bairro obrigatório"),
        city: z.string().min(2, "Cidade obrigatória"),
        state: z.string().length(2, "UF inválida"),
        country: z.string().optional(),
    }),

    // Contato
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),

    // Operacional
    openingDate: z.string().optional(),
    operationalCapacity: z.coerce.number().optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormClientProps {
    branchId?: string; // Se presente, é modo de edição
}

export function BranchFormClient({ branchId }: BranchFormClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);
    const isEditMode = !!branchId;

    const form = useForm<BranchFormData>({
        resolver: zodResolver(branchSchema) as any,
        defaultValues: {
            status: "ativo",
            address: {
                zipCode: "",
                street: "",
                number: "",
                neighborhood: "",
                city: "",
                state: "",
                country: "Brasil"
            }
        }
    });

    const { watch, setValue, formState: { errors } } = form;
    const formData = watch();

    useEffect(() => {
        if (isEditMode) {
            // TODO: Carregar dados da API
            // Simulando load
            setValue("name", "Matriz São Paulo");
            setValue("code", "SP-001");
            setValue("address.zipCode", "01310-100");
        }
    }, [isEditMode, setValue]);

    const handleSearchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length !== 8) return;

        setSearchingCep(true);
        try {
            const data = await buscarEnderecoPorCep(cleanCep);
            if (data) {
                setValue("address.street", data.logradouro || "");
                setValue("address.neighborhood", data.bairro || "");
                setValue("address.city", data.cidade || "");
                setValue("address.state", data.estado || "");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearchingCep(false);
        }
    };

    const onSubmit: import("react-hook-form").SubmitHandler<BranchFormData> = async (data) => {
        setSaving(true);
        try {
            // TODO: Salvar na API
            await new Promise(resolve => setTimeout(resolve, 1000));

            notificationCenter.add({
                type: "success",
                title: isEditMode ? "Filial atualizada" : "Filial criada",
                message: "As alterações foram salvas com sucesso."
            });

            router.push("/admin/branches");
        } catch (error) {
            notificationCenter.add({
                type: "error",
                title: "Erro ao salvar",
                message: "Ocorreu um erro inesperado."
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-6 relative pb-32">
            <div className="absolute inset-0 bg-[#09090b]" />

            <BranchesHeader
                title={isEditMode ? "Editar Filial" : "Nova Filial"}
                subtitle={isEditMode ? `Editando: ${formData.name || '...'}` : "Cadastre uma nova unidade operacional"}
                breadcrumbs={[
                    { label: "Admin" },
                    { label: "Filiais", href: "/admin/branches" },
                    { label: isEditMode ? "Edição" : "Nova" }
                ]}
            />

            {/* Navigation Tabs */}
            <div className="sticky top-4 z-30 mb-8">
                <motion.div
                    layout
                    className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-lg flex flex-wrap gap-2 w-fit"
                >
                    {[
                        { id: "general", label: "Dados Básicos", icon: Building2 },
                        { id: "address", label: "Localização", icon: MapPin },
                        { id: "contact", label: "Contato & Ops", icon: Phone },
                    ].map((section) => {
                        const Icon = section.icon;
                        const isActive = activeTab === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                                        : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {section.label}
                            </button>
                        );
                    })}
                </motion.div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-7xl">
                {/* GENERAL TAB */}
                <div className={cn("space-y-6", activeTab !== "general" && "hidden")}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl">
                        <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-[hsl(var(--primary))]" />
                            Informações da Unidade
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Nome da Filial"
                                placeholder="Ex: Matriz São Paulo"
                                required
                                {...form.register("name")}
                                error={!!errors.name}
                                errorMessage={errors.name?.message}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FuturisticInput
                                    label="Código da Unidade"
                                    placeholder="Ex: SP-001"
                                    required
                                    {...form.register("code")}
                                    error={!!errors.code}
                                    errorMessage={errors.code?.message}
                                />
                                <FuturisticSelect
                                    label="Status"
                                    {...form.register("status")}
                                >
                                    <option value="ativo" className="bg-[#09090b]">Ativo</option>
                                    <option value="inativo" className="bg-[#09090b]">Inativo</option>
                                    <option value="arquivado" className="bg-[#09090b]">Arquivado</option>
                                </FuturisticSelect>
                            </div>

                            <div className="md:col-span-2">
                                <FuturisticTextarea
                                    label="Descrição"
                                    placeholder="Detalhes sobre esta unidade..."
                                    rows={3}
                                    {...form.register("description")}
                                />
                            </div>

                            <FuturisticInput
                                label="CNPJ (Opcional)"
                                placeholder="00.000.000/0000-00"
                                {...form.register("cnpj")}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ADDRESS TAB */}
                <div className={cn("space-y-6", activeTab !== "address" && "hidden")}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl">
                        <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-[hsl(var(--accent))]" />
                            Endereço Completo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <FuturisticInput
                                        label="CEP"
                                        maxLength={9}
                                        placeholder="00000-000"
                                        required
                                        {...form.register("address.zipCode", {
                                            onChange: (e) => {
                                                const v = formatarCep(e.target.value);
                                                setValue("address.zipCode", v);
                                                if (v.length === 9) handleSearchCep(v);
                                            }
                                        })}
                                        error={!!errors.address?.zipCode}
                                        errorMessage={errors.address?.zipCode?.message}
                                    />
                                </div>
                                {searchingCep && <div className="mb-4 text-white/50"><Loader2 className="animate-spin h-6 w-6" /></div>}
                            </div>

                            <div className="md:col-span-2">
                                <FuturisticInput
                                    label="Logradouro"
                                    placeholder="Rua, Avenida..."
                                    {...form.register("address.street")}
                                    error={!!errors.address?.street}
                                    errorMessage={errors.address?.street?.message}
                                />
                            </div>

                            <FuturisticInput
                                label="Número"
                                placeholder="123"
                                {...form.register("address.number")}
                                error={!!errors.address?.number}
                                errorMessage={errors.address?.number?.message}
                            />

                            <FuturisticInput
                                label="Complemento"
                                placeholder="Sala 4, Bloco B"
                                {...form.register("address.complement")}
                            />

                            <FuturisticInput
                                label="Bairro"
                                placeholder="Centro"
                                {...form.register("address.neighborhood")}
                                error={!!errors.address?.neighborhood}
                                errorMessage={errors.address?.neighborhood?.message}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <FuturisticInput
                                        label="Cidade"
                                        {...form.register("address.city")}
                                        error={!!errors.address?.city}
                                        errorMessage={errors.address?.city?.message}
                                    />
                                </div>
                                <FuturisticInput
                                    label="UF"
                                    maxLength={2}
                                    {...form.register("address.state")}
                                    error={!!errors.address?.state}
                                    errorMessage={errors.address?.state?.message}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CONTACT & OPS TAB */}
                <div className={cn("space-y-6", activeTab !== "contact" && "hidden")}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl">
                        <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
                            <Phone className="h-6 w-6 text-[hsl(var(--primary))]" />
                            Contato e Operações
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FuturisticInput
                                label="Telefone Principal"
                                placeholder="(00) 0000-0000"
                                {...form.register("phone")}
                            />

                            <FuturisticInput
                                label="Email da Unidade"
                                type="email"
                                placeholder="filial@empresa.com"
                                {...form.register("email")}
                                error={!!errors.email}
                                errorMessage={errors.email?.message}
                            />

                            <div className="h-px bg-white/10 md:col-span-2 my-2" />

                            <FuturisticInput
                                label="Data de Abertura"
                                type="date"
                                {...form.register("openingDate")}
                            />

                            <FuturisticInput
                                label="Capacidade Operacional"
                                type="number"
                                placeholder="Quantidade de pessoas"
                                {...form.register("operationalCapacity")}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-t border-white/10 p-4 md:pl-72">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div className="text-sm text-white/40 hidden md:block">
                            Preencha os dados da filial com atenção.
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <Link href="/admin/branches">
                                <Button type="button" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] border-none px-8"
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar Filial
                            </Button>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
