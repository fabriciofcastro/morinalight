import { z } from "zod";
export declare const listarAuditoriaFeedInputSchema: z.ZodObject<
  {
    orgId: z.ZodString;
    acao: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limite: z.ZodOptional<z.ZodNumber>;
    inicio: z.ZodOptional<z.ZodDate>;
    fim: z.ZodOptional<z.ZodDate>;
  },
  "strict",
  z.ZodTypeAny,
  {
    orgId: string;
    cursor?: string | undefined;
    limite?: number | undefined;
    acao?: string | undefined;
    inicio?: Date | undefined;
    fim?: Date | undefined;
  },
  {
    orgId: string;
    cursor?: string | undefined;
    limite?: number | undefined;
    acao?: string | undefined;
    inicio?: Date | undefined;
    fim?: Date | undefined;
  }
>;
export type ListarAuditoriaFeedInput = z.infer<typeof listarAuditoriaFeedInputSchema>;
export declare const auditoriaFeedItemSchema: z.ZodObject<
  {
    id: z.ZodString;
    produtoId: z.ZodString;
    orgId: z.ZodString;
    acao: z.ZodString;
    actorId: z.ZodString;
    payload: z.ZodNullable<z.ZodUnknown>;
    criadoEm: z.ZodDate;
    produto: z.ZodOptional<
      z.ZodNullable<
        z.ZodObject<
          {
            orgId: z.ZodString;
            nome: z.ZodString;
            descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
          } & {
            produtoId: z.ZodString;
            status: z.ZodEnum<["rascunho", "aguardando_aprovacao", "ativo", "inativo"]>;
            criadoPor: z.ZodString;
            atualizadoPor: z.ZodString;
            criadoEm: z.ZodDate;
            atualizadoEm: z.ZodDate;
          },
          "strip",
          z.ZodTypeAny,
          {
            status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
            orgId: string;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            criadoPor: string;
            atualizadoPor: string;
            produtoId: string;
            descricao?: string | null | undefined;
            sku?: string | null | undefined;
            categoryId?: string | null | undefined;
          },
          {
            status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
            orgId: string;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            criadoPor: string;
            atualizadoPor: string;
            produtoId: string;
            descricao?: string | null | undefined;
            sku?: string | null | undefined;
            categoryId?: string | null | undefined;
          }
        >
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    actorId: string;
    orgId: string;
    criadoEm: Date;
    produtoId: string;
    acao: string;
    payload?: unknown;
    produto?:
      | {
          status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
          orgId: string;
          criadoEm: Date;
          atualizadoEm: Date;
          nome: string;
          criadoPor: string;
          atualizadoPor: string;
          produtoId: string;
          descricao?: string | null | undefined;
          sku?: string | null | undefined;
          categoryId?: string | null | undefined;
        }
      | null
      | undefined;
  },
  {
    id: string;
    actorId: string;
    orgId: string;
    criadoEm: Date;
    produtoId: string;
    acao: string;
    payload?: unknown;
    produto?:
      | {
          status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
          orgId: string;
          criadoEm: Date;
          atualizadoEm: Date;
          nome: string;
          criadoPor: string;
          atualizadoPor: string;
          produtoId: string;
          descricao?: string | null | undefined;
          sku?: string | null | undefined;
          categoryId?: string | null | undefined;
        }
      | null
      | undefined;
  }
>;
export type AuditoriaFeedItem = z.infer<typeof auditoriaFeedItemSchema>;
export declare const listarAuditoriaFeedResultadoSchema: z.ZodObject<
  {
    itens: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          produtoId: z.ZodString;
          orgId: z.ZodString;
          acao: z.ZodString;
          actorId: z.ZodString;
          payload: z.ZodNullable<z.ZodUnknown>;
          criadoEm: z.ZodDate;
          produto: z.ZodOptional<
            z.ZodNullable<
              z.ZodObject<
                {
                  orgId: z.ZodString;
                  nome: z.ZodString;
                  descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                  sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                  categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
                } & {
                  produtoId: z.ZodString;
                  status: z.ZodEnum<["rascunho", "aguardando_aprovacao", "ativo", "inativo"]>;
                  criadoPor: z.ZodString;
                  atualizadoPor: z.ZodString;
                  criadoEm: z.ZodDate;
                  atualizadoEm: z.ZodDate;
                },
                "strip",
                z.ZodTypeAny,
                {
                  status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
                  orgId: string;
                  criadoEm: Date;
                  atualizadoEm: Date;
                  nome: string;
                  criadoPor: string;
                  atualizadoPor: string;
                  produtoId: string;
                  descricao?: string | null | undefined;
                  sku?: string | null | undefined;
                  categoryId?: string | null | undefined;
                },
                {
                  status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
                  orgId: string;
                  criadoEm: Date;
                  atualizadoEm: Date;
                  nome: string;
                  criadoPor: string;
                  atualizadoPor: string;
                  produtoId: string;
                  descricao?: string | null | undefined;
                  sku?: string | null | undefined;
                  categoryId?: string | null | undefined;
                }
              >
            >
          >;
        },
        "strip",
        z.ZodTypeAny,
        {
          id: string;
          actorId: string;
          orgId: string;
          criadoEm: Date;
          produtoId: string;
          acao: string;
          payload?: unknown;
          produto?:
            | {
                status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
                orgId: string;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                criadoPor: string;
                atualizadoPor: string;
                produtoId: string;
                descricao?: string | null | undefined;
                sku?: string | null | undefined;
                categoryId?: string | null | undefined;
              }
            | null
            | undefined;
        },
        {
          id: string;
          actorId: string;
          orgId: string;
          criadoEm: Date;
          produtoId: string;
          acao: string;
          payload?: unknown;
          produto?:
            | {
                status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
                orgId: string;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                criadoPor: string;
                atualizadoPor: string;
                produtoId: string;
                descricao?: string | null | undefined;
                sku?: string | null | undefined;
                categoryId?: string | null | undefined;
              }
            | null
            | undefined;
        }
      >,
      "many"
    >;
    proximoCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    itens: {
      id: string;
      actorId: string;
      orgId: string;
      criadoEm: Date;
      produtoId: string;
      acao: string;
      payload?: unknown;
      produto?:
        | {
            status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
            orgId: string;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            criadoPor: string;
            atualizadoPor: string;
            produtoId: string;
            descricao?: string | null | undefined;
            sku?: string | null | undefined;
            categoryId?: string | null | undefined;
          }
        | null
        | undefined;
    }[];
    proximoCursor?: string | null | undefined;
  },
  {
    itens: {
      id: string;
      actorId: string;
      orgId: string;
      criadoEm: Date;
      produtoId: string;
      acao: string;
      payload?: unknown;
      produto?:
        | {
            status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
            orgId: string;
            criadoEm: Date;
            atualizadoEm: Date;
            nome: string;
            criadoPor: string;
            atualizadoPor: string;
            produtoId: string;
            descricao?: string | null | undefined;
            sku?: string | null | undefined;
            categoryId?: string | null | undefined;
          }
        | null
        | undefined;
    }[];
    proximoCursor?: string | null | undefined;
  }
>;
export type ListarAuditoriaFeedResultado = z.infer<typeof listarAuditoriaFeedResultadoSchema>;
