# CURSOR START RULES

## Objetivo

Acelerar geração de código com mínimo uso de tokens.

### Regras

1. Ler MANIFESTO e DOCS_STANDARDS antes de atuar.
2. Gerar diffs pequenos e justificados.
3. Referenciar contratos e DTOs por nome.
4. Não refatorar código estável sem necessidade.
5. Sempre rodar prepush antes do PR.

### Prompt padrão

Contexto: MORINA (ERP modular por departamento, DDD, eventos, RBAC).
Respeitar manifesto e docs standards.
Saída: apenas deltas necessários + checklist DoD + eventos + RBAC.
