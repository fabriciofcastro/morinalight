/**
 * MFA Test Suite
 * 
 * Suite de testes para validar fluxo completo de MFA
 * Uso: pnpm tsx src/scripts/mfa-test-suite.ts
 */

import { getPrismaClient } from "@/lib/prisma";

console.log("\n🔐 MFA TEST SUITE - MorinaLight\n");
console.log("=".repeat(70));

console.log(`
Este script fornece um checklist manual para testar o fluxo completo de MFA.
Execute cada teste e marque como concluído.

📋 CHECKLIST DE TESTES
`);

console.log("=".repeat(70));

console.log(`
## 1. SETUP DE MFA

### 1.1 Google Authenticator
- [ ] Fazer login com usuário sem MFA
- [ ] Acessar /settings/security
- [ ] Clicar em "Ativar 2FA"
- [ ] Escanear QR code com Google Authenticator
- [ ] Inserir código de 6 dígitos
- [ ] Verificar mensagem de sucesso
- [ ] Salvar backup codes

### 1.2 Authy
- [ ] Repetir processo com Authy
- [ ] Verificar compatibilidade
- [ ] Confirmar geração de códigos

### 1.3 Outro App TOTP
- [ ] Testar com Microsoft Authenticator ou similar
- [ ] Validar interoperabilidade

`);

console.log("=".repeat(70));

console.log(`
## 2. VERIFICAÇÃO DE CÓDIGO

### 2.1 Código Válido
- [ ] Fazer logout
- [ ] Fazer login com email/senha
- [ ] Verificar redirecionamento para /login/verify-mfa
- [ ] Inserir código válido do authenticator
- [ ] Verificar login bem-sucedido
- [ ] Confirmar redirecionamento para dashboard

### 2.2 Código Inválido
- [ ] Fazer logout
- [ ] Fazer login com email/senha
- [ ] Inserir código inválido (ex: 000000)
- [ ] Verificar mensagem de erro
- [ ] Confirmar que não foi autenticado
- [ ] Tentar 3 vezes consecutivas
- [ ] Verificar se conta foi bloqueada temporariamente

### 2.3 Código Expirado
- [ ] Esperar código expirar (30 segundos)
- [ ] Tentar usar código antigo
- [ ] Verificar rejeição
- [ ] Usar código novo
- [ ] Confirmar sucesso

`);

console.log("=".repeat(70));

console.log(`
## 3. BACKUP CODES

### 3.1 Uso de Backup Code
- [ ] Fazer logout
- [ ] Fazer login com email/senha
- [ ] Clicar em "Usar código de backup"
- [ ] Inserir um dos backup codes salvos
- [ ] Verificar login bem-sucedido
- [ ] Confirmar que código foi invalidado

### 3.2 Regenerar Backup Codes
- [ ] Acessar /settings/security
- [ ] Clicar em "Regenerar códigos de backup"
- [ ] Confirmar ação
- [ ] Salvar novos códigos
- [ ] Verificar que códigos antigos foram invalidados

`);

console.log("=".repeat(70));

console.log(`
## 4. DISPOSITIVOS CONFIÁVEIS

### 4.1 Adicionar Dispositivo
- [ ] Fazer login com MFA
- [ ] Marcar checkbox "Confiar neste dispositivo"
- [ ] Completar login
- [ ] Fazer logout
- [ ] Fazer login novamente
- [ ] Verificar que MFA NÃO foi solicitado

### 4.2 Revogar Dispositivo
- [ ] Acessar /settings/security
- [ ] Ver lista de dispositivos confiáveis
- [ ] Clicar em "Revogar" em um dispositivo
- [ ] Confirmar ação
- [ ] Fazer logout
- [ ] Fazer login
- [ ] Verificar que MFA FOI solicitado

### 4.3 Múltiplos Dispositivos
- [ ] Adicionar dispositivo A (Chrome)
- [ ] Adicionar dispositivo B (Firefox)
- [ ] Verificar ambos na lista
- [ ] Revogar apenas dispositivo A
- [ ] Confirmar que B ainda está ativo

`);

console.log("=".repeat(70));

console.log(`
## 5. DISABLE MFA

### 5.1 Desativar MFA
- [ ] Acessar /settings/security
- [ ] Clicar em "Desativar 2FA"
- [ ] Inserir senha atual
- [ ] Confirmar desativação
- [ ] Verificar mensagem de sucesso
- [ ] Fazer logout
- [ ] Fazer login
- [ ] Confirmar que MFA NÃO é solicitado

### 5.2 Reativar MFA
- [ ] Repetir processo de setup
- [ ] Usar novo QR code
- [ ] Verificar novos backup codes
- [ ] Confirmar funcionamento

`);

console.log("=".repeat(70));

