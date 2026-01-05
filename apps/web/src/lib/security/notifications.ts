/**
 * Security Notification Service
 * 
 * Handles multi-channel notifications for security events
 */

import { logger } from "@/lib/observability";

export type NotificationChannel = "email" | "sms" | "slack" | "push";

export interface SecurityNotificationOptions {
    to: string;
    subject?: string;
    message: string;
    metadata?: Record<string, any>;
    priority?: "low" | "medium" | "high" | "critical";
}

import { emailService } from "@/lib/services/email-service";
import { slackService } from "@/lib/services/slack-service";



class SecurityNotificationService {
    /**
     * Sends a notification through multiple channels
     */
    async sendMultiple(channels: NotificationChannel[], options: SecurityNotificationOptions): Promise<void> {
        await Promise.all(channels.map(channel => this.send(channel, options)));
    }

    /**
     * Sends a notification through a specific channel
     */
    async send(channel: NotificationChannel, options: SecurityNotificationOptions): Promise<void> {
        const { to, subject, message, priority = "medium" } = options;

        logger.info(`Sending security notification via ${channel}`, { to, subject, priority });

        try {
            switch (channel) {
                case "email":
                    await emailService.send({
                        to,
                        subject: subject || "Security Alert",
                        html: message,
                    });
                    break;
                case "slack":
                    // Format message for Slack if needed, or send as text
                    const slackMsg = priority === 'critical' ? `🚨 *CRITICAL ALERT*\n${message}` : message;
                    await slackService.send(slackMsg);
                    break;
                default:
                    logger.warn(`Channel ${channel} not fully implemented.`);
            }
        } catch (error) {
            logger.error(`Failed to send security notification via ${channel}`, error as Error);
        }
    }
}

export const securityNotificationService = new SecurityNotificationService();
