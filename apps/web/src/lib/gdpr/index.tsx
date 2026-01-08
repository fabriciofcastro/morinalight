/**
 * GDPR Compliance Module
 * 
 * Este módulo herda a infraestrutura de privacidade da LGPD,
 * pois ambas compartilham >90% dos requisitos técnicos (consentimento, 
 * exclusão, portabilidade).
 * 
 * Diferenças específicas da GDPR devem ser implementadas aqui.
 */

export {
    dataDeletionService as gdprDataDeletion, dataPortabilityService as gdprDataPortability
} from '../lgpd';

export {
    useCookieConsent as useGDPRConsent
} from '../lgpd/hooks';

