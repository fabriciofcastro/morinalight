"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/shared/ui/base/button";

interface SentryUserFeedbackProps {
    eventId?: string;
    onClose?: () => void;
}

export function SentryUserFeedback({ eventId, onClose }: SentryUserFeedbackProps) {
    const [isOpen, setIsOpen] = useState(!!eventId);
    const [comments, setComments] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (eventId) {
            setIsOpen(true);
        }
    }, [eventId]);

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            Sentry.captureFeedback({
                message: comments,
                name,
                email,
                associatedEventId: eventId,
            });

            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">Oops! Algo deu errado.</h2>
                    <p className="text-sm text-zinc-400">
                        Nossa equipe foi notificada. Se você puder nos contar o que aconteceu, ajudará muito a corrigir o problema.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="py-6 text-center text-green-500">
                        <p className="text-lg font-medium">Obrigado pelo seu feedback!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-white">
                                Nome (Opcional)
                            </label>
                            <input
                                id="name"
                                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-white">
                                Email (Opcional)
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="comments" className="text-sm font-medium text-white">
                                O que você estava tentando fazer?
                            </label>
                            <textarea
                                id="comments"
                                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 min-h-[100px]"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Descreva o que aconteceu..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
