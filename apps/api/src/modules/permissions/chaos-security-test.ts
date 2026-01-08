import { AuthEventStoreService } from './domain/services/auth-event-store.service';
import { OpaService } from './infra/opa/opa.service';
import { ChaosSecurityService } from './services/chaos-security.service';
import { RiskScoringService } from './services/risk-scoring.service';

/**
 * Script de verificação de Chaos Security
 * Valida a resiliência do stack de segurança avançada
 */
export async function runChaosSecurityTest(services: {
  chaos: ChaosSecurityService;
  risk: RiskScoringService;
  opa: OpaService;
  events: AuthEventStoreService;
}, userId: string, orgId: string) {
  console.log('--- 🛡️ Starting Chaos Security Verification 🛡️ ---');

  // Teste 1: Risco Crítico Injetado
  console.log('\n[Experiment 1] Fake High Risk Injection');
  await services.chaos.injectFailure('fake_high_risk', 5000);
  const riskScore = await services.risk.calculateRiskScore(userId, orgId, {});
  console.log(`> Calculated Risk Score: ${riskScore}`);
  if (riskScore > 90) console.log('✅ PASS: System detected high risk via chaos injection');
  else console.log('❌ FAIL: System failed to detect high risk injection');

  // Teste 2: OPA Down Simulation
  console.log('\n[Experiment 2] OPA Outage Simulation');
  await services.chaos.injectFailure('opa_down', 5000);
  const opaResult = await services.opa.evaluatePolicy('test/allow', {});
  console.log(`> OPA Evaluation (during outage): ${opaResult}`);
  if (opaResult === false) console.log('✅ PASS: System failed-safe (denied access during OPA outage)');
  else console.log('❌ FAIL: System failed-open (unsafe!)');

  // Teste 3: Audit Trail Integrity
  console.log('\n[Experiment 3] Event Store Audit Trail');
  const events = await services.events.getEventsForUser(userId, orgId);
  console.log(`> Recent events count: ${events.length}`);
  if (events.length > 0) console.log('✅ PASS: Events are being correctly persisted to the store');
  else console.log('❌ FAIL: No events found in store');

  console.log('\n--- ✅ Chaos Verification Complete ---');
}
