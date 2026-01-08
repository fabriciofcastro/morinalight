import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PolicyVersioningService {
  private readonly logger = new Logger(PolicyVersioningService.name);

  constructor(private readonly prisma: any) {} // Should be PrismaService

  /**
   * Creates a new version of a security policy
   */
  async createVersion(policyId: string, userId: string): Promise<void> {
    const policy = await this.prisma.securityPolicy.findUnique({
      where: { id: policyId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    });

    if (!policy) throw new Error('Policy not found');

    const nextVersion = (policy.versions[0]?.version || 0) + 1;

    const version = await this.prisma.securityPolicyVersion.create({
      data: {
        policyId,
        version: nextVersion,
        effect: policy.effect,
        action: policy.action,
        subject: policy.subject,
        conditions: policy.conditions,
        createdBy: userId,
      }
    });

    // Update current version
    await this.prisma.securityPolicy.update({
      where: { id: policyId },
      data: { currentVersionId: version.id }
    });

    this.logger.info(`Policy ${policyId} updated to version ${nextVersion}`);
  }

  /**
   * Rolls back a policy to a specific version
   */
  async rollback(policyId: string, versionNumber: number, userId: string): Promise<void> {
    const targetVersion = await this.prisma.securityPolicyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNumber } }
    });

    if (!targetVersion) throw new Error('Version not found');

    await this.prisma.$transaction([
      this.prisma.securityPolicy.update({
        where: { id: policyId },
        data: {
          effect: targetVersion.effect,
          action: targetVersion.action,
          subject: targetVersion.subject,
          conditions: targetVersion.conditions,
          currentVersionId: targetVersion.id,
        }
      }),
      // Log rollback event
      this.prisma.authorizationEvent.create({
        data: {
          orgId: (await this.prisma.securityPolicy.findUnique({ where: { id: policyId } })).orgId,
          userId,
          type: 'POLICY_ROLLED_BACK',
          payload: { policyId, version: versionNumber },
        }
      })
    ]);
  }
}
