/**
 * Evento de Domínio: Pré-Ficha Técnica Reprovada
 */
export class PreFichaTecnicaReprovada {
  constructor(
    public readonly preFichaTecnicaId: string,
    public readonly orgId: string,
    public readonly reprovadoPor: string,
    public readonly justificativa: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

