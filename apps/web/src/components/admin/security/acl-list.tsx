"use client";

import { Can } from "@/lib/auth/CaslContext";
import { ObjectAccessEntry } from "@morina/shared-kernel";
import {
    Badge,
    Button,
    GlassCard
} from "@morina/ui";
import {
    Edit2,
    FileText,
    Key,
    Lock,
    Shield,
    Trash2,
    User
} from "lucide-react";

interface AclListProps {
    entries: ObjectAccessEntry[];
    onEdit: (entry: ObjectAccessEntry) => void;
    onDelete: (id: string) => void;
}

export function AclList({ entries, onEdit, onDelete }: AclListProps) {
    if (entries.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <Lock className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/80">Nenhuma ACL Configurada</h3>
                <p className="text-white/40 max-w-md mx-auto mt-2">
                    Defina permissões cirúrgicas para objetos específicos, ignorando as regras gerais.
                </p>
                <Button variant="gradient" className="mt-6">
                    Adicionar Acesso Excecional
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {entries.map((entry) => (
                <GlassCard
                    key={entry.id}
                    className="p-3 border-white/5 hover:border-white/10 group transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Key className="h-4 w-4" />
                            </div>

                            <div className="grid grid-cols-4 gap-8">
                                <div className="flex flex-col min-w-[120px]">
                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Alvo (Objeto)</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <FileText className="h-3 w-3 text-white/30" />
                                        <span className="text-xs text-white font-medium">{entry.subject}</span>
                                        <Badge variant="secondary" className="px-1 py-0 text-[9px] bg-white/5 border-none text-white/40">#{entry.subjectId.substring(0, 6)}</Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col min-w-[120px]">
                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Ação</span>
                                    <span className="text-xs text-white uppercase font-mono mt-0.5 font-bold">{entry.action}</span>
                                </div>

                                <div className="flex flex-col min-w-[150px]">
                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Destinatário</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {entry.userId ? (
                                            <>
                                                <User className="h-3 w-3 text-blue-400" />
                                                <span className="text-xs text-blue-400 font-medium">Usuário: {entry.userId.substring(0, 8)}...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-3 w-3 text-purple-400" />
                                                <span className="text-xs text-purple-400 font-medium">Cargo: {entry.roleId}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Status</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] text-white/60">Ativo</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Can I="update" a="Permission">
                                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                            </Can>
                            <Can I="delete" a="Permission">
                                <Button variant="secondary" size="icon" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400" onClick={() => onDelete(entry.id!)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </Can>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
