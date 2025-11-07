# ADR 0001 — Portal de Login Morina Light

## Status

Proposta aprovada — 2025-11-07

## Contexto

- Liderança precisa de resposta imediata à falta de planilhas seguras para acompanhamento operacional.
- Regras corporativas exigem autenticação com políticas fortes e rastreabilidade por tentativa.
- UI deve impressionar stakeholders com narrativa futurista, mantendo acessibilidade e performance.
- Outras instâncias do projeto estão trabalhando na infraestrutura de banco/Redis e casos de uso avançados.

## Decisão

1. **Foco na camada de apresentação**: implementar portal `/login` em Next.js com vídeo imersivo, glassmorphism e copy que comunica segurança.
2. **Validação client-side robusta**: usar React Hook Form + Zod para garantir feedback instantâneo (política de senha, e-mail corporativo, token MFA opcional).
3. **Feedback auditável**: mensagens de sucesso/erro informam que auditoria e alertas serão disparados; integração real ficará para backend (outra tarefa).
4. **Testes completos**: cobrir formulário com Vitest (unit/integration) e Playwright (E2E) para demonstrar qualidade em 48h.
5. **Documentação de uso**: registrar guia em `docs/usage/login.md` conforme padrão MORINA, facilitando apresentação à gerência.

## Alternativas consideradas

- **Aguardar backend completo antes da UI**: rejeitado, pois precisamos de tela para demo urgente.
- **Usar formulário simples sem vídeo**: rejeitado; não atenderia expectativa de experiência futurista.
- **Delegar validação ao backend**: inviável no curto prazo; optamos por validação local com mensagem clara.

## Consequências

- Portal pronto para demonstração executiva, reduzindo risco de “falta de resposta” para a gerente.
- Quando backend estiver disponível, bastará conectar `onAuthenticate` a API e emitir eventos `auth.*`.
- Necessidade de manter cobertura de testes ao evoluir fluxos (ex.: SSO, rate limiting).
- A documentação e componentes servem como base para futuros módulos de acesso (admin, parceiros).

## Próximos passos

- Integrar chamadas reais à API quando camada de domínio estiver pronta.
- Emitir eventos `auth.attempted|accepted|denied` no backend e sincronizar com o fluxo descrito.
- Refinar copy e assets do vídeo conforme guidelines de branding.
- Criar painel de auditoria para exibir tentativas (outra iniciativa).
