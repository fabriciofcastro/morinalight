import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Criar organização padrão
    const org = await prisma.organization.upsert({
        where: { id: 'org-demo' },
        update: {},
        create: {
            id: 'org-demo',
            name: 'Morina Demo',
            slug: 'morina-demo',
        },
    });

    console.log('✅ Organização criada:', org.name);

    // Hash da senha: Admin@123
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Criar usuário admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@morina.com' },
        update: {},
        create: {
            email: 'admin@morina.com',
            displayName: 'Administrador',
            passwordHash: passwordHash,
            status: 'active',
            termsAcceptedAt: new Date(),
            memberships: {
                create: {
                    organizationId: org.id,
                    role: 'owner',
                },
            },
        },
    });

    console.log('✅ Usuário admin criado:', admin.email);
    console.log('');
    console.log('📋 Credenciais de login:');
    console.log('   Email: admin@morina.com');
    console.log('   Senha: Admin@123');
    console.log('');

    // Criar super administrador Fabricio
    const fabricioPasswordHash = await bcrypt.hash('67318696Il!@#', 10);
    const fabricio = await prisma.user.upsert({
        where: { email: 'fabricio@morina.com' },
        update: {
            passwordHash: fabricioPasswordHash,
            status: 'active',
        },
        create: {
            email: 'fabricio@morina.com',
            displayName: 'Fabricio Castro',
            passwordHash: fabricioPasswordHash,
            status: 'active',
            memberships: {
                create: {
                    organizationId: org.id,
                    role: 'owner',
                },
            },
        },
    });

    console.log('✅ Super Administrador criado:', fabricio.email);
    console.log('');
    console.log('👑 Super Admin Credentials:');
    console.log('   Email: fabricio@morina.com');
    console.log('   Senha: 67318696Il!@#');
    console.log('');

    // ===========================================
    // AI GATEWAY SEED
    // ===========================================
    console.log('🤖 Seeding AI Gateway...');

    // 1. Google Gemini Provider
    const geminiProvider = await prisma.aiProvider.upsert({
        where: { providerKey: 'gemini' },
        update: {},
        create: {
            name: 'Google Gemini',
            providerKey: 'gemini',
            apiKey: process.env.GOOGLE_API_KEY || 'sks-mock-key-123456', // Fallback for dev
            isActive: true,
            config: {
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
            }
        }
    });

    console.log('   Provider: Google Gemini created/updated');

    // 2. Agents
    const agents = [
        {
            name: 'Assistente Geral',
            slug: 'general_assistant',
            description: 'Assistente para dúvidas gerais de gestão empresarial.',
            model: 'gemini-1.5-flash',
            systemPrompt: 'Você é um assistente especialista em gestão empresarial. Ajude o usuário com dúvidas sobre a plataforma e administração de empresas.',
            providerId: geminiProvider.id
        },
        {
            name: 'Consultor Fiscal',
            slug: 'fiscal_advisor',
            description: 'Especialista em contabilidade e tributação brasileira.',
            model: 'gemini-1.5-flash',
            systemPrompt: 'Você é um consultor fiscal sênior. O usuário consultará sobre regimes tributários (Simples Nacional, Presumido, Real), alíquotas e classificação fiscal. Seja preciso e cite legislações quando pertinente.',
            providerId: geminiProvider.id
        }
    ];

    for (const agent of agents) {
        await prisma.aiAgent.upsert({
            where: { slug: agent.slug },
            update: {
                systemPrompt: agent.systemPrompt, // Update prompt if changed
                model: agent.model
            },
            create: agent
        });
        console.log(`   Agent: ${agent.name} ready`);
    }

    // ===========================================
    // BENCHMARK DATA SEED (Phase 5)
    // ===========================================
    console.log('📊 Seeding Benchmark Data...');

    const benchmarks = [
        // Approval Time (in milliseconds)
        { metricType: 'approval_time', industry: 'all', companySize: 'all', percentile: 25, value: 3600000, period: '2024-Q4' }, // 1 hour
        { metricType: 'approval_time', industry: 'all', companySize: 'all', percentile: 50, value: 7200000, period: '2024-Q4' }, // 2 hours
        { metricType: 'approval_time', industry: 'all', companySize: 'all', percentile: 75, value: 14400000, period: '2024-Q4' }, // 4 hours
        { metricType: 'approval_time', industry: 'all', companySize: 'all', percentile: 90, value: 28800000, period: '2024-Q4' }, // 8 hours

        // Data Completeness (percentage)
        { metricType: 'data_completeness', industry: 'all', companySize: 'all', percentile: 25, value: 60, period: '2024-Q4' },
        { metricType: 'data_completeness', industry: 'all', companySize: 'all', percentile: 50, value: 75, period: '2024-Q4' },
        { metricType: 'data_completeness', industry: 'all', companySize: 'all', percentile: 75, value: 85, period: '2024-Q4' },
        { metricType: 'data_completeness', industry: 'all', companySize: 'all', percentile: 90, value: 95, period: '2024-Q4' },

        // Feature Adoption (number of features used)
        { metricType: 'feature_adoption', industry: 'all', companySize: 'all', percentile: 25, value: 3, period: '2024-Q4' },
        { metricType: 'feature_adoption', industry: 'all', companySize: 'all', percentile: 50, value: 5, period: '2024-Q4' },
        { metricType: 'feature_adoption', industry: 'all', companySize: 'all', percentile: 75, value: 8, period: '2024-Q4' },
        { metricType: 'feature_adoption', industry: 'all', companySize: 'all', percentile: 90, value: 12, period: '2024-Q4' },
    ];

    for (const benchmark of benchmarks) {
        await prisma.benchmarkMetric.upsert({
            where: {
                metricType_industry_companySize_percentile_period: {
                    metricType: benchmark.metricType,
                    industry: benchmark.industry,
                    companySize: benchmark.companySize,
                    percentile: benchmark.percentile,
                    period: benchmark.period
                }
            },
            update: { value: benchmark.value },
            create: benchmark
        });
    }

    console.log('   Benchmark data seeded');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao fazer seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
