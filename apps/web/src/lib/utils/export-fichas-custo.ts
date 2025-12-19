import type { FichaCusto } from "@/lib/api/fichas-custo";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
};

export function exportFichasToCSV(fichas: FichaCusto[]): void {
  const headers = [
    "ID",
    "Número Sequencial",
    "Referência",
    "Nome da Peça",
    "Coleção",
    "Status",
    "Total de Custos",
    "Custo por Peça",
    "Quantidade de Insumos",
    "Data de Abertura",
    "Data do Corte",
  ];

  const rows = fichas.map((ficha) => [
    ficha.id,
    ficha.numeroSequencial?.toString() || "",
    ficha.referenciaPeca || "",
    ficha.nomePeca || "",
    ficha.categoria || "",
    ficha.status || "",
    formatCurrency(ficha.totalCustos || 0),
    formatCurrency(ficha.custoFinalPeca || 0),
    ficha.insumos?.length?.toString() || "0",
    formatDate(ficha.dataAbertura),
    formatDate(ficha.dataCorte),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fichas_custo_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFichasToExcel(fichas: FichaCusto[]): void {
  const headers = [
    "ID",
    "Número Sequencial",
    "Referência",
    "Nome da Peça",
    "Coleção",
    "Status",
    "Total de Custos",
    "Custo por Peça",
    "Quantidade de Insumos",
    "Data de Abertura",
    "Data do Corte",
  ];

  const rows = fichas.map((ficha) => [
    ficha.id,
    ficha.numeroSequencial?.toString() || "",
    ficha.referenciaPeca || "",
    ficha.nomePeca || "",
    ficha.categoria || "",
    ficha.status || "",
    ficha.totalCustos || 0,
    ficha.custoFinalPeca || 0,
    ficha.insumos?.length || 0,
    ficha.dataAbertura ? new Date(ficha.dataAbertura).toLocaleDateString("pt-BR") : "",
    ficha.dataCorte ? new Date(ficha.dataCorte).toLocaleDateString("pt-BR") : "",
  ]);

  // Excel usa tabulação (TSV) com BOM UTF-8
  const tsvContent = ["\uFEFF", headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  const blob = new Blob([tsvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fichas_custo_${new Date().toISOString().split("T")[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFichasToJSON(fichas: FichaCusto[]): void {
  const jsonContent = JSON.stringify(fichas, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fichas_custo_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFichasToPDF(fichas: FichaCusto[]): void {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "aprovada":
        return "badge-aprovada";
      case "reprovada":
        return "badge-reprovada";
      case "enviada_para_conferencia":
        return "badge-enviada";
      default:
        return "badge-rascunho";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Fichas de Custo - ${new Date().toLocaleDateString("pt-BR")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      background: #fff;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 22px;
      margin-bottom: 5px;
    }
    .header-info {
      font-size: 10px;
      color: #666;
      margin-top: 5px;
    }
    .summary {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .summary-item {
      display: inline-block;
      margin-right: 20px;
      font-size: 11px;
    }
    .summary-label {
      font-weight: bold;
      color: #666;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table th {
      background: #2563eb;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
      font-size: 10px;
      border: 1px solid #1e40af;
    }
    .table td {
      padding: 8px 10px;
      border: 1px solid #ddd;
      font-size: 10px;
    }
    .table tr:nth-child(even) {
      background: #f9fafb;
    }
    .table tr:hover {
      background: #f3f4f6;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: bold;
    }
    .badge-rascunho { background: #9ca3af; color: white; }
    .badge-enviada { background: #3b82f6; color: white; }
    .badge-aprovada { background: #10b981; color: white; }
    .badge-reprovada { background: #ef4444; color: white; }
    .text-right {
      text-align: right;
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
      .table { font-size: 9px; }
      .table th, .table td { padding: 6px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fichas de Custo de Aviamento</h1>
    <div class="header-info">
      Exportado em: ${new Date().toLocaleString("pt-BR")} | Total de fichas: ${fichas.length}
    </div>
  </div>

  <div class="summary">
    <div class="summary-item">
      <span class="summary-label">Total de Fichas:</span> ${fichas.length}
    </div>
    <div class="summary-item">
      <span class="summary-label">Aprovadas:</span> ${fichas.filter((f) => f.status === "aprovada").length}
    </div>
    <div class="summary-item">
      <span class="summary-label">Em Rascunho:</span> ${fichas.filter((f) => f.status === "rascunho").length}
    </div>
    <div class="summary-item">
      <span class="summary-label">Total Geral:</span> ${formatCurrency(fichas.reduce((sum, f) => sum + (f.totalCustos || 0), 0))}
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Referência</th>
        <th>Nome da Peça</th>
        <th>Coleção</th>
        <th>Status</th>
        <th class="text-right">Total</th>
        <th class="text-right">Custo/Pça</th>
        <th>Insumos</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${fichas
        .map(
          (ficha, index) => `
      <tr>
        <td>${ficha.numeroSequencial || index + 1}</td>
        <td>${ficha.referenciaPeca || "-"}</td>
        <td>${ficha.nomePeca || "-"}</td>
        <td>${ficha.categoria || "-"}</td>
        <td><span class="badge ${getStatusBadgeClass(ficha.status || "rascunho")}">${getStatusText(ficha.status || "rascunho")}</span></td>
        <td class="text-right">${formatCurrency(ficha.totalCustos || 0)}</td>
        <td class="text-right">${formatCurrency(ficha.custoFinalPeca || 0)}</td>
        <td>${ficha.insumos?.length || 0}</td>
        <td>${formatDate(ficha.dataAbertura)}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Este documento foi gerado automaticamente pelo sistema MORINA</p>
    <p>Para imprimir como PDF, use as opções de impressão do navegador (Ctrl/Cmd + P)</p>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fichas_custo_${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}





