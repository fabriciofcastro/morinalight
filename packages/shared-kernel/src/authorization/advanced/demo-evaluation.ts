import { unifiedPolicyEngine } from "./unified-policy-engine";
import { SecurityContext, SecurityPolicy, TimeWindow } from "./types";

/**
 * Advanced Security Engine Demo/Proof
 */
export function runSecurityCheckDemo() {
    console.log("🚀 Starting Advanced Security Engine Verification...");

    // 1. Setup Context
    const context: SecurityContext = {
        user: {
            id: "user-vip-001",
            role: "MANAGER",
            departmentId: "DEPT-SALES",
            attributes: { seniority: 5, clearance: "LV3" }
        },
        environment: {
            time: new Date("2026-01-01T22:00:00Z"), // 10 PM (Out of hours)
            mfaVerified: true,
            ip: "192.168.1.1"
        }
    };

    // 2. Setup TBAC (Time-Based)
    const workingHours: TimeWindow[] = [
        {
            startTime: "08:00",
            endTime: "18:00",
            daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        }
    ];
    unifiedPolicyEngine.setTimeWindows(workingHours);

    // 3. Setup PBAC (Policy-Based)
    const policies: SecurityPolicy[] = [
        {
            id: "pol-001",
            name: "High Value Approval",
            effect: "ALLOW",
            action: "approve",
            subject: "Order",
            priority: 1,
            conditions: {
                and: [
                    { field: "user.role", operator: "equals", value: "MANAGER" },
                    { field: "resource.value", operator: "lessThan", value: 10000 }
                ]
            }
        },
        {
            id: "pol-002",
            name: "Deny deletion of active products",
            effect: "DENY",
            action: "delete",
            subject: "Product",
            priority: 10,
            conditions: {
                and: [{ field: "resource.status", operator: "equals", value: "active" }]
            }
        }
    ];
    unifiedPolicyEngine.setPolicies(policies);

    // --- SCENARIO 1: TBAC Deny ---
    console.log("\nScenario 1: Access out of working hours (10 PM)");
    const canAccessAtNight = unifiedPolicyEngine.evaluate("read", "any", context);
    console.log(`Result: ${canAccessAtNight ? "ALLOWED" : "DENIED"} (Expected: DENIED)`);

    // Change context to working hours
    const daylightContext = { ...context, environment: { ...context.environment, time: new Date("2026-01-01T10:00:00Z") } };

    // --- SCENARIO 2: PBAC Allow (Manager approving < 10k) ---
    console.log("\nScenario 2: Manager approving Order value 5,000");
    const canApproveLow = unifiedPolicyEngine.evaluate("approve", "Order", daylightContext, { id: "ord-1", value: 5000 });
    console.log(`Result: ${canApproveLow ? "ALLOWED" : "DENIED"} (Expected: ALLOWED)`);

    // --- SCENARIO 3: PBAC Deny (Manager approving > 10k) ---
    console.log("\nScenario 3: Manager approving Order value 15,000");
    const canApproveHigh = unifiedPolicyEngine.evaluate("approve", "Order", daylightContext, { id: "ord-2", value: 15000 });
    console.log(`Result: ${canApproveHigh ? "ALLOWED" : "DENIED"} (Expected: DENIED)`);

    // --- SCENARIO 4: PBAC Deny (Deleting active product) ---
    console.log("\nScenario 4: Deleting active product");
    const canDeleteProduct = unifiedPolicyEngine.evaluate("delete", "Product", daylightContext, { id: "prod-1", status: "active" });
    console.log(`Result: ${canDeleteProduct ? "ALLOWED" : "DENIED"} (Expected: DENIED)`);

    console.log("\n✅ Verification Complete.");
}
