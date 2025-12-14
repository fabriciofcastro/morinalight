import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { PreFichaTecnicaId } from "../../domain/value-objects/pre-ficha-tecnica-id";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  orgId: string;
};

/**
 * Use Case para exportar pré-ficha técnica em PDF
 * Por enquanto, retorna HTML que pode ser convertido para PDF no frontend
 */
export class ExportarPdfPreFichaTecnicaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(preFichaTecnicaId: string): Promise<{
    html: string;
    dados: any;
  }> {
    const preFichaId = PreFichaTecnicaId.from(preFichaTecnicaId);
    const preFicha = await this.deps.preFichaTecnicaRepository.buscarPorId(
      preFichaId.toString(),
      this.deps.orgId,
    );

    if (!preFicha) {
      throw new Error("Pré-ficha técnica não encontrada");
    }

    const dados = preFicha.toJSON();

    // Gerar HTML para PDF
    const html = this.gerarHTML(dados);

    return {
      html,
      dados,
    };
  }

  private gerarHTML(dados: any): string {
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pré-Ficha Técnica #${dados.numeroSequencial}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 11px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      color: #666;
      font-size: 10px;
      margin-bottom: 3px;
    }
    .field-value {
      color: #333;
      font-size: 11px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table th {
      background: #f3f4f6;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      font-size: 10px;
      border: 1px solid #ddd;
    }
    .table td {
      padding: 8px;
      border: 1px solid #ddd;
      font-size: 10px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .badge-rascunho { background: #9ca3af; color: white; }
    .badge-submetida { background: #3b82f6; color: white; }
    .badge-em-revisao { background: #f59e0b; color: white; }
    .badge-aprovada { background: #10b981; color: white; }
    .badge-aguardando { background: #8b5cf6; color: white; }
    .badge-liberada { background: #059669; color: white; }
    .badge-reprovada { background: #ef4444; color: white; }
    .checklist-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    .checklist-item input[type="checkbox"] {
      margin-right: 8px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
    @media print {
      body { padding: 10px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pré-Ficha Técnica #${dados.numeroSequencial}</h1>
    <div class="header-info">
      <div>
        <strong>Código:</strong> ${dados.codigoPeca} | 
        <strong>Versão:</strong> ${dados.versaoMolde}
      </div>
      <div>
        <span class="badge badge-${dados.status.replace(/_/g, '-')}">
          ${dados.status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados da Peça</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Nome da Peça Piloto</div>
        <div class="field-value">${dados.nomePecaPiloto}</div>
      </div>
      <div class="field">
        <div class="field-label">Categoria</div>
        <div class="field-value">${dados.categoria || "-"}</div>
      </div>
      <div class="field">
        <div class="field-label">Criada em</div>
        <div class="field-value">${formatDate(dados.createdAt)}</div>
      </div>
      <div class="field">
        <div class="field-label">Atualizada em</div>
        <div class="field-value">${formatDate(dados.updatedAt)}</div>
      </div>
    </div>
  </div>

  ${dados.estilistaNome || dados.modelistaNome || dados.piloteiroNome ? `
  <div class="section">
    <div class="section-title">Responsáveis Técnicos</div>
    <div class="grid">
      ${dados.estilistaNome ? `
      <div class="field">
        <div class="field-label">Estilista</div>
        <div class="field-value">${dados.estilistaNome}</div>
      </div>
      ` : ''}
      ${dados.modelistaNome ? `
      <div class="field">
        <div class="field-label">Modelista</div>
        <div class="field-value">${dados.modelistaNome}</div>
      </div>
      ` : ''}
      ${dados.piloteiroNome ? `
      <div class="field">
        <div class="field-label">Piloteiro</div>
        <div class="field-value">${dados.piloteiroNome}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${dados.gradeTamanhos && dados.gradeTamanhos.length > 0 ? `
  <div class="section">
    <div class="section-title">Grade de Tamanhos</div>
    <div class="field-value">${dados.gradeTamanhos.join(', ')}</div>
  </div>
  ` : ''}

  ${dados.tecidos && dados.tecidos.length > 0 ? `
  <div class="section">
    <div class="section-title">Tecidos (${dados.tecidos.length})</div>
    <table class="table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Nome</th>
          <th>Consumo (m)</th>
          <th>Largura (cm)</th>
          <th>Partes</th>
        </tr>
      </thead>
      <tbody>
        ${dados.tecidos.map((t: any) => `
        <tr>
          <td>${t.tipo}</td>
          <td>${t.nome}</td>
          <td>${t.consumo}</td>
          <td>${t.largura}</td>
          <td>${t.quantidadePartes || "-"}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${dados.insumosTecnicos && dados.insumosTecnicos.length > 0 ? `
  <div class="section">
    <div class="section-title">Insumos Técnicos (${dados.insumosTecnicos.length})</div>
    <table class="table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Descrição</th>
          <th>Quantidade Base</th>
          <th>Unidade</th>
        </tr>
      </thead>
      <tbody>
        ${dados.insumosTecnicos.map((i: any) => `
        <tr>
          <td>${i.tipo}</td>
          <td>${i.descricao}</td>
          <td>${i.quantidadeBase}</td>
          <td>${i.unidadeMedida}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${dados.checklistTecnico ? `
  <div class="section">
    <div class="section-title">Checklist Técnico</div>
    <div class="checklist-item">
      <input type="checkbox" ${dados.checklistTecnico.moldeVesteCorretamente ? 'checked' : ''} disabled>
      <span>Molde veste corretamente</span>
    </div>
    <div class="checklist-item">
      <input type="checkbox" ${dados.checklistTecnico.costuraViavel ? 'checked' : ''} disabled>
      <span>Costura viável</span>
    </div>
    <div class="checklist-item">
      <input type="checkbox" ${dados.checklistTecnico.insumosCompatíveis ? 'checked' : ''} disabled>
      <span>Insumos compatíveis</span>
    </div>
    <div class="checklist-item">
      <input type="checkbox" ${dados.checklistTecnico.pecaPilotoAprovadaVisualmente ? 'checked' : ''} disabled>
      <span>Peça piloto aprovada visualmente</span>
    </div>
  </div>
  ` : ''}

  ${dados.observacoesTecnicas || dados.observacoesOficina ? `
  <div class="section">
    <div class="section-title">Observações</div>
    ${dados.observacoesTecnicas ? `
    <div class="field">
      <div class="field-label">Observações Técnicas</div>
      <div class="field-value">${dados.observacoesTecnicas}</div>
    </div>
    ` : ''}
    ${dados.observacoesOficina ? `
    <div class="field">
      <div class="field-label">Observações da Oficina</div>
      <div class="field-value">${dados.observacoesOficina}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Documento gerado em ${formatDate(new Date())}</p>
    <p>Pré-Ficha Técnica #${dados.numeroSequencial} - Versão ${dados.versaoMolde}</p>
  </div>
</body>
</html>
    `.trim();
  }
}

