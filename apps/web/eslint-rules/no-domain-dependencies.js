/**
 * ESLint Custom Rule: No Domain Dependencies
 * 
 * Garante que a camada Domain não importe de outras camadas.
 * Domain deve ser puro, sem dependências externas.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that domain layer has no external dependencies',
      category: 'Clean Architecture',
      recommended: true,
    },
    messages: {
      noDomainDependencies:
        'Domain layer cannot import from {{layer}}. Domain must be pure with no external dependencies.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Verifica se estamos em um arquivo da camada domain
    if (!filename.includes('/domain/')) {
      return {};
    }

    // Camadas proibidas para domain
    const forbiddenLayers = [
      'application',
      'infrastructure',
      'presentation',
      'app',
    ];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Verifica se está importando de camadas proibidas
        for (const layer of forbiddenLayers) {
          if (importPath.includes(`/${layer}/`) || importPath.startsWith(`@/${layer}`)) {
            context.report({
              node,
              messageId: 'noDomainDependencies',
              data: {
                layer,
              },
            });
          }
        }

        // Verifica imports externos (exceto shared/kernel)
        if (
          !importPath.startsWith('.') &&
          !importPath.startsWith('@/domain') &&
          !importPath.startsWith('@/shared/kernel')
        ) {
          // Permitir apenas alguns imports seguros
          const allowedExternalImports = [
            // Nenhum por padrão - domain deve ser puro
          ];

          if (!allowedExternalImports.some(allowed => importPath.startsWith(allowed))) {
            context.report({
              node,
              messageId: 'noDomainDependencies',
              data: {
                layer: 'external libraries (except shared/kernel)',
              },
            });
          }
        }
      },
    };
  },
};
