export type CustomFieldType =
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "boolean"
    | "select"
    | "multiselect"
    | "email"
    | "url"
    | "color";

export interface CustomFieldOption {
    label: string;
    value: string;
}

export interface CustomFieldDefinition {
    id: string;
    key: string;
    label: string;
    type: CustomFieldType;
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: CustomFieldOption[]; // Para select/multiselect
    defaultValue?: any;
    order: number;
    section?: string;
}

export interface CustomFieldSection {
    id: string;
    title: string;
    order: number;
}

export interface BranchCustomFieldsConfig {
    sections: CustomFieldSection[];
    fields: CustomFieldDefinition[];
}

export interface CustomFieldsValues {
    [key: string]: any;
}
