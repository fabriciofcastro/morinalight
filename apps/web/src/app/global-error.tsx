"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        backgroundColor: '#09090b', // zinc-950
                        color: '#e4e4e7', // zinc-200
                        fontFamily: 'sans-serif'
                    }}
                >
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f87171' }}>
                            Erro Crítico do Sistema
                        </h2>
                        <p style={{ marginBottom: '2rem' }}>
                            Um erro irrecuperável ocorreu no carregamento da aplicação.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Tentar Recarregar
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
