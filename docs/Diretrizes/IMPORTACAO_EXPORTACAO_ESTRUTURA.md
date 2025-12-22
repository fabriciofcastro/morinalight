# 📥📤 Importação e Exportação de Estrutura Organizacional

## Visão Geral

Sistema completo de importação e exportação da estrutura organizacional (Departments, Subdepartments, Sectors, Positions) em formatos JSON e CSV.

## Funcionalidades

### Exportação

#### JSON
- Exporta estrutura completa em formato JSON formatado
- Inclui metadados (versão, data de exportação)
- Preserva todas as relações hierárquicas
- Formato legível e fácil de editar

#### CSV
- Exporta estrutura em formato CSV compatível com Excel
- Colunas: Tipo, ID, Código, Nome, Status, Departamento, Subdepartamento, Setor, Descrição
- Fácil de visualizar e editar em planilhas
- Suporta valores com vírgulas (aspas)

### Importação

#### JSON
- Importa estrutura completa de arquivo JSON
- Validação completa antes de importar:
  - Códigos únicos
  - Referências válidas
  - Estrutura hierárquica correta
- Opções:
  - `skipDuplicates`: Pular entidades duplicadas
  - `updateExisting`: Atualizar entidades existentes

#### CSV
- Importa estrutura de arquivo CSV
- Parse automático de valores com aspas
- Conversão para formato interno
- Mesmas validações e opções do JSON

## Uso

### No Componente ImportExportPanel

```tsx
import { ImportExportPanel } from "@/components/organizational-structure/ImportExportPanel";

<ImportExportPanel
  departments={departments}
  subdepartments={subdepartments}
  sectors={sectors}
  positions={positions}
  orgId={orgId}
  onImportComplete={() => {
    // Recarregar dados após importação
    await loadAll();
  }}
/>
```

### Programaticamente

#### Exportação

```typescript
import { exportToJSON, exportToCSV, downloadFile } from "@/lib/organizational-structure/export";

// Exportar para JSON
const json = exportToJSON(departments, subdepartments, sectors, positions);
downloadFile(json, "estrutura.json", "application/json");

// Exportar para CSV
const csv = exportToCSV(departments, subdepartments, sectors, positions);
downloadFile(csv, "estrutura.csv", "text/csv");
```

#### Importação

```typescript
import { importFromJSON, importFromCSV, readFileAsText } from "@/lib/organizational-structure/import";

// Importar de JSON
const file = event.target.files[0];
const content = await readFileAsText(file);
const result = await importFromJSON(content, orgId, {
  skipDuplicates: false,
  updateExisting: false,
});

// Importar de CSV
const csvContent = await readFileAsText(file);
const result = await importFromCSV(csvContent, orgId, {
  skipDuplicates: false,
  updateExisting: false,
});

// Verificar resultado
if (result.success) {
  console.log(`Importados: ${result.imported.departments} departamentos`);
} else {
  console.error("Erros:", result.errors);
}
```

## Formato de Dados

### JSON

```json
{
  "version": "1.0",
  "exportedAt": "2025-01-19T10:00:00Z",
  "departments": [
    {
      "id": "...",
      "departmentId": "...",
      "orgId": "...",
      "name": "Comercial",
      "code": "COM",
      "description": "...",
      "type": "CORE",
      "filialId": null,
      "parentId": null,
      "active": true
    }
  ],
  "subdepartments": [...],
  "sectors": [...],
  "positions": [...]
}
```

### CSV

```csv
Tipo,ID,Código,Nome,Status,Departamento,Subdepartamento,Setor,Descrição
Departamento,dept-1,COM,Comercial,ativo,,,,"Departamento comercial"
Subdepartamento,sub-1,COM-VEN,Vendas,ativo,Comercial,,"Subdepartamento de vendas"
Setor,sec-1,COM-VEN-ON,Online,ativo,Comercial,Vendas,,"Setor de vendas online"
Cargo,pos-1,COM-VEN-ON-GER,Gerente,ativo,Comercial,Vendas,Online,"Gerente de vendas online"
```

## Validações

### Antes da Importação

1. **Estrutura Básica**
   - Versão especificada
   - Arrays válidos para cada tipo de entidade

2. **Códigos Únicos**
   - Nenhum código duplicado dentro do mesmo tipo
   - Validação por tipo (department, subdepartment, sector, position)

3. **Referências**
   - Subdepartments referenciam departments existentes
   - Sectors referenciam departments ou subdepartments existentes
   - Positions referenciam sectors existentes

4. **Hierarquia**
   - Estrutura hierárquica válida
   - Sem referências circulares

### Durante a Importação

1. **Duplicatas**
   - Verifica se código já existe
   - Opção de pular ou atualizar

2. **Referências Atualizadas**
   - Mapeia códigos para IDs reais
   - Atualiza referências após criação

3. **Tratamento de Erros**
   - Continua importação mesmo com erros
   - Coleta todos os erros para relatório

## Relatório de Importação

Após a importação, um relatório detalhado é gerado:

```typescript
{
  success: boolean;
  imported: {
    departments: number;
    subdepartments: number;
    sectors: number;
    positions: number;
  };
  errors: Array<{
    type: "department" | "subdepartment" | "sector" | "position";
    code: string;
    name: string;
    error: string;
  }>;
  warnings: string[];
}
```

### Exemplo de Relatório

```
✅ Importação concluída

Importados:
- 5 departamentos
- 12 subdepartamentos
- 25 setores
- 50 cargos

Erros (2):
- Setor FIN-ADM (Administração): Departamento pai não encontrado
- Cargo VEN-GER (Gerente): Setor pai não encontrado

Avisos (1):
- Departamento COM atualizado
```

## Integração no OrganizationalCommandCenter

O `ImportExportPanel` está integrado como uma aba no painel de detalhes:

1. Selecione qualquer nó na árvore organizacional
2. Clique na aba "Import/Export"
3. Use os botões para exportar ou importar

## Troubleshooting

### Erro: "Código duplicado"
- Verifique se há códigos duplicados no arquivo
- Cada código deve ser único dentro do mesmo tipo

### Erro: "Referência não encontrada"
- Verifique se todas as referências estão corretas
- Departments devem ser criados antes de Subdepartments
- Subdepartments devem ser criados antes de Sectors
- Sectors devem ser criados antes de Positions

### Erro: "Organização não encontrada"
- Certifique-se de que `orgId` está correto
- Verifique se está logado e tem acesso à organização

### CSV não importa corretamente
- Verifique se o CSV está no formato correto
- Certifique-se de que valores com vírgulas estão entre aspas
- Verifique se o encoding é UTF-8

## Próximos Passos

1. **Importação Incremental**: Importar apenas entidades específicas
2. **Validação Avançada**: Validações de negócio customizadas
3. **Template CSV**: Download de template CSV vazio
4. **Importação em Lote**: Processar múltiplos arquivos
5. **Histórico de Importações**: Rastrear todas as importações realizadas








