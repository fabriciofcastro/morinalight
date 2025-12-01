"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Building2, MapPin, Phone, MoreVertical, Edit, Trash2 } from "lucide-react";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi, Branch } from "@/lib/api/organizational-structure";
import { Button } from "@morina/ui"; // Assuming Button exists or I'll use HTML button
import Link from "next/link";

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await organizationalStructureApi.getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBranches = branches.filter((branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Filiais</h1>
                        <p className="mt-1 text-sm text-white/50">Gerencie as unidades da sua organização</p>
                    </div>
                    <Link href="/admin/branches/new">
                        <button className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8]">
                            <Plus className="h-4 w-4" />
                            Nova Filial
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
                        <div className="p-8 text-center text-white/50">Carregando filiais...</div>
                    ) : filteredBranches.length === 0 ? (
                        <div className="p-8 text-center text-white/50">Nenhuma filial encontrada.</div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {filteredBranches.map((branch) => (
                                <motion.div
                                    key={branch.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                                            <Building2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{branch.name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-white/50">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-mono bg-white/10 px-1 rounded">{branch.code}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${branch.active ? "bg-emerald-400" : "bg-red-400"}`} />
                                                    {branch.active ? "Ativo" : "Inativo"}
                                                </span>
                                                <span className="capitalize">{branch.type.toLowerCase()}</span>
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
