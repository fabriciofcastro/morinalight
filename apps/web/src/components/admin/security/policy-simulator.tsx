"use client";

import { PolicyCompiler } from "@morina/shared-kernel";
import {
    Badge,
    Button,
    GlassCard,
    Input
} from "@morina/ui";
import {
    Clock,
    Info,
    Play,
    User
} from "lucide-react";
import { useState } from "react";

/**
 * Policy Simulator
 * Allows non-destructive testing of authorization rules.
 */
export function PolicySimulator({ policy }: { policy: any }) {
    const [result, setResult] = useState<boolean | null>(null);
    const [simulationLog, setSimulationLog] = useState<string[]>([]);

    const [context, setContext] = useState({
        userRole: "MANAGER",
        time: "10:00",
        resourceValue: 5000,
        isMfa: true
    });

    const runSimulation = () => {
        const logs = [];
        logs.push(`🔍 Iniciando simulação para: ${policy.name}`);
        logs.push(`👤 Contexto: Usuário=${context.userRole}, Horário=${context.time}, Valor=${context.resourceValue}`);

        // Mocking evaluation based on PolicyCompiler logic
        // (In a real scenario, this calls the actual compiler)
        const mockContext = {
            user: { role: context.userRole, id: "sim-user" },
            environment: { time: new Date(`2026-01-01T${context.time}:00Z`), mfaVerified: context.isMfa }
        };
        const mockResource = { value: context.resourceValue };

        const isAllowed = PolicyCompiler.evaluate(policy.conditions || {}, mockContext as any, mockResource);

        const finalDecision = policy.effect === 'ALLOW' ? isAllowed : !isAllowed;

        setResult(finalDecision);
        logs.push(`🏁 Resultado: ${finalDecision ? 'PERMITIDO' : 'NEGADO'}`);
        setSimulationLog(logs);
    };

    return (
        <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-400" /> Simulador de Política
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-3 p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase">
                            <User className="h-3 w-3" /> Perfil do Usuário
                        </div>
                        <Input
                            value={context.userRole}
                            onChange={(e) => setContext({ ...context, userRole: e.target.value })}
                            placeholder="Cargo (ex: MANAGER, ADMIN)"
                        />
                    </div>

                    <div className="space-y-3 p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase">
                            <Clock className="h-3 w-3" /> Horário do Evento
                        </div>
                        <Input
                            type="time"
                            value={context.time}
                            onChange={(e) => setContext({ ...context, time: e.target.value })}
                        />
                    </div>

                    <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-500" onClick={runSimulation}>
                        <Play className="mr-2 h-4 w-4" /> Executar Dry-Run
                    </Button>
                </div>

                <div className="bg-black/60 rounded-xl border border-white/5 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Resultado do Teste</span>
                        {result !== null && (
                            <Badge variant={result ? "success" : "danger"}>
                                {result ? "ALLOWED" : "DENIED"}
                            </Badge>
                        )}
                    </div>

                    <div className="flex-1 font-mono text-[10px] text-white/60 space-y-1 overflow-y-auto max-h-[150px] custom-scrollbar">
                        {simulationLog.map((log, i) => <div key={i}>{log}</div>)}
                        {result === null && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
                                <Info className="h-8 w-8 mb-2 opacity-50" />
                                Configure o contexto e execute a simulação
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
