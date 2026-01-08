import type { MfaProvider } from "./mfa-provider.interface";

export class SmsMfaProvider implements MfaProvider {
  async sendCode(target: string, code: string): Promise<void> {
    // Zero Mocks: Em produção, isso usaria Twilio/SNS
    console.log(`📱 [SMS GATEWAY] Sending 2FA Code to ${target}: ${code}`);

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  supports(target: string): boolean {
    // Basic phone validation (E.164 or similar)
    return /^\+?[1-9]\d{1,14}$/.test(target);
  }
}
