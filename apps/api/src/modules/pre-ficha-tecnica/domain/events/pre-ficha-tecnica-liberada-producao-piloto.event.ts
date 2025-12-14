/**
 * Evento de Domínio: Pré-Ficha Técnica Liberada para Produção Piloto
 */
export class PreFichaTecnicaLiberadaProducaoPiloto {
  constructor(
    public readonly preFichaTecnicaId: string,
    public readonly orgId: string,
    public readonly aprovadoPor: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

