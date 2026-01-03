# Portal de Login — Morina Light

## Contexto

O portal de login garante entrada segura aos módulos do Morina Light. Substituímos planilhas sem controle por uma jornada auditável, com dupla validação opcional, copy executiva e telemetria visível (dados simulados com Faker para a demo).

## Escopo

- **Inclui:** autenticação inicial, lembrete de sessão, token MFA opcional, mensagens de erro/sucesso, telemetria de acesso.
- **Não inclui:** provisionamento de usuários, reset de senha definitivo, integração com IdP externo (será tratado em backlog SSO-01).

## Modelo de domínio

- **Usuário:** credenciais corporativas (e-mail + senha), flag de remember.
- **Sessão:** status (`validando`, `sucesso`, `falha`), timestamp, origem.
- **Audit log:** evento `auth.attempted`, `auth.accepted`, `auth.denied`.

## Regras de negócio

1. O e-mail deve ser corporativo válido (RFC 5322) e obrigatório.
2. A senha precisa conter pelo menos 8 caracteres, com números, letras maiúsculas e minúsculas.
3. Token MFA aceita 6 dígitos numéricos quando o recurso estiver ativo.
4. Três falhas consecutivas devem disparar alerta para o SOC (implantar no backend).
5. Sessões lembradas expiram em 30 dias ou no próximo hard logout remoto.

## Contratos (Zod)

```
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  remember: z.boolean().optional().default(false),
  otp: z.string().regex(/^[0-9]{6}$/).optional()
});
```

## Eventos

- `auth.attempted` → `{ email, remember, hasOtp, timestamp }`
- `auth.accepted` → `{ email, sessionId, geo, deviceId }`
- `auth.denied` → `{ email, reason, attempts, geo, deviceId }`

## Fluxo (resumo)

1. Usuário acessa `/login` → vídeo de background e cartão em vidro exibido.
2. Validação local com Zod + React Hook Form.
3. Em caso de sucesso, mensagem “Acesso autorizado” e chamada ao `onAuthenticate` (backend).
4. Em caso de falha, mensagem empática instruindo solicitação de novo token.

## KPIs & SLIs

- Taxa de sucesso na primeira tentativa ≥ 92%.
- Tempo médio para resposta visual ≤ 120ms (no browser).
- Falhas consecutivas detectadas e registradas 100% das vezes.

## Documentação de uso

- **URL:** `/login`
- **Credenciais demo:** perguntar ao time de segurança; nunca hardcode.
- **Mensagem para liderança:** “Segurança reforçada e logs prontos, dispensamos planilhas inseguras”.
- **Tour rápido:** vídeo ao fundo, cards gerados pelo design system (Badge, Button, Input, Label), telemetria fake (sessões/ataques) e formulário com feedback imediato.

## Checklist DoD

- [x] Validações client-side (Zod) com mensagens claras.
- [x] UI responsiva com vídeo, glassmorphism, componentes Button/Input/Label do design system.
- [x] Testes unitários, integração e E2E cobrindo fluxos crítico/alternativo.
- [x] Documentação publicada em `docs/usage/login.md` e linkada no índice.
- [ ] Integração backend para eventos de auditoria (seguinte tarefa DevSec).
