/**
 * Example: Users List Component
 * 
 * Exemplo de componente usando TanStack Query hooks
 */

"use client";

import { useState } from "react";
import { Button, Card, Input } from "@morina/ui";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    type User,
} from "@/hooks/queries";

export function UsersListExample() {
    const [search, setSearch] = useState("");

    // Query hooks
    const { data: users, isLoading, error } = useUsers({ search });
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    // Handlers
    const handleCreate = async () => {
        try {
            await createUser.mutateAsync({
                name: "Novo Usuário",
                email: "novo@example.com",
                role: "user",
            });
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await updateUser.mutateAsync({
                id,
                data: { name: "Nome Atualizado" },
            });
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUser.mutateAsync(id);
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-red-400">Erro ao carregar usuários</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Usuários</h2>
                <Button onClick={handleCreate} disabled={createUser.isPending}>
                    {createUser.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    Novo Usuário
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Buscar usuários..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* List */}
            <div className="grid gap-4">
                {users?.map((user) => (
                    <Card key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdate(user.id)}
                                    disabled={updateUser.isPending}
                                >
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={deleteUser.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {users?.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
            )}
        </div>
    );
}
