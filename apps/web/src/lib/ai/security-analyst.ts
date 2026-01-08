
import prisma from "@/lib/prisma";
import { GeoIPService } from "@/lib/security/geoip-service";
import { google } from "@ai-sdk/google";
import { tool as coreTool, streamText } from "ai";
import { z } from "zod";

const tool = (args: any) => coreTool(args);

/**
 * AI Security Analyst Service
 * Encapsulates the logic for the AI security assistant.
 * Uses RAG (Retrieval Augmented Generation) to provide context-aware answers.
 */
export class AiSecurityAnalyst {
    private model = google("gemini-1.5-pro"); // Or "models/gemini-1.5-flash-latest" for speed

    /**
     * Generates a system prompt with relevant context.
     * This is a simplified RAG implementation. For production, use a vector DB.
     */
    private async buildContext(userId: string): Promise<string> {
        // 1. Fetch recent critical alerts
        const recentAlerts = await prisma.securityAlert.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, severity: { in: ['HIGH', 'CRITICAL'] } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const contextString = `
      Context:
      - Current User ID: ${userId}
      - Recent Critical Alerts (Last 24h): ${JSON.stringify(recentAlerts)}
      - System Time: ${new Date().toISOString()}
    `;

        return `
      You are the AI Security Analyst for MorinaLight Enterprise.
      Your goal is to assist administrators in monitoring, analyzing, and responding to security threats.
      
      Capabilities:
      - Explain security alerts in simple terms.
      - Analyze IP addresses for reputation and location.
      - Suggest remediation actions (e.g., blocking IPs, investigating users).
      - Query system logs to investigate specific events.

      Guidelines:
      - Be concise and professional.
      - Prioritize security and accuracy.
      - If you don't know, say so. Do not hallucinate security facts.
      - Always check the "Context" provided below before answering.
      
      ${contextString}
    `;
    }

    /**
     * Defines the tools available to the AI.
     */
    private getTools() {
        return {
            get_ip_reputation: tool({
                description: "Get location and reputation information for an IP address.",
                parameters: z.object({ ip: z.string() }),
                execute: async ({ ip }: { ip: string }) => {
                    const geo = GeoIPService.lookup(ip);
                    return {
                        ip,
                        location: geo ? `${geo.city}, ${geo.country}` : "Unknown",
                        coordinates: geo?.ll,
                        reputation: "Neutral (Local lookup only)",
                    };
                },
            }),
            get_user_activity: tool({
                description: "Get recent activity logs for a specific user.",
                parameters: z.object({ email: z.string() }),
                execute: async ({ email }: { email: string }) => {
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return { error: "User not found" };

                    const logs = await prisma.usageLog.findMany({
                        where: { userId: user.id },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    });
                    return logs;
                }
            }),
            list_blocked_ips: tool({
                description: "List currently blocked IP addresses in the firewall.",
                parameters: z.object({}),
                execute: async () => {
                    return await prisma.blockedIP.findMany({
                        orderBy: { blockedAt: 'desc' }
                    });
                }
            }),
            block_ip: tool({
                description: "Block a suspicious IP address. Requires a reason.",
                parameters: z.object({
                    ip: z.string(),
                    reason: z.string(),
                    durationMinutes: z.number().optional()
                }),
                execute: async ({ ip, reason, durationMinutes }: { ip: string; reason: string; durationMinutes?: number }) => {
                    try {
                        // Use the API to ensure internal consistency (cache warmup, SIEM logging, etc.)
                        const response = await fetch('/api/security/blocked-ips', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ip, reason, durationMinutes })
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            return { error: error.message || "Failed to block IP" };
                        }

                        return { success: true, message: `IP ${ip} blocked: ${reason}` };
                    } catch (error) {
                        return { error: "Failed to connect to security API" };
                    }
                }
            })
        };
    }

    /**
     * Stream a chat response.
     */
    async streamChat(messages: any[], userId: string) {
        const system = await this.buildContext(userId);

        return streamText({
            model: this.model,
            system,
            messages,
            tools: this.getTools(),
        });
    }
}

export const aiSecurityAnalyst = new AiSecurityAnalyst();
