/**
 * ESLint Custom Rules for Clean Architecture
 * 
 * Plugin que exporta todas as regras customizadas.
 */

module.exports = {
  rules: {
    'no-domain-dependencies': require('./no-domain-dependencies'),
    'no-application-infrastructure-imports': require('./no-application-infrastructure-imports'),
    'no-presentation-infrastructure-imports': require('./no-presentation-infrastructure-imports'),
    'no-business-logic-in-components': require('./no-business-logic-in-components'),
  },
};
