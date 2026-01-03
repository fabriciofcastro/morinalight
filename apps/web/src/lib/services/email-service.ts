import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    text?: string;
}

export const emailService = {
    async send({ to, subject, html, from, text }: SendEmailOptions) {
        if (!resend) {
            console.warn('[EmailService] RESEND_API_KEY not configured. Email not sent.');
            console.log(`[EmailService] Mock Send: To=${to}, Subject=${subject}`);
            return false;
        }

        try {
            const data = await resend.emails.send({
                from: from || 'MorinaLight Security <security@morinalight.com>',
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>?/gm, ''), // Simple strip tags
            });
            console.log(`[EmailService] Email sent to ${to}. ID: ${data.data?.id}`);
            return true;
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
            return false;
        }
    }
};
