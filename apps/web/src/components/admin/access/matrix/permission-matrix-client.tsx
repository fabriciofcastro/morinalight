"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Shield,
    Loader2,
    Save,
    Check,
    X
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { permissionsApi, Role, Permission } from "@/lib/api/permissions";
import { notificationCenter } from "@/components/notifications/notification-center";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";

export function PermissionMatrixClient() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    // Map roleId -> Set of permissionIds
    const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changedRoles, setChangedRoles] = useState<Set<string>>(new Set());

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [rolesData, permissionsData] = await Promise.all([
                permissionsApi.getRoles(),
                permissionsApi.getPermissions(),
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);

            // Load permissions for each role
            const matrixData: Record<string, Set<string>> = {};
            await Promise.all(rolesData.map(async (role) => {
                try {
                    const rolePerms = await permissionsApi.getRolePermissions(role.id);
                    matrixData[role.id] = new Set(rolePerms.map(p => p.id));
                } catch (e) {
                    console.error(`Erro loading perms for role ${role.name}`, e);
                    matrixData[role.id] = new Set();
                }
            }));
            setMatrix(matrixData);
            setChangedRoles(new Set());
        } catch (error) {
            console.error("Erro ao carregar dados da matriz:", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar matriz de permissões." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const togglePermission = (roleId: string, permissionId: string) => {
        setMatrix(prev => {
            const rolePerms = new Set(prev[roleId]);
            if (rolePerms.has(permissionId)) {
                rolePerms.delete(permissionId);
            } else {
                rolePerms.add(permissionId);
            }
            return { ...prev, [roleId]: rolePerms };
        });
        setChangedRoles(prev => new Set(prev).add(roleId));
    };

    const handleSave = async () => {
        if (changedRoles.size === 0) return;
        setSaving(true);
        try {
            await Promise.all(Array.from(changedRoles).map(async (roleId) => {
                const perms = Array.from(matrix[roleId] || []);
                await permissionsApi.assignPermissionsToRole(roleId, perms, { granted: true });
            }));
            notificationCenter.add({ type: "success", title: "Sucesso", message: "Permissões atualizadas com sucesso." });
            setChangedRoles(new Set());
        } catch (error) {
            notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao salvar permissões." });
        } finally {
            setSaving(false);
        }
    };

    const permissionsByModule = useMemo(() => {
        const grouped: Record<string, Permission[]> = {};
        permissions.forEach(p => {
            if (!grouped[p.module]) grouped[p.module] = [];
            grouped[p.module].push(p);
        });
        return grouped;
    }, [permissions]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                <p>Carregando matriz de segurança...</p>
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen text-white pb-20 overflow-x-auto">
            <div className="flex items-center justify-between mb-8 sticky left-0">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-violet-500">
                        Matriz de Permissões
                    </h1>
                    <p className="text-white/60 mt-1">Visualize e gerencie acessos em grade</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving || changedRoles.size === 0}
                    className={cn(
                        "gap-2 transition-all",
                        changedRoles.size > 0 ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/10 text-white/40"
                    )}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </Button>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#090b16]/60 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="sticky left-0 z-20 bg-[#0c0e1a] p-4 text-left font-medium text-white/60 min-w-[300px] border-r border-white/10">
                                    Permissão / Módulo
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="p-4 text-center min-w-[120px] border-r border-white/5 last:border-r-0">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex flex-col items-center gap-1 cursor-help">
                                                        <span className="font-bold text-white text-xs uppercase tracking-wider">{role.code}</span>
                                                        <span className={cn("text-[10px] px-1.5 rounded border", role.active ? "border-emerald-500/30 text-emerald-500/80 bg-emerald-500/5" : "border-white/10 text-white/30")}>
                                                            {role.active ? "ATIVO" : "INATIVO"}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{role.name}</p>
                                                    <p className="text-xs opacity-70">{role.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(permissionsByModule).map(([module, perms]) => (
                                <>
                                    <tr key={`module-${module}`} className="bg-violet-900/10">
                                        <td colSpan={roles.length + 1} className="p-3 px-4 font-bold text-violet-300 border-y border-white/5 sticky left-0 z-10 bg-[#1a1625]">
                                            {module}
                                        </td>
                                    </tr>
                                    {perms.map(perm => (
                                        <tr key={perm.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="sticky left-0 z-10 bg-[#090b16] group-hover:bg-[#131520] p-3 px-4 border-r border-white/10 border-b border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white/90">{perm.name}</span>
                                                    <span className="text-xs text-white/40 font-mono mt-0.5">{perm.code}</span>
                                                </div>
                                            </td>
                                            {roles.map(role => {
                                                const isGranted = matrix[role.id]?.has(perm.id);
                                                return (
                                                    <td key={`${role.id}-${perm.id}`} className="p-0 text-center border-r border-white/5 border-b border-white/5 relative">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button
                                                                onClick={() => togglePermission(role.id, perm.id)}
                                                                className={cn(
                                                                    "w-full h-full flex items-center justify-center transition-all hover:bg-white/5",
                                                                    isGranted ? "text-emerald-500" : "text-white/5 hover:text-white/20"
                                                                )}
                                                            >
                                                                {isGranted ? (
                                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                        <Check className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    </motion.div>
                                                                ) : (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-currentColor opacity-20" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
