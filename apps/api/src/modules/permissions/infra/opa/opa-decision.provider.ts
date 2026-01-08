import { DecisionProvider, SecurityContext } from '@morina/shared-kernel';
import { Injectable } from '@nestjs/common';
import { OpaService } from './opa.service';

@Injectable()
export class OpaDecisionProvider implements DecisionProvider {
  readonly name = 'Open Policy Agent';

  constructor(private readonly opaService: OpaService) {}

  async evaluate(
    action: string,
    subject: string,
    context: SecurityContext,
    resource?: any,
  ): Promise<boolean | null> {
    // Determine the OPA policy path based on subject
    // Example: sensors/allow or users/allow
    const path = `${subject.toLowerCase()}/allow`;
    
    // Evaluate via OPA service
    // OPA might return null if it doesn't have a policy for this path
    const result = await this.opaService.evaluatePolicy(path, {
      action,
      subject,
      user: context.user,
      environment: context.environment,
      resource,
    });

    return result;
  }
}
