import { ValidationError } from "../errors";
import { Email } from "./email";

/**
 * Credentials Value Object
 */
export class Credentials {
  private constructor(
    public readonly email: Email,
    public readonly password?: string
  ) {}

  static create(email: string, password?: string): Credentials {
    const emailVO = Email.create(email);

    if (password && password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters", "password");
    }

    return new Credentials(emailVO, password);
  }
}
