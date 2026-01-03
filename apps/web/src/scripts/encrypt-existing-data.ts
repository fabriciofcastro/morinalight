#!/usr/bin/env node
/**
 * Encrypt Existing Data Script
 * 
 * Migra dados existentes para formato criptografado
 * 
 * Uso:
 *   node scripts/encrypt-existing-data.ts --dry-run
 *   node scripts/encrypt-existing-data.ts --model User --field cpf
 *   node scripts/encrypt-existing-data.ts --all
 */

import { getRawPrismaClient } from '../lib/prisma';
import * as encryptionService from '../lib/crypto/encryption';

interface MigrationOptions {
    dryRun?: boolean;
    model?: string;
    field?: string;
    all?: boolean;
    batchSize?: number;
}

// Definir campos a serem criptografados por modelo
const ENCRYPTION_MAP: Record<string, string[]> = {
    User: ['cpf', 'phone'],
    Cliente: ['documento', 'rg', 'telefone', 'celular'],
    Supplier: ['document', 'phone'],
};

async function encryptExistingData(options: MigrationOptions = {}) {
    const {
        dryRun = false,
        model,
        field,
        all = false,
        batchSize = 100
    } = options;

    console.log('🔐 Data Encryption Migration');
    console.log('============================\n');

    if (dryRun) {
        console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    const prisma = await getRawPrismaClient();
    if (!prisma) {
        console.error('❌ Database unavailable');
        process.exit(1);
    }

    // Determinar quais modelos/campos processar
    const modelsToProcess: Record<string, string[]> = {};

    if (all) {
        Object.assign(modelsToProcess, ENCRYPTION_MAP);
    } else if (model && field) {
        modelsToProcess[model] = [field];
    } else if (model) {
        modelsToProcess[model] = ENCRYPTION_MAP[model] || [];
    } else {
        console.error('❌ Specify --all, --model, or --model and --field');
        process.exit(1);
    }

    console.log('📋 Models to process:');
    Object.entries(modelsToProcess).forEach(([m, fields]) => {
        console.log(`   ${m}: ${fields.join(', ')}`);
    });
    console.log('');

    let totalProcessed = 0;
    let totalEncrypted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [modelName, fields] of Object.entries(modelsToProcess)) {
        console.log(`\n📦 Processing ${modelName}...`);
        console.log('─'.repeat(80));

        try {
            // Buscar todos os registros
            const model = (prisma as any)[modelName.toLowerCase()];
            if (!model) {
                console.error(`❌ Model ${modelName} not found in Prisma client`);
                continue;
            }

            const records = await model.findMany();
            console.log(`Found ${records.length} records`);

            // Processar em lotes
            for (let i = 0; i < records.length; i += batchSize) {
                const batch = records.slice(i, i + batchSize);
                console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} records)...`);

                for (const record of batch) {
                    totalProcessed++;
                    const updates: Record<string, string> = {};
                    let needsUpdate = false;

                    for (const fieldName of fields) {
                        const value = record[fieldName];

                        if (!value) {
                            // Campo vazio, pular
                            continue;
                        }

                        // Verificar se já está criptografado (formato: iv:authTag:encrypted)
                        if (typeof value === 'string' && value.includes(':') && value.split(':').length === 3) {
                            totalSkipped++;
                            continue;
                        }

                        // Criptografar
                        try {
                            const encrypted = encryptionService.encrypt(value);
                            updates[fieldName] = encrypted;
                            needsUpdate = true;
                            totalEncrypted++;
                        } catch (error) {
                            console.error(`❌ Failed to encrypt ${modelName}.${fieldName} for record ${record.id}:`, error);
                            totalErrors++;
                        }
                    }

                    // Atualizar registro se necessário
                    if (needsUpdate && !dryRun) {
                        try {
                            await model.update({
                                where: { id: record.id },
                                data: updates
                            });
                        } catch (error) {
                            console.error(`❌ Failed to update ${modelName} record ${record.id}:`, error);
                            totalErrors++;
                        }
                    }
                }

                // Mostrar progresso
                const progress = Math.min(100, ((i + batch.length) / records.length) * 100).toFixed(1);
                console.log(`Progress: ${progress}% (${i + batch.length}/${records.length})`);
            }

            console.log(`✅ ${modelName} completed`);

        } catch (error) {
            console.error(`❌ Error processing ${modelName}:`, error);
        }
    }

    // Resumo final
    console.log('\n' + '='.repeat(80));
    console.log('📊 Migration Summary');
    console.log('='.repeat(80));
    console.log(`Total Records Processed: ${totalProcessed}`);
    console.log(`Fields Encrypted: ${totalEncrypted}`);
    console.log(`Already Encrypted (Skipped): ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);

    if (dryRun) {
        console.log('\n⚠️  DRY RUN - No changes were made to the database');
    } else {
        console.log('\n✅ Migration completed successfully');
    }

    console.log('\n💡 Recommendations:');
    console.log('   1. Verify encrypted data by querying a few records');
    console.log('   2. Test decryption in your application');
    console.log('   3. Keep a database backup until verification is complete');
    console.log('');

    process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    model: args.find(arg => arg.startsWith('--model='))?.split('=')[1],
    field: args.find(arg => arg.startsWith('--field='))?.split('=')[1],
    all: args.includes('--all'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100'),
};

encryptExistingData(options).catch(console.error);
