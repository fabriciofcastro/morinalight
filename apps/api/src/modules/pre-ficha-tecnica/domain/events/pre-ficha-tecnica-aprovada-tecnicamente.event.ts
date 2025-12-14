/**
 * Evento de Domínio: Pré-Ficha Técnica Aprovada Tecnicamente
 */
export class PreFichaTecnicaAprovadaTecnicamente {
  constructor(
    public readonly preFichaTecnicaId: string,
    public readonly orgId: string,
    public readonly aprovadoPor: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

