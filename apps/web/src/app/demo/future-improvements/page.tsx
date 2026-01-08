"use client"

import React, { useState } from "react"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/shared/ui/base/date-range-picker"
import {
    AdvancedFilter,
    FilterField,
    FilterValue,
} from "@/shared/ui/base/advanced-filter"
import { ThemeCustomizer } from "@/shared/ui/base/theme-customizer"
import { FuturisticFunnelChart } from "@/components/charts/FuturisticFunnelChart"
import { FuturisticTreemap } from "@/components/charts/FuturisticTreemap"
import { Card } from "@/shared/ui/base/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/base/tabs"

// Mock data for charts
const funnelData = [
    { name: "Visitantes", value: 10000 },
    { name: "Leads", value: 5000 },
    { name: "Propostas", value: 2000 },
    { name: "Negociações", value: 800 },
    { name: "Vendas", value: 400 },
]

const treemapData = [
    {
        name: "Eletrônicos",
        size: 45000,
        children: [
            { name: "Smartphones", size: 25000 },
            { name: "Laptops", size: 15000 },
            { name: "Tablets", size: 5000 },
        ],
    },
    {
        name: "Roupas",
        size: 30000,
        children: [
            { name: "Camisetas", size: 12000 },
            { name: "Calças", size: 10000 },
            { name: "Vestidos", size: 8000 },
        ],
    },
    {
        name: "Alimentos",
        size: 20000,
        children: [
            { name: "Frutas", size: 8000 },
            { name: "Vegetais", size: 7000 },
            { name: "Carnes", size: 5000 },
        ],
    },
    {
        name: "Livros",
        size: 15000,
        children: [
            { name: "Ficção", size: 8000 },
            { name: "Não-ficção", size: 5000 },
            { name: "Técnicos", size: 2000 },
        ],
    },
]

// Filter fields configuration
const filterFields: FilterField[] = [
    {
        id: "dateRange",
        label: "Período",
        type: "date-range",
        placeholder: "Selecione um período",
    },
    {
        id: "category",
        label: "Categoria",
        type: "select",
        options: [
            { value: "electronics", label: "Eletrônicos" },
            { value: "clothing", label: "Roupas" },
            { value: "food", label: "Alimentos" },
            { value: "books", label: "Livros" },
        ],
        placeholder: "Selecione uma categoria",
    },
    {
        id: "region",
        label: "Região",
        type: "select",
        options: [
            { value: "SP", label: "São Paulo" },
            { value: "RJ", label: "Rio de Janeiro" },
            { value: "MG", label: "Minas Gerais" },
            { value: "RS", label: "Rio Grande do Sul" },
        ],
        placeholder: "Selecione uma região",
    },
    {
        id: "minValue",
        label: "Valor Mínimo",
        type: "number",
        placeholder: "0.00",
    },
    {
        id: "maxValue",
        label: "Valor Máximo",
        type: "number",
        placeholder: "10000.00",
    },
    {
        id: "search",
        label: "Buscar",
        type: "text",
        placeholder: "Digite para buscar...",
    },
]

export default function FutureImprovementsDemo() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [filterValues, setFilterValues] = useState<FilterValue[]>([])

    const handleFilterSave = (name: string, values: FilterValue[]) => {
        console.log("Salvando filtro:", name, values)
        // In a real app, this would call the API to save the filter
        alert(`Filtro "${name}" salvo com sucesso!`)
    }

    const handleThemeChange = (colors: Record<string, string>) => {
        console.log("Tema alterado:", colors)
        // In a real app, this could save to user preferences
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Melhorias Futuras - Demo</h1>
                    <p className="text-muted-foreground mt-2">
                        Demonstração de componentes reutilizáveis para analytics e relatórios
                    </p>
                </div>
                <ThemeCustomizer onThemeChange={handleThemeChange} />
            </div>

            <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="filters">Filtros</TabsTrigger>
                    <TabsTrigger value="date">Seletor de Data</TabsTrigger>
                    <TabsTrigger value="funnel">Gráfico Funil</TabsTrigger>
                    <TabsTrigger value="treemap">Treemap</TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4">
                    <Card className="p-6">
                        <AdvancedFilter
                            fields={filterFields}
                            values={filterValues}
                            onValuesChange={setFilterValues}
                            onSave={handleFilterSave}
                        />
                    </Card>

                    {filterValues.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Valores Atuais dos Filtros:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto">
                                {JSON.stringify(filterValues, null, 2)}
                            </pre>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="date" className="space-y-4">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Seletor de Período</h3>
                        <DateRangePicker
                            date={dateRange}
                            onDateChange={setDateRange}
                            placeholder="Selecione um período"
                        />
                    </Card>

                    {dateRange && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Período Selecionado:</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto">
                                {JSON.stringify(
                                    {
                                        from: dateRange.from?.toISOString(),
                                        to: dateRange.to?.toISOString(),
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="funnel" className="space-y-4">
                    <Card className="p-6">
                        <FuturisticFunnelChart
                            data={funnelData}
                            title="Funil de Vendas"
                            height={500}
                        />
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Dados do Funil:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {funnelData.map((item, index) => {
                                const nextItem = funnelData[index + 1]
                                const conversionRate = nextItem
                                    ? ((nextItem.value / item.value) * 100).toFixed(1)
                                    : null

                                return (
                                    <div
                                        key={item.name}
                                        className="p-4 border rounded-lg bg-card"
                                    >
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-2xl font-bold mt-2">
                                            {item.value.toLocaleString("pt-BR")}
                                        </div>
                                        {conversionRate && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Taxa de conversão: {conversionRate}%
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="treemap" className="space-y-4">
                    <Card className="p-6">
                        <FuturisticTreemap
                            data={treemapData}
                            title="Vendas por Categoria"
                            height={500}
                        />
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Dados do Treemap:</h3>
                        <div className="space-y-4">
                            {treemapData.map((category) => (
                                <div key={category.name} className="border rounded-lg p-4">
                                    <div className="font-semibold text-lg mb-2">
                                        {category.name} - Total: R${" "}
                                        {category.size.toLocaleString("pt-BR")}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {category.children?.map((child) => (
                                            <div
                                                key={child.name}
                                                className="p-2 bg-muted rounded text-sm"
                                            >
                                                <div className="font-medium">{child.name}</div>
                                                <div className="text-muted-foreground">
                                                    R$ {child.size.toLocaleString("pt-BR")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className="p-6 bg-muted/50">
                <h3 className="font-semibold mb-4">Recursos Implementados:</h3>
                <ul className="space-y-2 list-disc list-inside">
                    <li>📅 Seletor de data customizado com calendário em português</li>
                    <li>🔍 Filtros avançados com múltiplos tipos (texto, select, data, número)</li>
                    <li>💾 Funcionalidade de salvar configurações de filtros</li>
                    <li>📊 Gráfico Funil para visualização de conversão</li>
                    <li>📊 Treemap para visualização hierárquica de dados</li>
                    <li>🎨 Customizador de tema com presets e cores personalizadas</li>
                    <li>📧 API para agendamento de relatórios (backend)</li>
                    <li>⚙️ Todos os componentes são reutilizáveis e configuráveis</li>
                </ul>
            </Card>
        </div>
    )
}
