import { PrismaClient } from '@prisma/client';
import { CERTIFICATIONS } from '../apps/web/src/components/certifications/constants';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding certifications...');

    for (const cert of CERTIFICATIONS) {
        await prisma.certification.upsert({
            where: { id: cert.id },
            update: {
                title: cert.title,
                description: cert.description,
                category: cert.category,
                icon: cert.icon,
                benefits: cert.details?.benefits || [],
                evidence: cert.details?.evidence || [],
                baseScore: cert.details?.score || 0,
                isActive: true,
            },
            create: {
                id: cert.id,
                title: cert.title,
                description: cert.description,
                category: cert.category,
                icon: cert.icon,
                benefits: cert.details?.benefits || [],
                evidence: cert.details?.evidence || [],
                baseScore: cert.details?.score || 0,
                isActive: true,
            }
        });
        console.log(`- Seeded certification: ${cert.title}`);
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
