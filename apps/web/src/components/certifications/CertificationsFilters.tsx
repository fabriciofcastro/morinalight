"use client"

import React from "react"
import { AdvancedFilter, FilterField, FilterValue, FilterConfiguration } from "@/components/ui/advanced-filter"
import { motion } from "framer-motion"

interface CertificationsFiltersProps {
    values: FilterValue[]
    onValuesChange: (values: FilterValue[]) => void
}

const filterFields: FilterField[] = [
    {
        id: "search",
        label: "Buscar",
        type: "text",
        placeholder: "Ex: ISO 27001",
    },
    {
        id: "status",
        label: "Status",
        type: "select",
        options: [
            { value: "complete", label: "Concluído" },
            { value: "prepared", label: "Preparado" },
            { value: "in-progress", label: "Em Progresso" },
            { value: "pending", label: "Pendente" },
        ],
        placeholder: "Filtrar por status",
    },
    {
        id: "category",
        label: "Categoria",
        type: "select",
        options: [
            { value: "Security", label: "Segurança" },
            { value: "Compliance", label: "Conformidade" },
            { value: "Privacy", label: "Privacidade" },
            { value: "Accessibility", label: "Acessibilidade" },
        ],
        placeholder: "Filtrar por categoria",
    },
    {
        id: "progress",
        label: "Progresso Mínimo",
        type: "number",
        placeholder: "0",
    },
]

export const CertificationsFilters: React.FC<CertificationsFiltersProps> = ({
    values,
    onValuesChange,
}) => {
    const [savedConfigs, setSavedConfigs] = React.useState<FilterConfiguration[]>([])

    const fetchConfigs = React.useCallback(async () => {
        try {
            const response = await fetch("/api/analytics/filters")
            if (response.ok) {
                const data = await response.json()
                setSavedConfigs(data)
            }
        } catch (error) {
            console.error("Failed to fetch configs:", error)
        }
    }, [])

    React.useEffect(() => {
        fetchConfigs()
    }, [fetchConfigs])

    const handleSave = async (name: string, filterValues: FilterValue[]) => {
        try {
            const response = await fetch("/api/analytics/filters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    filterData: filterValues,
                }),
            })

            if (response.ok) {
                fetchConfigs()
            }
        } catch (error) {
            console.error("Failed to save filter:", error)
        }
    }

    const handleLoad = (config: FilterConfiguration) => {
        onValuesChange(config.filterData as FilterValue[])
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <AdvancedFilter
                fields={filterFields}
                values={values}
                onValuesChange={onValuesChange}
                savedConfigurations={savedConfigs}
                onLoadConfiguration={handleLoad}
                onSave={handleSave}
            />
        </motion.div>
    )
}
