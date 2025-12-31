
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../lib/prisma"; // Assuming prisma is exported from here
import { AiAgent } from "@prisma/client";

interface GenerateParams {
    agentSlug: string;
    message: string;
    context?: Record<string, any>;
    userId?: string;
}

export class AiGatewayService {

    async generateResponse({ agentSlug, message, context, userId }: GenerateParams) {
        // 1. Load Agent and Provider
        const agent = await prisma.aiAgent.findUnique({
            where: { slug: agentSlug },
            include: { provider: true }
        });

        if (!agent || !agent.provider.isActive) {
            throw new Error(`Agent ${agentSlug} not found or inactive`);
        }

        // 2. Select Provider Adapter (Simple Switch for now)
        let responseText = "";
        let tokensInput = 0;
        let tokensOutput = 0;
        const startTime = Date.now();

        if (agent.provider.providerKey === 'gemini') {
            const result = await this.callGemini(agent, message, context);
            responseText = result.text;
            tokensInput = result.inputTokens;
            tokensOutput = result.outputTokens;
        } else {
            throw new Error(`Provider ${agent.provider.providerKey} not supported`);
        }

        const duration = Date.now() - startTime;

        // 3. Log Usage & Cost (Estimated for Gemini Flash: Free Tier or very cheap)
        // Gemini Flash Pricing: ~$0.35 / 1M input, $1.05 / 1M output (approx)
        const costInput = (tokensInput / 1_000_000) * 0.35;
        const costOutput = (tokensOutput / 1_000_000) * 1.05;
        const totalCost = costInput + costOutput;

        await prisma.aiUsageLog.create({
            data: {
                agentId: agent.id,
                userId: userId,
                promptTokens: tokensInput,
                completionTokens: tokensOutput,
                totalCost: totalCost,
                durationMs: duration
            }
        });

        return {
            text: responseText,
            agent: agent.name
        };
    }

    private async callGemini(agent: AiAgent & { provider: any }, message: string, context: any) {
        const apiKey = agent.provider.apiKey; // In prod, decrypt this
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: agent.model });

        // Construct System Prompt with Context
        let systemInstruction = agent.systemPrompt;
        if (context) {
            systemInstruction += `\n\nCONTEXTO ATUAL:\n${JSON.stringify(context, null, 2)}`;
        }

        // Gemini System Instructions are better passed as config or pre-prompt
        // For 'flash', we can pass systemInstruction in the model config or just prepend.
        // Let's prepend for simplicity and wide compatibility

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `INSTRUÇÕES DO SISTEMA: ${systemInstruction}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido. Estou pronto para atuar conforme suas instruções." }],
                }
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Usage metadata (Gemini often returns this)
        const usage = result.response.usageMetadata;

        return {
            text,
            inputTokens: usage?.promptTokenCount || 0,
            outputTokens: usage?.candidatesTokenCount || 0
        };
    }
}

export const aiGatewayService = new AiGatewayService();
