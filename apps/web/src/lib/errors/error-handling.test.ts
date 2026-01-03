/**
 * Error Handling Tests
 * 
 * Testes para o sistema de error handling
 */

import { describe, it, expect } from "vitest";
import { parseError } from "@/lib/errors/error-parser";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { AppError, ErrorCode } from "@/lib/errors";

describe("parseError", () => {
    it("should parse AppError correctly", () => {
        const appError = new AppError(ErrorCode.VALIDATION_ERROR, "Invalid data", 400);
        const parsed = parseError(appError);

        expect(parsed).toBeInstanceOf(AppError);
        expect(parsed.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(parsed.message).toBe("Invalid data");
        expect(parsed.statusCode).toBe(400);
    });

    it("should parse generic Error", () => {
        const error = new Error("Something went wrong");
        const parsed = parseError(error);

        expect(parsed).toBeInstanceOf(AppError);
        expect(parsed.message).toBe("Something went wrong");
    });

    it("should parse unknown error", () => {
        const parsed = parseError("String error");

        expect(parsed).toBeInstanceOf(AppError);
        expect(parsed.message).toContain("String error");
    });

    it("should parse network error", () => {
        const error = new Error("Network Error");
        const parsed = parseError(error);

        expect(parsed.code).toBe(ErrorCode.NETWORK_ERROR);
    });
});

describe("getUserFriendlyMessage", () => {
    it("should return friendly message for INVALID_CREDENTIALS", () => {
        const error = new AppError(ErrorCode.INVALID_CREDENTIALS, "Invalid credentials", 401);
        const friendly = getUserFriendlyMessage(error);

        expect(friendly.title).toBe("Credenciais Inválidas");
        expect(friendly.message).toContain("Email ou senha incorretos");
    });

    it("should return friendly message for NETWORK_ERROR", () => {
        const error = new AppError(ErrorCode.NETWORK_ERROR, "Network failed", 0);
        const friendly = getUserFriendlyMessage(error);

        expect(friendly.title).toBe("Erro de Conexão");
        expect(friendly.message).toContain("conexão");
    });

    it("should return default message for unknown error", () => {
        const error = new AppError("UNKNOWN_CODE", "Unknown error", 500);
        const friendly = getUserFriendlyMessage(error);

        expect(friendly.title).toBeTruthy();
        expect(friendly.message).toBeTruthy();
    });
});

describe("AppError", () => {
    it("should create error with correct properties", () => {
        const error = new AppError(ErrorCode.VALIDATION_ERROR, "Invalid input", 400, {
            fields: [{ field: "email", message: "Invalid email" }],
        });

        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.message).toBe("Invalid input");
        expect(error.statusCode).toBe(400);
        expect(error.fields).toHaveLength(1);
        expect(error.fields![0].field).toBe("email");
    });

    it("should determine if error is retryable", () => {
        const retryableError = new AppError(ErrorCode.NETWORK_ERROR, "Network error", 0);
        const nonRetryableError = new AppError(ErrorCode.VALIDATION_ERROR, "Invalid", 400);

        expect(retryableError.isRetryable).toBe(true);
        expect(nonRetryableError.isRetryable).toBe(false);
    });

    it("should categorize errors correctly", () => {
        const networkError = new AppError(ErrorCode.NETWORK_ERROR, "Network", 0);
        const validationError = new AppError(ErrorCode.VALIDATION_ERROR, "Validation", 400);
        const serverError = new AppError(ErrorCode.INTERNAL_ERROR, "Server", 500);

        expect(networkError.category).toBe("NETWORK");
        expect(validationError.category).toBe("VALIDATION");
        expect(serverError.category).toBe("SERVER");
    });
});
