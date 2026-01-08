import { authenticator } from "otplib";

/**
 * TOTP Service
 * Handles Time-based One-Time Password (TOTP) generation and verification
 * Used for Two-Factor Authentication (2FA)
 */
export class TotpService {
  /**
   * Generate a new TOTP secret (Base32 encoded)
   * This should be stored securely in the database
   */
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Verify a TOTP token against a secret
   * @param token - The 6-digit code from the user's authenticator app
   * @param secret - The user's stored TOTP secret
   * @returns true if the token is valid
   */
  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error("TOTP verification error:", error);
      return false;
    }
  }

  /**
   * Generate an otpauth:// URL for QR code generation
   * @param email - User's email address
   * @param secret - The TOTP secret
   * @param issuer - Application name (default: MORINA)
   */
  static generateOtpAuthUrl(email: string, secret: string, issuer = "MORINA"): string {
    return authenticator.keyuri(email, issuer, secret);
  }

  /**
   * Verify a backup code
   * @param code - The backup code provided by the user
   * @param backupCodes - Array of valid backup codes (should be hashed in production)
   * @returns true if the code is valid
   */
  static verifyBackupCode(code: string, backupCodes: string[]): boolean {
    return backupCodes.includes(code);
  }
}
