"use client";

import { motion } from "framer-motion";
import {
    LogIn,
    Edit,
    Shield,
    Clock,
    UserPlus,
    UserMinus,
    Settings,
    FileText,
    CheckCircle2,
    AlertCircle,
    Info,
} from "lucide-react";
import { useState } from "react";

interface TimelineEvent {
    id: string;
    type: "login" | "edit" | "permission" | "create" | "delete" | "status_change" | "other";
    title: string;
    description: string;
    timestamp: Date;
    user?: string;
    metadata?: Record<string, any>;
}

interface UserTimelineProps {
    userId: string;
    events?: TimelineEvent[];
    loading?: boolean;
}

const eventConfig = {
    login: {
        icon: LogIn,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    },
    edit: {
        icon: Edit,
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/30",
    },
    permission: {
        icon: Shield,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
    },
    create: {
        icon: UserPlus,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
    },
    delete: {
        icon: UserMinus,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
    },
    status_change: {
        icon: CheckCircle2,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/20",
        borderColor: "border-cyan-500/30",
    },
    other: {
        icon: Info,
        color: "text-white/60",
        bgColor: "bg-white/10",
        borderColor: "border-white/20",
    },
};

export function UserTimeline({ userId, events = [], loading = false }: UserTimelineProps) {
    const [filter, setFilter] = useState<TimelineEvent["type"] | "all">("all");

    // Mock data para demonstração
    const mockEvents: TimelineEvent[] = [
        {
            id: "1",
            type: "login",
            title: "Login realizado",
            description: "IP: 192.168.1.100 • Chrome/Windows",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            user: "Sistema",
        },
        {
            id: "2",
            type: "edit",
            title: "Perfil atualizado",
            description: "Campo alterado: telefone",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            user: "João Silva",
        },
        {
            id: "3",
            type: "permission",
            title: "Permissão concedida",
            description: "users.edit • Concedido por Admin",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            user: "Admin",
        },
        {
            id: "4",
            type: "status_change",
            title: "Status alterado",
            description: "pendente → ativo",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            user: "Admin",
        },
        {
            id: "5",
            type: "create",
            title: "Usuário criado",
            description: "Conta criada no sistema",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            user: "Sistema",
        },
    ];

    const displayEvents = events.length > 0 ? events : mockEvents;
    const filteredEvents =
        filter === "all" ? displayEvents : displayEvents.filter((e) => e.type === filter);

    const filters: Array<{ id: TimelineEvent["type"] | "all"; label: string }> = [
        { id: "all", label: "Todos" },
        { id: "login", label: "Logins" },
        { id: "edit", label: "Edições" },
        { id: "permission", label: "Permissões" },
        { id: "status_change", label: "Status" },
    ];

    function formatRelativeTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "agora mesmo";
        if (diffMins < 60) return `há ${diffMins} min`;
        if (diffHours < 24) return `há ${diffHours}h`;
        if (diffDays < 7) return `há ${diffDays}d`;
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex gap-4 animate-pulse"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-1/3" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id
                                ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30"
                                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 border border-transparent"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-6 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

                {/* Events */}
                <div className="space-y-6">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 mx-auto text-white/20 mb-4" />
                            <p className="text-white/60">Nenhuma atividade encontrada</p>
                        </div>
                    ) : (
                        filteredEvents.map((event, index) => {
                            const config = eventConfig[event.type];
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex gap-4"
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center relative z-10`}
                                    >
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 p-4 rounded-lg border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-white/90">{event.title}</h4>
                                                <p className="text-sm text-white/60 mt-1">{event.description}</p>
                                            </div>
                                            <span className="text-xs text-white/50 whitespace-nowrap ml-4">
                                                {formatRelativeTime(event.timestamp)}
                                            </span>
                                        </div>

                                        {event.user && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                                                <span className="text-xs text-white/50">Por:</span>
                                                <span className="text-xs font-medium text-white/70">{event.user}</span>
                                            </div>
                                        )}

                                        {event.metadata && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(event.metadata).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            className="px-2 py-1 rounded bg-white/5 text-xs text-white/60"
                                                        >
                                                            {key}: {String(value)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Load more */}
            {filteredEvents.length > 0 && (
                <div className="text-center pt-4">
                    <button className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white/90 text-sm font-medium transition-all border border-white/20">
                        Carregar mais atividades
                    </button>
                </div>
            )}
        </div>
    );
}
