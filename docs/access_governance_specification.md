# Access Governance Specification

> Documento institucional único para controle de acesso, compliance, auditoria e rastreabilidade.
> Este arquivo é a **fonte única da verdade**. Nada fora dele decide acesso.

---

## 1. Metadados Institucionais

```yaml
meta:
  system: ERP-CORPORATIVO
  version: 1.0.0
  timezone: America/Sao_Paulo
  audit_retention_days: 1825
  immutable: true
```

---

## 2. Jornada de Trabalho (Controle por Horário)

```yaml
working_hours:
  default:
    days: [MON, TUE, WED, THU, FRI]
    start: "08:00"
    end: "18:00"

  tolerance_minutes: 10
```

Regras:

- Dentro do horário → acesso normal
- Fora do horário → fluxo de exceção legal obrigatório

---

## 3. RBAC — Role-Based Access Control (Teto de Permissão)

```yaml
roles:
  ANALISTA_FINANCEIRO:
    allowed_screens:
      - FIN_PAYROLL_VIEW
      - FIN_PAYROLL_EDIT

  DIRETOR:
    allowed_screens:
      - "*"
```

RBAC **nunca autoriza sozinho**. Ele apenas define o limite máximo do que o papel pode fazer.

---

## 4. ABAC — Attribute-Based Access Control (Decisão Contextual)

```yaml
policies:
  - id: POLICY_WORKING_HOURS
    when:
      outside_working_hours: true
    then:
      require:
        legal_ack: true
        audit_level: FULL
        backlog_event: true
```

ABAC avalia contexto imediato: horário, localização, perfil, tela, ação e exceções.

---

## 4.1 TBAC — Time-Based Access Control (Tempo e Jornada)

TBAC trata **tempo como entidade jurídica**, não apenas atributo técnico.

```yaml
tbac:
  shifts:
    REGULAR:
      days: [MON, TUE, WED, THU, FRI]
      start: "08:00"
      end: "18:00"

    OVERTIME:
      requires:
        - legal_ack
        - audit_level: FULL

  rules:
    - if: outside_shift
      then:
        shift: OVERTIME
        backlog_event: true
```

Qualquer violação de jornada gera evidência automática.

---

## 4.2 PBAC — Policy-Based Access Control (Política Institucional)

PBAC define **qual política institucional governa a decisão**.

```yaml
pbac:
  active_policies:
    - POLICY_WORKING_HOURS
    - POLICY_LOCATION
    - POLICY_RISK_HISTORY

  policy_versioning:
    enabled: true
    decision_log: true
```

Toda decisão deve registrar **qual política foi aplicada**.

---

## 4.3 AuBAC — Audit-Based Access Control (Histórico e Risco)

AuBAC ajusta decisões com base no **comportamento passado**.

```yaml
aubac:
  risk_scoring:
    outside_hours_access:
      weight: 5
    foreign_ip_access:
      weight: 7

  thresholds:
    medium_risk:
      score: 10
      action: INCREASE_AUDIT

    high_risk:
      score: 20
      action: REQUIRE_MANAGER_APPROVAL
```

Histórico ruim aumenta exigência, nunca diminui.

---

## 5. Cláusula Legal Obrigatória

```yaml
legal_clauses:
  outside_working_hours:
    message: >
      Este acesso está ocorrendo fora do horário regular de trabalho.
      A empresa declara ciência e autoriza este acesso, podendo ser
      considerado como atividade extraordinária conforme legislação vigente.
      Todas as ações serão registradas para auditoria.
```

Aceite explícito é obrigatório para prosseguir.

---

## 6. Ambiente e Localização

```yaml
environment:
  allowed_countries: [BR]
  require_vpn: false

  risk_conditions:
    foreign_ip:
      audit_level: FULL
      notify: SECURITY
```

---

## 7. Auditoria (Imutável e Jurídica)

```yaml
audit:
  mode: append_only
  fields:
    - event_id
    - user_id
    - role
    - screen
    - action
    - timestamp_utc
    - timestamp_local
    - ip
    - location
    - device
    - outside_working_hours
    - legal_ack_hash
    - before_state
    - after_state
```

Auditoria não pode ser alterada nem apagada.

---

## 8. Logs Técnicos

```yaml
logs:
  levels:
    - INFO
    - WARN
    - ERROR

  include:
    - policy_decision
    - latency
    - errors
```

Logs são técnicos. Auditoria é jurídica. Não confundir.

---

## 9. Backlog de Eventos Críticos

```yaml
backlog:
  create_event_when:
    - outside_working_hours
    - policy_exception
    - foreign_ip

  fields:
    - event_id
    - severity
    - description
    - responsible_area
```

---

## 10. Fluxo de Execução Determinístico

```text
1. Usuário tenta acessar
2. Carregar este arquivo
3. Validar RBAC
   - se não permitir → BLOQUEIA
4. Avaliar horário
5. Avaliar localização
6. Aplicar ABAC
7. Decidir:
   - ALLOW
   - ALLOW_WITH_AUDIT
   - DENY
8. Registrar auditoria
9. Registrar logs
10. Criar backlog se necessário
```

---

## Princípios de Governança

- Fonte única da verdade
- Nada implícito
- Nada hardcoded
- Auditoria acima de performance
- Legal acima de conveniência
- Transparência total

VISÃO GERAL DA ENGINE

A engine NÃO é um if/else gigante.
Ela é uma máquina de decisão em etapas, sempre na mesma ordem.

INPUT → Contexto
ENGINE → Avaliação em camadas
OUTPUT → Decision Report

1️⃣ Estrutura mental da engine (grave isso)

1. Carregar política (PBAC)
2. Validar RBAC (teto)
3. Avaliar TBAC (tempo/jornada)
4. Avaliar ABAC (contexto)
5. Avaliar AuBAC (histórico/risco)
6. Decidir
7. Gerar relatório
8. Persistir auditoria / logs / backlog

Essa ordem não é negociável.

