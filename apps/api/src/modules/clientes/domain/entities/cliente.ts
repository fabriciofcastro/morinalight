import { ClienteId } from "../value-objects/cliente-id";

export type ClienteStatus = "ativo" | "inativo" | "bloqueado";

export type ClienteProps = {
  orgId: string;
  nome: string;
  razaoSocial?: string | null;
  tipo: "fisica" | "juridica";
  documento: string; // CPF ou CNPJ
  email?: string | null;
  telefone?: string | null;
  celular?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  status: ClienteStatus;
  observacoes?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Cliente {
  constructor(
    private readonly props: ClienteProps,
    private readonly id: ClienteId = ClienteId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Cliente requer orgId");
    }

    if (!props.nome) {
      throw new Error("Cliente requer nome");
    }

    if (!props.documento) {
      throw new Error("Cliente requer documento (CPF/CNPJ)");
    }
  }

  static criar(
    input: Omit<ClienteProps, "criadoEm" | "atualizadoEm" | "status"> & {
      status?: ClienteStatus;
    },
  ) {
    const agora = new Date();
    return new Cliente(
      {
        ...input,
        status: input.status ?? "ativo",
        createdAt: agora,
        updatedAt: agora,
      },
      ClienteId.from(),
    );
  }

  static restaurar(props: ClienteProps, id: string) {
    return new Cliente({ ...props }, ClienteId.from(id));
  }

  get clienteId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<ClienteProps, "orgId" | "createdAt" | "createdBy">>,
    actorId: string,
  ) {
    if (dados.nome !== undefined) {
      if (!dados.nome || dados.nome.trim().length === 0) {
        throw new Error("Nome do cliente não pode ser vazio");
      }
      this.props.nome = dados.nome;
    }

    if (dados.razaoSocial !== undefined) {
      this.props.razaoSocial = dados.razaoSocial;
    }

    if (dados.email !== undefined) {
      this.props.email = dados.email;
    }

    if (dados.telefone !== undefined) {
      this.props.telefone = dados.telefone;
    }

    if (dados.celular !== undefined) {
      this.props.celular = dados.celular;
    }

    if (dados.endereco !== undefined) {
      this.props.endereco = dados.endereco;
    }

    if (dados.cidade !== undefined) {
      this.props.cidade = dados.cidade;
    }

    if (dados.estado !== undefined) {
      this.props.estado = dados.estado;
    }

    if (dados.cep !== undefined) {
      this.props.cep = dados.cep;
    }

    if (dados.status !== undefined) {
      this.props.status = dados.status;
    }

    if (dados.observacoes !== undefined) {
      this.props.observacoes = dados.observacoes;
    }

    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  atualizarNome(nome: string) {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome do cliente não pode ser vazio");
    }
    this.props.nome = nome;
    this.props.updatedAt = new Date();
  }

  atualizarRazaoSocial(razaoSocial: string | null) {
    this.props.razaoSocial = razaoSocial;
    this.props.updatedAt = new Date();
  }

  atualizarEmail(email: string | null) {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  atualizarTelefone(telefone: string | null) {
    this.props.telefone = telefone;
    this.props.updatedAt = new Date();
  }

  atualizarCelular(celular: string | null) {
    this.props.celular = celular;
    this.props.updatedAt = new Date();
  }

  atualizarEndereco(endereco: string | null) {
    this.props.endereco = endereco;
    this.props.updatedAt = new Date();
  }

  atualizarCidade(cidade: string | null) {
    this.props.cidade = cidade;
    this.props.updatedAt = new Date();
  }

  atualizarEstado(estado: string | null) {
    this.props.estado = estado;
    this.props.updatedAt = new Date();
  }

  atualizarCep(cep: string | null) {
    this.props.cep = cep;
    this.props.updatedAt = new Date();
  }

  atualizarObservacoes(observacoes: string | null) {
    this.props.observacoes = observacoes;
    this.props.updatedAt = new Date();
  }

  alterarStatus(status: ClienteStatus) {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  marcarComoAtualizado(actorId: string) {
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  bloquear(actorId: string) {
    this.props.status = "bloqueado";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  ativar(actorId: string) {
    this.props.status = "ativo";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  desativar(actorId: string) {
    this.props.status = "inativo";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}
