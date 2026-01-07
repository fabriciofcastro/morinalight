/**
 * ESLint Custom Rule: No Business Logic in Components
 * 
 * Garante que componentes React não contenham lógica de negócio.
 * Componentes devem ser puros, apenas UI.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce that React components do not contain business logic',
      category: 'Clean Architecture',
      recommended: true,
    },
    messages: {
      noBusinessLogic:
        'Components should not contain business logic. Move validation, calculations, and business rules to domain/application layers.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Verifica se estamos em um componente React
    if (
      !filename.includes('/components/') &&
      !filename.includes('/presentation/')
    ) {
      return {};
    }

    // Padrões que indicam lógica de negócio em componentes
    const businessLogicPatterns = [
      // Validações inline
      /if\s*\(\s*.*\.length\s*[<>]=?\s*\d+\s*\)/,
      /if\s*\(\s*.*\s*[<>]=?\s*0\s*\)/,
      
      // Cálculos de negócio
      /const\s+\w+\s*=\s*.*\s*[\*\/\+\-]\s*.*/,
      
      // Regras de negócio
      /if\s*\(\s*.*\.includes\s*\(/,
      /if\s*\(\s*.*\.some\s*\(/,
      /if\s*\(\s*.*\.every\s*\(/,
    ];

    return {
      FunctionDeclaration(node) {
        // Ignora se for um hook customizado (use*)
        if (node.id && node.id.name.startsWith('use')) {
          return;
        }

        const sourceCode = context.getSourceCode();
        const functionText = sourceCode.getText(node);

        // Verifica padrões de lógica de negócio
        for (const pattern of businessLogicPatterns) {
          if (pattern.test(functionText)) {
            // Não reportar se estiver usando hooks (delegando para application)
            if (functionText.includes('useMutation') || functionText.includes('useQuery')) {
              continue;
            }

            context.report({
              node,
              messageId: 'noBusinessLogic',
            });
            break;
          }
        }
      },
    };
  },
};
