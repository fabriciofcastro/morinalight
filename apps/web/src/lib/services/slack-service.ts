interface SlackMessage {
    text: string;
    blocks?: any[];
}

export const slackService = {
    async send(message: string | SlackMessage) {
        const webhookUrl = process.env.SLACK_WEBHOOK_SECURITY;

        if (!webhookUrl) {
            console.warn('[SlackService] SLACK_WEBHOOK_SECURITY not configured. Message not sent.');
            return false;
        }

        const payload = typeof message === 'string' ? { text: message } : message;

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(`[SlackService] Failed to send message: ${response.status} ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[SlackService] Failed to send message:', error);
            return false;
        }
    }
};
