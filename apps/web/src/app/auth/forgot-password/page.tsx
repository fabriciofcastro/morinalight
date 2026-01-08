'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FuturisticInput } from '@/shared/ui/base/futuristic-input';
import { Button } from '@/shared/ui/base/button';
import { toast } from 'sonner';
import { requestPasswordResetAction } from '@/app/actions/auth-security';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestPasswordResetAction(email);
            // Always show success to avoid enumeration
            setSent(true);
            toast.success('Se o email estiver cadastrado, você receberá um link de recuperação.');
        } catch (error) {
            toast.error('Erro ao processar solicitação.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-gray-900/50 border border-gray-800 p-8 rounded-2xl text-center backdrop-blur-xl"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <Mail className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verifique seu Email</h2>
                    <p className="text-gray-400 mb-8">
                        Enviamos um link de recuperação para <strong className="text-white">{email}</strong>.
                    </p>
                    <Link href="/auth/login">
                        <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                            Voltar para Login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-8 pl-1">
                    <Link href="/auth/login" className="group text-gray-500 hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Recuperar Senha
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Digite seu email para receber as instruções.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FuturisticInput
                        label="Email Corporativo"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seu@morinalight.com"
                        startIcon={<Mail className="w-5 h-5" />}
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar Link'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
