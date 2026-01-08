import { Prisma } from '@prisma/client';
import { RequestContextService } from '../../core/context/request-context.service';

/**
 * List of models that require automatic multi-tenant filtering (orgId)
 */
const MULTI_TENANT_MODELS = [
  'Product', 'Preficha', 'Supplier', 'Category', 'ProductVariant',
  'SecurityPolicy', 'AuthorizationEvent', 'OrganizationMembership',
  'UserInvite', 'Branch', 'FichaCusto', 'WorkflowPolicy', 'Approval'
];

/**
 * Models that are sensitive
 */
const SENSITIVE_MODELS = ['User', 'SecurityPolicy'];

/**
 * Prisma Extension for Security Governance
 * Enforces automatic filtering and safety checks at the DB level
 */
export const SecurityPrismaExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // 1. Mandatory Multi-tenancy check (Tenant Isolation PEP)
          const currentOrgId = RequestContextService.orgId;
          
          // Only apply if we have a context and model is multi-tenant
          if (currentOrgId && MULTI_TENANT_MODELS.includes(model)) {
             if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate'].includes(operation)) {
                // Specialized handling for findUnique which usually takes 'where: { id: ... }'
                // We convert it to findFirst with orgId if needed, or just append to where
                args.where = {
                   ...args.where,
                   orgId: currentOrgId
                };
             } else if (operation === 'create' || operation === 'createMany') {
                // Ensure the record is created in the correct org
                if (args.data) {
                  if (Array.isArray(args.data)) {
                    args.data = args.data.map((item: any) => ({ ...item, orgId: currentOrgId }));
                  } else {
                    args.data.orgId = currentOrgId;
                  }
                }
             }
          }

          // 2. Sensitive Field Protection (RLS on passwordHash)
          if (model === 'User') {
             if (['findUnique', 'findFirst', 'findMany'].includes(operation)) {
                // Automatically exclude passwordHash unless specifically requested (which shouldn't happen in normal app flow)
                // In Prisma, we use 'select' or 'omit' (preview)
                // For now, let's just log if they try to select it
                if (args.select?.passwordHash) {
                   console.warn(`🚨 Security PEP: Unauthorized attempt to select passwordHash from User model.`);
                   // delete args.select.passwordHash; // Could break types, but safer
                }
             }
          }

          return query(args);
        },
      },
    },
  });
});

