import { z } from "zod";

/**
 * Seção 1: Metadados Institucionais
 */
export const PolicyMetaSchema = z.object({
  system: z.string(),
  version: z.string(),
  timezone: z.string(), // ex: "America/Sao_Paulo"
  audit_retention_days: z.number().int().positive(),
  immutable: z.boolean(),
});

/**
 * Seção 2: Jornada de Trabalho
 */
export const WorkingHoursSchema = z.object({
  default: z.object({
    days: z.array(z.string()), // ex: ["MON", "TUE"]
    start: z.string(), // ex: "08:00"
    end: z.string(), // ex: "18:00"
  }),
  tolerance_minutes: z.number().int().min(0),
});

/**
 * Seção 3: RBAC
 */
export const RBACRoleSchema = z.record(
  z.string(), // Role Name (ex: "ANALISTA")
  z.object({
    allowed_screens: z.array(z.string()), // ["FIN_PAYROLL_VIEW", "*"]
  }),
);

// --- ABAC ---
export const PolicyConditionSchema = z.object({
  outside_working_hours: z.boolean().optional(),
  foreign_ip: z.boolean().optional(),
});

export const PolicyEnforcementSchema = z.object({
  require: z.object({
    legal_ack: z.boolean().optional(),
    audit_level: z.enum(["FULL", "BASIC"]).optional(),
    backlog_event: z.boolean().optional(),
  }),
});

export const ABACPolicySchema = z.object({
  id: z.string(),
  when: PolicyConditionSchema,
  then: PolicyEnforcementSchema,
});

// --- PBAC ---
export const PBACSchema = z.object({
  active_policies: z.array(z.string()),
  policy_versioning: z.object({
    enabled: z.boolean(),
    decision_log: z.boolean(),
  }),
});

// --- AuBAC ---
export const AuBACSchema = z.object({
  risk_scoring: z.object({
    outside_hours_access: z.object({ weight: z.number() }),
    foreign_ip_access: z.object({ weight: z.number() }),
  }),
  thresholds: z.object({
    medium_risk: z.object({ score: z.number(), action: z.string() }),
    high_risk: z.object({ score: z.number(), action: z.string() }),
  }),
});

export const GovernancePolicySchema = z.object({
  meta: PolicyMetaSchema,
  working_hours: WorkingHoursSchema,
  roles: RBACRoleSchema,
  policies: z.array(ABACPolicySchema),
  pbac: PBACSchema,
  aubac: AuBACSchema,
});

export type GovernancePolicy = z.infer<typeof GovernancePolicySchema>;
export type PolicyMeta = z.infer<typeof PolicyMetaSchema>;
export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type RBACRole = z.infer<typeof RBACRoleSchema>;
export type ABACPolicy = z.infer<typeof ABACPolicySchema>;
