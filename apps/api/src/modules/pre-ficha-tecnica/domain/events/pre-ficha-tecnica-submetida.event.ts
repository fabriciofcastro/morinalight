/**
 * Evento de Domínio: Pré-Ficha Técnica Submetida para Revisão
 */
export class PreFichaTecnicaSubmetida {
  constructor(
    public readonly preFichaTecnicaId: string,
    public readonly orgId: string,
    public readonly submetidoPor: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}












