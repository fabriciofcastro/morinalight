"use client"

import { Button } from "@/shared/ui/base/button"
import { Input } from "@/shared/ui/base/input"
import { Label } from "@/shared/ui/base/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/base/popover"
import { Check, Palette } from "lucide-react"
import * as React from "react"

interface ThemeColor {
    name: string
    cssVar: string
    label: string
}

const themeColors: ThemeColor[] = [
    { name: "background", cssVar: "--background", label: "Fundo" },
    { name: "foreground", cssVar: "--foreground", label: "Texto Principal" },
    { name: "primary", cssVar: "--primary", label: "Primária" },
    { name: "primary-foreground", cssVar: "--primary-foreground", label: "Texto Primário" },
    { name: "secondary", cssVar: "--secondary", label: "Secundária" },
    { name: "secondary-foreground", cssVar: "--secondary-foreground", label: "Texto Secundário" },
    { name: "accent", cssVar: "--accent", label: "Destaque" },
    { name: "accent-foreground", cssVar: "--accent-foreground", label: "Texto Destaque" },
    { name: "muted", cssVar: "--muted", label: "Mudo" },
    { name: "muted-foreground", cssVar: "--muted-foreground", label: "Texto Mudo" },
    { name: "border", cssVar: "--border", label: "Borda" },
    { name: "input", cssVar: "--input", label: "Input" },
    { name: "ring", cssVar: "--ring", label: "Anel de Foco" },
]

const presetThemes = [
    {
        name: "Padrão",
        colors: {
            "--background": "0 0% 100%",
            "--foreground": "222.2 84% 4.9%",
            "--primary": "222.2 47.4% 11.2%",
            "--primary-foreground": "210 40% 98%",
            "--secondary": "210 40% 96.1%",
            "--secondary-foreground": "222.2 47.4% 11.2%",
            "--accent": "210 40% 96.1%",
            "--accent-foreground": "222.2 47.4% 11.2%",
            "--muted": "210 40% 96.1%",
            "--muted-foreground": "215.4 16.3% 46.9%",
            "--border": "214.3 31.8% 91.4%",
            "--input": "214.3 31.8% 91.4%",
            "--ring": "222.2 84% 4.9%",
        },
    },
    {
        name: "Oceano",
        colors: {
            "--background": "210 100% 97%",
            "--foreground": "210 100% 10%",
            "--primary": "200 100% 40%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "190 80% 50%",
            "--secondary-foreground": "0 0% 100%",
            "--accent": "180 70% 60%",
            "--accent-foreground": "210 100% 10%",
            "--muted": "210 40% 90%",
            "--muted-foreground": "210 20% 40%",
            "--border": "210 40% 80%",
            "--input": "210 40% 85%",
            "--ring": "200 100% 40%",
        },
    },
    {
        name: "Floresta",
        colors: {
            "--background": "120 20% 97%",
            "--foreground": "120 30% 10%",
            "--primary": "140 60% 35%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "100 40% 50%",
            "--secondary-foreground": "0 0% 100%",
            "--accent": "80 60% 60%",
            "--accent-foreground": "120 30% 10%",
            "--muted": "120 20% 90%",
            "--muted-foreground": "120 10% 40%",
            "--border": "120 20% 80%",
            "--input": "120 20% 85%",
            "--ring": "140 60% 35%",
        },
    },
    {
        name: "Crepúsculo",
        colors: {
            "--background": "270 30% 10%",
            "--foreground": "270 10% 95%",
            "--primary": "280 80% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "260 60% 40%",
            "--secondary-foreground": "0 0% 100%",
            "--accent": "290 70% 60%",
            "--accent-foreground": "0 0% 100%",
            "--muted": "270 20% 20%",
            "--muted-foreground": "270 10% 70%",
            "--border": "270 20% 25%",
            "--input": "270 20% 22%",
            "--ring": "280 80% 50%",
        },
    },
]

interface ThemeCustomizerProps {
    onThemeChange?: (colors: Record<string, string>) => void
    className?: string
}

export function ThemeCustomizer({
    onThemeChange,
    className,
}: ThemeCustomizerProps) {
    const [customColors, setCustomColors] = React.useState<Record<string, string>>({})
    const [activePreset, setActivePreset] = React.useState<string | null>(null)

    const applyTheme = (colors: Record<string, string>) => {
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
        })
        setCustomColors(colors)
        onThemeChange?.(colors)
    }

    const handlePresetClick = (preset: typeof presetThemes[0]) => {
        applyTheme(preset.colors)
        setActivePreset(preset.name)
    }

    const handleColorChange = (cssVar: string, value: string) => {
        const newColors = { ...customColors, [cssVar]: value }
        applyTheme(newColors)
        setActivePreset(null)
    }

    const resetToDefault = () => {
        handlePresetClick(presetThemes[0]!)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={className}>
                    <Palette className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-3">Temas Predefinidos</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {presetThemes.map((preset) => (
                                <Button
                                    key={preset.name}
                                    variant={activePreset === preset.name ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePresetClick(preset)}
                                    className="justify-between"
                                >
                                    {preset.name}
                                    {activePreset === preset.name && (
                                        <Check className="h-4 w-4 ml-2" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Cores Personalizadas</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {themeColors.map((color) => {
                                const currentValue =
                                    customColors[color.cssVar] ||
                                    getComputedStyle(document.documentElement)
                                        .getPropertyValue(color.cssVar)
                                        .trim()

                                return (
                                    <div key={color.name} className="space-y-1">
                                        <Label htmlFor={color.name} className="text-xs">
                                            {color.label}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id={color.name}
                                                value={currentValue}
                                                onChange={(e) =>
                                                    handleColorChange(color.cssVar, e.target.value)
                                                }
                                                placeholder="HSL (ex: 222.2 47.4% 11.2%)"
                                                className="text-xs"
                                            />
                                            <div
                                                className="w-10 h-10 rounded border shrink-0"
                                                style={{
                                                    backgroundColor: `hsl(${currentValue})`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetToDefault}
                            className="w-full"
                        >
                            Restaurar Padrão
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
