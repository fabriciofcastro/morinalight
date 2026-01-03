"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Users, Building2, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@morina/ui";
import {
    generateOrganizationalSuggestions,
    type OrganizationalContext,
    type DepartmentSuggestion,
} from "@/lib/ai/organizational-suggestions";

interface AISuggestionsProps {
    context: OrganizationalContext;
    onApplySuggestion?: (suggestion: DepartmentSuggestion) => void;
    className?: string;
}

export function AISuggestions({ context, onApplySuggestion, className }: AISuggestionsProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<ReturnType<typeof generateOrganizationalSuggestions> | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simular delay de IA
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = generateOrganizationalSuggestions(context);
        setSuggestions(result);
        setIsGenerating(false);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Sugestões de IA</h3>
                        <p className="text-sm text-white/60">Recomendações baseadas em melhores práticas</p>
                    </div>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                    {isGenerating ? (
                        <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gerar Sugestões
                        </>
                    )}
                </Button>
            </div>

            <AnimatePresence>
                {suggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Gaps Organizacionais */}
                        {suggestions.gaps.length > 0 && (
                            <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <h4 className="font-bold text-white">Gaps Críticos</h4>
                                </div>
                                <ul className="space-y-2">
                                    {suggestions.gaps.map((gap, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-red-300">
                                            <span className="text-red-400 mt-0.5">•</span>
                                            {gap}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Sugestões de Departamentos */}
                        {suggestions.departments.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="w-5 h-5 text-purple-400" />
                                    <h4 className="font-bold text-white">Departamentos Sugeridos</h4>
                                    <span className="text-xs text-white/40">({suggestions.departments.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestions.departments.map((dept, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-white mb-1">{dept.name}</h5>
                                                    <p className="text-xs text-white/60">{dept.description}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(dept.priority)}`}>
                                                    {dept.priority}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-start gap-2 text-xs text-white/70">
                                                    <Lightbulb className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
                                                    <span>{dept.reason}</span>
                                                </div>
                                                {dept.estimatedHeadcount && (
                                                    <div className="flex items-center gap-2 text-xs text-white/60">
                                                        <Users className="w-3 h-3" />
                                                        <span>~{dept.estimatedHeadcount} pessoas</span>
                                                    </div>
                                                )}
                                            </div>

                                            {onApplySuggestion && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onApplySuggestion(dept)}
                                                    className="w-full border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 text-white/80 hover:text-white"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-2" />
                                                    Aplicar Sugestão
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sugestão de Hierarquia */}
                        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                <h4 className="font-bold text-white">Estrutura Hierárquica Recomendada</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-white/80">Tipo:</span>
                                        <span className="text-sm font-bold text-blue-400 uppercase">{suggestions.hierarchy.structure}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-medium text-white/80">Níveis:</span>
                                        <span className="text-sm font-bold text-white">{suggestions.hierarchy.levels}</span>
                                    </div>
                                    <p className="text-sm text-white/60 mb-4">{suggestions.hierarchy.reasoning}</p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h5 className="text-xs font-bold text-emerald-400 mb-2">Vantagens</h5>
                                        <ul className="space-y-1">
                                            {suggestions.hierarchy.pros.map((pro, index) => (
                                                <li key={index} className="flex items-start gap-2 text-xs text-white/70">
                                                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-400 shrink-0" />
                                                    {pro}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-amber-400 mb-2">Desafios</h5>
                                        <ul className="space-y-1">
                                            {suggestions.hierarchy.cons.map((con, index) => (
                                                <li key={index} className="flex items-start gap-2 text-xs text-white/70">
                                                    <AlertCircle className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
                                                    {con}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recomendações Gerais */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                                <h4 className="font-bold text-white">Recomendações</h4>
                            </div>
                            <ul className="space-y-2">
                                {suggestions.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                                        <span className="text-purple-400 mt-1">→</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!suggestions && !isGenerating && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-2">Clique em "Gerar Sugestões" para receber</p>
                    <p className="text-sm text-white/40">recomendações personalizadas de IA</p>
                </div>
            )}
        </div>
    );
}
