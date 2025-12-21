import { ClienteId } from "../value-objects/cliente-id";

export type ClienteStatus = "ativo" | "inativo" | "bloqueado";

export type ClienteProps = {
  orgId: string;
  nome: string;
  nomeSocial?: string | null; // Nome Social / Apelido
  razaoSocial?: string | null;
  nomeFantasia?: string | null; // Nome Fantasia separado (especialmente para PJ)
  tipo: "fisica" | "juridica";
  documento: string; // CPF ou CNPJ
  documentoValidade?: Date | null; // Data de validade do documento
  situacaoCadastral?: string | null; // Situação Cadastral na Receita Federal
  fotoUrl?: string | null; // URL da foto/logo do cliente
  rg?: string | null; // RG para PF
  orgaoEmissor?: string | null; // Órgão Emissor do RG
  dataNascimento?: Date | null; // Data de Nascimento (PF) / Data de Fundação (PJ)
  sexo?: "masculino" | "feminino" | "outro" | "nao_informar" | null; // Sexo/Gênero (PF)
  estadoCivil?: "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel" | null; // Estado Civil (PF)
  nacionalidade?: string | null; // Nacionalidade
  naturalidadeCidade?: string | null; // Cidade de Naturalidade
  naturalidadeEstado?: string | null; // Estado de Naturalidade (UF)
  tituloEleitor?: string | null; // Título de Eleitor
  certidaoNascimento?: string | null; // Certidão de Nascimento
  certidaoCasamento?: string | null; // Certidão de Casamento
  nomeMae?: string | null; // Nome da Mãe (PF)
  nomePai?: string | null; // Nome do Pai (PF)
  inscricaoEstadual?: string | null; // IE para PJ
  inscricaoMunicipal?: string | null; // IM para PJ
  email?: string | null;
  emailSecundario?: string | null; // Email secundário
  emailCorporativo?: string | null; // Email corporativo
  telefone?: string | null;
  telefoneComercial?: string | null; // Telefone comercial
  celular?: string | null;
  whatsapp?: string | null; // WhatsApp Business
  telegram?: string | null; // Telegram
  website?: string | null; // Website do cliente
  endereco?: string | null;
  numero?: string | null; // Número do endereço
  complemento?: string | null; // Complemento do endereço
  bairro?: string | null; // Bairro
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
    input: Omit<ClienteProps, "createdAt" | "updatedAt" | "status"> & {
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

    if (dados.nomeFantasia !== undefined) {
      this.props.nomeFantasia = dados.nomeFantasia;
    }

    if (dados.nomeSocial !== undefined) {
      this.props.nomeSocial = dados.nomeSocial;
    }

    if (dados.rg !== undefined) {
      this.props.rg = dados.rg;
    }

    if (dados.orgaoEmissor !== undefined) {
      this.props.orgaoEmissor = dados.orgaoEmissor;
    }

    if (dados.dataNascimento !== undefined) {
      this.props.dataNascimento = dados.dataNascimento;
    }

    if (dados.inscricaoEstadual !== undefined) {
      this.props.inscricaoEstadual = dados.inscricaoEstadual;
    }

    if (dados.inscricaoMunicipal !== undefined) {
      this.props.inscricaoMunicipal = dados.inscricaoMunicipal;
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

    if (dados.website !== undefined) {
      this.props.website = dados.website;
    }

    if (dados.linkedin !== undefined) {
      this.props.linkedin = dados.linkedin;
    }

    if (dados.facebook !== undefined) {
      this.props.facebook = dados.facebook;
    }

    if (dados.instagram !== undefined) {
      this.props.instagram = dados.instagram;
    }

    if (dados.twitter !== undefined) {
      this.props.twitter = dados.twitter;
    }

    if (dados.youtube !== undefined) {
      this.props.youtube = dados.youtube;
    }

    if (dados.blog !== undefined) {
      this.props.blog = dados.blog;
    }

    if (dados.endereco !== undefined) {
      this.props.endereco = dados.endereco;
    }

    if (dados.pontoReferencia !== undefined) {
      this.props.pontoReferencia = dados.pontoReferencia;
    }

    if (dados.latitude !== undefined) {
      this.props.latitude = dados.latitude;
    }

    if (dados.longitude !== undefined) {
      this.props.longitude = dados.longitude;
    }

    if (dados.codigoIBGE !== undefined) {
      this.props.codigoIBGE = dados.codigoIBGE;
    }

    if (dados.codigoMunicipio !== undefined) {
      this.props.codigoMunicipio = dados.codigoMunicipio;
    }

    if (dados.regiao !== undefined) {
      this.props.regiao = dados.regiao;
    }

    if (dados.zona !== undefined) {
      this.props.zona = dados.zona;
    }

    if (dados.horarioPreferencialContato !== undefined) {
      this.props.horarioPreferencialContato = dados.horarioPreferencialContato;
    }

    if (dados.idiomaPreferido !== undefined) {
      this.props.idiomaPreferido = dados.idiomaPreferido;
    }

    if (dados.formaPreferidaComunicacao !== undefined) {
      this.props.formaPreferidaComunicacao = dados.formaPreferidaComunicacao;
    }

    if (dados.numero !== undefined) {
      this.props.numero = dados.numero;
    }

    if (dados.complemento !== undefined) {
      this.props.complemento = dados.complemento;
    }

    if (dados.bairro !== undefined) {
      this.props.bairro = dados.bairro;
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

  atualizarNomeFantasia(nomeFantasia: string | null) {
    this.props.nomeFantasia = nomeFantasia;
    this.props.updatedAt = new Date();
  }

  atualizarInscricaoEstadual(inscricaoEstadual: string | null) {
    this.props.inscricaoEstadual = inscricaoEstadual;
    this.props.updatedAt = new Date();
  }

  atualizarInscricaoMunicipal(inscricaoMunicipal: string | null) {
    this.props.inscricaoMunicipal = inscricaoMunicipal;
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

  atualizarWebsite(website: string | null) {
    this.props.website = website;
    this.props.updatedAt = new Date();
  }

  atualizarEndereco(endereco: string | null) {
    this.props.endereco = endereco;
    this.props.updatedAt = new Date();
  }

  atualizarNumero(numero: string | null) {
    this.props.numero = numero;
    this.props.updatedAt = new Date();
  }

  atualizarComplemento(complemento: string | null) {
    this.props.complemento = complemento;
    this.props.updatedAt = new Date();
  }

  atualizarBairro(bairro: string | null) {
    this.props.bairro = bairro;
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
