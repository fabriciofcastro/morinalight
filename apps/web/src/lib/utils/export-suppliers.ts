import type { Supplier } from "@/lib/api/suppliers";

export function exportSuppliersToCSV(suppliers: Supplier[]): void {
  const headers = [
    "Nome",
    "Email",
    "Telefone",
    "CPF/CNPJ",
    "Endereço",
    "Cidade",
    "Estado",
    "CEP",
    "Status",
    "Observações",
    "Data de Criação",
    "Última Atualização",
  ];

  const rows = suppliers.map((supplier) => [
    supplier.name || "",
    supplier.email || "",
    supplier.phone || "",
    supplier.document || "",
    supplier.address || "",
    supplier.city || "",
    supplier.state || "",
    supplier.zipCode || "",
    supplier.status || "",
    supplier.notes || "",
    supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString("pt-BR") : "",
    supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString("pt-BR") : "",
  ]);

  // CSV com separador vírgula e encoding UTF-8
  const csvContent = [
    "\uFEFF", // BOM para UTF-8
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fornecedores_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSuppliersToExcel(suppliers: Supplier[]): void {
  const headers = [
    "Nome",
    "Email",
    "Telefone",
    "CPF/CNPJ",
    "Endereço",
    "Cidade",
    "Estado",
    "CEP",
    "Status",
    "Observações",
    "Data de Criação",
    "Última Atualização",
  ];

  const rows = suppliers.map((supplier) => [
    supplier.name || "",
    supplier.email || "",
    supplier.phone || "",
    supplier.document || "",
    supplier.address || "",
    supplier.city || "",
    supplier.state || "",
    supplier.zipCode || "",
    supplier.status || "",
    supplier.notes || "",
    supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString("pt-BR") : "",
    supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString("pt-BR") : "",
  ]);

  // Excel usa tabulação (TSV) com BOM UTF-8
  const tsvContent = ["\uFEFF", headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  const blob = new Blob([tsvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fornecedores_${new Date().toISOString().split("T")[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSuppliersToJSON(suppliers: Supplier[]): void {
  const jsonContent = JSON.stringify(suppliers, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fornecedores_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSupplierToPDF(supplier: Supplier): void {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fornecedor - ${supplier.name}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 40px;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { 
      color: #4f46e5;
      margin: 0;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-section h2 {
      color: #6366f1;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-ativo { background-color: #d1fae5; color: #065f46; }
    .badge-inativo { background-color: #fee2e2; color: #991b1b; }
    .badge-suspenso { background-color: #fef3c7; color: #92400e; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fornecedor: ${supplier.name}</h1>
    <p style="color: #6b7280; margin-top: 5px;">
      Exportado em: ${new Date().toLocaleString("pt-BR")}
    </p>
  </div>

  <div class="info-section">
    <h2>Dados Cadastrais</h2>
    <div class="info-grid">
      <div class="info-label">Nome/Razão Social:</div>
      <div class="info-value">${supplier.name}</div>
      
      ${supplier.document ? `
      <div class="info-label">CPF/CNPJ:</div>
      <div class="info-value">${supplier.document}</div>
      ` : ""}
      
      ${supplier.email ? `
      <div class="info-label">Email:</div>
      <div class="info-value">${supplier.email}</div>
      ` : ""}
      
      ${supplier.phone ? `
      <div class="info-label">Telefone:</div>
      <div class="info-value">${supplier.phone}</div>
      ` : ""}
      
      <div class="info-label">Status:</div>
      <div class="info-value">
        <span class="badge badge-${supplier.status}">${supplier.status}</span>
      </div>
    </div>
  </div>

  ${supplier.address || supplier.city || supplier.state || supplier.zipCode ? `
  <div class="info-section">
    <h2>Endereço</h2>
    <div class="info-grid">
      ${supplier.address ? `
      <div class="info-label">Endereço:</div>
      <div class="info-value">${supplier.address}</div>
      ` : ""}
      
      ${supplier.city ? `
      <div class="info-label">Cidade:</div>
      <div class="info-value">${supplier.city}</div>
      ` : ""}
      
      ${supplier.state ? `
      <div class="info-label">Estado:</div>
      <div class="info-value">${supplier.state}</div>
      ` : ""}
      
      ${supplier.zipCode ? `
      <div class="info-label">CEP:</div>
      <div class="info-value">${supplier.zipCode}</div>
      ` : ""}
    </div>
  </div>
  ` : ""}

  ${supplier.notes ? `
  <div class="info-section">
    <h2>Observações</h2>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
      ${supplier.notes}
    </div>
  </div>
  ` : ""}

  <div class="info-section">
    <h2>Informações do Sistema</h2>
    <div class="info-grid">
      <div class="info-label">Data de Criação:</div>
      <div class="info-value">${supplier.createdAt ? new Date(supplier.createdAt).toLocaleString("pt-BR") : "-"}</div>
      
      <div class="info-label">Última Atualização:</div>
      <div class="info-value">${supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleString("pt-BR") : "-"}</div>
    </div>
  </div>

  <div class="footer">
    <p>Documento gerado automaticamente pelo sistema MORINA</p>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fornecedor_${supplier.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

