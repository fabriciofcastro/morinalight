"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck, Terminal } from 'lucide-react';
import { Button, Input, Label, Alert, Checkbox, Popover, PopoverTrigger, PopoverContent, TooltipProvider } from '@morina/ui';
import { authApi } from '@/lib/api/auth';
import { cn } from '@morina/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { PasswordRequirements } from './PasswordRequirements';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🔐 [LOGIN] Iniciando processo de login...');
        console.log('📧 [LOGIN] Email:', email);
        console.log('✅ [LOGIN] Termos aceitos:', termsAccepted);

        if (!termsAccepted) {
            console.warn('⚠️ [LOGIN] Termos não aceitos');
            setError('Protocolo de segurança: Aceite os termos.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            console.log('🌐 [LOGIN] Chamando authApi.login...');
            const response = await authApi.login({ email, password });
            console.log('✅ [LOGIN] Resposta recebida:', {
                hasToken: !!response.token,
                userId: response.user.userId,
                organizationsCount: response.organizations.length
            });

            // Pequeno delay para garantir que o cookie seja salvo
            console.log('⏳ [LOGIN] Aguardando 100ms para salvar cookie...');
            await new Promise(resolve => setTimeout(resolve, 100));

            // Usar window.location.href para garantir redirecionamento completo
            if (response.organizations.length > 1) {
                console.log('🔀 [LOGIN] Redirecionando para seleção de organização...');
                window.location.href = '/select-organization';
            } else {
                console.log('🏠 [LOGIN] Redirecionando para dashboard...');
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            console.error('❌ [LOGIN] Erro durante login:', err);
            console.error('📋 [LOGIN] Detalhes do erro:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            setLoginAttempts(prev => prev + 1);
            const errorMessage = err.response?.data?.error || err.response?.data?.message;
            if (errorMessage === 'invalid_credentials') {
                setError('Acesso Negado: Credenciais inválidas.');
            } else if (errorMessage === 'account_locked') {
                setError('Bloqueio de Segurança: Contate admin.');
            } else if (errorMessage === 'too_many_attempts') {
                setError('Muitas tentativas. Aguarde cooldown.');
            } else {
                setError('Erro de Conexão. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePasswordStrength = (pwd: string): number => {
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const strength = calculatePasswordStrength(password);

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">

                {/* Error Notification - Squared Tech */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-red-500/10 border-l-2 border-red-500 text-red-200 px-4 py-3 flex items-center gap-3 text-xs font-mono tracking-tight backdrop-blur-sm"
                        >
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="uppercase">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    {/* Email Input - Squared & Technical */}
                    <div className="group space-y-1.5">
                        <Label htmlFor="email" className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                            <Terminal className="h-3 w-3" />
                            Identificador Corporativo
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative bg-black/40 border border-white/10 flex items-center px-0 h-12 focus-within:border-[hsl(var(--primary))] transition-all duration-300 group-hover:border-white/20">
                                <div className="h-full w-12 flex items-center justify-center border-r border-white/10 bg-white/5">
                                    <Mail className="h-5 w-5 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="USUARIO@MORINA.COM"
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 px-4 h-full font-mono tracking-wide"
                                    required
                                    autoComplete="username"
                                    disabled={isLoading}
                                />
                                {/* Corner Accents */}
                                <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                                <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Password Input - Squared & Technical */}
                    <div className="group space-y-1.5">
                        <div className="flex justify-between items-center pl-1">
                            <Label htmlFor="password" className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" />
                                Credencial de Acesso
                            </Label>
                            <Link href="/forgot-password" className="text-[9px] text-white/40 hover:text-[hsl(var(--primary))] transition-colors font-mono uppercase tracking-wider">
                                [ Recuperar Acesso ]
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative bg-black/40 border border-white/10 flex items-center px-0 h-12 focus-within:border-[hsl(var(--primary))] transition-all duration-300 group-hover:border-white/20">
                                <div className="h-full w-12 flex items-center justify-center border-r border-white/10 bg-white/5">
                                    <Lock className="h-5 w-5 text-white/40 group-focus-within:text-[hsl(var(--primary))] transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 px-4 h-full font-mono tracking-wide"
                                    required
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="h-full w-12 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all border-l border-white/10"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                {/* Corner Accents */}
                                <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                                <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-focus-within:border-[hsl(var(--primary))] transition-colors" />
                            </div>
                        </div>

                        {/* Technical Password Strength - Squared Blocks */}
                        <AnimatePresence>
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-1"
                                >
                                    <div className="flex gap-0.5 h-1">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={cn(
                                                    "flex-1 transition-colors duration-300",
                                                    i < strength
                                                        ? strength <= 2 ? "bg-red-500" : strength <= 3 ? "bg-yellow-500" : "bg-[hsl(var(--primary))]"
                                                        : "bg-white/5"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] font-mono text-white/30 uppercase">Segurança</span>
                                        <span className={cn(
                                            "text-[9px] font-mono uppercase tracking-wider",
                                            strength <= 2 ? "text-red-500" : strength <= 3 ? "text-yellow-500" : "text-[hsl(var(--primary))]"
                                        )}>
                                            {strength <= 2 ? "Vulnerável" : strength <= 3 ? "Moderada" : "Blindada"}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Terms & Remember - Squared Checkboxes */}
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="h-4 w-4 border border-white/30 bg-black/20 peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all flex items-center justify-center">
                                <div className="h-2 w-2 bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors font-mono leading-snug">
                            CONFIRMO LEITURA: <Link href="/termos" className="text-[hsl(var(--primary))] hover:underline">TERMOS</Link> & <Link href="/privacidade" className="text-[hsl(var(--primary))] hover:underline">POLÍTICAS</Link>
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="h-4 w-4 border border-white/30 bg-black/20 peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all flex items-center justify-center">
                                <div className="h-2 w-2 bg-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors font-mono uppercase">
                            Manter Sessão Ativa
                        </span>
                    </label>
                </div>

                {/* Action Button - Squared Tech */}
                <Button
                    type="submit"
                    className={cn(
                        "w-full h-14 font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden group border border-transparent",
                        termsAccepted && !isLoading
                            ? "bg-[hsl(var(--primary))] text-black hover:bg-[hsl(var(--primary)/0.9)] shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                            : "bg-white/5 text-white/20 border-white/10 cursor-not-allowed"
                    )}
                    disabled={isLoading || !termsAccepted || loginAttempts >= 5}
                >
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700" />

                    <span className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="animate-pulse">ESTABELECENDO CONEXÃO...</span>
                            </>
                        ) : (
                            <>
                                INICIAR SISTEMA
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </Button>
            </form>
        </TooltipProvider>
    );
}
