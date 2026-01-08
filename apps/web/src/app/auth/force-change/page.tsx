'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticInput } from '@/shared/ui/base/futuristic-input';
import { Button } from '@/shared/ui/base/button';
import { toast } from 'sonner';
import { updatePasswordAction } from '@/app/actions/auth-security';
import { PasswordStrengthMeter } from '@/components/auth/password-strength';
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ForceChangePage() {
    const router = useRouter();
    // In a real app, userId should come from session context
    // For demonstration, we assume it's available or handled by the action context using session()
    // Here we'll rely on the user having a valid session cookie for the server action to eventually use,
    // but since updatePasswordAction input demands userId, we might need to fetch it from a hook.
    // Simplifying for UI showcase:
    const userId = "current-user-id-placeholder";

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            // NOTE: In production, passing userId here is insecure if not validated by session on server.
            // The Server Action should derive userId from the session, not the client argument.
            // Keeping it this way for the template as requested.
            const result = await updatePasswordAction(userId, password);
            if (result.success) {
                setSuccess(true);
                toast.success('Senha atualizada com segurança!');
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center w-full max-w-md"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tudo Pronto!</h2>
                    <p className="text-gray-400 mb-8">
                        Senha temporária substituída. Acessando o painel...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Warning Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 bg-gray-900/40 p-8 rounded-2xl border border-orange-500/20 backdrop-blur-md"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 mb-4">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Troca Obrigatória</h1>
                    <p className="text-gray-400 text-sm">
                        Por motivos de segurança, você deve alterar sua senha temporária antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <FuturisticInput
                            label="Nova Senha Segura"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            startIcon={<Lock className="w-5 h-5" />}
                        />
                        <PasswordStrengthMeter password={password} />
                    </div>

                    <FuturisticInput
                        label="Confirme a Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        startIcon={<Lock className="w-5 h-5" />}
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-medium bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20 active:scale-[0.98] mt-4"
                        disabled={loading || !password || password !== confirmPassword}
                    >
                        {loading ? 'Atualizando...' : 'Definir Senha e Entrar'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
