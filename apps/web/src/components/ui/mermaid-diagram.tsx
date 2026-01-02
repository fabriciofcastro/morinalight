'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
    className?: string;
    title?: string;
}

export function MermaidDiagram({ chart, className = '', title }: MermaidDiagramProps) {
    const [svg, setSvg] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        setIsMounted(true);
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            themeVariables: {
                darkMode: true,
                background: 'transparent',
                primaryColor: '#10b981', // Emerald-500
                secondaryColor: '#f59e0b', // Amber-500
                tertiaryColor: '#3b82f6', // Blue-500
                primaryTextColor: '#fff',
                secondaryTextColor: '#ddd',
                tertiaryTextColor: '#bbb',
                lineColor: '#525252', // Neutral-600
                textColor: '#fff',
                mainBkg: 'transparent',
                nodeBorder: '#525252',
            },
        });
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const renderChart = async () => {
            try {
                const { svg } = await mermaid.render(idRef.current, chart);
                setSvg(svg);
            } catch (error) {
                console.error('Failed to render mermaid chart:', error);
                // Fallback for failed render
                setSvg(`<div class="text-red-400 p-4 border border-red-500/20 rounded">Erro ao renderizar diagrama</div>`);
            }
        };

        renderChart();
    }, [chart, isMounted]);

    if (!isMounted) return <div className="animate-pulse h-64 bg-white/5 rounded-lg" />;

    return (
        <div className={`flex flex-col items-center my-8 ${className}`}>
            {title && (
                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
                    {title}
                </h4>
            )}
            <div
                className="mermaid-container bg-black/20 p-6 rounded-lg border border-white/5 w-full flex justify-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="text-xs text-center text-gray-600 mt-2">
                Diagrama gerado automaticamente pelo Sistema
            </p>
        </div>
    );
}
