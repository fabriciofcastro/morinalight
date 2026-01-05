import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper functions
const randomNumber = (min: number, max: number) => faker.number.int({ min, max });
const randomFloat = (min: number, max: number, precision: number = 2) =>
    faker.number.float({ min, max, fractionDigits: precision });

/**
 * Update analytics data to simulate ongoing business activity
 * This can be run as a cron job to keep data fresh
 */
async function updateAnalyticsData() {
    console.log('🔄 Updating analytics data...');

    // Get first organization
    const org = await prisma.organization.findFirst();
    if (!org) {
        console.error('❌ No organization found.');
        return;
    }

    const orgId = org.id;
    console.log(`📊 Updating analytics for: ${org.name} (${orgId})`);

    // ============================================================================
    // UPDATE SALES METRICS - Add today's data
    // ============================================================================
    console.log('💰 Updating sales metrics...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenue = randomFloat(2000, 8000);

    await prisma.salesMetric.upsert({
        where: {
            orgId_date_period: {
                orgId,
                date: today,
                period: 'daily'
            }
        },
        create: {
            orgId,
            date: today,
            period: 'daily',
            revenue,
            orders: randomNumber(5, 20),
            target: 5000,
            onlineRevenue: revenue * 0.45,
            retailRevenue: revenue * 0.35,
            b2bRevenue: revenue * 0.20,
            profit: revenue * 0.25
        },
        update: {
            revenue,
            orders: randomNumber(5, 20),
            onlineRevenue: revenue * 0.45,
            retailRevenue: revenue * 0.35,
            b2bRevenue: revenue * 0.20,
            profit: revenue * 0.25
        }
    });

    console.log('✅ Sales metrics updated');

    // ============================================================================
    // UPDATE INVENTORY METRICS
    // ============================================================================
    console.log('📦 Updating inventory metrics...');

    const categories = await prisma.inventoryMetric.findMany({
        where: { orgId }
    });

    for (const category of categories) {
        // Simulate small changes in inventory
        const valueChange = randomFloat(-5000, 5000);
        const itemChange = randomNumber(-10, 10);

        await prisma.inventoryMetric.update({
            where: { id: category.id },
            data: {
                totalValue: Math.max(10000, category.totalValue + valueChange),
                itemCount: Math.max(10, category.itemCount + itemChange),
                turnoverRate: randomFloat(40, 95),
                lowStockItems: randomNumber(0, 20),
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Inventory metrics updated');

    // ============================================================================
    // UPDATE CUSTOMER METRICS
    // ============================================================================
    console.log('👥 Updating customer metrics...');

    const segments = await prisma.customerMetric.findMany({
        where: { orgId }
    });

    for (const segment of segments) {
        // Simulate customer growth/churn
        const countChange = randomNumber(-5, 10);
        const newCount = Math.max(10, segment.count + countChange);

        await prisma.customerMetric.update({
            where: { id: segment.id },
            data: {
                count: newCount,
                totalRevenue: newCount * segment.avgOrderValue * randomFloat(0.9, 1.1),
                avgOrderValue: segment.avgOrderValue * randomFloat(0.95, 1.05),
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Customer metrics updated');

    // ============================================================================
    // UPDATE SUPPLIER METRICS
    // ============================================================================
    console.log('🚚 Updating supplier metrics...');

    const suppliers = await prisma.supplierMetric.findMany({
        where: { orgId }
    });

    for (const supplier of suppliers) {
        await prisma.supplierMetric.update({
            where: { id: supplier.id },
            data: {
                onTimeDelivery: Math.min(100, Math.max(70, supplier.onTimeDelivery + randomFloat(-2, 2))),
                quality: Math.min(100, Math.max(70, supplier.quality + randomFloat(-2, 2))),
                totalOrders: supplier.totalOrders + randomNumber(0, 5),
                lastUpdated: new Date()
            }
        });
    }

    console.log('✅ Supplier metrics updated');

    // ============================================================================
    // ADD NEW ACTIVITY LOG ENTRIES
    // ============================================================================
    console.log('📋 Adding new activity...');

    const activityTypes = ['order', 'stock', 'customer', 'notification'];
    const activityTemplates = {
        order: [
            { title: 'Novo Pedido #{id}', description: 'Cliente: {customer} - R$ {value}' },
            { title: 'Pedido #{id} Aprovado', description: 'Valor total: R$ {value}' },
        ],
        stock: [
            { title: 'Alerta de Estoque Baixo', description: '{product} - Apenas {qty} unidades' },
            { title: 'Reposição de Estoque', description: '{product} - {qty} unidades adicionadas' },
        ],
        customer: [
            { title: 'Novo Cliente', description: '{customer} cadastrado' },
        ],
        notification: [
            { title: 'Meta Atingida', description: 'Vendas do dia superaram a meta' },
        ]
    };

    // Add 3 new activities
    for (let i = 0; i < 3; i++) {
        const type = faker.helpers.arrayElement(activityTypes);
        const template = faker.helpers.arrayElement(activityTemplates[type as keyof typeof activityTemplates]);

        const title = template.title
            .replace('{id}', randomNumber(1000, 9999).toString())
            .replace('{customer}', faker.person.fullName())
            .replace('{product}', faker.commerce.productName());

        const description = template.description
            .replace('{customer}', faker.person.fullName())
            .replace('{value}', randomFloat(100, 5000).toFixed(2))
            .replace('{product}', faker.commerce.productName())
            .replace('{qty}', randomNumber(1, 50).toString());

        await prisma.activityLog.create({
            data: {
                orgId,
                type,
                title,
                description,
                timestamp: new Date()
            }
        });
    }

    // Delete old activities (keep only last 50)
    const oldActivities = await prisma.activityLog.findMany({
        where: { orgId },
        orderBy: { timestamp: 'desc' },
        skip: 50
    });

    if (oldActivities.length > 0) {
        await prisma.activityLog.deleteMany({
            where: {
                id: {
                    in: oldActivities.map(a => a.id)
                }
            }
        });
    }

    console.log('✅ Activity log updated');
    console.log('🎉 Analytics data update completed!');
}

updateAnalyticsData()
    .catch((e) => {
        console.error('❌ Error updating analytics:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
