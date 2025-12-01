import { z } from "zod";

export const businessSegmentBaseSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional().nullable(),
    active: z.boolean().optional().default(true),
});

export const criarBusinessSegmentInputSchema = businessSegmentBaseSchema.extend({
    orgId: z.string().uuid(),
});

export type CriarBusinessSegmentInput = z.infer<typeof criarBusinessSegmentInputSchema>;

export const businessSegmentViewSchema = businessSegmentBaseSchema.extend({
    id: z.string().uuid(),
    orgId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type BusinessSegmentView = z.infer<typeof businessSegmentViewSchema>;

export const atualizarBusinessSegmentInputSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    active: z.boolean().optional(),
});

export type AtualizarBusinessSegmentInput = z.infer<typeof atualizarBusinessSegmentInputSchema>;

export const listarBusinessSegmentsInputSchema = z
    .object({
        orgId: z.string().uuid(),
        busca: z.string().min(2).max(120).optional(),
        active: z.enum(["true", "false"]).transform((val) => val === "true").optional(),
    })
    .strict();

export type ListarBusinessSegmentsInput = z.infer<typeof listarBusinessSegmentsInputSchema>;

export const listarBusinessSegmentsResultadoSchema = z.object({
    itens: z.array(businessSegmentViewSchema),
});

export type ListarBusinessSegmentsResultado = z.infer<typeof listarBusinessSegmentsResultadoSchema>;