console.log(`
## 6. EDGE CASES

### 6.1 Perda de Acesso ao Authenticator
- [ ] Simular perda de dispositivo
- [ ] Usar backup code para login
- [ ] Desativar MFA
- [ ] Reativar com novo dispositivo

### 6.2 Múltiplas Tentativas Falhadas
- [ ] Tentar 5 códigos inválidos consecutivos
- [ ] Verificar bloqueio temporário
- [ ] Aguardar período de bloqueio
- [ ] Tentar novamente com código válido

### 6.3 Sessão Expirada
- [ ] Iniciar processo de MFA
- [ ] Aguardar 10 minutos sem completar
- [ ] Tentar inserir código
- [ ] Verificar mensagem de sessão expirada
- [ ] Reiniciar processo de login

`);

console.log("=".repeat(70));

console.log(`
## 7. SEGURANÇA

### 7.1 Alertas de Segurança
- [ ] Fazer login com MFA de novo IP
- [ ] Verificar alerta no Security Dashboard
- [ ] Confirmar geolocalização correta
- [ ] Verificar notificação (se configurada)

### 7.2 Impossible Travel
- [ ] Simular login de localizações distantes
- [ ] Verificar detecção de viagem impossível
- [ ] Confirmar bloqueio automático
- [ ] Verificar alerta crítico

### 7.3 Audit Trail
- [ ] Verificar logs de todas ações MFA
- [ ] Confirmar registro de:
  - [ ] Setup MFA
  - [ ] Verificação bem-sucedida
  - [ ] Verificação falhada
  - [ ] Uso de backup code
  - [ ] Disable MFA

`);

console.log("=".repeat(70));

console.log(`
## 8. PERFORMANCE

### 8.1 Tempo de Resposta
- [ ] Medir tempo de setup (< 30s)
- [ ] Medir tempo de verificação (< 2s)
- [ ] Medir tempo de disable (< 5s)

### 8.2 Concorrência
- [ ] Testar 10 logins simultâneos com MFA
- [ ] Verificar que todos funcionam
- [ ] Confirmar ausência de race conditions

`);

console.log("=".repeat(70));

console.log(`
## 9. COMPATIBILIDADE

### 9.1 Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 9.2 Dispositivos
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile (iOS)
- [ ] Mobile (Android)

`);

console.log("=".repeat(70));

console.log(`
## 10. DOCUMENTAÇÃO

- [ ] Verificar guia de usuário para MFA
- [ ] Confirmar FAQs atualizadas
- [ ] Validar mensagens de erro claras
- [ ] Verificar tooltips e ajuda contextual

`);

console.log("=".repeat(70));

console.log(`
\n✅ CRITÉRIOS DE SUCESSO

Para considerar o MFA pronto para produção, TODOS os itens devem estar marcados.

📊 ESTATÍSTICAS ESPERADAS:
- Taxa de sucesso de setup: > 95%
- Taxa de sucesso de verificação: > 99%
- Tempo médio de setup: < 2 minutos
- Tempo médio de verificação: < 5 segundos
- Zero falsos positivos em impossible travel

🎯 PRÓXIMOS PASSOS:
1. Executar todos os testes acima
2. Documentar quaisquer problemas encontrados
3. Corrigir bugs identificados
4. Re-testar itens que falharam
5. Obter aprovação final da equipe de segurança

`);

console.log("\n" + "=".repeat(70) + "\n");

// Script de validação automática (opcional)
async function runAutomatedChecks() {
    console.log("🤖 VERIFICAÇÕES AUTOMATIZADAS\n");

    const prisma = await getPrismaClient();
    if (!prisma) {
        console.log("❌ Não foi possível conectar ao banco de dados");
        return;
    }

    // Verificar usuários com MFA
    const usersWithMFA = await prisma.user.count({
        where: { twoFactorEnabled: true },
    });

    const totalUsers = await prisma.user.count();
    const mfaPercentage = totalUsers > 0
        ? ((usersWithMFA / totalUsers) * 100).toFixed(1)
        : "0.0";

    console.log(`📊 Estatísticas Atuais:`);
    console.log(`   Total de usuários: ${totalUsers}`);
    console.log(`   Usuários com MFA: ${usersWithMFA}`);
    console.log(`   Cobertura de MFA: ${mfaPercentage}%\n`);

    // Verificar dispositivos confiáveis
    const trustedDevices = await prisma.trustedDevice.count();
    console.log(`📱 Dispositivos Confiáveis: ${trustedDevices}\n`);

    // Verificar alertas de MFA
    const mfaAlerts = await prisma.securityAlert.count({
        where: {
            alertType: {
                in: ["mfa_setup", "mfa_verified", "mfa_failed"],
            },
        },
    });

    console.log(`🔔 Alertas de MFA: ${mfaAlerts}\n`);

    await prisma.$disconnect();
}

// Executar verificações se solicitado
if (process.argv.includes("--check")) {
    runAutomatedChecks().catch(console.error);
}
