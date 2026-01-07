import { describe, expect, it } from 'vitest';
import { BusinessRuleError } from '../../errors';
import { Email } from '../../value-objects/email';
import { UserRegistrationPolicy } from '../user-registration.policy';

describe('UserRegistrationPolicy', () => {
  describe('canRegister', () => {
    it('should allow registration with valid domain', () => {
      const email = Email.create('user@example.com');
      
      expect(UserRegistrationPolicy.canRegister(email)).toBe(true);
    });

    it('should block registration with temporary email domain', () => {
      const email = Email.create('user@tempmail.com');
      
      expect(UserRegistrationPolicy.canRegister(email)).toBe(false);
    });

    it('should block registration with guerrillamail domain', () => {
      const email = Email.create('user@guerrillamail.com');
      
      expect(UserRegistrationPolicy.canRegister(email)).toBe(false);
    });

    it('should block registration with 10minutemail domain', () => {
      const email = Email.create('user@10minutemail.com');
      
      expect(UserRegistrationPolicy.canRegister(email)).toBe(false);
    });
  });

  describe('requiresApproval', () => {
    it('should require approval for corporate domain', () => {
      const email = Email.create('user@morina.com');
      
      expect(UserRegistrationPolicy.requiresApproval(email)).toBe(true);
    });

    it('should require approval for morinalight domain', () => {
      const email = Email.create('user@morinalight.com');
      
      expect(UserRegistrationPolicy.requiresApproval(email)).toBe(true);
    });

    it('should not require approval for regular domain', () => {
      const email = Email.create('user@example.com');
      
      expect(UserRegistrationPolicy.requiresApproval(email)).toBe(false);
    });
  });

  describe('validateRegistration', () => {
    it('should not throw for valid email', () => {
      const email = Email.create('user@example.com');
      
      expect(() => UserRegistrationPolicy.validateRegistration(email)).not.toThrow();
    });

    it('should throw BusinessRuleError for blocked domain', () => {
      const email = Email.create('user@tempmail.com');
      
      expect(() => UserRegistrationPolicy.validateRegistration(email)).toThrow(
        BusinessRuleError
      );
    });

    it('should include domain in error message', () => {
      const email = Email.create('user@tempmail.com');
      
      try {
        UserRegistrationPolicy.validateRegistration(email);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessRuleError);
        expect((error as BusinessRuleError).message).toContain('tempmail.com');
      }
    });
  });

  describe('isCorporateEmail', () => {
    it('should return true for morina domain', () => {
      const email = Email.create('user@morina.com');
      
      expect(UserRegistrationPolicy.isCorporateEmail(email)).toBe(true);
    });

    it('should return true for morinalight domain', () => {
      const email = Email.create('user@morinalight.com');
      
      expect(UserRegistrationPolicy.isCorporateEmail(email)).toBe(true);
    });

    it('should return false for regular domain', () => {
      const email = Email.create('user@example.com');
      
      expect(UserRegistrationPolicy.isCorporateEmail(email)).toBe(false);
    });
  });
});
