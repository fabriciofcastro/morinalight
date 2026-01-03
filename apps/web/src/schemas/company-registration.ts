import { z } from "zod";

export const companyRegistrationSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    description: z.string().optional(),
    legalName: z.string().optional(),
    cnpj: z.string().optional(), // TODO: Add CNPJ validation
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CompanyRegistrationPayload = z.infer<typeof companyRegistrationSchema>;

export const DEFAULT_COMPANY_REGISTRATION: CompanyRegistrationPayload = {
    name: "",
    description: "",
    legalName: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    website: "",
};
