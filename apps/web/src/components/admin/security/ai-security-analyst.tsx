
"use client";

import { useChat } from "ai/react";
import { Button, GlassCard, Input, cn } from "@morina/ui";
import { Bot, ChevronDown, ChevronUp, Loader2, Send, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AiSecurityAnalyst() {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/security/ai/chat",
        onError: (error) => {
            console.error("AI Chat Error", error);
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300",
            isOpen ? "w-[400px] h-[600px]" : "w-auto h-auto"
        )}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="flex flex-col w-full h-full mb-4 overflow-hidden rounded-xl border border-[hsl(var(--primary)_/_0.3)] bg-[hsl(var(--surface)_/_0.95)] backdrop-blur-xl shadow-2xl shadow-[hsl(var(--primary)_/_0.1)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-[hsl(var(--primary)_/_0.2)]">
                                    <Bot className="h-5 w-5 text-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">AI Security Analyst</h3>
                                    <div className="flex items-center gap-1.5 ">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <p className="text-[10px] text-white/50">Online & Monitoring</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8 hover:bg-white/10">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                    <Sparkles className="h-12 w-12 text-[hsl(var(--primary))]" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">Como posso ajudar?</p>
                                        <p className="text-xs text-white/60 max-w-[200px]">
                                            Analiso alertas, verifico reputação de IPs e investigo logs de usuários.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 w-full max-w-[250px]">
                                        <button
                                            className="text-xs p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
                                            onClick={() => {
                                                const event = { target: { value: "Quais são os alertas críticos recentes?" } } as any;
                                                handleInputChange(event);
                                                // Ideally we would auto-submit here but useChat requires form submission
                                            }}
                                        >
                                            "Quais são os alertas críticos?"
                                        </button>
                                        <button
                                            className="text-xs p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
                                            onClick={() => {
                                                const event = { target: { value: "Investigue a atividade do usuário admin@morina.com" } } as any;
                                                handleInputChange(event);
                                            }}
                                        >
                                            "Investigue o admin"
                                        </button>
                                    </div>
                                </div>
                            )}

                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex w-full mb-4",
                                        m.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex gap-3 max-w-[85%] rounded-2xl p-3 text-sm",
                                            m.role === "user"
                                                ? "bg-[hsl(var(--primary))] text-black rounded-tr-sm"
                                                : "bg-white/10 text-white rounded-tl-sm"
                                        )}
                                    >
                                        {m.role !== "user" && (
                                            <Bot className="h-5 w-5 mt-0.5 shrink-0 opacity-70" />
                                        )}
                                        <div className="flex flex-col gap-1">
                                            {/* Render tools executions differently if needed */}
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {m.content}
                                            </div>
                                            {m.toolInvocations?.map((toolInvocation) => {
                                                const toolCallId = toolInvocation.toolCallId;
                                                // Only show tool execution status, not full result unless debug
                                                if (!('result' in toolInvocation)) {
                                                    return (
                                                        <div key={toolCallId} className="flex items-center gap-2 text-xs text-white/40 italic bg-black/20 p-1.5 rounded">
                                                            <Terminal className="h-3 w-3" />
                                                            Executando: {toolInvocation.toolName}...
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <div key={toolCallId} className="flex items-center gap-2 text-xs text-[hsl(var(--success))] bg-[hsl(var(--success)_/_0.1)] p-1.5 rounded border border-[hsl(var(--success)_/_0.2)]">
                                                        <Terminal className="h-3 w-3" />
                                                        Executado: {toolInvocation.toolName}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
                                        <Bot className="h-4 w-4 opacity-50" />
                                        <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                                        <span className="text-xs text-white/40">Analisando...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Descreva o incidente ou faça uma pergunta..."
                                    className="pr-10 bg-black/20 border-white/10 focus:bg-black/40"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className={cn(
                                        "absolute right-1 h-8 w-8 transition-all",
                                        input.trim() ? "bg-[hsl(var(--primary))] text-black" : "bg-transparent text-white/20 hover:bg-white/5"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    layoutId="ai-trigger"
                    onClick={toggleOpen}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-black shadow-[0_0_20px_hsl(var(--primary)_/_0.4)] transition-all hover:scale-110 hover:shadow-[0_0_30px_hsl(var(--primary)_/_0.6)]"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        1
                    </span>
                </motion.button>
            )}
        </div>
    );
}
