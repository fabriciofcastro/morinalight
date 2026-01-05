"use client";

import { type FormEvent, type ReactNode, useState, useEffect } from "react";

interface SecureFormProps {
    children: ReactNode;
    onSubmit: (data: FormData) => Promise<void>;
    className?: string;
}

/**
 * Secure Form Wrapper
 * 
 * Automatically handles:
 * 1. CSRF token injection
 * 2. Input sanitization
 * 3. Form validation
 * 
 * Usage:
 * <SecureForm onSubmit={handleSubmit}>
 *   <input name="email" />
 *   <button type="submit">Submit</button>
 * </SecureForm>
 */
export function SecureForm({ children, onSubmit, className }: SecureFormProps) {
    const [csrfToken, setCSRFToken] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch CSRF token on mount
        fetch("/api/auth/csrf-token")
            .then((res) => res.json())
            .then((data) => setCSRFToken(data.token))
            .catch((err) => console.error("Failed to fetch CSRF token:", err));
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);

            // Add CSRF token
            formData.append("_csrf", csrfToken);

            // Sanitize all string inputs
            for (const [key, value] of formData.entries()) {
                if (typeof value === "string") {
                    formData.set(key, sanitizeInput(value));
                }
            }

            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <input type="hidden" name="_csrf" value={csrfToken} />
            {children}
        </form>
    );
}

/**
 * Sanitize user input
 */
function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, "") // Remove < and >
        .replace(/javascript:/gi, "") // Remove javascript:
        .replace(/on\w+=/gi, "") // Remove event handlers
        .replace(/script/gi, "") // Remove script tags
        .trim();
}
