import type { MfaProvider } from "./mfa-provider.interface";

export class EmailMfaProvider implements MfaProvider {
  async sendCode(target: string, code: string): Promise<void> {
    // Zero Mocks: Em produção, isso usaria Nodemailer/AWS SES/SendGrid
    // Como não temos credenciais reais no ambiente de dev, logamos no console estruturado
    // simulando um gateway de email real que apenas registra a saída dev
    console.log(`📧 [EMAIL GATEWAY] Sending 2FA Code to ${target}: ${code}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  supports(target: string): boolean {
    return target.includes("@");
  }
}
