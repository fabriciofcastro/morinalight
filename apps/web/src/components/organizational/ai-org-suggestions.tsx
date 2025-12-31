"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Building2, Users, Lightbulb, X, RefreshCw } from "lucide-react";
import { Button, cn } from "@morina/ui";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
    id: string;
    type: "structure" | "optimization" | "best-practice" | "warning";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    category: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface AIOrgSuggestionsProps {
    context: {
        companySize?: "small" | "medium" | "large";
        industry?: string;
        currentDepartments?: number;
        currentEmployees?: number;
    };
    onApplySuggestion?: (suggestion: Suggestion) => void;
    className?: string;
}

export function AIOrgSuggestions({
    context,
    onApplySuggestion,
    className,
}: AIOrgSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        generateSuggestions();
    }, [context]);

    const generateSuggestions = async () => {
        setLoading(true);

        // Simulação de chamada AI - em produção, substituir por API real
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockSuggestions: Suggestion[] = [];

        // Sugestões baseadas no tamanho da empresa
        if (context.companySize === "small" && (context.currentDepartments || 0) > 5) {
            mockSuggestions.push({
                id: "consolidate-depts",
                type: "optimization",
                title: "Consolidar Departamentos",
                description: "Para empresas de pequeno porte, recomendamos manter 3-4 departamentos principais. Considere consolidar departamentos com funções similares.",
                impact: "medium",
                category: "Estrutura",
                action: {
                    label: "Ver Sugestão de Estrutura",
                    onClick: () => console.log("Show consolidation plan"),
                },
            });
        }

        if ((context.currentEmployees || 0) > 50 && (context.currentDepartments || 0) < 3) {
            mockSuggestions.push({
                id: "expand-structure",
                type: "structure",
                title: "Expandir Estrutura Organizacional",
                description: "Com mais de 50 colaboradores, considere criar departamentos especializados (RH, Financeiro, Operações) para melhor gestão.",
                impact: "high",
                category: "Estrutura",
                action: {
                    label: "Criar Departamentos",
                    onClick: () => console.log("Create departments"),
                },
            });
        }

        // Best practices
        mockSuggestions.push({
            id: "manager-assignment",
            type: "best-practice",
            title: "Atribuir Gestores aos Departamentos",
            description: "Departamentos sem gestores definidos podem ter problemas de coordenação. Configure os gestores para melhor accountability.",
            impact: "high",
            category: "Gestão",
            action: {
                label: "Configurar Gestores",
                onClick: () => console.log("Configure managers"),
            },
        });

        mockSuggestions.push({
            id: "hierarchy-depth",
            type: "optimization",
            title: "Otimizar Profundidade Hierárquica",
            description: "Estruturas muito verticais (>4 níveis) podem dificultar a comunicação. Considere uma hierarquia mais horizontal.",
            impact: "medium",
            category: "Estrutura",
        });

        mockSuggestions.push({
            id: "cross-functional",
            type: "structure",
            title: "Criar Equipes Multifuncionais",
            description: "Para projetos complexos, considere criar setores com membros de diferentes departamentos.",
            impact: "low",
            category: "Inovação",
        });

        // Warning
        if ((context.currentEmployees || 0) / (context.currentDepartments || 1) > 20) {
            mockSuggestions.push({
                id: "overload-warning",
                type: "warning",
                title: "Possível Sobrecarga Departamental",
                description: "Alguns departamentos podem estar com muitos colaboradores. Ideal: 8-15 pessoas por departamento.",
                impact: "high",
                category: "Alerta",
                action: {
                    label: "Analisar Distribuição",
                    onClick: () => console.log("Analyze distribution"),
                },
            });
        }

        setSuggestions(mockSuggestions.filter(s => !dismissed.has(s.id)));
        setLoading(false);
    };

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set(prev).add(id));
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    const getImpactColor = (impact: Suggestion["impact"]) => {
        switch (impact) {
            case "high":
                return "text-red-400 bg-red-500/10 border-red-500/20";
            case "medium":
                return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "low":
                return "text-blue-400 bg-blue-500/10 border-blue-500/20";
        }
    };

    const getTypeIcon = (type: Suggestion["type"]) => {
        switch (type) {
            case "structure":
                return <Building2 className="w-5 h-5" />;
            case "optimization":
                return <TrendingUp className="w-5 h-5" />;
            case "best-practice":
                return <Lightbulb className="w-5 h-5" />;
            case "warning":
                return <Sparkles className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className={cn("p-6 rounded-xl border border-white/10 bg-white/5", className)}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Analisando Estrutura...</h3>
                        <p className="text-sm text-white/50">IA processando recomendações</p>
                    </div>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-20 bg-white/5 rounded-lg"></div>
                    <div className="h-20 bg-white/5 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <div className={cn("p-6 rounded-xl border border-white/10 bg-white/5", className)}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Sugestões IA</h3>
                        <p className="text-sm text-white/50">Sua estrutura está otimizada!</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="w-16 h-16 text-white/20 mb-3" />
                    <p className="text-white/40 text-sm">
                        Nenhuma sugestão de melhoria no momento
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateSuggestions}
                        className="mt-4 text-white/50 hover:text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar Análise
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Sugestões de IA</h3>
                        <p className="text-sm text-white/50">
                            {suggestions.length} recomendação{suggestions.length !== 1 ? "ões" : ""} disponível{suggestions.length !== 1 ? "is" : ""}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSuggestions}
                    className="text-white/50 hover:text-white"
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Suggestions List */}
            <AnimatePresence>
                {suggestions.map((suggestion) => (
                    <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-purple-500/30 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                getImpactColor(suggestion.impact)
                            )}>
                                {getTypeIcon(suggestion.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{suggestion.title}</h4>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDismiss(suggestion.id)}
                                        className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs px-2 py-1 rounded border border-white/10 bg-white/5 text-white/50">
                                        {suggestion.category}
                                    </span>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded border",
                                        getImpactColor(suggestion.impact)
                                    )}>
                                        Impacto: {suggestion.impact === "high" ? "Alto" : suggestion.impact === "medium" ? "Médio" : "Baixo"}
                                    </span>

                                    {suggestion.action && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                suggestion.action?.onClick();
                                                onApplySuggestion?.(suggestion);
                                            }}
                                            className="ml-auto text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                        >
                                            {suggestion.action.label}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
