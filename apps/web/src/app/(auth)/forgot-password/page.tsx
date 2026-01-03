"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Input, Label, Alert } from '@morina/ui';
import { cn } from '@morina/ui';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // TODO: Implement API call
            // await authApi.forgotPassword({ email });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
        } catch {
            setError('Erro ao enviar email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                            <CheckCircle className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Email Enviado!</h1>
                        <p className="text-sm text-white/60 mb-6">
                            Enviamos instruções para redefinir sua senha para <strong className="text-white">{email}</strong>
                        </p>
                        <p className="text-xs text-white/40 mb-6">
                            Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                        </p>
                        <Link href="/login">
                            <Button className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)]">
                                Voltar para Login
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="mb-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para login
                    </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
                        <p className="text-sm text-white/60">
                            Digite seu email corporativo e enviaremos instruções para redefinir sua senha.
                        </p>
                    </div>

                    {error && (
                        <Alert variant="error" className="mb-4 flex items-start gap-2 bg-red-500/10 border-red-500/20 text-red-200 py-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
                            <span className="text-xs">{error}</span>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-white/70">
                                Email Corporativo
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="pl-9 h-10 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-10 font-semibold text-sm tracking-wide transition-all duration-300 border-none",
                                "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]"
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Instruções'}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/40 text-center">
                            Lembrou sua senha?{' '}
                            <Link href="/login" className="text-[hsl(var(--primary))] hover:underline font-semibold">
                                Fazer Login
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
