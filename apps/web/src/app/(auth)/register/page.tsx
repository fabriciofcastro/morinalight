"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, Users } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))] p-4">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--text-1)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text-1)) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px'
                }}
            />

            <div className="relative z-10 w-full max-w-6xl">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="flex flex-col justify-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[hsl(var(--text-1))]">Morina Light</h1>
                                <p className="text-sm text-[hsl(var(--text-3))]">Sistema Corporativo</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h2 className="text-4xl font-bold text-[hsl(var(--text-1))] lg:text-5xl">
                                Crie sua conta
                            </h2>
                            <p className="text-lg text-[hsl(var(--text-2))]">
                                Junte-se à plataforma de gestão corporativa com auditoria completa e controle de comissões.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-[hsl(var(--primary)_/_0.1)] flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[hsl(var(--text-1))]">Controle Total</p>
                                    <p className="text-sm text-[hsl(var(--text-3))]">
                                        Gerencie comissões, clientes e operações em um só lugar
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-[hsl(var(--primary)_/_0.1)] flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[hsl(var(--text-1))]">Segurança Empresarial</p>
                                    <p className="text-sm text-[hsl(var(--text-3))]">
                                        Criptografia, RBAC e conformidade com LGPD
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-5 w-5 rounded-full bg-[hsl(var(--primary)_/_0.1)] flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[hsl(var(--text-1))]">Rastreabilidade Total</p>
                                    <p className="text-sm text-[hsl(var(--text-3))]">
                                        Auditoria completa de todas as operações e alterações
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/terms" className="flex items-center gap-2 text-sm text-[hsl(var(--text-3))] hover:text-[hsl(var(--primary))] transition-colors">
                                <FileText className="h-4 w-4" />
                                Termos de Uso
                            </Link>
                            <Link href="/privacy" className="flex items-center gap-2 text-sm text-[hsl(var(--text-3))] hover:text-[hsl(var(--primary))] transition-colors">
                                <Shield className="h-4 w-4" />
                                Privacidade
                            </Link>
                            <Link href="/lgpd" className="flex items-center gap-2 text-sm text-[hsl(var(--text-3))] hover:text-[hsl(var(--primary))] transition-colors">
                                <Lock className="h-4 w-4" />
                                LGPD
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-end">
                        <div className="w-full max-w-md">
                            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 shadow-lg">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-[hsl(var(--text-1))]">Criar nova conta</h3>
                                    <p className="mt-2 text-sm text-[hsl(var(--text-3))]">
                                        Preencha os dados para começar
                                    </p>
                                </div>

                                <Suspense fallback={
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                                    </div>
                                }>
                                    <RegisterForm />
                                </Suspense>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-[hsl(var(--text-3))]">
                                    Desenvolvido por Michel, Adriana e Fabrício
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
