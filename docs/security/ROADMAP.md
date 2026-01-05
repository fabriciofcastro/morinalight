# 🚀 Roadmap: Próximos Passos do Sistema de Segurança

Após a consolidação da infraestrutura core de segurança (TBAC, Geo-Fencing, Análise Comportamental e Auditoria), este documento descreve as prioridades estratégicas para levar a **Morina Light** ao próximo nível de resiliência e maturidade operacional.

---

## 💎 1. Observabilidade e Monitoramento SRE
Para garantir que o sistema não apenas funcione, mas seja mensurável e resiliente.

- [ ] **Dashboards no Grafana**: Criar métricas de "Threat Level" (Nível de Ameaça) e "Security Latency".
- [ ] **Alertas de Erros Críticos**: Integração do `AdvancedAuditService` com Sentry para disparar notificações quando o motor de regras falhar ou houver picos de 403 (Proibido).
- [ ] **Distributed Tracing**: Uso de OpenTelemetry para rastrear o caminho de uma requisição e identificar por qual política de segurança ela foi bloqueada.

## 🕹️ 2. Centro de Comando Ativo (Mitigação)
Transformar o dashboard administrativo atual em uma ferramenta de intervenção imediata.

- [ ] **Quick Revoke**: Botão para revogar instantaneamente todas as sessões de um usuário em caso de suspeita confirmada.
- [ ] **IP Hard-Block**: Possibilidade de banir permanentemente um IP ou CIDR diretamente pela interface do `SecurityMonitoring`.
- [ ] **Auto-Quarantine**: Regra para degradar automaticamente as permissões de um usuário se o `Risk Score` exceder 85, até que ele revalide a identidade (MFA).

## ⚡ 3. Performance e Escalabilidade Enterprise
Otimizações para cenários de alta carga e milhares de usuários simultâneos.

- [ ] **Permissões em Cache (Redis)**: Mover o resultado das verificações de `SharedAbilityFactory` para o Redis para evitar consultas repetitivas ao banco de dados.
- [ ] **Edge Security**: Mover validações básicas de Geo-Fencing para a Edge (ex: Vercel Edge Middleware ou Cloudflare Workers) para bloquear tráfego malicioso antes mesmo de atingir a API.

## 🛡️ 4. Resiliência e Compliance Contínuo
Garantir que as barreiras de segurança permaneçam intransponíveis.

- [ ] **Chaos Engineering**: Simular quedas nos provedores de GeoIP e VPN Detection para garantir que o sistema entre em "Fail-safe mode" sem quebrar.
- [ ] **Automated Pentesting**: Configurar scanners de vulnerabilidades (ex: OWASP ZAP) no pipeline de CI/CD.
- [ ] **Auditoria de Acesso a Dados Pessoais**: Relatório focado 100% em LGPD, mostrando quem acessou dados sensíveis (PII) e por quê.

---

## 🛠️ Como Contribuir
Cada fase acima pode ser implementada de forma modular. Recomenda-se começar pela **Fase 2 (Centro de Comando)** para dar mais poder aos administradores humanos, seguida pela **Fase 3 (Performance)** visando a estabilidade do sistema sob carga.

> [!NOTE]
> Este documento é um guia vivo e deve ser atualizado conforme o crescimento da Morina Light.
