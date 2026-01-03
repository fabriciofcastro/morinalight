/**
 * LGPD Index - Centralized Exports
 */

// Cookie Consent
export {
    useCookieConsent,
    CookieConsentBanner,
    useAnalytics,
    type CookieConsent,
} from "./cookie-consent";

// Data Deletion
export {
    DataDeletionService,
    dataDeletionService,
    type DataDeletionRequest,
} from "./data-deletion";

// Data Portability
export {
    DataPortabilityService,
    dataPortabilityService,
    type UserDataExport,
} from "./data-portability";
