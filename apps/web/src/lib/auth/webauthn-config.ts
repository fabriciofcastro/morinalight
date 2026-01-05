
// RP ID (Relying Party ID) deve ser o domínio sem porta.
// Para desenvolvimento local (localhost:3000), o RPID é "localhost".
// Em produção, deve ser o domínio real, e.g. "morinalight.com".

export const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
export const RP_NAME = 'MorinaLight Enterprise';
export const EXPECTED_ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
