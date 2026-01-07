'use client';

import { AlertTriangle, Edit, Globe, MapPin, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GeoRestriction {
    id: string;
    name: string;
    type: 'COUNTRY' | 'IP_RANGE' | 'CITY' | 'STATE';
    action: 'ALLOW' | 'DENY';
    countries: string[];
    ipRanges: string[];
    cities: string[];
    blockVpn: boolean;
    blockProxy: boolean;
    blockTor: boolean;
    isActive: boolean;
    priority: number;
}

interface GeoRestrictionManagerProps {
    orgId?: string;
}

const RESTRICTION_TYPES = [
    { value: 'COUNTRY', label: 'País', icon: Globe },
    { value: 'IP_RANGE', label: 'Faixa de IP', icon: MapPin },
    { value: 'CITY', label: 'Cidade', icon: MapPin },
];

export function GeoRestrictionManager({ orgId }: GeoRestrictionManagerProps) {
    const [restrictions, setRestrictions] = useState<GeoRestriction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRestriction, setEditingRestriction] = useState<GeoRestriction | null>(null);

    useEffect(() => {
        loadRestrictions();
    }, [orgId]);

    const loadRestrictions = async () => {
        try {
            const response = await fetch('/api/geo-restrictions');
            const data = await response.json();
            setRestrictions(data.data);
        } catch (error) {
            console.error('Erro ao carregar restrições:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta restrição?')) {
            return;
        }

        try {
            await fetch(`/api/geo-restrictions/${id}`, { method: 'DELETE' });
            await loadRestrictions();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    const handleToggleActive = async (restriction: GeoRestriction) => {
        try {
            await fetch(`/api/geo-restrictions/${restriction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !restriction.isActive }),
            });
            await loadRestrictions();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const allowRestrictions = restrictions.filter(r => r.action === 'ALLOW');
    const denyRestrictions = restrictions.filter(r => r.action === 'DENY');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-blue-600" />
                        Restrições Geográficas
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Controle de acesso por localização e IP
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova Restrição
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{restrictions.length}</p>
                        </div>
                        <Globe className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Whitelist</p>
                            <p className="text-2xl font-bold text-green-600">{allowRestrictions.length}</p>
                        </div>
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Blacklist</p>
                            <p className="text-2xl font-bold text-red-600">{denyRestrictions.length}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ativas</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {restrictions.filter(r => r.isActive).length}
                            </p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Whitelist Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Whitelist (Permitir)
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                        Apenas estes locais/IPs podem acessar
                    </p>
                </div>
                <RestrictionList
                    restrictions={allowRestrictions}
                    onEdit={setEditingRestriction}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                />
            </div>

            {/* Blacklist Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Blacklist (Bloquear)
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                        Estes locais/IPs são bloqueados
                    </p>
                </div>
                <RestrictionList
                    restrictions={denyRestrictions}
                    onEdit={setEditingRestriction}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                />
            </div>

            {/* Modals */}
            {showCreateModal && (
                <GeoRestrictionModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={loadRestrictions}
                />
            )}

            {editingRestriction && (
                <GeoRestrictionModal
                    restriction={editingRestriction}
                    onClose={() => setEditingRestriction(null)}
                    onSave={loadRestrictions}
                />
            )}
        </div>
    );
}

function RestrictionList({
    restrictions,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    restrictions: GeoRestriction[];
    onEdit: (r: GeoRestriction) => void;
    onDelete: (id: string) => void;
    onToggleActive: (r: GeoRestriction) => void;
}) {
    if (restrictions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma restrição configurada
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {restrictions.map((restriction) => (
                <div key={restriction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {restriction.name}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    {RESTRICTION_TYPES.find(t => t.value === restriction.type)?.label}
                                </span>
                                <button
                                    onClick={() => onToggleActive(restriction)}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${restriction.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                        }`}
                                >
                                    {restriction.isActive ? 'Ativa' : 'Inativa'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {restriction.countries.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
                                            Países:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {restriction.countries.map((country) => (
                                                <span
                                                    key={country}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                                >
                                                    {country}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {restriction.ipRanges.length > 0 && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
                                            IPs:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {restriction.ipRanges.map((ip) => (
                                                <span
                                                    key={ip}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                                >
                                                    {ip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(restriction.blockVpn || restriction.blockProxy || restriction.blockTor) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
                                            Bloquear:
                                        </span>
                                        <div className="flex gap-2">
                                            {restriction.blockVpn && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    VPN
                                                </span>
                                            )}
                                            {restriction.blockProxy && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    Proxy
                                                </span>
                                            )}
                                            {restriction.blockTor && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    Tor
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => onEdit(restriction)}
                                className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(restriction.id)}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                                title="Deletar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GeoRestrictionModal({
    restriction,
    onClose,
    onSave,
}: {
    restriction?: GeoRestriction;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        name: restriction?.name || '',
        type: restriction?.type || 'COUNTRY' as const,
        action: restriction?.action || 'ALLOW' as const,
        countries: restriction?.countries.join(', ') || '',
        ipRanges: restriction?.ipRanges.join(', ') || '',
        blockVpn: restriction?.blockVpn || false,
        blockProxy: restriction?.blockProxy || false,
        blockTor: (restriction?.blockTor ?? true) as boolean,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            countries: formData.countries.split(',').map(s => s.trim()).filter(Boolean),
            ipRanges: formData.ipRanges.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            const url = restriction ? `/api/geo-restrictions/${restriction.id}` : '/api/geo-restrictions';
            const method = restriction ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {restriction ? 'Editar' : 'Nova'} Restrição Geográfica
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                {RESTRICTION_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ação
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="ALLOW">Permitir (Whitelist)</option>
                                <option value="DENY">Bloquear (Blacklist)</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'COUNTRY' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Países (códigos ISO separados por vírgula)
                            </label>
                            <input
                                type="text"
                                value={formData.countries}
                                onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                                placeholder="BR, US, UK"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Exemplo: BR, US, UK, DE</p>
                        </div>
                    )}

                    {formData.type === 'IP_RANGE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Faixas de IP (CIDR separados por vírgula)
                            </label>
                            <input
                                type="text"
                                value={formData.ipRanges}
                                onChange={(e) => setFormData({ ...formData, ipRanges: e.target.value })}
                                placeholder="192.168.1.0/24, 10.0.0.0/8"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">Exemplo: 192.168.1.0/24, 10.0.0.0/8</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bloqueios Adicionais
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.blockVpn}
                                onChange={(e) => setFormData({ ...formData, blockVpn: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Bloquear VPN</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.blockProxy}
                                onChange={(e) => setFormData({ ...formData, blockProxy: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Bloquear Proxy</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.blockTor}
                                onChange={(e) => setFormData({ ...formData, blockTor: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Bloquear Tor</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {restriction ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
