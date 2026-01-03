
/**
 * Global Session Invalidation Script
 * 
 * Rotates the JWT secret and CLEARS the history, forcing all tokens to be invalid immediately.
 * usage: pnpm tsx src/scripts/invalidate-all-sessions.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { keyManager, KeyType } from "@/lib/security/key-manager";
import { getRedisClient } from "@/lib/redis/client";
import { logger } from "@/lib/observability";

async function invalidateAllSessions() {
    console.log("🔒 Starting Global Session Invalidation...");

    try {
        const redis = getRedisClient();
        if (!redis) {
            console.error("❌ Redis client not available");
            process.exit(1);
        }

        // 1. Rotate the keys
        console.log("🔄 Rotating keys...");
        await keyManager.rotateKey("JWT_SECRET");
        await keyManager.rotateKey("NEXTAUTH_SECRET");

        // 2. Clear history to prevent grace period validation
        console.log("🧹 Clearing key history...");
        const types: KeyType[] = ["JWT_SECRET", "NEXTAUTH_SECRET"];

        for (const type of types) {
            const historyKey = `security:keys:${type}:history`;
            await redis.del(historyKey);
            console.log(`   ✅ Cleared history for ${type}`);
        }

        console.log("✅ All sessions invalidated successfully.");
        console.log("   Users will need to re-login on their next request.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to invalidate sessions:", error);
        process.exit(1);
    }
}

invalidateAllSessions();
