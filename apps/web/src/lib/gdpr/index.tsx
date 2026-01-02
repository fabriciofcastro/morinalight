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
    dataPortabilityService as gdprDataPortability,
    dataDeletionService as gdprDataDeletion, // Alias para clareza
} from '../lgpd';

export {
    CookieConsentBanner as GDPRCookieConsentBanner,
    useCookieConsent as useGDPRConsent,
} from '../lgpd/cookie-consent';
