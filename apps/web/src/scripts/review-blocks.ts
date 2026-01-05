#!/usr/bin/env node
/**
 * Review Blocks Script
 * 
 * Script para revisar usuários e IPs bloqueados
 * 
 * Uso:
 *   node scripts/review-blocks.ts
 *   node scripts/review-blocks.ts --export blocks.csv
 *   node scripts/review-blocks.ts --stats
 */

import { getPrismaClient } from '../lib/prisma';
import { writeFileSync } from 'fs';

interface ReviewOptions {
    export?: string;
    stats?: boolean;
}

async function reviewBlocks(options: ReviewOptions = {}) {
    console.log('🔒 Security Blocks Review');
    console.log('========================\n');

    const prisma = await getPrismaClient();
    if (!prisma) {
        console.error('❌ Database unavailable');
        process.exit(1);
    }

    const now = new Date();

    // Buscar usuários bloqueados
    const blockedUsers = await prisma.user.findMany({
        where: {
            blockedUntil: {
                gte: now
            }
        },
        select: {
            id: true,
            email: true,
            displayName: true,
            blockedUntil: true,
            lastLoginIp: true,
            lastLoginAt: true
        },
        orderBy: {
            blockedUntil: 'desc'
        }
    });

    // Buscar IPs bloqueados
    const blockedIPs = await prisma.blockedIP.findMany({
        where: {
            OR: [
                { expiresAt: { gte: now } },
                { expiresAt: null } // Bloqueios permanentes
            ]
        },
        orderBy: {
            blockedAt: 'desc'
        }
    });

    // Estatísticas
    if (options.stats) {
        console.log('📊 Statistics');
        console.log('─'.repeat(80));
        console.log(`Total Blocked Users: ${blockedUsers.length}`);
        console.log(`Total Blocked IPs: ${blockedIPs.length}`);

        const expiringSoon = blockedUsers.filter((u: any) => {
            const timeLeft = u.blockedUntil!.getTime() - now.getTime();
            return timeLeft < 60 * 60 * 1000; // Less than 1 hour
        });
        console.log(`Users expiring in < 1 hour: ${expiringSoon.length}`);

        const permanentBlocks = blockedIPs.filter((ip: any) => !ip.expiresAt);
        console.log(`Permanent IP blocks: ${permanentBlocks.length}`);
        console.log('');
    }

    // Exibir usuários bloqueados
    if (blockedUsers.length > 0) {
        console.log('👤 Blocked Users');
        console.log('─'.repeat(80));

        blockedUsers.forEach((user: any, index: number) => {
            const timeLeft = user.blockedUntil!.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            console.log(`\n[${index + 1}] ${user.displayName || user.email}`);
            console.log(`    ID: ${user.id}`);
            console.log(`    Email: ${user.email}`);
            console.log(`    Blocked Until: ${user.blockedUntil!.toISOString()}`);
            console.log(`    Time Remaining: ${hoursLeft}h ${minutesLeft}m`);
            console.log(`    Last Login IP: ${user.lastLoginIp || 'N/A'}`);
            console.log(`    Last Login: ${user.lastLoginAt?.toISOString() || 'N/A'}`);
        });

        console.log('\n' + '─'.repeat(80) + '\n');
    } else {
        console.log('✅ No blocked users\n');
    }

    // Exibir IPs bloqueados
    if (blockedIPs.length > 0) {
        console.log('🌐 Blocked IPs');
        console.log('─'.repeat(80));

        blockedIPs.forEach((ip: any, index: number) => {
            const isPermanent = !ip.expiresAt;
            let timeInfo = 'Permanent';

            if (!isPermanent) {
                const timeLeft = ip.expiresAt!.getTime() - now.getTime();
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                timeInfo = `${hoursLeft}h ${minutesLeft}m remaining`;
            }

            console.log(`\n[${index + 1}] ${ip.ip}`);
            console.log(`    ID: ${ip.id}`);
            console.log(`    Blocked At: ${ip.blockedAt.toISOString()}`);
            console.log(`    Expires: ${isPermanent ? 'Never' : ip.expiresAt!.toISOString()}`);
            console.log(`    Status: ${timeInfo}`);
            console.log(`    Reason: ${ip.reason || 'N/A'}`);
            console.log(`    Created By: ${ip.createdBy || 'System'}`);
        });

        console.log('\n' + '─'.repeat(80) + '\n');
    } else {
        console.log('✅ No blocked IPs\n');
    }

    // Exportar para CSV
    if (options.export) {
        const csvLines: string[] = [];

        // Header
        csvLines.push('Type,Identifier,Email/IP,Blocked At,Expires At,Reason,Status');

        // Users
        blockedUsers.forEach((user: any) => {
            const timeLeft = user.blockedUntil!.getTime() - now.getTime();
            const status = timeLeft > 0 ? 'Active' : 'Expired';
            csvLines.push(
                `User,${user.id},"${user.email}",${user.blockedUntil!.toISOString()},${user.blockedUntil!.toISOString()},"Security Alert",${status}`
            );
        });

        // IPs
        blockedIPs.forEach((ip: any) => {
            const status = !ip.expiresAt || ip.expiresAt > now ? 'Active' : 'Expired';
            csvLines.push(
                `IP,${ip.id},${ip.ip},${ip.blockedAt.toISOString()},${ip.expiresAt?.toISOString() || 'Never'},"${ip.reason || 'N/A'}",${status}`
            );
        });

        writeFileSync(options.export, csvLines.join('\n'));
        console.log(`📄 Exported to: ${options.export}\n`);
    }

    process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ReviewOptions = {
    export: args.find(arg => arg.startsWith('--export'))?.split('=')[1] ||
        (args.includes('--export') ? args[args.indexOf('--export') + 1] : undefined),
    stats: args.includes('--stats')
};

reviewBlocks(options).catch(console.error);
