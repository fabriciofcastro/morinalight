import type { Branch } from "@/lib/api/organizational-structure";

export function exportBranchesToCSV(branches: Branch[]): void {
    const headers = [
        "Nome",
        "Código",
        "Tipo",
        "CNPJ",
        "Inscrição Estadual",
        "Email",
        "Telefone",
        "CEP",
        "Logradouro",
        "Número",
        "Complemento",
        "Bairro",
        "Cidade",
        "Estado",
        "Status",
        "Data de Criação",
        "Última Atualização",
    ];

    const rows = branches.map((branch) => [
        branch.name || "",
        branch.code || "",
        branch.type || "",
        branch.cnpj || "",
        branch.stateRegistration || "",
        branch.email || "",
        branch.phone || "",
        branch.address?.zipCode || "",
        branch.address?.street || "",
        branch.address?.number || "",
        branch.address?.complement || "",
        branch.address?.neighborhood || "",
        branch.address?.city || "",
        branch.address?.state || "",
        branch.active ? "Ativo" : "Inativo",
        branch.createdAt ? new Date(branch.createdAt).toLocaleDateString("pt-BR") : "",
        branch.updatedAt ? new Date(branch.updatedAt).toLocaleDateString("pt-BR") : "",
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
    link.download = `filiais_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportBranchesToExcel(branches: Branch[]): void {
    const headers = [
        "Nome",
        "Código",
        "Tipo",
        "CNPJ",
        "Inscrição Estadual",
        "Email",
        "Telefone",
        "CEP",
        "Logradouro",
        "Número",
        "Complemento",
        "Bairro",
        "Cidade",
        "Estado",
        "Status",
        "Data de Criação",
        "Última Atualização",
    ];

    const rows = branches.map((branch) => [
        branch.name || "",
        branch.code || "",
        branch.type || "",
        branch.cnpj || "",
        branch.stateRegistration || "",
        branch.email || "",
        branch.phone || "",
        branch.address?.zipCode || "",
        branch.address?.street || "",
        branch.address?.number || "",
        branch.address?.complement || "",
        branch.address?.neighborhood || "",
        branch.address?.city || "",
        branch.address?.state || "",
        branch.active ? "Ativo" : "Inativo",
        branch.createdAt ? new Date(branch.createdAt).toLocaleDateString("pt-BR") : "",
        branch.updatedAt ? new Date(branch.updatedAt).toLocaleDateString("pt-BR") : "",
    ]);

    // Excel usa tabulação (TSV) com BOM UTF-8
    const tsvContent = ["\uFEFF", headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

    const blob = new Blob([tsvContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filiais_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportBranchesToJSON(branches: Branch[]): void {
    const jsonContent = JSON.stringify(branches, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filiais_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportBranchToPDF(branch: Branch): void {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Filial - ${branch.name}</title>
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
    <h1>Filial: ${branch.name}</h1>
    <p style="color: #6b7280; margin-top: 5px;">
      Exportado em: ${new Date().toLocaleString("pt-BR")}
    </p>
  </div>

  <div class="info-section">
    <h2>Dados Cadastrais</h2>
    <div class="info-grid">
      <div class="info-label">Nome:</div>
      <div class="info-value">${branch.name}</div>
      
      <div class="info-label">Código Interno:</div>
      <div class="info-value">${branch.code}</div>
      
      <div class="info-label">Tipo:</div>
      <div class="info-value">${branch.type}</div>
      
      ${branch.cnpj ? `
      <div class="info-label">CNPJ:</div>
      <div class="info-value">${branch.cnpj}</div>
      ` : ""}
      
      ${branch.stateRegistration ? `
      <div class="info-label">Inscrição Estadual:</div>
      <div class="info-value">${branch.stateRegistration}</div>
      ` : ""}
      
      <div class="info-label">Status:</div>
      <div class="info-value">
        <span class="badge badge-${branch.active ? "ativo" : "inativo"}">${branch.active ? "Ativo" : "Inativo"}</span>
      </div>
    </div>
  </div>

  ${branch.email || branch.phone ? `
  <div class="info-section">
    <h2>Contato</h2>
    <div class="info-grid">
      ${branch.email ? `
      <div class="info-label">Email:</div>
      <div class="info-value">${branch.email}</div>
      ` : ""}
      
      ${branch.phone ? `
      <div class="info-label">Telefone:</div>
      <div class="info-value">${branch.phone}</div>
      ` : ""}
    </div>
  </div>
  ` : ""}

  ${branch.address ? `
  <div class="info-section">
    <h2>Endereço</h2>
    <div class="info-grid">
      ${branch.address.street ? `
      <div class="info-label">Logradouro:</div>
      <div class="info-value">${branch.address.street}${branch.address.number ? `, ${branch.address.number}` : ""}</div>
      ` : ""}
      
      ${branch.address.complement ? `
      <div class="info-label">Complemento:</div>
      <div class="info-value">${branch.address.complement}</div>
      ` : ""}
      
      ${branch.address.neighborhood ? `
      <div class="info-label">Bairro:</div>
      <div class="info-value">${branch.address.neighborhood}</div>
      ` : ""}
      
      ${branch.address.city ? `
      <div class="info-label">Cidade:</div>
      <div class="info-value">${branch.address.city}${branch.address.state ? ` - ${branch.address.state}` : ""}</div>
      ` : ""}
      
      ${branch.address.zipCode ? `
      <div class="info-label">CEP:</div>
      <div class="info-value">${branch.address.zipCode}</div>
      ` : ""}
    </div>
  </div>
  ` : ""}

  <div class="info-section">
    <h2>Informações do Sistema</h2>
    <div class="info-grid">
      <div class="info-label">Data de Criação:</div>
      <div class="info-value">${branch.createdAt ? new Date(branch.createdAt).toLocaleString("pt-BR") : "-"}</div>
      
      <div class="info-label">Última Atualização:</div>
      <div class="info-value">${branch.updatedAt ? new Date(branch.updatedAt).toLocaleString("pt-BR") : "-"}</div>
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
    link.download = `filial_${branch.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
