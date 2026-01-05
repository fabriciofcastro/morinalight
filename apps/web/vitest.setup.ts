import "@testing-library/jest-dom/vitest";

// Set up test environment variables
process.env.ENCRYPTION_MASTER_KEY = "test-master-key-for-encryption-do-not-use-in-production";
process.env.ENCRYPTION_SALT = "test-salt-for-encryption-do-not-use-in-production-environment";
process.env.JWT_SECRET = "test-jwt-secret-for-testing-only-do-not-use-in-production";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-for-testing-only-do-not-use";
(process.env as any).NODE_ENV = "test";
