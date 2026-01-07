/**
 * ESLint Custom Rule: No Presentation Infrastructure Imports
 * 
 * Garante que a camada Presentation não importe diretamente de Infrastructure.
 * Presentation deve usar Application layer (use cases, queries) via hooks.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that presentation layer does not import from infrastructure',
      category: 'Clean Architecture',
      recommended: true,
    },
    messages: {
      noInfrastructureImports:
        'Presentation layer cannot import from infrastructure. Use application layer (use cases, queries) instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Verifica se estamos em um arquivo da camada presentation
    if (!filename.includes('/presentation/')) {
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
      },
    };
  },
};
