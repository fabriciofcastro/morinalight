"use client";

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input } from '@morina/ui';
import { clientsApi, type Client } from '@/lib/api/clients';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const orgId = localStorage.getItem("selected_org_id") || "1";
            const response = await clientsApi.list(orgId);
            setClients(response.items);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.document?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--text-1))]">Clientes</h1>
                    <p className="mt-2 text-[hsl(var(--text-2))]">Gerencie os clientes do sistema</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo cliente
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                <Input
                    type="search"
                    placeholder="Buscar clientes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-hover))]">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Nome</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Telefone</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Documento</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Status</th>
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
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[hsl(var(--text-3))]">
                                        Nenhum cliente encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-[hsl(var(--surface-hover))]">
                                        <td className="px-6 py-4 font-medium text-[hsl(var(--text-1))]">{client.name}</td>
                                        <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">{client.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">{client.phone || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">{client.document || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${client.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                    }`}
                                            >
                                                {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                            </span>
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
