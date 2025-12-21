import type { ClienteRepository } from "../../domain/repositories/cliente-repository";
import {
  clienteViewSchema,
  listarClientesInputSchema,
  listarClientesResultadoSchema,
} from "../schemas/cliente.schema";
import { getPrisma } from "../../../../infra/database/prisma.service";

type Dependencies = {
  clienteRepository: ClienteRepository;
};

const prisma = getPrisma();

export class ListarClientesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarClientesInputSchema.parse(rawInput);

    const pagina = await this.deps.clienteRepository.listarPorOrg(input.orgId, {
      status: input.status,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    // Buscar tags para todos os clientes
    const clienteIds = pagina.itens.map((c) => c.clienteId);
    const tagsRelations = await prisma.clienteTagRelation.findMany({
      where: {
        clienteId: { in: clienteIds },
      },
      include: {
        tag: true,
      },
    });

    // Criar mapa de tags por cliente
    const tagsMap = new Map<string, Array<{ id: string; name: string; color: string | null }>>();
    tagsRelations.forEach((rel) => {
      if (!tagsMap.has(rel.clienteId)) {
        tagsMap.set(rel.clienteId, []);
      }
      tagsMap.get(rel.clienteId)!.push({
        id: rel.tag.id,
        name: rel.tag.name,
        color: rel.tag.color || null,
      });
    });

    const itens = pagina.itens.map((cliente) => {
      const tags = tagsMap.get(cliente.clienteId) || [];

      return clienteViewSchema.parse({
        clienteId: cliente.clienteId,
        orgId: cliente.dados.orgId,
        nome: cliente.dados.nome,
        nomeSocial: cliente.dados.nomeSocial ?? null,
        razaoSocial: cliente.dados.razaoSocial ?? null,
        nomeFantasia: cliente.dados.nomeFantasia ?? null,
        tipo: cliente.dados.tipo,
        documento: cliente.dados.documento,
        documentoValidade: cliente.dados.documentoValidade ?? null,
        situacaoCadastral: cliente.dados.situacaoCadastral ?? null,
        fotoUrl: cliente.dados.fotoUrl ?? null,
        rg: cliente.dados.rg ?? null,
        orgaoEmissor: cliente.dados.orgaoEmissor ?? null,
        dataNascimento: cliente.dados.dataNascimento ?? null,
        sexo: cliente.dados.sexo ?? null,
        estadoCivil: cliente.dados.estadoCivil ?? null,
        nacionalidade: cliente.dados.nacionalidade ?? null,
        naturalidadeCidade: cliente.dados.naturalidadeCidade ?? null,
        naturalidadeEstado: cliente.dados.naturalidadeEstado ?? null,
        tituloEleitor: cliente.dados.tituloEleitor ?? null,
        certidaoNascimento: cliente.dados.certidaoNascimento ?? null,
        certidaoCasamento: cliente.dados.certidaoCasamento ?? null,
        nomeMae: cliente.dados.nomeMae ?? null,
        nomePai: cliente.dados.nomePai ?? null,
        inscricaoEstadual: cliente.dados.inscricaoEstadual ?? null,
        inscricaoMunicipal: cliente.dados.inscricaoMunicipal ?? null,
        email: cliente.dados.email ?? null,
        emailSecundario: cliente.dados.emailSecundario ?? null,
        emailCorporativo: cliente.dados.emailCorporativo ?? null,
        telefone: cliente.dados.telefone ?? null,
        telefoneComercial: cliente.dados.telefoneComercial ?? null,
        celular: cliente.dados.celular ?? null,
        whatsapp: cliente.dados.whatsapp ?? null,
        telegram: cliente.dados.telegram ?? null,
        website: cliente.dados.website ?? null,
        linkedin: cliente.dados.linkedin ?? null,
        facebook: cliente.dados.facebook ?? null,
        instagram: cliente.dados.instagram ?? null,
        twitter: cliente.dados.twitter ?? null,
        youtube: cliente.dados.youtube ?? null,
        blog: cliente.dados.blog ?? null,
        endereco: cliente.dados.endereco ?? null,
        pontoReferencia: cliente.dados.pontoReferencia ?? null,
        latitude: cliente.dados.latitude ?? null,
        longitude: cliente.dados.longitude ?? null,
        codigoIBGE: cliente.dados.codigoIBGE ?? null,
        codigoMunicipio: cliente.dados.codigoMunicipio ?? null,
        regiao: cliente.dados.regiao ?? null,
        zona: cliente.dados.zona ?? null,
        horarioPreferencialContato: cliente.dados.horarioPreferencialContato ?? null,
        idiomaPreferido: cliente.dados.idiomaPreferido ?? null,
        formaPreferidaComunicacao: cliente.dados.formaPreferidaComunicacao ?? null,
        numero: cliente.dados.numero ?? null,
        complemento: cliente.dados.complemento ?? null,
        bairro: cliente.dados.bairro ?? null,
        cidade: cliente.dados.cidade ?? null,
        estado: cliente.dados.estado ?? null,
        cep: cliente.dados.cep ?? null,
        status: cliente.dados.status,
        observacoes: cliente.dados.observacoes ?? null,
        createdBy: cliente.dados.createdBy,
        updatedBy: cliente.dados.updatedBy,
        createdAt: cliente.dados.createdAt,
        updatedAt: cliente.dados.updatedAt,
        tags,
      });
    });

    return listarClientesResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
