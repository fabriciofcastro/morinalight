"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { FuturisticFunnelChart } from "@/components/charts/FuturisticFunnelChart"
import { FuturisticTreemap } from "@/components/charts/FuturisticTreemap"
import { Certification } from "./types"
import { Card } from "@/shared/ui/base/card"

interface CertificationsAnalyticsProps {
    certifications: Certification[]
}

export const CertificationsAnalytics: React.FC<CertificationsAnalyticsProps> = ({
    certifications,
}) => {
    const funnelData = useMemo(() => {
        const total = certifications.length
        const prepared = certifications.filter(
            (c) => c.status === "prepared" || c.status === "in-progress" || c.status === "complete"
        ).length
        const inProgress = certifications.filter(
            (c) => c.status === "in-progress" || c.status === "complete"
        ).length
        const complete = certifications.filter((c) => c.status === "complete").length

        return [
            { name: "Identificadas", value: total },
            { name: "Preparadas", value: prepared },
            { name: "Em Auditoria", value: inProgress },
            { name: "Concluídas", value: complete },
        ]
    }, [certifications])

    const treemapData = useMemo(() => {
        const categories = Array.from(new Set(certifications.map((c) => c.category)))
        return categories.map((cat) => ({
            name: cat,
            size: certifications.filter((c) => c.category === cat).reduce((acc, curr) => acc + curr.progress, 0),
            children: certifications
                .filter((c) => c.category === cat)
                .map((c) => ({
                    name: c.title,
                    size: c.progress,
                })),
        }))
    }, [certifications])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <Card className="p-6 bg-white/[0.02] border-white/10 backdrop-blur-xl h-full">
                    <FuturisticFunnelChart
                        data={funnelData}
                        title="Funil de Maturidade"
                        height={400}
                    />
                    <div className="mt-4 text-sm text-gray-500 text-center italic">
                        Visualização do processo de auditoria e conformidade.
                    </div>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                <Card className="p-6 bg-white/[0.02] border-white/10 backdrop-blur-xl h-full">
                    <FuturisticTreemap
                        data={treemapData}
                        title="Distribuição por Categoria"
                        height={400}
                    />
                    <div className="mt-4 text-sm text-gray-500 text-center italic">
                        Peso e progresso das certificações por área de atuação.
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
