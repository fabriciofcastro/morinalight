import type { AnomalyDetectionResult, LoginAnomalyEvent } from "./login-anomaly-detector";

export type AlertChannel = "slack" | "email" | "both";

export type AlertConfig = {
  slackWebhookUrl?: string;
  emailFrom?: string;
  emailTo?: string[];
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
};

export class AlertService {
  private config: AlertConfig;

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async sendAlert(
    event: LoginAnomalyEvent,
    anomaly: AnomalyDetectionResult,
    channel: AlertChannel = "both",
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    if ((channel === "slack" || channel === "both") && this.config.slackWebhookUrl) {
      promises.push(this.sendSlackAlert(event, anomaly));
    }

    if ((channel === "email" || channel === "both") && this.config.emailTo) {
      promises.push(this.sendEmailAlert(event, anomaly));
    }

    await Promise.allSettled(promises);
  }

  private async sendSlackAlert(
    event: LoginAnomalyEvent,
    anomaly: AnomalyDetectionResult,
  ): Promise<void> {
    try {
      const { IncomingWebhook } = await import("@slack/webhook");
      const webhook = new IncomingWebhook(this.config.slackWebhookUrl!);

      const color = this.getSeverityColor(anomaly.severity);
      const emoji = this.getSeverityEmoji(anomaly.severity);

      await webhook.send({
        text: `${emoji} *Anomalia de Segurança Detectada*`,
        attachments: [
          {
            color,
            fields: [
              {
                title: "Severidade",
                value: anomaly.severity.toUpperCase(),
                short: true,
              },
              {
                title: "Usuário",
                value: event.email,
                short: true,
              },
              {
                title: "IP",
                value: event.ip,
                short: true,
              },
              {
                title: "Status",
                value: event.success ? "✅ Sucesso" : "❌ Falha",
                short: true,
              },
              {
                title: "Razão",
                value: anomaly.reason || "N/A",
                short: false,
              },
              {
                title: "Ação Recomendada",
                value: anomaly.shouldBlock
                  ? "🔒 *BLOQUEIO AUTOMÁTICO ATIVADO*"
                  : "⚠️ Monitorar atividade",
                short: false,
              },
            ],
            footer: "Morina Security System",
            ts: Math.floor(event.timestamp.getTime() / 1000).toString(),
          },
        ],
      });

      console.log("✅ [ALERT] Slack notification sent successfully");
    } catch (error) {
      console.error("❌ [ALERT] Failed to send Slack notification:", error);
    }
  }

  private async sendEmailAlert(
    event: LoginAnomalyEvent,
    anomaly: AnomalyDetectionResult,
  ): Promise<void> {
    try {
      const nodemailer = await import("nodemailer");

      const transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPassword,
        },
      });

      const htmlContent = this.generateEmailHTML(event, anomaly);

      await transporter.sendMail({
        from: this.config.emailFrom,
        to: this.config.emailTo,
        subject: `🚨 [${anomaly.severity.toUpperCase()}] Anomalia de Segurança Detectada`,
        html: htmlContent,
      });

      console.log("✅ [ALERT] Email notification sent successfully");
    } catch (error) {
      console.error("❌ [ALERT] Failed to send email notification:", error);
    }
  }

  private generateEmailHTML(event: LoginAnomalyEvent, anomaly: AnomalyDetectionResult): string {
    const severityColor = this.getSeverityColor(anomaly.severity);
    const emoji = this.getSeverityEmoji(anomaly.severity);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid ${severityColor};
    }
    .header h1 {
      margin: 0;
      color: ${severityColor};
      font-size: 24px;
    }
    .severity-badge {
      display: inline-block;
      padding: 8px 16px;
      background: ${severityColor};
      color: white;
      border-radius: 4px;
      font-weight: bold;
      margin: 10px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid ${severityColor};
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .reason-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .action-box {
      background: ${anomaly.shouldBlock ? "#f8d7da" : "#d1ecf1"};
      border: 1px solid ${anomaly.shouldBlock ? "#f5c6cb" : "#bee5eb"};
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} Anomalia de Segurança Detectada</h1>
      <div class="severity-badge">${anomaly.severity.toUpperCase()}</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Usuário</div>
        <div class="info-value">${event.email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">IP Address</div>
        <div class="info-value">${event.ip}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">${event.success ? "✅ Sucesso" : "❌ Falha"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Timestamp</div>
        <div class="info-value">${event.timestamp.toLocaleString("pt-BR")}</div>
      </div>
    </div>

    <div class="reason-box">
      <strong>Razão da Anomalia:</strong><br>
      ${anomaly.reason || "N/A"}
    </div>

    <div class="action-box">
      <strong>${anomaly.shouldBlock ? "🔒 BLOQUEIO AUTOMÁTICO ATIVADO" : "⚠️ Ação Recomendada"}:</strong><br>
      ${
        anomaly.shouldBlock
          ? "A conta foi bloqueada automaticamente. Contate o usuário para verificação."
          : "Monitore a atividade deste usuário. Considere contato direto se o comportamento persistir."
      }
    </div>

    <div class="footer">
      <p>Este é um alerta automático do <strong>Morina Security System</strong></p>
      <p>Para mais informações, acesse o painel de segurança.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "#dc3545";
      case "high":
        return "#fd7e14";
      case "medium":
        return "#ffc107";
      case "low":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⚡";
      case "low":
        return "ℹ️";
      default:
        return "📊";
    }
  }
}

// Singleton instance
let alertServiceInstance: AlertService | null = null;

export function getAlertService(): AlertService {
  if (!alertServiceInstance) {
    alertServiceInstance = new AlertService({
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      emailFrom: process.env.ALERT_EMAIL_FROM || "security@morina.ai",
      emailTo: process.env.ALERT_EMAIL_TO?.split(",") || [],
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
    });
  }
  return alertServiceInstance;
}
