"use client";

import { FuturisticInput } from "@/components/ui/futuristic-input";
import type {
    BranchCustomFieldsConfig,
    CustomFieldsValues,
    CustomFieldDefinition
} from "@/types/custom-fields";

interface CustomFieldsRendererProps {
    config: BranchCustomFieldsConfig;
    values: CustomFieldsValues;
    onChange: (values: CustomFieldsValues) => void;
    errors?: Record<string, string>;
}

export function CustomFieldsRenderer({
    config,
    values,
    onChange,
    errors = {}
}: CustomFieldsRendererProps) {

    const handleChange = (key: string, value: any) => {
        onChange({
            ...values,
            [key]: value,
        });
    };

    const renderField = (field: CustomFieldDefinition) => {
        switch (field.type) {
            case "textarea":
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        <textarea
                            value={values[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full min-h-[100px] px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${errors[field.key] ? "border-red-500/50" : "border-white/10"
                                }`}
                        />
                        {field.helperText && <p className="text-xs text-white/50">{field.helperText}</p>}
                        {errors[field.key] && <p className="text-xs text-red-400">{errors[field.key]}</p>}
                    </div>
                );

            case "boolean":
                return (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <input
                            type="checkbox"
                            checked={!!values[field.key]}
                            onChange={(e) => handleChange(field.key, e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-white">{field.label}</p>
                            {field.helperText && <p className="text-xs text-white/50">{field.helperText}</p>}
                        </div>
                    </div>
                );

            case "select":
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        <select
                            value={values[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none ${errors[field.key] ? "border-red-500/50" : "border-white/10"
                                }`}
                        >
                            <option value="" className="bg-gray-900">Selecione...</option>
                            {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors[field.key] && <p className="text-xs text-red-400">{errors[field.key]}</p>}
                    </div>
                );

            default: // text, number, email, url, date
                return (
                    <FuturisticInput
                        label={field.label}
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        value={values[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        helperText={field.helperText}
                        required={field.required}
                        error={!!errors[field.key]}
                        errorMessage={errors[field.key]}
                    />
                );
        }
    };

    if (config.fields.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                <p className="text-white/50">Nenhum campo customizado configurado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.fields.map((field) => (
                <div
                    key={field.id}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                >
                    {renderField(field)}
                </div>
            ))}
        </div>
    );
}
