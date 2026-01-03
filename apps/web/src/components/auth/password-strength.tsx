'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
    password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length > 0) score += 10;
        if (password.length >= 8) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 30;
        return Math.min(100, score);
    }, [password]);

    const activeColor = useMemo(() => {
        if (strength <= 30) return 'bg-red-500';
        if (strength <= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    }, [strength]);

    const checks = [
        { label: 'Pelo menos 8 caracteres', pass: password.length >= 8 },
        { label: 'Letra maiúscula', pass: /[A-Z]/.test(password) },
        { label: 'Número', pass: /[0-9]/.test(password) },
        { label: 'Caractere especial', pass: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <div className="space-y-4 mt-2">
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${activeColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-2 gap-2">
                {checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                        {check.pass ? (
                            <Check className="w-3 h-3 text-green-500" />
                        ) : (
                            <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={check.pass ? 'text-green-400' : 'text-gray-500'}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-right text-xs">
                {strength < 100 ? (
                    <span className="text-yellow-500">Senha fraca ou média</span>
                ) : (
                    <span className="text-green-500 font-bold">Senha Forte! 💪</span>
                )}
            </div>
        </div>
    );
}
