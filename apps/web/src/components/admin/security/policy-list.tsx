"use client";

import {
    Shield,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Power,
    ArrowUpRight
} from "lucide-react";
import {
    GlassCard,
    Badge,
    Button
} from "@/components/ui/futuristic";
import { SecurityPolicy } from "@morina/shared-kernel";
import { Can } from "@/lib/auth/CaslContext";

interface PoliciesListProps {
    policies: SecurityPolicy[];
    onEdit: (policy: SecurityPolicy) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

export function PoliciesList({ policies, onEdit, onDelete, onToggle }: PoliciesListProps) {
    if (policies.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <Shield className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/80">Nenhuma Política PBAC</h3>
                <p className="text-white/40 max-w-md mx-auto mt-2">
                    Defina regras globais de acesso baseadas em atributos para máxima precisão.
                </p>
                <Button variant="primary" className="mt-6">
                    Mapear Primeira Política
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {policies.map((policy) => (
                <GlassCard
                    key={policy.id}
                    className={`p-4 border-white/5 hover:border-white/10 group transition-all ${!policy.active ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-xl ${policy.effect === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-white group-hover:text-[hsl(var(--primary))] transition-colors">
                                        {policy.name}
                                    </h4>
                                    <Badge variant={policy.effect === 'ALLOW' ? 'success' : 'destructive'} className="text-[10px] py-0">
                                        {policy.effect}
                                    </Badge>
                                </div>
                                <p className="text-sm text-white/40 line-clamp-1 mt-1">{policy.description || 'Sem descrição.'}</p>

                                <div className="flex gap-4 mt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/20 uppercase tracking-tighter">Sujeito</span>
                                        <span className="text-xs text-white/60">{policy.subject}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/20 uppercase tracking-tighter">Ação</span>
                                        <span className="text-xs text-white/60">{Array.isArray(policy.action) ? policy.action.join(', ') : policy.action}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/20 uppercase tracking-tighter">Prioridade</span>
                                        <span className="text-xs text-white/60">{policy.priority}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Can I="update" a="SecurityPolicy">
                                <Button variant="secondary" size="icon" onClick={() => onToggle(policy.id)}>
                                    <Power className={`h-4 w-4 ${policy.active ? 'text-emerald-400' : 'text-white/40'}`} />
                                </Button>
                                <Button variant="secondary" size="icon" onClick={() => onEdit(policy)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </Can>
                            <Can I="delete" a="SecurityPolicy">
                                <Button variant="secondary" size="icon" className="hover:bg-red-500/20 hover:text-red-400" onClick={() => onDelete(policy.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Can>
                        </div>
                    </div>

                    {/* Condition Summary */}
                    {policy.conditions && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] text-white/30 italic">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>{JSON.stringify(policy.conditions).substring(0, 80)}...</span>
                            </div>
                            <Button variant="link" size="sm" className="h-6 text-[10px]">
                                <Eye className="mr-1 h-3 w-3" /> Detalhes da Regra
                            </Button>
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
}
