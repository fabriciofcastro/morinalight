
"use client";

import { useEffect, useState } from "react";
import { ApprovalRequest, ApprovalRequestComment, governanceAPI } from "@/lib/api/governance";
import { FuturisticInput } from "@/shared/ui/base/futuristic-ui";
import { Loader2, Send, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RequestDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: ApprovalRequest | null;
    onAction: (id: string, action: 'approve' | 'reject') => void;
}

export function RequestDetailsDialog({ open, onOpenChange, request, onAction }: RequestDetailsDialogProps) {
    const [comments, setComments] = useState<ApprovalRequestComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (open && request) {
            loadComments();
        }
    }, [open, request]);

    async function loadComments() {
        if (!request) return;
        setLoadingComments(true);
        try {
            const data = await governanceAPI.getComments(request.id);
            setComments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    }

    async function handleSendComment() {
        if (!request || !newComment.trim()) return;
        setSending(true);
        try {
            const comment = await governanceAPI.createComment(request.id, newComment);
            setComments([...comments, comment]);
            setNewComment("");
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    if (!request) return null;

    return (
        // Simplistic Dialog implementation if UI kit not fully available, adapting to current codebase style
        // Assuming we are injecting this into the main DOM or using a Portal if we had one.
        // For now, I'll use a fixed overlay since I don't recall seeing a Dialog primitive in the imports list of GovernanceTab other than custom ones.
        // Wait, I saw `SensitiveActionConfirmDialog` which likely uses Radix.
        // I will assume I can't easily import Radix primitives without checking.
        // I'll build a custom overlay for safety or stick to the pattern used in `SensitiveActionConfirmDialog`.

        open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Detalhes da Solicitação</h2>
                            <p className="text-sm text-white/50">ID: {request.id.slice(0, 8)}</p>
                        </div>
                        <button onClick={() => onOpenChange(false)} className="text-white/50 hover:text-white">✕</button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Payload Diff (Simplified) */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Alterações Propostas</h3>
                            <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">
                                {JSON.stringify(request.data, null, 2)}
                            </pre>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-white/60" />
                                <h3 className="text-sm font-semibold text-white/80">Comentários & Discussão</h3>
                            </div>

                            <div className="space-y-4 min-h-[100px]">
                                {loadingComments ? (
                                    <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-white/20" /></div>
                                ) : comments.length === 0 ? (
                                    <p className="text-center text-sm text-white/30 italic py-4">Nenhum comentário ainda.</p>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                {comment.author.avatarUrl ? <img src={comment.author.avatarUrl} className="rounded-full" /> : <User className="w-4 h-4 text-white/50" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">{comment.author.displayName}</span>
                                                    <span className="text-xs text-white/40">{formatDistanceToNow(new Date(comment.createdAt), { locale: ptBR, addSuffix: true })}</span>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-3 rounded-tl-none border border-white/5 text-sm text-white/80">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                        <div className="flex gap-2 mb-4">
                            <input
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                                placeholder="Escreva um comentário..."
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={sending || !newComment.trim()}
                                className="p-2 rounded-xl bg-[hsl(var(--primary))] text-black hover:brightness-110 disabled:opacity-50 transition-all font-bold"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                            <button
                                onClick={() => { onAction(request.id, 'reject'); onOpenChange(false); }}
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                            >
                                Rejeitar
                            </button>
                            <button
                                onClick={() => { onAction(request.id, 'approve'); onOpenChange(false); }}
                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                            >
                                Aprovar Alteração
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
}
