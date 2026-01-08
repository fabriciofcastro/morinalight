"use client";

import { useState } from "react";
import { Copy, X, FileText, Clock, GitBranch } from "lucide-react";
import { FuturisticInput } from "./futuristic-input";

interface DuplicateBranchModalProps {
    branchName: string;
    onConfirm: (options: DuplicateOptions) => void;
    onCancel: () => void;
}

export interface DuplicateOptions {
    newName: string;
    newCode: string;
    copyDocuments: boolean;
    copyBusinessHours: boolean;
    maintainHierarchy: boolean;
}

export function DuplicateBranchModal({
    branchName,
    onConfirm,
    onCancel,
}: DuplicateBranchModalProps) {
    const [newName, setNewName] = useState(`${branchName} (Cópia)`);
    const [newCode, setNewCode] = useState("");
    const [copyDocuments, setCopyDocuments] = useState(false);
    const [copyBusinessHours, setCopyBusinessHours] = useState(true);
    const [maintainHierarchy, setMaintainHierarchy] = useState(false);

    const handleConfirm = () => {
        if (!newName.trim() || !newCode.trim()) {
            return;
        }

        onConfirm({
            newName: newName.trim(),
            newCode: newCode.trim(),
            copyDocuments,
            copyBusinessHours,
            maintainHierarchy,
        });
    };

    const canConfirm = newName.trim().length >= 2 && newCode.trim().length >= 2;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <div
                className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Copy className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Duplicar Filial</h2>
                            <p className="text-sm text-white/60">Criar cópia de "{branchName}"</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Informações básicas */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/90">Informações da Nova Filial</h3>
                        <div className="space-y-4">
                            <FuturisticInput
                                label="Nome"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nome da nova filial"
                                helperText="Este nome será usado para identificar a nova filial"
                            />
                            <FuturisticInput
                                label="Código Interno"
                                required
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value)}
                                placeholder="Ex: FIL-02"
                                helperText="Código único para a nova filial"
                            />
                        </div>
                    </div>

                    {/* Opções de cópia */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/90 mb-3">O que deseja copiar?</h3>

                        {/* Copiar documentos */}
                        <label className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={copyDocuments}
                                onChange={(e) => setCopyDocuments(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium text-white">Copiar Documentos</span>
                                </div>
                                <p className="text-xs text-white/60 mt-1">
                                    Todos os documentos anexados serão copiados para a nova filial
                                </p>
                            </div>
                        </label>

                        {/* Copiar horários */}
                        <label className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={copyBusinessHours}
                                onChange={(e) => setCopyBusinessHours(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-green-400" />
                                    <span className="font-medium text-white">Copiar Horários de Funcionamento</span>
                                </div>
                                <p className="text-xs text-white/60 mt-1">
                                    Os horários de funcionamento serão mantidos na nova filial
                                </p>
                            </div>
                        </label>

                        {/* Manter hierarquia */}
                        <label className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={maintainHierarchy}
                                onChange={(e) => setMaintainHierarchy(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-purple-400" />
                                    <span className="font-medium text-white">Manter Mesma Hierarquia</span>
                                </div>
                                <p className="text-xs text-white/60 mt-1">
                                    A nova filial terá o mesmo tipo e filial pai da original
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Aviso */}
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs text-yellow-400">
                            <strong>Atenção:</strong> CNPJ, Razão Social e Inscrição Estadual não serão copiados.
                            Você precisará preenchê-los manualmente após a duplicação.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${canConfirm
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-white/10 text-white/40 cursor-not-allowed"
                            }`}
                    >
                        <Copy className="w-4 h-4" />
                        Duplicar Filial
                    </button>
                </div>
            </div>
        </div>
    );
}
