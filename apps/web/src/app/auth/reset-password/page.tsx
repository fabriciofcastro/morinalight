'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { FuturisticInput } from '@/shared/ui/base/futuristic-input';
import { Button } from '@/shared/ui/base/button';
import { toast } from 'sonner';
import { completePasswordResetAction } from '@/app/actions/auth-security';
import { PasswordStrengthMeter } from '@/components/auth/password-strength';
import { Lock, Key, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center text-white">
                <h2 className="text-xl font-bold text-red-500 mb-4">Link Inválido</h2>
                <p className="text-gray-400 mb-6">O link de recuperação está incompleto ou inválido.</p>
                <Link href="/auth/forgot-password">
                    <Button variant="outline">Solicitar novo link</Button>
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        if (password.length < 8) {
            toast.error('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const result = await completePasswordResetAction(token, password);
            if (result.success) {
                setSuccess(true);
                toast.success('Senha redefinida com sucesso!');
                setTimeout(() => router.push('/auth/login'), 3000);
            } else {
                toast.error(result.error || 'Erro ao redefinir senha.');
            }
        } catch (error) {
            toast.error('Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Sucesso!</h2>
                <p className="text-gray-400 mb-8">
                    Sua senha foi atualizada. Você será redirecionado para o login em instantes.
                </p>
                <Link href="/auth/login">
                    <Button className="w-full bg-green-600 hover:bg-green-500">
                        Ir para Login agora
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Nova Senha</h1>
                <p className="text-gray-400">
                    Crie uma senha forte para proteger sua conta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <FuturisticInput
                        label="Nova Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        startIcon={<Lock className="w-5 h-5" />}
                    />
                    <PasswordStrengthMeter password={password} />
                </div>

                <FuturisticInput
                    label="Confirmar Senha"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    startIcon={<Lock className="w-5 h-5" />}
                    error={!!(confirmPassword && password !== confirmPassword)}
                    errorMessage="As senhas não coincidem"
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-4"
                    disabled={loading || !password || password !== confirmPassword}
                >
                    {loading ? 'Atualizando...' : 'Definir Nova Senha'}
                </Button>
            </form>
        </motion.div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Suspense fallback={<div className="text-white text-center">Carregando formulário...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
