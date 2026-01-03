"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { Button, Input } from '@morina/ui';
import { usersApi, type User } from '@/lib/api/users';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersApi.list();
            // Garantir que data seja sempre um array
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]); // Definir array vazio em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(
        (user) =>
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--text-1))]">Usuários</h1>
                    <p className="mt-2 text-[hsl(var(--text-2))]">
                        Gerencie os usuários do sistema
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo usuário
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        type="search"
                        placeholder="Buscar usuários..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-hover))]">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">
                                    Último acesso
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-[hsl(var(--text-1))]">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[hsl(var(--text-3))]">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-[hsl(var(--surface-hover))]">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-sm font-semibold text-white">
                                                    {user.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-[hsl(var(--text-1))]">
                                                    {user.displayName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                    }`}
                                            >
                                                {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">
                                            {user.lastLogin
                                                ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                                                : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--text-2))] hover:bg-[hsl(var(--surface-hover))] hover:text-[hsl(var(--text-1))]">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
