
import { Redis } from "ioredis";

async function main() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    console.log(`Connecting to Redis at ${redisUrl}...`);

    const redis = new Redis(redisUrl);

    const streamKey = "realtime.catalogo";
    const groupName = "realtime-consumers";

    try {
        // Check if stream exists, if not create it by adding a dummy event (and then deleting it if you want, but unnecessary for streams)
        // Actually XGROUP CREATE with MKSTREAM option creates the stream if it doesn't exist.
        // ioredis supports xgroup.

        console.log(`Creating consumer group '${groupName}' for stream '${streamKey}'...`);

        // xgroup('CREATE', key, groupname, id, 'MKSTREAM')
        await redis.xgroup("CREATE", streamKey, groupName, "$", "MKSTREAM");

        console.log("✅ Consumer group created successfully.");
    } catch (error: any) {
        if (error.message.includes("BUSYGROUP")) {
            console.log("⚠️ Consumer group already exists.");
        } else {
            console.error("❌ Error creating consumer group:", error);
        }
    } finally {
        redis.disconnect();
    }
}

main();
