/**
 * ESLint Custom Rule: No Application Infrastructure Imports
 * 
 * Garante que a camada Application não importe de Infrastructure.
 * Application deve depender apenas de abstrações (ports), não de implementações.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that application layer does not import from infrastructure',
      category: 'Clean Architecture',
      recommended: true,
    },
    messages: {
      noInfrastructureImports:
        'Application layer cannot import from infrastructure. Use ports (interfaces) instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Verifica se estamos em um arquivo da camada application
    if (!filename.includes('/application/')) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Verifica se está importando de infrastructure
        if (
          importPath.includes('/infrastructure/') ||
          importPath.startsWith('@/infrastructure')
        ) {
          context.report({
            node,
            messageId: 'noInfrastructureImports',
          });
        }

        // Verifica se está importando de presentation
        if (
          importPath.includes('/presentation/') ||
          importPath.startsWith('@/presentation')
        ) {
          context.report({
            node,
            messageId: 'noInfrastructureImports',
          });
        }

        // Verifica se está importando de app
        if (
          importPath.includes('/app/') ||
          importPath.startsWith('@/app')
        ) {
          context.report({
            node,
            messageId: 'noInfrastructureImports',
          });
        }
      },
    };
  },
};
