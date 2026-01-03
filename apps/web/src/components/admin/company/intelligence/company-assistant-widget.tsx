
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles, ChevronDown, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { companySettingsAPI } from "@/lib/api/company-settings";
import { cn } from "@morina/ui";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
}

interface CompanyAssistantWidgetProps {
    contextData: any;
    agentSlug?: string; // e.g. 'fiscal_advisor' or 'general_assistant'
}

export function CompanyAssistantWidget({ contextData, agentSlug = "general_assistant" }: CompanyAssistantWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Olá! Sou seu assistente de gestão empresarial. Como posso ajudar com os dados da sua empresa hoje?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Remove sensitive or large data from context to save tokens?
            // For now, sending full context as it's just company settings
            const response = await companySettingsAPI.sendChatMessage(userMsg.text, agentSlug, contextData);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: response.text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                text: "Desculpe, tive um problema ao processar sua solicitação. Tente novamente.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="font-bold pr-1">IA Assistant</span>
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed z-50 bg-[#09090b] border border-white/10 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden",
            isMinimized ? "bottom-6 right-6 w-72 h-14 rounded-t-xl" : "bottom-6 right-6 w-[400px] h-[600px] rounded-2xl"
        )}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => isMinimized ? setIsMinimized(false) : null}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight">Morina AI</h3>
                        <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online • Gemini Flash
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                                {msg.role === "assistant" && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                                        <Bot className="w-4 h-4 text-indigo-400" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
                                )}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    <span className="text-[10px] opacity-40 mt-1 block text-right">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                                        <User className="w-4 h-4 text-white/60" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white/5 border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua dúvida..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-white/30"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-white/20 mt-2">
                            A IA pode cometer erros. Verifique informações importantes.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
