'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Shield, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

interface TimeWindow {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone: string;
    active: boolean;
    createdAt: string;
}

interface TimeWindowManagerProps {
    orgId: string;
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
];

export function TimeWindowManager({ orgId }: TimeWindowManagerProps) {
    const [windows, setWindows] = useState<TimeWindow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingWindow, setEditingWindow] = useState<TimeWindow | null>(null);

    useEffect(() => {
        loadTimeWindows();
    }, [orgId]);

    const loadTimeWindows = async () => {
        try {
            const response = await fetch('/api/time-windows');
            const data = await response.json();
            setWindows(data.data);
        } catch (error) {
            console.error('Erro ao carregar janelas de tempo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta janela de tempo?')) {
            return;
        }

        try {
            await fetch(`/api/time-windows/${id}`, { method: 'DELETE' });
            await loadTimeWindows();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    const handleToggleActive = async (window: TimeWindow) => {
        try {
            await fetch(`/api/time-windows/${window.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !window.active }),
            });
            await loadTimeWindows();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Janelas de Tempo (TBAC)
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Controle temporal de acesso ao sistema
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova Janela
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{windows.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ativas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {windows.filter(w => w.active).length}
                            </p>
                        </div>
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Inativas</p>
                            <p className="text-2xl font-bold text-gray-600">
                                {windows.filter(w => !w.active).length}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Horário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Dias
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Timezone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {windows.map((window) => (
                                <tr key={window.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {window.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                            {window.startTime} - {window.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {window.daysOfWeek.map((day) => (
                                                <span
                                                    key={day}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                >
                                                    {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {window.timezone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(window)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${window.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-200'
                                                }`}
                                        >
                                            {window.active ? 'Ativa' : 'Inativa'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingWindow(window)}
                                                className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(window.id)}
                                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {windows.length === 0 && (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Nenhuma janela de tempo configurada
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Criar primeira janela
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <TimeWindowModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={loadTimeWindows}
                />
            )}

            {editingWindow && (
                <TimeWindowModal
                    window={editingWindow}
                    onClose={() => setEditingWindow(null)}
                    onSave={loadTimeWindows}
                />
            )}
        </div>
    );
}

// Modal Component
function TimeWindowModal({
    window,
    onClose,
    onSave,
}: {
    window?: TimeWindow;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        name: window?.name || '',
        startTime: window?.startTime || '08:00',
        endTime: window?.endTime || '18:00',
        daysOfWeek: window?.daysOfWeek || [1, 2, 3, 4, 5],
        timezone: window?.timezone || 'America/Sao_Paulo',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = window ? `/api/time-windows/${window.id}` : '/api/time-windows';
            const method = window ? 'PATCH' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const toggleDay = (day: number) => {
        setFormData(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day].sort(),
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {window ? 'Editar' : 'Nova'} Janela de Tempo
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
                                Início
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fim
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dias da Semana
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${formData.daysOfWeek.includes(day.value)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Timezone
                        </label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                            <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                            <option value="America/New_York">New York (EST)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="UTC">UTC</option>
                        </select>
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
                            {window ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
