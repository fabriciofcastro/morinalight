import { z } from "zod";

export const statusCustomizadoSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  nome: z.string().min(1).max(100),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  descricao: z.string().max(500).optional().nullable(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
  criadoPor: z.string().uuid(),
  atualizadoPor: z.string().uuid().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional().nullable(),
  deletedBy: z.string().uuid().optional().nullable(),
});

export type StatusCustomizado = z.infer<typeof statusCustomizadoSchema>;

export class StatusCustomizadoEntity {
  private constructor(private props: StatusCustomizado) {}

  static criar(params: {
    id: string;
    orgId: string;
    nome: string;
    cor: string;
    descricao?: string | null;
    ordem?: number;
    ativo?: boolean;
    criadoPor: string;
  }): StatusCustomizadoEntity {
    const status: StatusCustomizado = {
      id: params.id,
      orgId: params.orgId,
      nome: params.nome,
      cor: params.cor,
      descricao: params.descricao ?? null,
      ordem: params.ordem ?? 0,
      ativo: params.ativo ?? true,
      criadoPor: params.criadoPor,
      atualizadoPor: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      deletedBy: null,
    };

    return new StatusCustomizadoEntity(status);
  }

  static reconstituir(props: StatusCustomizado): StatusCustomizadoEntity {
    return new StatusCustomizadoEntity(props);
  }

  atualizar(params: {
    nome?: string;
    cor?: string;
    descricao?: string | null;
    ordem?: number;
    ativo?: boolean;
    atualizadoPor: string;
  }): void {
    if (params.nome !== undefined) {
      this.props.nome = params.nome;
    }
    if (params.cor !== undefined) {
      this.props.cor = params.cor;
    }
    if (params.descricao !== undefined) {
      this.props.descricao = params.descricao;
    }
    if (params.ordem !== undefined) {
      this.props.ordem = params.ordem;
    }
    if (params.ativo !== undefined) {
      this.props.ativo = params.ativo;
    }
    this.props.atualizadoPor = params.atualizadoPor;
    this.props.updatedAt = new Date();
  }

  desativar(deletedBy: string): void {
    this.props.ativo = false;
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
  }

  ativar(): void {
    this.props.ativo = true;
    this.props.deletedAt = null;
    this.props.deletedBy = null;
  }

  get id(): string {
    return this.props.id;
  }

  get orgId(): string {
    return this.props.orgId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cor(): string {
    return this.props.cor;
  }

  get descricao(): string | null {
    return this.props.descricao;
  }

  get ordem(): number {
    return this.props.ordem;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  toJSON(): StatusCustomizado {
    return { ...this.props };
  }
}


