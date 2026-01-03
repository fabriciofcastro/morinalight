# Guia Rápido de Referência - Cheat Sheet

> **Comandos, checklists e referências rápidas para uso diário.**
> Imprima ou mantenha este documento sempre à mão.

---

## 🚀 Comandos Essenciais

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Testes
pnpm test              # Todos os testes
pnpm test:watch        # Watch mode
pnpm test:coverage     # Com cobertura

# Qualidade
pnpm lint              # Linter
pnpm lint:fix          # Corrigir automaticamente
pnpm type-check        # TypeScript check

# Build
pnpm build            # Build completo
```

### Health Checks

```bash
# Health check local
curl http://localhost:3000/health | jq
curl http://localhost:3000/api/health | jq

# Status dos serviços
docker-compose ps
docker stats

# Logs em tempo real
docker-compose logs -f --tail=100
```

### Deploy

```bash
# Deploy staging
./deploy/deploy.sh staging

# Deploy produção
./deploy/deploy.sh production

# Rollback
./deploy/rollback.sh

# Monitoramento
./deploy/monitor.sh
```

### Diagnóstico

```bash
# Erros recentes
grep -i "error\|exception" logs/*.log | tail -50

# Verificar conexões de banco
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Verificar cache
redis-cli ping
redis-cli info stats
```

---

## ✅ Checklists Rápidos

### Antes de Começar a Codar

```
[ ] Consultei Centro de Comando?
[ ] Executei autoanálise?
[ ] Identifiquei capacidade?
[ ] Validei módulo/contexto?
[ ] Criei ADR (se necessário)?
```

### Antes do Commit

```
[ ] Linter passando? (pnpm lint)
[ ] Type check OK? (pnpm type-check)
[ ] Testes passando? (pnpm test)
[ ] Build funcionando? (pnpm build)
[ ] Sem console.log/debug?
[ ] Sem código órfão?
[ ] Documentação atualizada?
```

### Antes do Deploy

```
[ ] Todos os testes passando?
[ ] Security scan OK?
[ ] Checklist de produção completo?
[ ] Staging validado?
[ ] Backup realizado?
[ ] Rollback plan pronto?
[ ] Equipe notificada?
```

### Pós-Deploy (Primeiros 15 min)

```
[ ] Health checks passando?
[ ] Error rate < 1%?
[ ] Latência normal?
[ ] Sem erros críticos nos logs?
[ ] Funcionalidades críticas OK?
```

---

## 🗺️ Mapa de Decisão Rápida

| Situação       | Ação                                                        | Documento              |
| -------------- | ----------------------------------------------------------- | ---------------------- |
| Nova tarefa    | Consultar Centro de Comando → Autoanálise                   | Centro de Comando      |
| Criar módulo   | Verificar autoridade → Mapear capacidade → Validar contexto | Matriz + Contextos     |
| Erro grave     | Seguir procedimento CRÍTICO                                 | Centro de Comando §5.2 |
| Deploy         | Checklist produção → Blue-Green → Monitorar                 | Guia Deploy §6         |
| Mapear sistema | Processo inventário → Templates                             | Guia Inventário §3     |

---

## 📋 Templates Rápidos

### Template de PR Description

```markdown
## O que foi feito?

[Descrição clara do que foi implementado]

## Por que foi feito?

[Motivação/justificativa]

## Como testar?

[Passos para testar]

## Checklist

- [ ] Testes adicionados
- [ ] Documentação atualizada
- [ ] Breaking changes documentados
- [ ] Compatibilidade validada

## Referências

- Issue: #[número]
- ADR: [link se aplicável]
- Documentos: [links]
```

### Template de ADR (Resumido)

```markdown
# ADR-XXXX: [Título]

**Status:** Proposta / Aceita / Deprecada  
**Data:** YYYY-MM-DD  
**Decisores:** [Lista]

## Contexto

[Qual situação levou a esta decisão?]

## Decisão

[Qual decisão foi tomada?]

## Consequências

- **Positivas:** [lista]
- **Negativas:** [lista e mitigação]

## Alternativas Consideradas

1. [Alternativa 1]: [por que foi rejeitada]
2. [Alternativa 2]: [por que foi rejeitada]
```

---

## 🎯 Regras de Ouro (Resumo)

1. ✅ Core Domain não depende de nada externo
2. ✅ Nenhum contexto acessa banco de outro diretamente
3. ✅ Regras de negócio NUNCA em controllers/hooks
4. ✅ Toda capacidade tem dono
5. ✅ API pública não quebra (versionar)
6. ✅ Nunca deploy sem testes
7. ✅ Nunca commitar secrets

---

## 🚨 Procedimento de Emergência (Resumo)

### CRÍTICO (Sistema inoperante)

```
1. Isolar problema (2 min)
   curl http://localhost:3000/health
   docker-compose logs -f

2. Contenção (5 min)
   docker-compose stop [servico]

3. Diagnóstico (5 min)
   grep -i "error" logs/*.log | tail -100

4. Decisão (3 min)
   - Rollback? → ./deploy/rollback.sh
   - Hotfix? → Aplicar e deploy
   - Escalar? → Notificar equipe

5. Comunicação
   - Notificar equipe
   - Atualizar status

6. Pós-incidente
   - Criar ADR
   - Implementar prevenção
```

---

## 📚 Referências Rápidas

### Documentos por Necessidade

| Preciso...             | Documento         | Seção  |
| ---------------------- | ----------------- | ------ |
| Visão geral            | Centro de Comando | §2     |
| Controle               | Centro de Comando | §3     |
| Erro grave             | Centro de Comando | §5     |
| Desenvolver            | Guia Deploy       | §3     |
| Deploy                 | Guia Deploy       | §6, §7 |
| Mapear módulo          | Matriz            | §3     |
| Identificar capacidade | Mapa Capacidades  | §4     |
| Validar contexto       | Mapa Contextos    | §5     |
| Autoanálise            | Diretiva          | §2     |
| Mapear sistema         | Guia Inventário   | §3     |

---

## 🔍 Busca Rápida

### Onde está...

| Buscar...                   | Onde                |
| --------------------------- | ------------------- |
| Processo de desenvolvimento | Guia Deploy §2      |
| Checklist produção          | Guia Deploy §6      |
| Procedimento erro           | Centro Comando §5   |
| Template ADR                | Diretiva §8.1       |
| Comandos deploy             | Guia Deploy §9      |
| Regras arquiteturais        | Centro Comando §3.3 |
| Validação rápida            | Centro Comando §6   |

---

## 📞 Contatos de Emergência

| Papel     | Responsabilidade       | Contato   |
| --------- | ---------------------- | --------- |
| Arquiteto | Decisões arquiteturais | [Contato] |
| Tech Lead | Decisões técnicas      | [Contato] |
| DevOps    | Infraestrutura         | [Contato] |

---

**💡 Dica:** Mantenha este documento sempre à mão. Imprima ou salve como favorito.

**🔄 Atualização:** Este documento deve ser atualizado quando novos comandos ou processos forem adicionados.
