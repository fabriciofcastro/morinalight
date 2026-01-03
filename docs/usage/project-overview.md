# Overview do Projeto — Página Principal

## Contexto

A home do Morina Light funciona como vitrine executiva: comunica entregas concluídas, dependências em andamento e próximos módulos, tudo com a mesma estética futurista do portal de login.

## Escopo

- **Inclui:** hero futurista, destaque do portal de login, roadmap visual (`ProjectOverview`) com status e próximos passos.
- **Não inclui:** dados dinâmicos do backend ou dashboards de métricas (serão agregados quando a API estiver pronta).

## Componentes principais

- `ProjectOverview`: cartões em glass com badge de status, barra de progresso e telemetria gerada com Faker (apresenta números coerentes para a demo).
- `LoginForm`: continua disponível via CTA “Abrir portal de acesso” e recebe insights simulados (sessões, ameaças, auditoria).
- `GlassCard`, `Badge`, `Progress`: pilares do design system para manter consistência visual e hierarquia clara.

## Narrativa sugerida

1. Entrar na home → hero reforça “futuro operacional sem ERP monolítico”.
2. Seção de login → mostra que já entregamos algo concreto (vídeo + validações).
3. **Roadmap** → comunica transparência: o que está entregue, o que depende do backend e o que vem na sequência (MatrixGrade, approvals).
4. Badges + progress bar → evidenciam maturidade e possibilidade de acompanhar por marcos.

## Próximos incrementos

- Conectar dados reais (status do backend, integrações) no `ProjectOverview` assim que endpoints ficarem disponíveis.
- Expandir a seção com KPIs dinâmicos (tempo médio de aprovação, SLIs) quando camadas de domínio estiverem prontas.
- Linkar cards a documentos específicos (ex.: ADR de auditoria, backlog de MatrixGrade).

## Checklist DoD

- [x] Conteúdo traduzido para narrativa executiva.
- [x] Componentes acessíveis (badge, progress) adicionados via shadcn/ui + dados Faker para storytelling.
- [x] Teste de renderização garantindo presença dos marcos principais.
- [ ] Dados dinâmicos integrados (aguardar backend).
