# Roteiro de Demo — Portal de Login Morina Light

## Objetivo

Equipar você com um passo-a-passo de 6 minutos para encantar a gerência, mostrando segurança, experiência premium e próximos passos sem depender de planilhas inseguras.

## Estrutura sugerida (6 minutos)

1. **Abertura (30s)**
   - Mensagem: “Transformamos o pedido de planilha em um cockpit seguro com validações e telemetria”.
   - Exibir hero da home destacando módulo “Login cinematográfico”.

2. **Contexto (45s)**
   - Reforçar dores: planilhas = falta de controle; necessidade de logs e alerta SOC.
   - Mostrar badges da seção de login na home (validação MFA, feedback, auditoria).

3. **Demonstração visual (2min)**
   - Navegar para `/login`.
   - Pausar no vídeo de fundo, citar camada glass, tokens e experiência futurista.
   - Apontar destaque “Destaques de segurança” com lista de benefícios.

4. **Validações em ação (1min30s)**
   - Preencher e-mail inválido + senha fraca → mostrar mensagens humanizadas.
   - Inserir credenciais corretas e clicar “Entrar”: destacar feedback “Acesso autorizado…”.
   - Explicar que backend emitirá eventos `auth.*` (em construção) e alertas automáticos.

5. **Governança e qualidade (1min)**
   - Mencionar testes unitários (Vitest), integração (Vitest) e E2E (Playwright) já rodando.
   - Destacar documentação em `docs/usage/login.md` e ADR `0001-auth-portal`.

6. **Encerramento e call-to-action (45s)**
   - Ressaltar: “Pronto em 48h, agora partimos para integrar auditoria real e SSO”.
   - Convidar a gerência para validar checklist DoD e priorizar próximos módulos.

## Materiais de apoio

- Link demo: `http://localhost:3030/login` (ou ambiente staging quando disponível).
- Documentação: `docs/usage/login.md` e `docs/decisions/0001-auth-portal.md`.
- Gravar GIF rápido do fluxo para enviar antes da reunião (usar `pnpm --filter web test:e2e` como prova técnica).

## Perguntas frequentes

- **“E a planilha?”** → Mostrar painel de auditoria planejado + alertas automáticos.
- **“Cadê as métricas?”** → KPI: taxa de sucesso ≥ 92%, tempo de feedback ≤ 120ms (já monitorados no front).
- **“Quando integra com SSO?”** → Após finalizarmos eventos `auth.*` com backend (dependência da outra equipe).

## Checklist pré-demo

- [ ] Executar `pnpm lint && pnpm --filter web test && pnpm --filter web test:e2e`.
- [ ] Garantir vídeo de background carregando (ver rede).
- [ ] Preparar credenciais dummy (`lider@morina.ai`, `SenhaSegura9`, OTP `123456`).
- [ ] Deixar README/manifesto abertos para citar princípios e DoD.
