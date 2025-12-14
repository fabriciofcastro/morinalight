/**
 * Evento de Domínio: Pré-Ficha Técnica Criada
 */
export class PreFichaTecnicaCriada {
  constructor(
    public readonly preFichaTecnicaId: string,
    public readonly orgId: string,
    public readonly codigoPeca: string,
    public readonly nomePecaPiloto: string,
    public readonly criadoPor: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

