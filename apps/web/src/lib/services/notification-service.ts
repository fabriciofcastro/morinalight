/**
 * Notification Service
 * 
 * Serviço de notificações por email e SMS
 * Usa Resend para emails
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotification {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}

export interface SMSNotification {
    to: string;
    message: string;
}

export interface SecurityAlertEmailData {
    alertType: string;
    severity: string;
    description: string;
    userEmail: string;
    userName?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

class NotificationService {
    private defaultFrom = process.env.SECURITY_ADMIN_EMAIL || 'security@morinalight.com';

    /**
     * Envia email genérico
     */
    async sendEmail(notification: EmailNotification): Promise<boolean> {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Notification] RESEND_API_KEY not configured, skipping email');
            return false;
        }

        try {
            const { data, error } = await resend.emails.send({
                from: notification.from || this.defaultFrom,
                to: Array.isArray(notification.to) ? notification.to : [notification.to],
                subject: notification.subject,
                html: notification.html,
            });

            if (error) {
                console.error('[Notification] Email send error:', error);
                return false;
            }

            console.log('[Notification] Email sent successfully:', data?.id);
            return true;
        } catch (error) {
            console.error('[Notification] Email send exception:', error);
            return false;
        }
    }

    /**
     * Envia alerta de segurança por email
     */
    async sendSecurityAlert(alertData: SecurityAlertEmailData): Promise<boolean> {
        const html = this.generateSecurityAlertHTML(alertData);

        return this.sendEmail({
            to: process.env.SECURITY_ADMIN_EMAIL || 'admin@morinalight.com',
            subject: `🚨 SECURITY ALERT: ${alertData.alertType} - ${alertData.severity.toUpperCase()}`,
            html,
        });
    }

    /**
     * Envia múltiplos alertas de segurança em um único email
     */
    async sendBatchSecurityAlerts(alerts: SecurityAlertEmailData[]): Promise<boolean> {
        if (alerts.length === 0) return false;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🚨 Security Alerts</h1>
                    <p style="margin: 10px 0 0 0;">${alerts.length} Critical Security Event(s) Detected</p>
                </div>
                
                <div style="padding: 20px; background: #f9fafb;">
                    ${alerts.map((alert, index) => this.generateSecurityAlertHTML(alert, index + 1)).join('<hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e7eb;">')}
                </div>
                
                <div style="background: #1f2937; color: white; padding: 15px; text-align: center;">
                    <p style="margin: 0; font-size: 12px;">
                        MorinaLight Security System | ${new Date().toISOString()}
                    </p>
                </div>
            </div>
        `;

        return this.sendEmail({
            to: process.env.SECURITY_ADMIN_EMAIL || 'admin@morinalight.com',
            subject: `🚨 CRITICAL: ${alerts.length} Security Alerts Detected`,
            html,
        });
    }

    /**
     * Gera HTML para alerta de segurança
     */
    private generateSecurityAlertHTML(alertData: SecurityAlertEmailData, index?: number): string {
        const severityColors = {
            critical: '#dc2626',
            high: '#ea580c',
            medium: '#ca8a04',
            low: '#65a30d'
        };

        const color = severityColors[alertData.severity as keyof typeof severityColors] || '#6b7280';

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${index ? `<h2 style="color: #1f2937;">Alert #${index}</h2>` : ''}
                
                <div style="background: ${color}; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0; font-size: 20px;">${alertData.alertType.replace(/_/g, ' ').toUpperCase()}</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Severity: ${alertData.severity.toUpperCase()}</p>
                </div>
                
                <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Description:</td>
                            <td style="padding: 8px 0; color: #6b7280;">${alertData.description}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">User:</td>
                            <td style="padding: 8px 0; color: #6b7280;">${alertData.userName || alertData.userEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                            <td style="padding: 8px 0; color: #6b7280;">${alertData.userEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Timestamp:</td>
                            <td style="padding: 8px 0; color: #6b7280;">${alertData.timestamp.toISOString()}</td>
                        </tr>
                        ${alertData.metadata ? `
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #374151; vertical-align: top;">Metadata:</td>
                            <td style="padding: 8px 0; color: #6b7280;">
                                <pre style="background: #f9fafb; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(alertData.metadata, null, 2)}</pre>
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Immediate Action Required</p>
                        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                            Please review this security alert and take appropriate action through the Security Dashboard.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Envia SMS (placeholder - requer integração com Twilio ou similar)
     */
    async sendSMS(notification: SMSNotification): Promise<boolean> {
        // TODO: Implementar integração com Twilio ou similar
        console.log('[Notification] SMS not implemented yet:', notification);
        return false;
    }

    /**
     * Envia notificação por múltiplos canais
     */
    async sendMultiChannel(channels: ('email' | 'sms')[], data: SecurityAlertEmailData): Promise<{
        email: boolean;
        sms: boolean;
    }> {
        const results = {
            email: false,
            sms: false
        };

        if (channels.includes('email')) {
            results.email = await this.sendSecurityAlert(data);
        }

        if (channels.includes('sms')) {
            results.sms = await this.sendSMS({
                to: process.env.SECURITY_ADMIN_PHONE || '',
                message: `SECURITY ALERT: ${data.alertType} - ${data.severity} - ${data.description}`
            });
        }

        return results;
    }
}

export const notificationService = new NotificationService();
