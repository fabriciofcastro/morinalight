/**
 * Email Service Provider via Resend
 * Free Tier Limit: 3000 emails/month, 100/day.
 */
import { Resend } from 'resend';

export class EmailService {
    private client: Resend | null = null;
    private fromEmail: string;

    constructor() {
        // Safe initialization: Check for API Key
        const apiKey = process.env.RESEND_API_KEY;

        if (apiKey) {
            this.client = new Resend(apiKey);
        } else {
            // Warn only once in server logs
            if (typeof window === 'undefined') {
                console.warn("[EmailService] RESEND_API_KEY is missing. Emails will be logged to console only.");
            }
        }

        this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    }

    /**
     * Sends an email
     */
    async send(params: {
        to: string | string[];
        subject: string;
        html: string;
        text?: string;
        attachments?: { filename: string; content: Buffer | string }[];
    }) {
        // Mock Mode if no client
        if (!this.client) {
            console.log(`[EmailService] Mock Send (Key Missing):
              To: ${params.to}
              Subject: ${params.subject}
              Attachments: ${params.attachments?.length || 0}
            `);
            return { id: 'mock-id', success: true };
        }

        try {
            const data = await this.client.emails.send({
                from: this.fromEmail,
                to: params.to,
                subject: params.subject,
                html: params.html,
                text: params.text,
                attachments: params.attachments,
            });

            if (data.error) {
                console.error("[EmailService] Resend API Error:", data.error);
                throw new Error(data.error.message);
            }

            console.log(`[EmailService] Sent email to ${params.to}, ID: ${data.data?.id}`);
            return { id: data.data?.id, success: true };
        } catch (error) {
            console.error("[EmailService] Failed to send:", error);
            throw error;
        }
    }
}

// Singleton export
export const emailService = new EmailService();
