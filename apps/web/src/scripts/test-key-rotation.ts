
import { config } from "dotenv";
config({ path: ".env.local" });

import { KeyManager } from "@/lib/security/key-manager";

// Mock Redis Implementation for Testing Logic
class MockRedis {
    private storage = new Map<string, any>();

    async get(key: string) {
        return this.storage.get(key) || null;
    }

    async set(key: string, value: any) {
        this.storage.set(key, value);
        return "OK";
    }

    pipeline() {
        return {
            lpush: (key: string, value: any) => {
                const list = this.storage.get(key) || [];
                list.unshift(value);
                this.storage.set(key, list);
            },
            ltrim: (key: string, start: number, end: number) => {
                const list = this.storage.get(key) || [];
                // Simple slice mock for verification
                this.storage.set(key, list.slice(start, end + 1));
            },
            set: (key: string, value: any) => {
                this.storage.set(key, value);
            },
            exec: async () => {
                return "OK";
            }
        };
    }

    async lrange(key: string, start: number, end: number) {
        const list = this.storage.get(key) || [];
        if (end === -1) return list.slice(start);
        return list.slice(start, end + 1);
    }
}

async function run() {
    try {
        console.log("Starting Key Rotation Test (Simulated Redis)...");

        const mockRedis = new MockRedis() as any;
        const keyManager = new KeyManager(mockRedis);

        // 1. Get initial key (should use env fallback or default)
        const initialKey = await keyManager.getCurrentKey("API_KEY");
        console.log("Initial Key:", initialKey.substring(0, 10) + "...");

        // 2. Rotate
        // Note: First rotation might not add to history if Redis was empty, 
        // effectively resetting to a tracked state.
        console.log("Rotating key 1...");
        const key1 = await keyManager.rotateKey("API_KEY");
        console.log("Key 1:", key1.substring(0, 10) + "...");

        // 3. Rotate Again to test history
        console.log("Rotating key 2...");
        const key2 = await keyManager.rotateKey("API_KEY");
        console.log("Key 2:", key2.substring(0, 10) + "...");

        if (key1 === key2) {
            throw new Error("Key did not change after rotation!");
        }

        // 4. Validate newest key
        const isValidNew = await keyManager.isValidKey(key2, "API_KEY", (k) => k === key2);
        console.log("Is Key 2 Valid?", isValidNew);
        if (!isValidNew) throw new Error("Newest key failed validation");

        // 5. Validate previous key (grace period)
        // key1 should be in history now
        const isValidOld = await keyManager.isValidKey(key1, "API_KEY", (k) => k === key1);
        console.log("Is Key 1 Valid (Grace Period)?", isValidOld);
        if (!isValidOld) throw new Error("Previous key failed validation (History lookup failed)");

        console.log("✅ Key Rotation Test Passed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

run();
