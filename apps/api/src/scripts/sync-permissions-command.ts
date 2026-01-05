import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PermissionsRegistryService } from "../modules/permissions/domain/services/permissions-registry.service";

// Scripts run in ts-node/tsx where strict module rules might differ, but for tsc build (CommonJS) import.meta is invalid.
// We can hardcode the .env path resolution or just accept that this script is for development.
const __dirname = resolve(".");
const rootEnv = resolve(__dirname, "../../../../.env");
loadEnv({ path: rootEnv, override: false });

const prisma = new PrismaClient();

async function syncPermissions() {
    console.log("\n🔄 Iniciando Sincronização de Permissões...");

    const definitions = PermissionsRegistryService.getAllDefinitions();
    console.log(`📋 ${definitions.length} definições encontradas no Registry.`);

    let created = 0;
    let updated = 0;

    for (const def of definitions) {
        // Upsert permission
        // Note: ID generation needs to be consistent or handled if permission exists
        // Here we rely on 'code' being unique if the schema supports it, 
        // OR we find by code first. The schema allows duplicate codes per different modules? 
        // SharedAbilityFactory assumes 'code' (key) is unique enough for logic.
        // Let's check schema: Permission has `code` but unique constraint is not guaranteed globally in all schemas.
        // We will assume `code` is unique or we will update the first match.

        const existing = await prisma.permission.findFirst({
            where: { code: def.key }
        });

        if (existing) {
            await prisma.permission.update({
                where: { id: existing.id },
                data: {
                    name: def.name,
                    description: def.description,
                    module: def.module,
                    level: def.level,
                    updatedAt: new Date()
                }
            });
            updated++;
            // console.log(`   ✏️ Updated: ${def.key}`);
        } else {
            await prisma.permission.create({
                data: {
                    id: crypto.randomUUID(),
                    code: def.key,
                    name: def.name,
                    description: def.description,
                    module: def.module,
                    level: def.level,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            created++;
            console.log(`   ➕ Created: ${def.key}`);
        }
    }

    console.log(`\n✅ Sincronização Concluída:`);
    console.log(`   Novas: ${created}`);
    console.log(`   Atualizadas: ${updated}`);
}

syncPermissions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
