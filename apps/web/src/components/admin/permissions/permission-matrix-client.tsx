"use client";

import { useState, useEffect } from "react";
import { PermissionMatrix, type PermissionGroup, type Role } from "@/components/permissions/permission-matrix-enhanced";

export function PermissionMatrixClient() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Mock data - em produção viria da API
            const mockRoles: Role[] = [
                {
                    id: "1", name: "Admin", isSystem: true, permissions: [
                        { permissionId: "p1" }, { permissionId: "p2" }, { permissionId: "p3" }
                    ]
                },
                {
                    id: "2", name: "Manager", isSystem: false, permissions: [
                        { permissionId: "p1" }, { permissionId: "p2" }
                    ]
                },
                {
                    id: "3", name: "User", isSystem: false, permissions: [
                        { permissionId: "p1" }
                    ]
                },
                { id: "4", name: "Guest", isSystem: false, permissions: [] }
            ];

            const mockPermissions: PermissionGroup[] = [
                {
                    category: "users",
                    label: "Usuários",
                    permissions: [
                        { id: "p1", name: "Visualizar Usuários", code: "users.view", category: "users", action: "view", description: "Permite visualizar lista de usuários" },
                        { id: "p2", name: "Criar Usuários", code: "users.create", category: "users", action: "create", description: "Permite criar novos usuários" },
                        { id: "p3", name: "Editar Usuários", code: "users.edit", category: "users", action: "edit", description: "Permite editar usuários existentes" },
                        { id: "p4", name: "Deletar Usuários", code: "users.delete", category: "users", action: "delete", description: "Permite remover usuários" }
                    ]
                },
                {
                    category: "departments",
                    label: "Departamentos",
                    permissions: [
                        { id: "p5", name: "Visualizar Departamentos", code: "departments.view", category: "departments", action: "view" },
                        { id: "p6", name: "Criar Departamentos", code: "departments.create", category: "departments", action: "create" },
                        { id: "p7", name: "Editar Departamentos", code: "departments.edit", category: "departments", action: "edit" },
                        { id: "p8", name: "Deletar Departamentos", code: "departments.delete", category: "departments", action: "delete" }
                    ]
                },
                {
                    category: "products",
                    label: "Produtos",
                    permissions: [
                        { id: "p9", name: "Visualizar Produtos", code: "products.view", category: "products", action: "view" },
                        { id: "p10", name: "Criar Produtos", code: "products.create", category: "products", action: "create" },
                        { id: "p11", name: "Editar Produtos", code: "products.edit", category: "products", action: "edit" },
                        { id: "p12", name: "Deletar Produtos", code: "products.delete", category: "products", action: "delete" }
                    ]
                }
            ];

            setRoles(mockRoles);
            setPermissionGroups(mockPermissions);
        } catch (error) {
            console.error("Failed to load permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (roleId: string, permissionId: string, enabled: boolean) => {
        setRoles(prev => prev.map(role => {
            if (role.id !== roleId) return role;

            if (enabled) {
                // Add permission
                if (!role.permissions.some(p => p.permissionId === permissionId)) {
                    return {
                        ...role,
                        permissions: [...role.permissions, { permissionId }]
                    };
                }
            } else {
                // Remove permission
                return {
                    ...role,
                    permissions: role.permissions.filter(p => p.permissionId !== permissionId)
                };
            }

            return role;
        }));
    };

    const handleSave = async () => {
        try {
            console.log("Saving permissions:", roles);
            // API call would go here
            alert("Permissões salvas com sucesso!");
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Erro ao salvar permissões");
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                    <div className="h-96 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <PermissionMatrix
                roles={roles}
                permissionGroups={permissionGroups}
                onChange={handlePermissionChange}
                onSave={handleSave}
                readOnly={false}
            />
        </div>
    );
}
