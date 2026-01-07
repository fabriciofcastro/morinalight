"use client";

import { authApi } from '@/lib/api/auth';
import { Alert, Button, Checkbox, Input, Label } from '@morina/ui';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterForm() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordStrength = {
        hasMinLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    };

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isPasswordStrong) {
            setError('A senha não atende aos requisitos mínimos de segurança.');
            return;
        }

        if (!passwordsMatch) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!acceptedTerms) {
            setError('Você deve aceitar os termos de uso para continuar.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.register({ email, password, displayName });

            if (response?.organizations && response.organizations.length > 1) {
                router.push('/select-organization');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const message =
                typeof err === "object" &&
                err &&
                "response" in err &&
                typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
                    ? (err as { response: { data: { message: string } } }).response.data.message
                    : null;
            setError(message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <Alert variant="error" className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </Alert>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">Nome completo</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        id="displayName"
                        type="text"
                        placeholder="Seu nome"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email corporativo</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-3))] hover:text-[hsl(var(--text-1))] transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>

                {password && (
                    <div className="mt-2 space-y-1.5">
                        <PasswordRequirement met={passwordStrength.hasMinLength}>
                            Mínimo 8 caracteres
                        </PasswordRequirement>
                        <PasswordRequirement met={passwordStrength.hasUpperCase}>
                            Uma letra maiúscula
                        </PasswordRequirement>
                        <PasswordRequirement met={passwordStrength.hasLowerCase}>
                            Uma letra minúscula
                        </PasswordRequirement>
                        <PasswordRequirement met={passwordStrength.hasNumber}>
                            Um número
                        </PasswordRequirement>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
                {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm">
                        {passwordsMatch ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-green-600">Senhas coincidem</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-600">Senhas não coincidem</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-start gap-2">
                <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    disabled={isLoading}
                    className="mt-0.5"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                    Aceito os{' '}
                    <Link href="/terms" target="_blank" className="text-[hsl(var(--primary))] hover:underline">
                        Termos de Uso
                    </Link>
                    {' '}e declaro estar ciente da{' '}
                    <Link href="/terms#competencia" target="_blank" className="text-[hsl(var(--primary))] hover:underline">
                        Política de Competência Mensal
                    </Link>
                    {' '}para comissões
                </Label>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isPasswordStrong || !passwordsMatch || !acceptedTerms}
            >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="text-center text-sm text-[hsl(var(--text-2))]">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-[hsl(var(--primary))] hover:underline">
                    Fazer login
                </Link>
            </div>
        </form>
    );
}

function PasswordRequirement({ met, children }: { met: boolean; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {met ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
                <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--border))] flex-shrink-0" />
            )}
            <span className={met ? 'text-green-600' : 'text-[hsl(var(--text-3))]'}>{children}</span>
        </div>
    );
}
