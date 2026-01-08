export interface AccessContext {
  userId: string;
  role: string;
  screen: string; // ID da tela (ex: "FIN_PAYROLL_VIEW")
  action: string; // "VIEW", "EDIT", etc.
  timestamp: Date;
  ip: string;
  location?: string; // País/Cidade (ex: "BR/Sao Paulo")
  device?: string; // User-Agent
}

export type Decision = "ALLOW" | "ALLOW_WITH_AUDIT" | "DENY" | "REQUIRE_MANAGER_APPROVAL";

export interface DecisionResult {
  decision: Decision;
  reasons: string[];
  requiredEnforcements?: string[]; // ex: ["LEGAL_ACK"]
  meta?: {
    policyVersion: string;
    policySystem: string;
  };
}