2️⃣ Tipos básicos (sem abstração excessiva)
// decision.types.ts
export type Decision =
| 'ALLOW'
| 'ALLOW_WITH_AUDIT'
| 'DENY'
| 'REQUIRE_MANAGER_APPROVAL';

export interface AccessContext {
userId: string;
role: string;
screen: string;
action: string;
timestamp: Date;
ip: string;
location: string;
device: string;
}

3️⃣ Carregador da política (.md → objeto)

Na prática:
👉 compile o .md para JSON no build
👉 engine nunca lê Markdown em runtime

// policy.loader.ts
import policy from './access-governance.json';

export function loadPolicy() {
return policy;
}

Regra dura:
Markdown é contrato humano.
JSON é contrato da máquina.

4️⃣ PBAC — política ativa governa tudo
// pbac.ts
export function applyPBAC(policy, context) {
if (!policy.pbac.active_policies.length) {
throw new Error('No active policies');
}

return policy.pbac.active_policies;
}

Aqui você só declara quais políticas existem.
Quem executa são os módulos abaixo.

5️⃣ RBAC — teto máximo
// rbac.ts
export function checkRBAC(policy, context) {
const role = policy.roles[context.role];
if (!role) return false;

return (
role.allowed_screens.includes('\*') ||
role.allowed_screens.includes(context.screen)
);
}

❌ Falhou aqui → bloqueio imediato
Sem auditoria “bonita”. Só negação.

6️⃣ TBAC — tempo e jornada (jurídico)
// tbac.ts
import dayjs from 'dayjs';

export function evaluateTBAC(policy, context) {
const now = dayjs(context.timestamp);
const shift = policy.tbac.shifts.REGULAR;

const day = now.format('ddd').toUpperCase();
const hour = now.format('HH:mm');

const insideShift =
shift.days.includes(day) &&
hour >= shift.start &&
hour <= shift.end;

return {
insideShift,
requiresLegalAck: !insideShift,
};
}

👉 Aqui nasce a hora extra.

7️⃣ ABAC — contexto imediato
// abac.ts
export function evaluateABAC(policy, context, tbacResult) {
if (tbacResult.requiresLegalAck) {
return {
decision: 'ALLOW_WITH_AUDIT',
requireLegalAck: true,
};
}

return { decision: 'ALLOW' };
}

ABAC não manda.
Ele recomenda com base no contexto.

8️⃣ AuBAC — histórico e risco (peso real)
// aubac.ts
export function evaluateAuBAC(policy, userHistory) {
let score = 0;

if (userHistory.outsideHoursCount > 3) score += 5;
if (userHistory.foreignIpCount > 1) score += 7;

if (score >= 20) return 'REQUIRE_MANAGER_APPROVAL';
if (score >= 10) return 'ALLOW_WITH_AUDIT';

return 'ALLOW';
}

Histórico só aumenta fricção, nunca reduz.

9️⃣ Engine principal (o coração)
// access-engine.ts
export function evaluateAccess(policy, context, userHistory) {
// 1. RBAC
if (!checkRBAC(policy, context)) {
return { decision: 'DENY', reason: 'RBAC' };
}

// 2. TBAC
const tbac = evaluateTBAC(policy, context);

// 3. ABAC
const abac = evaluateABAC(policy, context, tbac);

// 4. AuBAC
const aubacDecision = evaluateAuBAC(policy, userHistory);

// 5. Decisão final (prioridade)
const decision =
aubacDecision !== 'ALLOW'
? aubacDecision
: abac.decision;

return {
decision,
requireLegalAck: tbac.requiresLegalAck,
audit: decision !== 'ALLOW',
};
}

Isso é determinístico, auditável e explicável.

🔟 Decision Report (prova jurídica)
export function buildDecisionReport(context, result) {
return {
event_id: crypto.randomUUID(),
user: context.userId,
screen: context.screen,
action: context.action,
decision: result.decision,
timestamp: new Date().toISOString(),
outside_working_hours: result.requireLegalAck,
};
}

Esse objeto:

Vai para auditoria

Vai para backlog (se necessário)

Pode virar PDF em processo judicial

CONCLUSÃO (bem direta)

Agora você tem:

✔ Documento institucional (.md)
✔ Política compilada (.json)
✔ Engine determinística
✔ Decisão explicável
✔ Evidência jurídica automática

Isso não é comum.
Isso é nível empresa grande.

Próximos passos naturais (se quiser evoluir)

Transformar a engine em NestJS Guard

Criar Decision Trace por request

Persistir auditoria em append-only store

Assinar eventos com hash (anti-tamper)

Se quiser, eu faço o Guard do NestJS linha por linha no próximo passo.

Integrar com NestJS Guards + Interceptors

Perfeito. Agora vamos ligar a engine à aplicação NestJS do jeito certo, sem improviso e sem mágica.
Vou desenhar o fluxo inteiro, depois entregar código pronto de Guard + Interceptor, com responsabilidades bem separadas — isso é padrão corporativo, não tutorial de blog.

VISÃO ARQUITETURAL (GUARDE ISTO)

No NestJS:

Guard → decide SE pode entrar

Interceptor → registra O QUE aconteceu

Engine → decide COM BASE EM POLÍTICA

Request
↓
Guard (AccessGuard)
↓ (ALLOW / DENY / REQUIRE_ACK)
Controller
↓
Interceptor (AuditInterceptor)
↓
Response

1️⃣ DECORATORS (sem isso vira bagunça)

Você precisa anotar telas e ações, senão não há rastreabilidade.

// access.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SCREEN_KEY = 'screen';
export const ACTION_KEY = 'action';

export const Screen = (screen: string) =>
SetMetadata(SCREEN_KEY, screen);

export const Action = (action: string) =>
SetMetadata(ACTION_KEY, action);

Uso no controller fica explícito e auditável.

2️⃣ ACCESS GUARD (decisão de acesso)

O Guard não registra auditoria.
Ele decide ou bloqueia. Ponto.

