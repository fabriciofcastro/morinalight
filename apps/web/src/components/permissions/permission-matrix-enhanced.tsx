"use client";

import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@morina/ui";
import {
    Eye,
    EyeOff,
    RotateCcw,
    Save,
    Search,
    Shield,
} from "lucide-react";
import { useState } from "react";

interface Permission {
    id: string;
    name: string;
    code: string;
    description?: string;
    category: string;
    action: string;
}

interface PermissionGroup {
    category: string;
    label: string;
    permissions: Permission[];
}

interface RolePermission {
    permissionId: string;
}

interface Role {
    id: string;
    name: string;
    isSystem: boolean;
    permissions: RolePermission[];
}

interface PermissionMatrixProps {
    roles: Role[];
    permissionGroups: PermissionGroup[];
    onChange?: (roleId: string, permissionId: string, enabled: boolean) => void;
    onSave?: () => void;
    readOnly?: boolean;
}

export function PermissionMatrix({
    roles,
    permissionGroups,
    onChange,
    onSave,
    readOnly = false,
}: PermissionMatrixProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [showSystemRoles, setShowSystemRoles] = useState(true);

    // Filter permissions by search and category
    const filteredGroups = permissionGroups
        .map((group) => ({
            ...group,
            permissions: group.permissions.filter((perm) => {
                const matchesSearch =
                    searchTerm === "" ||
                    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    perm.code.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory =
                    selectedCategory === "all" || perm.category === selectedCategory;

                return matchesSearch && matchesCategory;
            }),
        }))
        .filter((group) => group.permissions.length > 0);

    // Filter roles
    const filteredRoles = roles.filter((role) =>
        showSystemRoles ? true : !role.isSystem
    );

    // Check if role has permission
    const hasPermission = (role: Role, permissionId: string): boolean => {
        return role.permissions.some((rp) => rp.permissionId === permissionId);
    };

    // Toggle permission
    const handleTogglePermission = (roleId: string, permissionId: string) => {
        if (readOnly) return;
        const role = roles.find((r) => r.id === roleId);
        if (!role) return;

        const enabled = !hasPermission(role, permissionId);
        onChange?.(roleId, permissionId, enabled);
    };

    // Bulk actions
    const handleSelectAllForRole = (roleId: string) => {
        if (readOnly) return;
        filteredGroups.forEach((group) => {
            group.permissions.forEach((perm) => {
                onChange?.(roleId, perm.id, true);
            });
        });
    };

    const handleDeselectAllForRole = (roleId: string) => {
        if (readOnly) return;
        filteredGroups.forEach((group) => {
            group.permissions.forEach((perm) => {
                onChange?.(roleId, perm.id, false);
            });
        });
    };

    // Get all categories
    const categories = Array.from(
        new Set(
            permissionGroups.flatMap((g) => g.permissions.map((p) => p.category))
        )
    );

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Matriz de Permissões</h2>
                        </div>

                        {!readOnly && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Resetar
                                </Button>
                                <Button size="sm" onClick={onSave}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input
                                placeholder="Buscar permissões..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                            <option value="all">Todas as categorias</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        {/* Show System Roles */}
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showSystemRoles}
                                onChange={(e) => setShowSystemRoles(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                            />
                            <span className="text-sm font-medium text-white">
                                Mostrar roles do sistema
                            </span>
                        </label>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>
                            {filteredRoles.length} role{filteredRoles.length !== 1 && "s"}
                        </span>
                        <span>•</span>
                        <span>
                            {filteredGroups.reduce((sum, g) => sum + g.permissions.length, 0)}{" "}
                            {filteredGroups.reduce((sum, g) => sum + g.permissions.length, 0) !== 1
                                ? "permissões"
                                : "permissão"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Matrix */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090b16] pb-4">
                            <div
                                className="grid gap-4"
                                style={{
                                    gridTemplateColumns: "250px repeat(auto-fill, 120px)",
                                }}
                            >
                                <div className="font-semibold text-white">Permissões</div>
                                {filteredRoles.map((role) => (
                                    <div key={role.id} className="space-y-2">
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge
                                                variant={role.isSystem ? "default" : "secondary"}
                                                className={cn(
                                                    "w-full justify-center",
                                                    role.isSystem && "bg-blue-500"
                                                )}
                                            >
                                                {role.name}
                                            </Badge>
                                            {!readOnly && !role.isSystem && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => handleSelectAllForRole(role.id)}
                                                        title="Marcar todas"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => handleDeselectAllForRole(role.id)}
                                                        title="Desmarcar todas"
                                                    >
                                                        <EyeOff className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Permission Rows */}
                        <div className="mt-4 space-y-6">
                            {filteredGroups.map((group) => (
                                <div key={group.category} className="space-y-2">
                                    {/* Category Header */}
                                    <div className="sticky top-14 z-10 bg-[#090b16] py-2">
                                        <h3 className="text-sm font-semibold uppercase text-white/50">
                                            {group.label}
                                        </h3>
                                    </div>

                                    {/* Permissions in this category */}
                                    {group.permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="grid gap-4 border-b border-white/5 py-3 hover:bg-white/5"
                                            style={{
                                                gridTemplateColumns: "250px repeat(auto-fill, 120px)",
                                            }}
                                        >
                                            {/* Permission Info */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">
                                                        {permission.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs text-white/40">
                                                        {permission.code}
                                                    </code>
                                                    <Badge variant="outline" className="text-xs">
                                                        {permission.action}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Checkboxes for each role */}
                                            {filteredRoles.map((role) => {
                                                const isEnabled = hasPermission(role, permission.id);
                                                const isLocked = role.isSystem && readOnly;

                                                return (
                                                    <div
                                                        key={role.id}
                                                        className="flex items-center justify-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isEnabled}
                                                            disabled={isLocked || readOnly}
                                                            onChange={() =>
                                                                handleTogglePermission(role.id, permission.id)
                                                            }
                                                            className={cn(
                                                                "h-5 w-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50",
                                                                isEnabled && "bg-cyan-500"
                                                            )}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { Permission, PermissionGroup, Role, PermissionMatrixProps };
