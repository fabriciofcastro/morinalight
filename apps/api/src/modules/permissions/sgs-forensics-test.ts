import { getPrisma } from "../../infra/database/prisma.service";
import { ForensicsService } from './domain/services/forensics.service';
import { ImmutableAuditService } from './domain/services/immutable-audit.service';
import { GovernancePepService } from './services/governance-pep.service';
import { UebaService } from './services/ueba.service';

const prisma = getPrisma();
/**
 * Script de Verificação Forense e SGS
 */
export async function runSgsForensicsTest(services: {
  immutableAudit: ImmutableAuditService;
  forensics: ForensicsService;
  ueba: UebaService;
  governance: GovernancePepService;
}, userId: string, orgId: string) {
  console.log('--- 🛡️ Starting SGS Governance & Forensics Verification 🛡️ ---');

  // Teste 1: Integridade da Cadeia (Forensics)
  console.log('\n[Experiment 1] Hash-Chain Integrity Verification');
  const integrity = await services.forensics.fullAuditVerification(orgId);
  if (integrity.isValid) console.log('✅ PASS: Audit chain is intact and valid.');
  else console.log('❌ FAIL: Audit chain corrupted!');

  // Teste 2: UEBA & Risk Degradation
  console.log('\n[Experiment 2] UEBA Velocity Detection');
  // Simulate high speed actions
  for (let i = 0; i < 40; i++) {
    await services.ueba.analyzeBehavior(userId, orgId, { action: 'products:view', ip: '127.0.0.1' });
  }
  const uebaFinal = await services.ueba.analyzeBehavior(userId, orgId, { action: 'products:delete', ip: '127.0.0.1' });
  console.log(`> UEBA Anomaly Detected: ${uebaFinal.isAnomalous}`);
  console.log(`> Risk Adjustment: +${uebaFinal.riskScoreAdjustment}`);
  if (uebaFinal.isAnomalous) console.log('✅ PASS: UEBA correctly identified high-velocity anomaly.');
  else console.log('❌ FAIL: UEBA failed to detect anomaly.');

  // Teste 3: Runtime Controls (Kill Switch)
  console.log('\n[Experiment 3] Feature Kill Switch Verification');
  services.governance.activateKillSwitch('sensitive:admin');
  const isDisabled = services.governance.isFeatureDisabled('sensitive:admin');
  console.log(`> Feature Disabled: ${isDisabled}`);
  if (isDisabled) console.log('✅ PASS: Kill switch correctly blocked the feature.');
  else console.log('❌ FAIL: Kill switch failed.');

  console.log('\n--- ✅ SGS Verification Complete ---');
}
