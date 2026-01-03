
/**
 * Test LGPD Compliance Tools
 * 
 * Verifies Personal Data Report generation and User Anonymization.
 * Usage: pnpm tsx src/scripts/test-lgpd-compliance.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { personalDataService } from "@/lib/compliance/personal-data-service";
import { getPrismaClient } from "@/lib/prisma";
import crypto from "crypto";

async function testLGPD() {
    console.log("🛡️  Starting LGPD Compliance Test...");
    const prisma = await getPrismaClient();

    if (!prisma) {
        console.error("❌ DB connection failed");
        process.exit(1);
    }

    try {
        // 1. Create a Test User
        const testEmail = `lgpd_test_${crypto.randomBytes(4).toString('hex')}@example.com`;
        console.log(`\n👤 Creating test user: ${testEmail}`);

        const user = await prisma.user.create({
            data: {
                displayName: "LGPD Test User",
                email: testEmail,
                passwordHash: "hashed_password"
            }
        });

        console.log(`   ✅ User created: ${user.id}`);


        // 2. Generate Personal Data Report
        console.log("\n📄 Generating Personal Data Report (Portability)...");
        const report = await personalDataService.generateReport(user.id);

        if (report && report.data.profile.email === testEmail) {
            console.log("   ✅ Report generated successfully.");
            console.log(`   Points of data found: ${Object.keys(report.data).length}`);
        } else {
            throw new Error("Report generation failed or empty");
        }

        // 3. Anonymize User (Right to be Forgotten)
        console.log("\n🗑️  Executing Anonymization Request...");
        const success = await personalDataService.anonymizeUser(user.id);

        if (!success) throw new Error("Anonymization returned false");

        // 4. Verify Anonymization
        const anonymizedUser = await prisma.user.findUnique({ where: { id: user.id } });

        if (!anonymizedUser) throw new Error("User record disappeared (should be kept but anonymized)");

        if (anonymizedUser.email.startsWith("deleted_") && anonymizedUser.displayName === "Anonymized User") {
            console.log("   ✅ User successfully anonymized.");
            console.log(`   New Email: ${anonymizedUser.email}`);
        } else {
            console.error("   ❌ Anonymization failed. Data still present:", anonymizedUser);
            throw new Error("PII verification failed");
        }

        console.log("\n🎉 LGPD Compliance Tools Verified Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
        process.exit(1);
    }
}

testLGPD();
