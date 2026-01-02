"use client";

import { useState } from "react";
import {
    Lock,
    Save,
    X,
    User,
    Shield,
    Database
} from "lucide-react";
import {
    GlassCard,
    GlassInput,
    Button,
    GlassSelect
} from "@/components/ui/futuristic";
import { ObjectAccessEntry } from "@morina/shared-kernel";

interface AclFormProps {
    initialData?: Partial<ObjectAccessEntry>;
    onSave: (data: Partial<ObjectAccessEntry>) => void;
    onCancel: () => void;
}

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Limpar o campo oposto ao tipo de concessão selecionado
        const data = { ...formData };
        if (grantType === "user") data.roleId = undefined;
        else data.userId = undefined;

        onSave(data);
    };

    return (
        <GlassCard className="p-6 border-emerald-500/20 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {initialData?.id ? 'Editar Entrada ACL' : 'Nova Exceção de Acesso (ACL)'}
                        </h3>
                        <p className="text-sm text-white/40">Conceda permissão a um objeto específico por ID.</p>
                    </div>
                </div>
                <Button variant="secondary" size="icon" onClick={onCancel} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resource Target */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Alvo do Recurso</h4>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Tipo de Objeto</label>
                            <GlassSelect
                                value={formData.subject}
                                onChange={(val: string) => setFormData({ ...formData, subject: val })}
                                options={[
                                    { value: "Product", label: "Produto" },
                                    { value: "Order", label: "Pedido" },
                                    { value: "Document", label: "Documento" },
                                    { value: "Report", label: "Relatório" },
                                    { value: "User", label: "Usuário" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider flex items-center gap-2">
                                <Database className="h-3 w-3" /> ID do Recurso (UUID)
                            </label>
                            <GlassInput
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                value={formData.subjectId}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Ação Permitida</label>
                            <GlassInput
                                placeholder="Ex: manage, read, delete"
                                value={formData.action}
                                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Destinatário do Acesso</h4>

                        <div className="flex p-1 bg-black/40 rounded-lg mb-4">
                            <button
                                type="button"
                                onClick={() => setGrantType("user")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${grantType === 'user' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                            >
                                <User className="h-4 w-4" />
                                <span className="text-xs font-semibold">Usuário</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGrantType("role")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${grantType === 'role' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                            >
                                <Shield className="h-4 w-4" />
                                <span className="text-xs font-semibold">Cargo</span>
                            </button>
                        </div>

                        {grantType === "user" ? (
                            <div>
                                <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">ID do Usuário</label>
                                <GlassInput
                                    placeholder="UUID do usuário..."
                                    value={formData.userId || ""}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs font-semibold text-white/60 mb-1.5 block uppercase tracking-wider">Código do Cargo</label>
                                <GlassInput
                                    placeholder="Ex: MANAGER, SALES_DIR..."
                                    value={formData.roleId || ""}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mt-4">
                            <p className="text-[10px] text-emerald-400/80 italic leading-relaxed text-center">
                                Esta regra terá precedência sobre as políticas RBAC gerais para este objeto específico.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button variant="secondary" type="button" onClick={onCancel}>
                        Descartar
                    </Button>
                    <Button variant="primary" type="submit" className="min-w-[120px] bg-emerald-500 hover:bg-emerald-400 text-black border-none">
                        <Save className="mr-2 h-4 w-4" />
                        Conceder Acesso
                    </Button>
                </div>
            </form>
        </GlassCard>
    );
}
