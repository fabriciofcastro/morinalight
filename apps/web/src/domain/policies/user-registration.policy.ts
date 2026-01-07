import { BusinessRuleError } from '../errors';
import { Email } from '../value-objects';

/**
 * User Registration Policy
 * 
 * Encapsula regras de negócio relacionadas ao registro de usuários.
 * 
 * Regras:
 * - Não permitir emails de domínios temporários
 * - Emails corporativos podem requerer aprovação
 * - Validar domínios permitidos
 */

export class UserRegistrationPolicy {
  private static readonly BLOCKED_DOMAINS = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
  ];

  private static readonly CORPORATE_DOMAINS = [
    'morina.com',
    'morinalight.com',
  ];

  /**
   * Verifica se o usuário pode se registrar com este email
   */
  static canRegister(email: Email): boolean {
    const domain = email.getDomain();
    return !this.BLOCKED_DOMAINS.includes(domain);
  }

  /**
   * Verifica se o registro requer aprovação manual
   */
  static requiresApproval(email: Email): boolean {
    const domain = email.getDomain();
    return this.CORPORATE_DOMAINS.includes(domain);
  }

  /**
   * Valida se o email pode ser usado para registro
   * Lança exceção se não puder
   */
  static validateRegistration(email: Email): void {
    if (!this.canRegister(email)) {
      throw new BusinessRuleError(
        `Email domain ${email.getDomain()} is not allowed for registration`,
        'email_domain_blocked'
      );
    }
  }

  /**
   * Verifica se é um email corporativo
   */
  static isCorporateEmail(email: Email): boolean {
    const domain = email.getDomain();
    return this.CORPORATE_DOMAINS.includes(domain);
  }
}
