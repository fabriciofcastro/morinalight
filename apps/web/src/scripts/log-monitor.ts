#!/usr/bin/env node
/**
 * Log Monitor Script
 * 
 * Monitora logs do servidor em busca de alertas de segurança críticos
 * 
 * Uso:
 *   node scripts/log-monitor.ts
 *   node scripts/log-monitor.ts --follow  # Modo contínuo
 */

import { getPrismaClient } from '../src/lib/prisma';

interface MonitorOptions {
    follow?: boolean;
    interval?: number; // milliseconds
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

async function monitorLogs(options: MonitorOptions = {}) {
    const {
        follow = false,
        interval = 5000,
        severity = 'critical'
    } = options;

    console.log('🔍 Security Log Monitor');
    console.log('======================');
    console.log(`Monitoring for: ${severity} alerts`);
    console.log(`Mode: ${follow ? 'Continuous' : 'One-time'}`);
    console.log('');

    const prisma = await getPrismaClient();
    if (!prisma) {
        console.error('❌ Database unavailable');
        process.exit(1);
    }

    let lastCheck = new Date();

    const checkLogs = async () => {
        try {
            // Buscar alertas desde a última verificação
            const alerts = await prisma.securityAlert.findMany({
                where: {
                    severity: severity === 'critical' ? 'critical' : {
                        in: severity === 'high' ? ['high', 'critical'] :
                            severity === 'medium' ? ['medium', 'high', 'critical'] :
                                ['low', 'medium', 'high', 'critical']
                    },
                    createdAt: {
                        gte: lastCheck
                    }
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            displayName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            if (alerts.length > 0) {
                console.log(`\n🚨 ${alerts.length} new alert(s) detected at ${new Date().toISOString()}`);
                console.log('─'.repeat(80));

                alerts.forEach((alert, index) => {
                    const severityIcon = {
                        critical: '🔴',
                        high: '🟠',
                        medium: '🟡',
                        low: '🟢'
                    }[alert.severity] || '⚪';

                    console.log(`\n${severityIcon} [${index + 1}] ${alert.alertType.toUpperCase()}`);
                    console.log(`   Severity: ${alert.severity}`);
                    console.log(`   User: ${alert.user.displayName || alert.user.email}`);
                    console.log(`   Description: ${alert.description}`);
                    console.log(`   Time: ${alert.createdAt.toISOString()}`);
                    console.log(`   Acknowledged: ${alert.acknowledged ? 'Yes' : 'No'}`);

                    if (alert.metadata) {
                        console.log(`   Metadata: ${JSON.stringify(alert.metadata, null, 2)}`);
                    }
                });

                console.log('\n' + '─'.repeat(80));
            } else if (!follow) {
                console.log('✅ No new alerts found');
            }

            lastCheck = new Date();

        } catch (error) {
            console.error('❌ Error checking logs:', error);
        }
    };

    // Primeira verificação
    await checkLogs();

    if (follow) {
        console.log(`\n👁️  Monitoring continuously (checking every ${interval}ms)...`);
        console.log('Press Ctrl+C to stop\n');

        setInterval(checkLogs, interval);
    } else {
        process.exit(0);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: MonitorOptions = {
    follow: args.includes('--follow') || args.includes('-f'),
    interval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '5000'),
    severity: (args.find(arg => arg.startsWith('--severity='))?.split('=')[1] as any) || 'critical'
};

monitorLogs(options).catch(console.error);
