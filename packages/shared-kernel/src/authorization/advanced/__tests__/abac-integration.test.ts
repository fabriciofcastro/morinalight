import { describe, it, expect, beforeEach } from "vitest";
import { UnifiedPolicyEngine } from "../unified-policy-engine";
import { SecurityContext, SecurityPolicy, TimeWindow } from "../types";

describe("UnifiedPolicyEngine ABAC Integration", () => {
    let engine: UnifiedPolicyEngine;

    const mockContext: SecurityContext = {
        user: {
            id: "user-123",
            role: "member",
            departmentId: "dept-fin",
            attributes: { seniority: 5 }
        },
        environment: {
            time: new Date("2024-03-20T10:00:00Z"), // Monday 10:00
            ip: "192.168.1.1",
            mfaVerified: true
        }
    };

    beforeEach(() => {
        engine = new UnifiedPolicyEngine();
    });

    it("should allow access when PBAC policy matches", () => {
        const policies: SecurityPolicy[] = [{
            id: "pol-1",
            name: "Allow Financial View",
            effect: "ALLOW",
            action: "read",
            subject: "FinancialReport",
            priority: 1
        }];
        engine.setPolicies(policies);

        expect(engine.evaluate("read", "FinancialReport", mockContext)).toBe(true);
    });

    it("should deny access when TBAC window is not active", () => {
        const timeWindows: TimeWindow[] = [{
            startTime: "09:00",
            endTime: "18:00",
            daysOfWeek: [1, 2, 3, 4, 5] // Mon-Fri
        }];
        engine.setTimeWindows(timeWindows);
        engine.setPolicies([{
            id: "pol-1",
            name: "Allow All",
            effect: "ALLOW",
            action: "read",
            subject: "FinancialReport",
            priority: 1
        }]);

        const outOfWindowContext: SecurityContext = {
            ...mockContext,
            environment: { ...mockContext.environment, time: new Date("2024-03-24T10:00:00Z") } // Sunday
        };

        expect(engine.evaluate("read", "FinancialReport", outOfWindowContext)).toBe(false);
    });

    it("should apply ABAC conditions correctly", () => {
        const policies: SecurityPolicy[] = [{
            id: "pol-abac",
            name: "Department Restriction",
            effect: "ALLOW",
            action: "read",
            subject: "FinancialReport",
            conditions: {
                and: [{ field: "user.departmentId", operator: "equals", value: "dept-fin" }]
            },
            priority: 1
        }];
        engine.setPolicies(policies);

        expect(engine.evaluate("read", "FinancialReport", mockContext)).toBe(true);

        const otherDeptContext: SecurityContext = {
            ...mockContext,
            user: { ...mockContext.user, departmentId: "dept-hr" }
        };
        expect(engine.evaluate("read", "FinancialReport", otherDeptContext)).toBe(false);
    });

    it("should honor ACL entries", () => {
        engine.setAclEntries([{
            subject: "Document",
            subjectId: "doc-999",
            userId: "user-123",
            action: "read"
        }]);

        // ACL should fail if no matching entry, even if everything else is OK
        expect(engine.evaluate("read", "Document", mockContext, { id: "doc-999" })).toBe(true);
        expect(engine.evaluate("read", "Document", mockContext, { id: "doc-000" })).toBe(false);
    });

    it("should prioritize Deny over Allow (Conflict Resolution)", () => {
        const policies: SecurityPolicy[] = [
            {
                id: "pol-allow",
                name: "General Allow",
                effect: "ALLOW",
                action: "read",
                subject: "SecretDoc",
                priority: 1
            },
            {
                id: "pol-deny",
                name: "Specific Deny",
                effect: "DENY",
                action: "read",
                subject: "SecretDoc",
                conditions: {
                    and: [{ field: "user.role", operator: "equals", value: "member" }]
                },
                priority: 10
            }
        ];
        engine.setPolicies(policies);

        expect(engine.evaluate("read", "SecretDoc", mockContext)).toBe(false);
    });
});