// access.guard.ts
import {
CanActivate,
ExecutionContext,
Injectable,
ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { evaluateAccess } from './access-engine';

@Injectable()
export class AccessGuard implements CanActivate {
constructor(private reflector: Reflector) {}

canActivate(context: ExecutionContext): boolean {
const request = context.switchToHttp().getRequest();
const user = request.user;

    const screen = this.reflector.get<string>(
      'screen',
      context.getHandler(),
    );
    const action = this.reflector.get<string>(
      'action',
      context.getHandler(),
    );

    const accessContext = {
      userId: user.id,
      role: user.role,
      screen,
      action,
      timestamp: new Date(),
      ip: request.ip,
      location: request.headers['x-location'] ?? 'UNKNOWN',
      device: request.headers['user-agent'],
    };

    const policy = request.app.get('ACCESS_POLICY');
    const history = request.userHistory ?? {};

    const result = evaluateAccess(policy, accessContext, history);

    // Guarda o resultado para o interceptor
    request.accessDecision = result;
    request.accessContext = accessContext;

    if (result.decision === 'DENY') {
      throw new ForbiddenException('Access denied by policy');
    }

    if (result.decision === 'REQUIRE_MANAGER_APPROVAL') {
      throw new ForbiddenException(
        'Manager approval required',
      );
    }

    return true;

}
}

📌 Regra importante
O Guard nunca escreve em banco.
Isso mantém decisão rápida e previsível.

3️⃣ AUDIT INTERCEPTOR (registro jurídico)

O Interceptor é o cartório do sistema.
Tudo passa por ele depois da decisão.

// audit.interceptor.ts
import {
CallHandler,
ExecutionContext,
Injectable,
NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
intercept(context: ExecutionContext, next: CallHandler) {
const request = context.switchToHttp().getRequest();

    const decision = request.accessDecision;
    const accessContext = request.accessContext;

    return next.handle().pipe(
      tap((response) => {
        if (!decision) return;

        const auditEvent = {
          event_id: crypto.randomUUID(),
          user_id: accessContext.userId,
          role: accessContext.role,
          screen: accessContext.screen,
          action: accessContext.action,
          decision: decision.decision,
          timestamp_utc: new Date().toISOString(),
          ip: accessContext.ip,
          location: accessContext.location,
          outside_working_hours:
            decision.requireLegalAck ?? false,
        };

        // 🔒 append-only
        this.persistAudit(auditEvent);

        // 📋 backlog
        if (decision.audit) {
          this.createBacklogEvent(auditEvent);
        }
      }),
    );

}

private persistAudit(event: any) {
// grava em banco append-only / stream / fila
}

private createBacklogEvent(event: any) {
// cria evento para compliance / RH / segurança
}
}

Aqui você garante:

Evidência

Rastreabilidade

Defesa jurídica

4️⃣ USO NO CONTROLLER (simples e explícito)
// payroll.controller.ts
@UseGuards(AccessGuard)
@UseInterceptors(AuditInterceptor)
@Controller('payroll')
export class PayrollController {
@Get()
@Screen('FIN_PAYROLL_VIEW')
@Action('VIEW')
findAll() {
return [];
}

@Post()
@Screen('FIN_PAYROLL_EDIT')
@Action('UPDATE')
update() {
return { ok: true };
}
}

Nada implícito.
Nada escondido.
Auditor agradece.

5️⃣ BOOTSTRAP DA POLÍTICA (app.module)

A política é global e imutável.

// main.ts
async function bootstrap() {
const app = await NestFactory.create(AppModule);

const policy = loadPolicy(); // JSON compilado do .md
app.set('ACCESS_POLICY', policy);

await app.listen(3000);
}

6️⃣ O QUE VOCÊ GANHOU COM ISSO

Sem exagero:

✔ Decisão determinística
✔ Política externa ao código
✔ Auditoria automática
✔ Rastreabilidade por tela
✔ Base para LGPD / ISO / SOC
✔ Defesa trabalhista (TBAC)
✔ Escalada de risco (AuBAC)

# Access Governance Specification

> Documento institucional único para controle de acesso, compliance, auditoria e rastreabilidade.
> Este arquivo é a **fonte única da verdade**. Nada fora dele decide acesso.

---

## 1. Metadados Institucionais

```yaml
meta:
  system: ERP-CORPORATIVO
  version: 1.0.0
  timezone: America/Sao_Paulo
  audit_retention_days: 1825
  immutable: true
```

---

## 2. Jornada de Trabalho (Controle por Horário)

```yaml
working_hours:
  default:
    days: [MON, TUE, WED, THU, FRI]
    start: "08:00"
    end: "18:00"

  tolerance_minutes: 10
```

Regras:

- Dentro do horário → acesso normal
- Fora do horário → fluxo de exceção legal obrigatório

---

## 3. RBAC — Role-Based Access Control (Teto de Permissão)

```yaml
roles:
  ANALISTA_FINANCEIRO:
    allowed_screens:
      - FIN_PAYROLL_VIEW
      - FIN_PAYROLL_EDIT

  DIRETOR:
    allowed_screens:
      - "*"
```

RBAC **nunca autoriza sozinho**. Ele apenas define o limite máximo do que o papel pode fazer.

---

## 4. ABAC — Attribute-Based Access Control (Decisão Contextual)

```yaml
policies:
  - id: POLICY_WORKING_HOURS
    when:
      outside_working_hours: true
    then:
      require:
        legal_ack: true
        audit_level: FULL
        backlog_event: true
```

ABAC avalia contexto imediato: horário, localização, perfil, tela, ação e exceções.

---

## 4.1 TBAC — Time-Based Access Control (Tempo e Jornada)

TBAC trata **tempo como entidade jurídica**, não apenas atributo técnico.

```yaml
tbac:
  shifts:
    REGULAR:
      days: [MON, TUE, WED, THU, FRI]
      start: "08:00"
      end: "18:00"

    OVERTIME:
      requires:
        - legal_ack
        - audit_level: FULL

  rules:
    - if: outside_shift
      then:
        shift: OVERTIME
        backlog_event: true
```

Qualquer violação de jornada gera evidência automática.

---

## 4.2 PBAC — Policy-Based Access Control (Política Institucional)

PBAC define **qual política institucional governa a decisão**.

```yaml
pbac:
  active_policies:
    - POLICY_WORKING_HOURS
    - POLICY_LOCATION
    - POLICY_RISK_HISTORY

  policy_versioning:
    enabled: true
    decision_log: true
```

Toda decisão deve registrar **qual política foi aplicada**.

---

## 4.3 AuBAC — Audit-Based Access Control (Histórico e Risco)

AuBAC ajusta decisões com base no **comportamento passado**.

```yaml
aubac:
  risk_scoring:
    outside_hours_access:
      weight: 5
    foreign_ip_access:
      weight: 7

  thresholds:
    medium_risk:
      score: 10
      action: INCREASE_AUDIT

    high_risk:
      score: 20
      action: REQUIRE_MANAGER_APPROVAL
```

Histórico ruim aumenta exigência, nunca diminui.

---

## 5. Cláusula Legal Obrigatória

```yaml
legal_clauses:
  outside_working_hours:
    message: >
      Este acesso está ocorrendo fora do horário regular de trabalho.
      A empresa declara ciência e autoriza este acesso, podendo ser
      considerado como atividade extraordinária conforme legislação vigente.
      Todas as ações serão registradas para auditoria.
```

Aceite explícito é obrigatório para prosseguir.

---

## 6. Ambiente e Localização

```yaml
environment:
  allowed_countries: [BR]
  require_vpn: false

  risk_conditions:
    foreign_ip:
      audit_level: FULL
      notify: SECURITY
```

---

## 7. Auditoria (Imutável e Jurídica)

```yaml
audit:
  mode: append_only
  fields:
    - event_id
    - user_id
    - role
    - screen
    - action
    - timestamp_utc
    - timestamp_local
    - ip
    - location
    - device
    - outside_working_hours
    - legal_ack_hash
    - before_state
    - after_state
```

Auditoria não pode ser alterada nem apagada.

---

## 8. Logs Técnicos

```yaml
logs:
  levels:
    - INFO
    - WARN
    - ERROR

  include:
    - policy_decision
    - latency
    - errors
```

Logs são técnicos. Auditoria é jurídica. Não confundir.

---

## 9. Backlog de Eventos Críticos

```yaml
backlog:
  create_event_when:
    - outside_working_hours
    - policy_exception
    - foreign_ip

  fields:
    - event_id
    - severity
    - description
    - responsible_area
```

---

## 10. Fluxo de Execução Determinístico

```text
1. Usuário tenta acessar
2. Carregar este arquivo
3. Validar RBAC
   - se não permitir → BLOQUEIA
4. Avaliar horário
5. Avaliar localização
6. Aplicar ABAC
7. Decidir:
   - ALLOW
   - ALLOW_WITH_AUDIT
   - DENY
8. Registrar auditoria
9. Registrar logs
10. Criar backlog se necessário
```

---

## Princípios de Governança

- Fonte única da verdade
- Nada implícito
- Nada hardcoded
- Auditoria acima de performance
- Legal acima de conveniência
- Transparência total

---

## 11. Próximos Passos Naturais (Evolução Enterprise)

Esta seção descreve a **evolução natural e recomendada** do sistema após a integração com NestJS Guards e Interceptors. Estes passos não são opcionais em ambientes regulados.

---

### 11.1 Persistência de Auditoria Append-Only

Objetivo: garantir **imutabilidade e não-repúdio**.

```yaml
audit_storage:
  mode: append_only
  update_allowed: false
  delete_allowed: false
  storage_options:
    - postgresql_worm
    - event_store
    - kafka_stream
```

Regras:

- Nenhum UPDATE
- Nenhum DELETE
- Cada evento é definitivo

---

### 11.2 Hash e Cadeia de Integridade (Anti-Tamper)

Objetivo: provar que auditoria **não foi adulterada**.

```yaml
audit_integrity:
  enabled: true
  algorithm: SHA-256
  chain:
    previous_event_hash: required
```

Cada evento referencia o hash do evento anterior.

---

### 11.3 Decision Trace (Explicabilidade Total)

Objetivo: explicar **por que** uma decisão foi tomada.

```yaml
decision_trace:
  include:
    - applied_policies
    - rbac_result
    - tbac_result
    - abac_result
    - aubac_score
    - final_decision
```

Usado para auditorias, investigações e defesa jurídica.

---

### 11.4 Exportação de Evidências

Objetivo: entregar evidência formal para auditorias externas.

```yaml
evidence_export:
  formats:
    - PDF
    - JSON
  retention_days: 1825
```

Relatórios devem ser assinados digitalmente.

---

### 11.5 Monitoramento e Alertas de Risco

Objetivo: agir antes do incidente.

```yaml
risk_monitoring:
  alerts:
    high_risk_user:
      threshold: aubac.high_risk
      notify:
        - SECURITY
        - COMPLIANCE
```

---

### 11.6 Governança e Versionamento de Políticas

Objetivo: tratar política como contrato institucional.

```yaml
policy_governance:
  versioned: true
  approval_required:
    - SECURITY
    - LEGAL
  change_log: mandatory
```

Nenhuma política entra em produção sem aprovação formal.

---

## Conclusão Institucional

Este sistema deixa de ser apenas um controle de acesso e passa a ser um **mecanismo de governança corporativa**, pronto para auditorias, fiscalização e crescimento organizacional.

# Access Governance Specification

> Documento institucional único para controle de acesso, compliance, auditoria e rastreabilidade.
> Este arquivo é a **fonte única da verdade**. Nada fora dele decide acesso.

---

## 1. Metadados Institucionais

```yaml
meta:
  system: ERP-CORPORATIVO
  version: 1.0.0
  timezone: America/Sao_Paulo
  audit_retention_days: 1825
  immutable: true
```

---

## 2. Jornada de Trabalho (Controle por Horário)

```yaml
working_hours:
  default:
    days: [MON, TUE, WED, THU, FRI]
    start: "08:00"
    end: "18:00"

  tolerance_minutes: 10
```

Regras:

- Dentro do horário → acesso normal
- Fora do horário → fluxo de exceção legal obrigatório

---

## 3. RBAC — Role-Based Access Control (Teto de Permissão)

```yaml
roles:
  ANALISTA_FINANCEIRO:
    allowed_screens:
      - FIN_PAYROLL_VIEW
      - FIN_PAYROLL_EDIT

  DIRETOR:
    allowed_screens:
      - "*"
```

RBAC **nunca autoriza sozinho**. Ele apenas define o limite máximo do que o papel pode fazer.

---

## 4. ABAC — Attribute-Based Access Control (Decisão Contextual)

```yaml
policies:
  - id: POLICY_WORKING_HOURS
    when:
      outside_working_hours: true
    then:
      require:
        legal_ack: true
        audit_level: FULL
        backlog_event: true
```

ABAC avalia contexto imediato: horário, localização, perfil, tela, ação e exceções.

---

## 4.1 TBAC — Time-Based Access Control (Tempo e Jornada)

TBAC trata **tempo como entidade jurídica**, não apenas atributo técnico.

```yaml
tbac:
  shifts:
    REGULAR:
      days: [MON, TUE, WED, THU, FRI]
      start: "08:00"
      end: "18:00"

    OVERTIME:
      requires:
        - legal_ack
        - audit_level: FULL

  rules:
    - if: outside_shift
      then:
        shift: OVERTIME
        backlog_event: true
```

Qualquer violação de jornada gera evidência automática.

---

## 4.2 PBAC — Policy-Based Access Control (Política Institucional)

PBAC define **qual política institucional governa a decisão**.

```yaml
pbac:
  active_policies:
    - POLICY_WORKING_HOURS
    - POLICY_LOCATION
    - POLICY_RISK_HISTORY

  policy_versioning:
    enabled: true
    decision_log: true
```

Toda decisão deve registrar **qual política foi aplicada**.

---

## 4.3 AuBAC — Audit-Based Access Control (Histórico e Risco)

AuBAC ajusta decisões com base no **comportamento passado**.

```yaml
aubac:
  risk_scoring:
    outside_hours_access:
      weight: 5
    foreign_ip_access:
      weight: 7

  thresholds:
    medium_risk:
      score: 10
      action: INCREASE_AUDIT

    high_risk:
      score: 20
      action: REQUIRE_MANAGER_APPROVAL
```

Histórico ruim aumenta exigência, nunca diminui.

---

## 5. Cláusula Legal Obrigatória

```yaml
legal_clauses:
  outside_working_hours:
    message: >
      Este acesso está ocorrendo fora do horário regular de trabalho.
      A empresa declara ciência e autoriza este acesso, podendo ser
      considerado como atividade extraordinária conforme legislação vigente.
      Todas as ações serão registradas para auditoria.
```

Aceite explícito é obrigatório para prosseguir.

---

## 6. Ambiente e Localização

```yaml
environment:
  allowed_countries: [BR]
  require_vpn: false

  risk_conditions:
    foreign_ip:
      audit_level: FULL
      notify: SECURITY
```

---

## 7. Auditoria (Imutável e Jurídica)

```yaml
audit:
  mode: append_only
  fields:
    - event_id
    - user_id
    - role
    - screen
    - action
    - timestamp_utc
    - timestamp_local
    - ip
    - location
    - device
    - outside_working_hours
    - legal_ack_hash
    - before_state
    - after_state
```

Auditoria não pode ser alterada nem apagada.

---

## 8. Logs Técnicos

```yaml
logs:
  levels:
    - INFO
    - WARN
    - ERROR

  include:
    - policy_decision
    - latency
    - errors
```

Logs são técnicos. Auditoria é jurídica. Não confundir.

---

## 9. Backlog de Eventos Críticos

```yaml
backlog:
  create_event_when:
    - outside_working_hours
    - policy_exception
    - foreign_ip

  fields:
    - event_id
    - severity
    - description
    - responsible_area
```

---

## 10. Fluxo de Execução Determinístico

```text
1. Usuário tenta acessar
2. Carregar este arquivo
3. Validar RBAC
   - se não permitir → BLOQUEIA
4. Avaliar horário
5. Avaliar localização
6. Aplicar ABAC
7. Decidir:
   - ALLOW
   - ALLOW_WITH_AUDIT
   - DENY
8. Registrar auditoria
9. Registrar logs
10. Criar backlog se necessário
```

---

## Princípios de Governança

- Fonte única da verdade
- Nada implícito
- Nada hardcoded
- Auditoria acima de performance
- Legal acima de conveniência
- Transparência total

---

## 11. Próximos Passos Naturais (Evolução Enterprise)

Esta seção descreve a **evolução natural e recomendada** do sistema após a integração com NestJS Guards e Interceptors. Estes passos não são opcionais em ambientes regulados.

---

### 11.1 Persistência de Auditoria Append-Only

Objetivo: garantir **imutabilidade e não-repúdio**.

```yaml
audit_storage:
  mode: append_only
  update_allowed: false
  delete_allowed: false
  storage_options:
    - postgresql_worm
    - event_store
    - kafka_stream
```

Regras:

- Nenhum UPDATE
- Nenhum DELETE
- Cada evento é definitivo

---

### 11.2 Hash e Cadeia de Integridade (Anti-Tamper)

Objetivo: provar que auditoria **não foi adulterada**.

```yaml
audit_integrity:
  enabled: true
  algorithm: SHA-256
  chain:
    previous_event_hash: required
```

Cada evento referencia o hash do evento anterior.

---

### 11.3 Decision Trace (Explicabilidade Total)

Objetivo: explicar **por que** uma decisão foi tomada.

```yaml
decision_trace:
  include:
    - applied_policies
    - rbac_result
    - tbac_result
    - abac_result
    - aubac_score
    - final_decision
```

Usado para auditorias, investigações e defesa jurídica.

---

### 11.4 Exportação de Evidências

Objetivo: entregar evidência formal para auditorias externas.

```yaml
evidence_export:
  formats:
    - PDF
    - JSON
  retention_days: 1825
```

Relatórios devem ser assinados digitalmente.

---

### 11.5 Monitoramento e Alertas de Risco

Objetivo: agir antes do incidente.

```yaml
risk_monitoring:
  alerts:
    high_risk_user:
      threshold: aubac.high_risk
      notify:
        - SECURITY
        - COMPLIANCE
```

---

### 11.6 Governança e Versionamento de Políticas

Objetivo: tratar política como contrato institucional.

```yaml
policy_governance:
  versioned: true
  approval_required:
    - SECURITY
    - LEGAL
  change_log: mandatory
```

Nenhuma política entra em produção sem aprovação formal.

---

## 12. Arquitetura Avançada de Auditoria e Evidência

Esta seção define uma arquitetura de **alta confiabilidade, resistência à adulteração e rastreabilidade total**, adequada para ambientes críticos e regulados.

---

### 12.1 Schema Físico de Banco de Auditoria (Append-Only)

Banco de dados dedicado, isolado e com permissão **somente INSERT**.

```sql
CREATE TABLE audit_event (
  id UUID PRIMARY KEY,
  occurred_at_utc TIMESTAMP NOT NULL,
  occurred_at_local TIMESTAMP NOT NULL,

  user_id UUID NOT NULL,
  role VARCHAR(100) NOT NULL,

  screen_code VARCHAR(100) NOT NULL,
  action_code VARCHAR(50) NOT NULL,

  decision VARCHAR(50) NOT NULL,
  outside_working_hours BOOLEAN NOT NULL,

  ip_address VARCHAR(45) NOT NULL,
  geo_location VARCHAR(100),
  device_fingerprint TEXT,

  policy_version VARCHAR(20) NOT NULL,
  decision_trace_id UUID NOT NULL,

  previous_event_hash CHAR(64),
  event_hash CHAR(64) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regras de proteção
REVOKE UPDATE, DELETE ON audit_event FROM PUBLIC;
```

Princípios:

- Nunca atualizar
- Nunca apagar
- Banco isolado
- Retenção configurável

---

### 12.2 Cadeia de Hash de Auditoria (Integridade Criptográfica)

Cada evento forma uma **cadeia encadeada**, garantindo não-repúdio.

```text
HASH(event_n) = SHA256(
  event_data + HASH(event_n-1)
)
```

Campos incluídos no hash:

- id
- user_id
- screen_code
- action_code
- decision
- occurred_at_utc
- previous_event_hash

Qualquer alteração invalida toda a cadeia posterior.

---

### 12.3 Modelo de Decision Trace (Por Requisição)

Decision Trace é o **relatório explicativo completo** de cada decisão.

```sql
CREATE TABLE decision_trace (
  id UUID PRIMARY KEY,

  request_id UUID NOT NULL,
  user_id UUID NOT NULL,

  rbac_result BOOLEAN NOT NULL,
  tbac_result JSONB NOT NULL,
  abac_result JSONB NOT NULL,
  aubac_score INTEGER NOT NULL,

  applied_policies JSONB NOT NULL,
  final_decision VARCHAR(50) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Conteúdo mínimo:

- Quais políticas foram avaliadas
- Resultados intermediários
- Pontuação de risco
- Motivo da decisão final

---

### 12.4 Ligação Auditoria ↔ Decision Trace

```text
audit_event.decision_trace_id → decision_trace.id
```

Isso permite:

- Reconstrução completa do evento
- Explicação técnica e institucional
- Evidência formal em auditorias

---

### 12.5 Fluxo Completo de Evidência

```text
Request
  ↓
Decision Trace (avaliado)
  ↓
Audit Event (registrado)
  ↓
Hash encadeado
  ↓
Armazenamento imutável
```

---

### 12.6 Princípios Operacionais Avançados

- Separação total entre banco operacional e banco de auditoria
- Credenciais distintas
- Acesso somente leitura para auditores
- Exportação somente a partir de views controladas

---

## Conclusão Institucional Final

Este sistema estabelece um **nível máximo de controle, transparência e rastreabilidade**, permitindo provar:

- Quem acessou
- Quando acessou
- De onde acessou
- O que fez
- Por qual política
- Com qual justificativa

O resultado é um mecanismo de governança completo, preparado para ambientes críticos, fiscalização rigorosa e crescimento sustentável.

# Access Governance Specification

> Documento institucional único para controle de acesso, compliance, auditoria e rastreabilidade.
> Este arquivo é a **fonte única da verdade**. Nada fora dele decide acesso.

---

## 1. Metadados Institucionais

```yaml
meta:
  system: ERP-CORPORATIVO
  version: 1.0.0
  timezone: America/Sao_Paulo
  audit_retention_days: 1825
  immutable: true
```

---

## 2. Jornada de Trabalho (Controle por Horário)

```yaml
working_hours:
  default:
    days: [MON, TUE, WED, THU, FRI]
    start: "08:00"
    end: "18:00"

  tolerance_minutes: 10
```

Regras:

- Dentro do horário → acesso normal
- Fora do horário → fluxo de exceção legal obrigatório

---

## 3. RBAC — Role-Based Access Control (Teto de Permissão)

```yaml
roles:
  ANALISTA_FINANCEIRO:
    allowed_screens:
      - FIN_PAYROLL_VIEW
      - FIN_PAYROLL_EDIT

  DIRETOR:
    allowed_screens:
      - "*"
```

RBAC **nunca autoriza sozinho**. Ele apenas define o limite máximo do que o papel pode fazer.

---

## 4. ABAC — Attribute-Based Access Control (Decisão Contextual)

```yaml
policies:
  - id: POLICY_WORKING_HOURS
    when:
      outside_working_hours: true
    then:
      require:
        legal_ack: true
        audit_level: FULL
        backlog_event: true
```

ABAC avalia contexto imediato: horário, localização, perfil, tela, ação e exceções.

---

## 4.1 TBAC — Time-Based Access Control (Tempo e Jornada)

TBAC trata **tempo como entidade jurídica**, não apenas atributo técnico.

```yaml
tbac:
  shifts:
    REGULAR:
      days: [MON, TUE, WED, THU, FRI]
      start: "08:00"
      end: "18:00"

    OVERTIME:
      requires:
        - legal_ack
        - audit_level: FULL

  rules:
    - if: outside_shift
      then:
        shift: OVERTIME
        backlog_event: true
```

Qualquer violação de jornada gera evidência automática.

---

## 4.2 PBAC — Policy-Based Access Control (Política Institucional)

PBAC define **qual política institucional governa a decisão**.

```yaml
pbac:
  active_policies:
    - POLICY_WORKING_HOURS
    - POLICY_LOCATION
    - POLICY_RISK_HISTORY

  policy_versioning:
    enabled: true
    decision_log: true
```

Toda decisão deve registrar **qual política foi aplicada**.

---

## 4.3 AuBAC — Audit-Based Access Control (Histórico e Risco)

AuBAC ajusta decisões com base no **comportamento passado**.

```yaml
aubac:
  risk_scoring:
    outside_hours_access:
      weight: 5
    foreign_ip_access:
      weight: 7

  thresholds:
    medium_risk:
      score: 10
      action: INCREASE_AUDIT

    high_risk:
      score: 20
      action: REQUIRE_MANAGER_APPROVAL
```

Histórico ruim aumenta exigência, nunca diminui.

---

## 5. Cláusula Legal Obrigatória

```yaml
legal_clauses:
  outside_working_hours:
    message: >
      Este acesso está ocorrendo fora do horário regular de trabalho.
      A empresa declara ciência e autoriza este acesso, podendo ser
      considerado como atividade extraordinária conforme legislação vigente.
      Todas as ações serão registradas para auditoria.
```

Aceite explícito é obrigatório para prosseguir.

---

## 6. Ambiente e Localização

```yaml
environment:
  allowed_countries: [BR]
  require_vpn: false

  risk_conditions:
    foreign_ip:
      audit_level: FULL
      notify: SECURITY
```

---

## 7. Auditoria (Imutável e Jurídica)

```yaml
audit:
  mode: append_only
  fields:
    - event_id
    - user_id
    - role
    - screen
    - action
    - timestamp_utc
    - timestamp_local
    - ip
    - location
    - device
    - outside_working_hours
    - legal_ack_hash
    - before_state
    - after_state
```

Auditoria não pode ser alterada nem apagada.

---

## 8. Logs Técnicos

```yaml
logs:
  levels:
    - INFO
    - WARN
    - ERROR

  include:
    - policy_decision
    - latency
    - errors
```

Logs são técnicos. Auditoria é jurídica. Não confundir.

---

## 9. Backlog de Eventos Críticos

```yaml
backlog:
  create_event_when:
    - outside_working_hours
    - policy_exception
    - foreign_ip

  fields:
    - event_id
    - severity
    - description
    - responsible_area
```

---

## 10. Fluxo de Execução Determinístico

```text
1. Usuário tenta acessar
2. Carregar este arquivo
3. Validar RBAC
   - se não permitir → BLOQUEIA
4. Avaliar horário
5. Avaliar localização
6. Aplicar ABAC
7. Decidir:
   - ALLOW
   - ALLOW_WITH_AUDIT
   - DENY
8. Registrar auditoria
9. Registrar logs
10. Criar backlog se necessário
```

---

## Princípios de Governança

- Fonte única da verdade
- Nada implícito
- Nada hardcoded
- Auditoria acima de performance
- Legal acima de conveniência
- Transparência total

---

## 11. Próximos Passos Naturais (Evolução Enterprise)

Esta seção descreve a **evolução natural e recomendada** do sistema após a integração com NestJS Guards e Interceptors. Estes passos não são opcionais em ambientes regulados.

---

### 11.1 Persistência de Auditoria Append-Only

Objetivo: garantir **imutabilidade e não-repúdio**.

```yaml
audit_storage:
  mode: append_only
  update_allowed: false
  delete_allowed: false
  storage_options:
    - postgresql_worm
    - event_store
    - kafka_stream
```

Regras:

- Nenhum UPDATE
- Nenhum DELETE
- Cada evento é definitivo

---

### 11.2 Hash e Cadeia de Integridade (Anti-Tamper)

Objetivo: provar que auditoria **não foi adulterada**.

```yaml
audit_integrity:
  enabled: true
  algorithm: SHA-256
  chain:
    previous_event_hash: required
```

Cada evento referencia o hash do evento anterior.

---

### 11.3 Decision Trace (Explicabilidade Total)

Objetivo: explicar **por que** uma decisão foi tomada.

```yaml
decision_trace:
  include:
    - applied_policies
    - rbac_result
    - tbac_result
    - abac_result
    - aubac_score
    - final_decision
```

Usado para auditorias, investigações e defesa jurídica.

---

### 11.4 Exportação de Evidências

Objetivo: entregar evidência formal para auditorias externas.

```yaml
evidence_export:
  formats:
    - PDF
    - JSON
  retention_days: 1825
```

Relatórios devem ser assinados digitalmente.

---

### 11.5 Monitoramento e Alertas de Risco

Objetivo: agir antes do incidente.

```yaml
risk_monitoring:
  alerts:
    high_risk_user:
      threshold: aubac.high_risk
      notify:
        - SECURITY
        - COMPLIANCE
```

---

### 11.6 Governança e Versionamento de Políticas

Objetivo: tratar política como contrato institucional.

```yaml
policy_governance:
  versioned: true
  approval_required:
    - SECURITY
    - LEGAL
  change_log: mandatory
```

Nenhuma política entra em produção sem aprovação formal.

---

## 12. Arquitetura Avançada de Auditoria e Evidência

Esta seção define uma arquitetura de **alta confiabilidade, resistência à adulteração e rastreabilidade total**, adequada para ambientes críticos e regulados.

---

### 12.1 Schema Físico de Banco de Auditoria (Append-Only)

Banco de dados dedicado, isolado e com permissão **somente INSERT**.

```sql
CREATE TABLE audit_event (
  id UUID PRIMARY KEY,
  occurred_at_utc TIMESTAMP NOT NULL,
  occurred_at_local TIMESTAMP NOT NULL,

  user_id UUID NOT NULL,
  role VARCHAR(100) NOT NULL,

  screen_code VARCHAR(100) NOT NULL,
  action_code VARCHAR(50) NOT NULL,

  decision VARCHAR(50) NOT NULL,
  outside_working_hours BOOLEAN NOT NULL,

  ip_address VARCHAR(45) NOT NULL,
  geo_location VARCHAR(100),
  device_fingerprint TEXT,

  policy_version VARCHAR(20) NOT NULL,
  decision_trace_id UUID NOT NULL,

  previous_event_hash CHAR(64),
  event_hash CHAR(64) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regras de proteção
REVOKE UPDATE, DELETE ON audit_event FROM PUBLIC;
```

Princípios:

- Nunca atualizar
- Nunca apagar
- Banco isolado
- Retenção configurável

---

### 12.2 Cadeia de Hash de Auditoria (Integridade Criptográfica)

Cada evento forma uma **cadeia encadeada**, garantindo não-repúdio.

```text
HASH(event_n) = SHA256(
  event_data + HASH(event_n-1)
)
```

Campos incluídos no hash:

- id
- user_id
- screen_code
- action_code
- decision
- occurred_at_utc
- previous_event_hash

Qualquer alteração invalida toda a cadeia posterior.

---

### 12.3 Modelo de Decision Trace (Por Requisição)

Decision Trace é o **relatório explicativo completo** de cada decisão.

```sql
CREATE TABLE decision_trace (
  id UUID PRIMARY KEY,

  request_id UUID NOT NULL,
  user_id UUID NOT NULL,

  rbac_result BOOLEAN NOT NULL,
  tbac_result JSONB NOT NULL,
  abac_result JSONB NOT NULL,
  aubac_score INTEGER NOT NULL,

  applied_policies JSONB NOT NULL,
  final_decision VARCHAR(50) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Conteúdo mínimo:

- Quais políticas foram avaliadas
- Resultados intermediários
- Pontuação de risco
- Motivo da decisão final

---

### 12.4 Ligação Auditoria ↔ Decision Trace

```text
audit_event.decision_trace_id → decision_trace.id
```

Isso permite:

- Reconstrução completa do evento
- Explicação técnica e institucional
- Evidência formal em auditorias

---

### 12.5 Fluxo Completo de Evidência

```text
Request
  ↓
Decision Trace (avaliado)
  ↓
Audit Event (registrado)
  ↓
Hash encadeado
  ↓
Armazenamento imutável
```

---

### 12.6 Princípios Operacionais Avançados

- Separação total entre banco operacional e banco de auditoria
- Credenciais distintas
- Acesso somente leitura para auditores
- Exportação somente a partir de views controladas

---

## 13. Próximo e Último Degrau Lógico (Governança Máxima)

Esta seção define os **componentes finais** para atingir o mais alto nível de confiabilidade, independência e verificabilidade do sistema. Após estes pontos, não há evolução estrutural — apenas operação e manutenção.

---

### 13.1 Views de Auditoria para Entidades Externas

Objetivo: fornecer **transparência controlada**, sem expor dados sensíveis ou permitir manipulação.

```sql
CREATE VIEW audit_external_view AS
SELECT
  occurred_at_utc,
  user_id,
  screen_code,
  action_code,
  decision,
  outside_working_hours,
  event_hash,
  previous_event_hash
FROM audit_event;

GRANT SELECT ON audit_external_view TO auditor_role;
```

Regras:

- Somente leitura
- Sem dados pessoais sensíveis
- Sem joins dinâmicos

---

### 13.2 Assinatura Digital Assimétrica dos Eventos

Objetivo: garantir **autenticidade da origem** do evento de auditoria.

```yaml
digital_signature:
  enabled: true
  algorithm: RSA-4096
  private_key_location: HSM
  sign_fields:
    - event_hash
    - occurred_at_utc
```

Fluxo:

1. Evento é criado
2. Hash é calculado
3. Hash é assinado
4. Assinatura é armazenada junto ao evento

---

### 13.3 Replicação Imutável Off-Site

Objetivo: garantir **sobrevivência da evidência** mesmo em falhas catastróficas.

```yaml
offsite_replication:
  enabled: true
  mode: write_once
  targets:
    - region_secondary
    - cold_storage
```

Princípios:

- Replicação unidirecional
- Sem possibilidade de sobrescrita
- Verificação periódica de integridade

---

### 13.4 Simulador de Decisão (What-if)

Objetivo: permitir análise preventiva e validação de políticas **sem impacto operacional**.

```yaml
decision_simulator:
  enabled: true
  inputs:
    - user_profile
    - context
    - timestamp
  outputs:
    - expected_decision
    - applied_policies
    - risk_score
```

Uso permitido:

- Compliance
- Jurídico
- Segurança

Uso proibido:

- Produção
- Alteração de políticas ativas

---

## Encerramento Institucional

Com estes componentes, o sistema atinge um **estado final de maturidade**, no qual:

- Toda decisão é explicável
- Toda ação é rastreável
- Toda evidência é íntegra
- Toda política é verificável

A partir deste ponto, o foco passa a ser **disciplina operacional, revisão periódica e evolução controlada**, não mais arquitetura.
