import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper functions
const randomNumber = (min: number, max: number) => faker.number.int({ min, max });
const randomFloat = (min: number, max: number, precision: number = 2) =>
    faker.number.float({ min, max, fractionDigits: precision });

async function seedAnalytics() {
    console.log('🌱 Seeding analytics data...');

    // Get first organization
    const org = await prisma.organization.findFirst();
    if (!org) {
        console.error('❌ No organization found. Please create an organization first.');
        return;
    }

    const orgId = org.id;
    console.log(`📊 Seeding analytics for organization: ${org.name} (${orgId})`);

    // ============================================================================
    // SALES METRICS
    // ============================================================================
    console.log('💰 Creating sales metrics...');

    // Create 12 months of monthly sales data
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1); // First day of month

        const revenue = randomFloat(40000, 120000);

        await prisma.salesMetric.upsert({
            where: {
                orgId_date_period: {
                    orgId,
                    date,
                    period: 'monthly'
                }
            },
            create: {
                orgId,
                date,
                period: 'monthly',
                revenue,
                orders: randomNumber(100, 300),
                target: 50000 + (i * 2000),
                onlineRevenue: revenue * 0.45,
                retailRevenue: revenue * 0.35,
                b2bRevenue: revenue * 0.20,
                profit: revenue * 0.25
            },
            update: {}
        });
    }

    // Create 30 days of daily sales data
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const revenue = randomFloat(2000, 8000);

        await prisma.salesMetric.upsert({
            where: {
                orgId_date_period: {
                    orgId,
                    date,
                    period: 'daily'
                }
            },
            create: {
                orgId,
                date,
                period: 'daily',
                revenue,
                orders: randomNumber(5, 20),
                target: 5000,
                onlineRevenue: revenue * 0.45,
                retailRevenue: revenue * 0.35,
                b2bRevenue: revenue * 0.20,
                profit: revenue * 0.25
            },
            update: {}
        });
    }

    console.log('✅ Sales metrics created');

    // ============================================================================
    // INVENTORY METRICS
    // ============================================================================
    console.log('📦 Creating inventory metrics...');

    const categories = ['Vestuário', 'Acessórios', 'Calçados', 'Tecidos', 'Aviamentos'];

    for (const category of categories) {
        await prisma.inventoryMetric.upsert({
            where: {
                orgId_category: {
                    orgId,
                    category
                }
            },
            create: {
                orgId,
                category,
                totalValue: randomFloat(30000, 200000),
                itemCount: randomNumber(50, 500),
                turnoverRate: randomFloat(40, 95),
                lowStockItems: randomNumber(0, 20)
            },
            update: {
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Inventory metrics created');

    // ============================================================================
    // CUSTOMER METRICS
    // ============================================================================
    console.log('👥 Creating customer metrics...');

    const segments = [
        { segment: 'VIP', color: '#8b5cf6', avgValue: 10000, countRange: [20, 50] },
        { segment: 'Premium', color: '#06b6d4', avgValue: 5000, countRange: [80, 150] },
        { segment: 'Regular', color: '#10b981', avgValue: 1500, countRange: [300, 600] },
        { segment: 'Novos', color: '#f59e0b', avgValue: 500, countRange: [150, 350] }
    ];

    for (const seg of segments) {
        const count = randomNumber(seg.countRange[0], seg.countRange[1]);
        const avgOrderValue = seg.avgValue + randomFloat(-seg.avgValue * 0.2, seg.avgValue * 0.2);

        await prisma.customerMetric.upsert({
            where: {
                orgId_segment: {
                    orgId,
                    segment: seg.segment
                }
            },
            create: {
                orgId,
                segment: seg.segment,
                count,
                totalRevenue: count * avgOrderValue,
                avgOrderValue,
                color: seg.color
            },
            update: {
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Customer metrics created');

    // ============================================================================
    // SUPPLIER METRICS
    // ============================================================================
    console.log('🚚 Creating supplier metrics...');

    const supplierNames = [
        'Fornecedor Premium Ltda',
        'Têxtil Brasil S.A.',
        'Aviamentos Express',
        'Tecidos Finos & Cia',
        'Distribuidora Nacional'
    ];

    for (const name of supplierNames) {
        await prisma.supplierMetric.upsert({
            where: {
                orgId_name: {
                    orgId,
                    name
                }
            },
            create: {
                orgId,
                name,
                onTimeDelivery: randomFloat(75, 99),
                quality: randomFloat(80, 99),
                totalOrders: randomNumber(50, 300)
            },
            update: {
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Supplier metrics created');

    // ============================================================================
    // PRODUCT METRICS
    // ============================================================================
    console.log('🏷️  Creating product metrics...');

    const products = [
        { name: 'Jaqueta Premium', category: 'Vestuário' },
        { name: 'Calça Social', category: 'Vestuário' },
        { name: 'Camisa Polo', category: 'Vestuário' },
        { name: 'Bolsa de Couro', category: 'Acessórios' },
        { name: 'Sapato Social', category: 'Calçados' },
        { name: 'Tênis Esportivo', category: 'Calçados' },
        { name: 'Cinto de Couro', category: 'Acessórios' },
        { name: 'Vestido Longo', category: 'Vestuário' }
    ];

    for (const product of products) {
        const unitsSold = randomNumber(50, 500);
        const pricePerUnit = randomFloat(50, 500);

        await prisma.productMetric.create({
            data: {
                orgId,
                name: product.name,
                category: product.category,
                unitsSold,
                revenue: unitsSold * pricePerUnit,
                period: '30d',
                periodDate: new Date()
            }
        });
    }

    console.log('✅ Product metrics created');

    // ============================================================================
    // ACTIVITY LOG
    // ============================================================================
    console.log('📋 Creating activity log...');

    const activityTypes = ['order', 'stock', 'customer', 'notification'];
    const activityTemplates = {
        order: [
            { title: 'Novo Pedido #{id}', description: 'Cliente: {customer} - R$ {value}' },
            { title: 'Pedido #{id} Aprovado', description: 'Valor total: R$ {value}' },
            { title: 'Pedido #{id} Enviado', description: 'Transportadora: {carrier}' }
        ],
        stock: [
            { title: 'Alerta de Estoque Baixo', description: '{product} - Apenas {qty} unidades' },
            { title: 'Reposição de Estoque', description: '{product} - {qty} unidades adicionadas' },
            { title: 'Estoque Crítico', description: '{product} abaixo do mínimo' }
        ],
        customer: [
            { title: 'Novo Cliente', description: '{customer} cadastrado' },
            { title: 'Cliente VIP', description: '{customer} atingiu status VIP' },
            { title: 'Aniversário de Cliente', description: '{customer} - Enviar cupom' }
        ],
        notification: [
            { title: 'Meta Atingida', description: 'Vendas do mês superaram a meta' },
            { title: 'Novo Fornecedor', description: '{supplier} cadastrado no sistema' },
            { title: 'Relatório Disponível', description: 'Relatório mensal de vendas pronto' }
        ]
    };

    for (let i = 0; i < 20; i++) {
        const type = faker.helpers.arrayElement(activityTypes);
        const template = faker.helpers.arrayElement(activityTemplates[type as keyof typeof activityTemplates]);

        const title = template.title
            .replace('{id}', randomNumber(1000, 9999).toString())
            .replace('{customer}', faker.person.fullName())
            .replace('{product}', faker.commerce.productName())
            .replace('{supplier}', faker.company.name())
            .replace('{carrier}', faker.company.name());

        const description = template.description
            .replace('{customer}', faker.person.fullName())
            .replace('{value}', randomFloat(100, 5000).toFixed(2))
            .replace('{product}', faker.commerce.productName())
            .replace('{qty}', randomNumber(1, 50).toString())
            .replace('{supplier}', faker.company.name())
            .replace('{carrier}', faker.company.name());

        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - (i * 30)); // 30 minutes apart

        await prisma.activityLog.create({
            data: {
                orgId,
                type,
                title,
                description,
                timestamp
            }
        });
    }

    console.log('✅ Activity log created');
    console.log('🎉 Analytics seeding completed!');
}

seedAnalytics()
    .catch((e) => {
        console.error('❌ Error seeding analytics:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
