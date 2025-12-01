"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Shield, Edit, Trash2 } from "lucide-react";
import { PageBackground } from "@/components/page-background";
import { permissionsApi, Role } from "@/lib/api/permissions";
import Link from "next/link";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const data = await permissionsApi.getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Failed to load roles", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Perfis de Acesso</h1>
                        <p className="mt-1 text-sm text-white/50">Gerencie os perfis e níveis de acesso (RBAC)</p>
                    </div>
                    <Link href="/admin/roles/new">
                        <button className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8]">
                            <Plus className="h-4 w-4" />
                            Novo Perfil
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-white/50">Carregando perfis...</div>
                    ) : filteredRoles.length === 0 ? (
                        <div className="p-8 text-center text-white/50">Nenhum perfil encontrado.</div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {filteredRoles.map((role) => (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                                            <Shield className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{role.name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-white/50">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-mono bg-white/10 px-1 rounded">{role.code}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${role.active ? "bg-emerald-400" : "bg-red-400"}`} />
                                                    {role.active ? "Ativo" : "Inativo"}
                                                </span>
                                                <span className="capitalize">{role.scope.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
