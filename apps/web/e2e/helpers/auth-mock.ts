import { Page } from "@playwright/test";

export interface MockPermissionOptions {
    role?: string;
    effective?: Array<{
        permissionKey: string;
        granted: boolean;
        source?: string;
        sourceEntityId?: string;
    }>;
    denied?: string[];
    context?: {
        userId?: string;
        organizationId?: string;
        departmentId?: string;
        sectorId?: string;
        positionId?: string;
        attributes?: Record<string, any>;
        mfaVerified?: boolean;
    };
    policies?: any[];
    aclEntries?: any[];
}

/**
 * Mocks the authentication session and effective permissions
 */
export async function mockAuth(page: Page, options: MockPermissionOptions = {}) {
    const {
        role = "member",
        effective = [],
        denied = [],
        context = {},
        policies = [],
        aclEntries = []
    } = options;

    const userId = "test-user-id";
    const userEmail = "test@example.com";

    // Mock Session
    await page.route("**/api/auth/session", async (route) => {
        await route.fulfill({
            json: {
                user: {
                    id: userId,
                    userId,
                    email: userEmail,
                    displayName: "Test User",
                    role: role,
                }
            }
        });
    });

    // Mock Effective Permissions
    await page.route(`**/api/users/${userId}/permissions/effective`, async (route) => {
        await route.fulfill({
            json: {
                effective,
                denied,
                role,
                context,
                policies,
                aclEntries
            }
        });
    });

    // Also mock generic user profile if needed
    await page.route(`**/api/users/${userId}`, async (route) => {
        await route.fulfill({
            json: {
                id: userId,
                email: userEmail,
                displayName: "Test User",
                role: role,
                organizationId: "test-org-id"
            }
        });
    });
}

/**
 * Common Permission Sets for testing
 */
export const AuthPresets = {
    OWNER: {
        role: "owner",
        effective: [{ permissionKey: "all:manage", granted: true }]
    },
    MEMBER: {
        role: "member",
        effective: [
            { permissionKey: "dashboard:view", granted: true },
            { permissionKey: "products:view", granted: true }
        ]
    },
    PRODUCT_MANAGER: {
        role: "member",
        effective: [
            { permissionKey: "dashboard:view", granted: true },
            { permissionKey: "products:view", granted: true },
            { permissionKey: "products:create", granted: true },
            { permissionKey: "products:edit", granted: true }
        ]
    },
    // TBAC Preset: Only during business hours
    BUSINESS_HOURS_ONLY: {
        role: "member",
        effective: [
            { permissionKey: "products:view", granted: true },
            { permissionKey: "products:create:business_hours", granted: true }
        ]
    },
    // ABAC Preset: Only own products
    OWN_ONLY: {
        role: "member",
        effective: [
            { permissionKey: "products:view", granted: true },
            { permissionKey: "products:edit:own", granted: true }
        ]
    }
};
