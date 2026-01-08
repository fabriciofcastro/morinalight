"use client"

import { Button } from "@/shared/ui/base/button"
import { DateRangePicker } from "@/shared/ui/base/date-range-picker"
import { Input } from "@/shared/ui/base/input"
import { Label } from "@/shared/ui/base/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/base/select"
import { cn } from "@/lib/utils"
import { Filter, Plus, Save, X } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"

export interface FilterField {
    id: string
    label: string
    type: "text" | "select" | "date-range" | "number"
    options?: { value: string; label: string }[]
    placeholder?: string
}

export interface FilterValue {
    fieldId: string
    value: any
}

export interface FilterConfiguration {
    id: string
    name: string
    filterData: any // Changed to any to match JSON storage
}

interface AdvancedFilterProps {
    fields: FilterField[]
    values?: FilterValue[]
    onValuesChange?: (values: FilterValue[]) => void
    savedConfigurations?: FilterConfiguration[]
    onLoadConfiguration?: (config: FilterConfiguration) => void
    onSave?: (name: string, values: FilterValue[]) => void
    className?: string
}

export function AdvancedFilter({
    fields,
    values = [],
    onValuesChange,
    savedConfigurations = [],
    onLoadConfiguration,
    onSave,
    className,
}: AdvancedFilterProps) {
    const [filterValues, setFilterValues] = React.useState<FilterValue[]>(values)
    const [activeFilters, setActiveFilters] = React.useState<string[]>(values.map(v => v.fieldId))

    // Update internal state when external values change
    React.useEffect(() => {
        if (JSON.stringify(values) !== JSON.stringify(filterValues)) {
            setFilterValues(values)
            setActiveFilters(values.map(v => v.fieldId))
        }
    }, [values])
    const [saveName, setSaveName] = React.useState("")
    const [showSaveInput, setShowSaveInput] = React.useState(false)

    const handleAddFilter = (fieldId: string) => {
        if (!activeFilters.includes(fieldId)) {
            setActiveFilters([...activeFilters, fieldId])
            const newValue: FilterValue = { fieldId, value: null }
            const newValues = [...filterValues, newValue]
            setFilterValues(newValues)
            onValuesChange?.(newValues)
        }
    }

    const handleRemoveFilter = (fieldId: string) => {
        setActiveFilters(activeFilters.filter((id) => id !== fieldId))
        const newValues = filterValues.filter((v) => v.fieldId !== fieldId)
        setFilterValues(newValues)
        onValuesChange?.(newValues)
    }

    const handleValueChange = (fieldId: string, value: any) => {
        const newValues = filterValues.map((v) =>
            v.fieldId === fieldId ? { ...v, value } : v
        )
        setFilterValues(newValues)
        onValuesChange?.(newValues)
    }

    const handleSave = () => {
        if (saveName.trim() && onSave) {
            onSave(saveName, filterValues)
            setSaveName("")
            setShowSaveInput(false)
        }
    }

    const availableFields = fields.filter((f) => !activeFilters.includes(f.id))

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros Avançados
                </h3>
                <div className="flex gap-2">
                    {savedConfigurations.length > 0 && (
                        <Select onValueChange={(id) => {
                            const config = savedConfigurations.find(c => c.id === id)
                            if (config && onLoadConfiguration) onLoadConfiguration(config)
                        }}>
                            <SelectTrigger className="w-[200px] h-8 text-xs">
                                <SelectValue placeholder="Configurações Salvas" />
                            </SelectTrigger>
                            <SelectContent>
                                {savedConfigurations.map((config) => (
                                    <SelectItem key={config.id} value={config.id}>
                                        {config.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {activeFilters.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSaveInput(!showSaveInput)}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Filtros
                        </Button>
                    )}
                </div>
            </div>

            {showSaveInput && (
                <div className="flex gap-2">
                    <Input
                        placeholder="Nome da configuração"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                    <Button onClick={handleSave} size="sm">
                        Salvar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveInput(false)}
                    >
                        Cancelar
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {activeFilters.map((fieldId) => {
                    const field = fields.find((f) => f.id === fieldId)
                    if (!field) return null

                    const filterValue = filterValues.find((v) => v.fieldId === fieldId)

                    return (
                        <div
                            key={fieldId}
                            className="flex items-end gap-2 p-3 border rounded-lg bg-card"
                        >
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={fieldId}>{field.label}</Label>
                                {field.type === "text" && (
                                    <Input
                                        id={fieldId}
                                        placeholder={field.placeholder}
                                        value={filterValue?.value || ""}
                                        onChange={(e) => handleValueChange(fieldId, e.target.value)}
                                    />
                                )}
                                {field.type === "number" && (
                                    <Input
                                        id={fieldId}
                                        type="number"
                                        placeholder={field.placeholder}
                                        value={filterValue?.value || ""}
                                        onChange={(e) =>
                                            handleValueChange(fieldId, e.target.value)
                                        }
                                    />
                                )}
                                {field.type === "select" && (
                                    <Select
                                        value={filterValue?.value || ""}
                                        onValueChange={(value) => handleValueChange(fieldId, value)}
                                    >
                                        <SelectTrigger id={fieldId}>
                                            <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {field.type === "date-range" && (
                                    <DateRangePicker
                                        date={filterValue?.value as DateRange}
                                        onDateChange={(date) => handleValueChange(fieldId, date)}
                                        placeholder={field.placeholder}
                                    />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFilter(fieldId)}
                                className="shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                })}
            </div>

            {availableFields.length > 0 && (
                <Select onValueChange={handleAddFilter}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <SelectValue placeholder="Adicionar filtro" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {availableFields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                                {field.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}
