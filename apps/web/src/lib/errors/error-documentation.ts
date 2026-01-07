/**
 * Automatic Error Documentation Generator
 * 
 * Gera documentação automática de erros e best practices
 */

import type { AppError } from "./types";
import { errorAggregator } from "./error-aggregation";
import { performanceMonitor } from "./performance-monitor";
import { getUserFriendlyMessage } from "./user-messages";

/**
 * Documentação de erro
 */
export interface ErrorDocumentation {
    code: string;
    title: string;
    description: string;
    commonCauses: string[];
    solutions: string[];
    examples: string[];
    relatedErrors: string[];
    frequency: number;
    lastOccurrence: string;
}

/**
 * Gerador de documentação
 */
export class ErrorDocumentationGenerator {
    /**
     * Gerar documentação completa de todos os erros
     */
    generateFullDocumentation(): ErrorDocumentation[] {
        const groups = errorAggregator.getAllGroups();
        const docs: ErrorDocumentation[] = [];

        for (const group of groups) {
            const friendly = getUserFriendlyMessage(group.errors[0] as AppError);

            docs.push({
                code: group.code,
                title: friendly.title,
                description: friendly.message,
                commonCauses: this.inferCommonCauses(group),
                solutions: this.generateSolutions(group),
                examples: this.extractExamples(group),
                relatedErrors: this.findRelatedErrors(group),
                frequency: group.count,
                lastOccurrence: new Date(group.lastSeen).toISOString(),
            });
        }

        return docs.sort((a, b) => b.frequency - a.frequency);
    }

    /**
     * Inferir causas comuns
     */
    private inferCommonCauses(group: any): string[] {
        const causes: string[] = [];

        // Analisar endpoints afetados
        if (group.affectedEndpoints.size > 1) {
            causes.push(`Afeta múltiplos endpoints: ${Array.from(group.affectedEndpoints).join(", ")}`);
        }

        // Analisar usuários afetados
        if (group.affectedUsers.size > 5) {
            causes.push(`Afeta múltiplos usuários (${group.affectedUsers.size})`);
        }

        // Analisar padrão temporal
        const errors = group.errors;
        const timestamps = errors.map((e: any) => new Date(e.timestamp || 0).getTime());
        const avgInterval = timestamps.length > 1
            ? (Math.max(...timestamps) - Math.min(...timestamps)) / timestamps.length
            : 0;

        if (avgInterval < 60000) {
            causes.push("Ocorre em rajadas (múltiplas vezes em curto período)");
        }

        return causes;
    }

    /**
     * Gerar soluções
     */
    private generateSolutions(group: any): string[] {
        const solutions: string[] = [];

        // Soluções baseadas no código
        if (group.code.includes("NETWORK")) {
            solutions.push("Verificar conectividade de rede");
            solutions.push("Implementar retry com exponential backoff");
            solutions.push("Adicionar cache para operação offline");
        }

        if (group.code.includes("TIMEOUT")) {
            solutions.push("Aumentar timeout da requisição");
            solutions.push("Otimizar query no backend");
            solutions.push("Implementar paginação");
        }

        if (group.code.includes("VALIDATION")) {
            solutions.push("Validar dados no frontend antes de enviar");
            solutions.push("Melhorar mensagens de erro para o usuário");
            solutions.push("Adicionar exemplos de formato correto");
        }

        if (group.code.includes("AUTH") || group.code.includes("401")) {
            solutions.push("Verificar se token está válido");
            solutions.push("Implementar refresh token automático");
            solutions.push("Redirecionar para login se sessão expirou");
        }

        return solutions;
    }

    /**
     * Extrair exemplos
     */
    private extractExamples(group: any): string[] {
        const examples: string[] = [];

        // Pegar até 3 exemplos de stack traces
        const uniqueStacks = new Set<string>();
        for (const error of group.errors.slice(0, 3)) {
            if (error.stack) {
                const firstLine = error.stack.split("\n")[0];
                uniqueStacks.add(firstLine);
            }
        }

        return Array.from(uniqueStacks);
    }

    /**
     * Encontrar erros relacionados
     */
    private findRelatedErrors(group: any): string[] {
        const allGroups = errorAggregator.getAllGroups();
        const related: string[] = [];

        for (const otherGroup of allGroups) {
            if (otherGroup.fingerprint === group.fingerprint) continue;

            // Verificar se compartilham endpoints
            const sharedEndpoints = Array.from(group.affectedEndpoints).filter((e: any) =>
                otherGroup.affectedEndpoints.has(e as string),
            );

            if (sharedEndpoints.length > 0) {
                related.push(otherGroup.code);
            }
        }

        return related.slice(0, 5);
    }

    /**
     * Gerar markdown da documentação
     */
    generateMarkdown(): string {
        const docs = this.generateFullDocumentation();
        let markdown = "# Error Documentation\n\n";
        markdown += `Generated: ${new Date().toISOString()}\n\n`;
        markdown += `Total error types: ${docs.length}\n\n`;
        markdown += "---\n\n";

        for (const doc of docs) {
            markdown += `## ${doc.code}\n\n`;
            markdown += `**${doc.title}**\n\n`;
            markdown += `${doc.description}\n\n`;
            markdown += `**Frequency:** ${doc.frequency} occurrences\n`;
            markdown += `**Last seen:** ${new Date(doc.lastOccurrence).toLocaleString("pt-BR")}\n\n`;

            if (doc.commonCauses.length > 0) {
                markdown += "### Common Causes\n\n";
                doc.commonCauses.forEach((cause) => {
                    markdown += `- ${cause}\n`;
                });
                markdown += "\n";
            }

            if (doc.solutions.length > 0) {
                markdown += "### Solutions\n\n";
                doc.solutions.forEach((solution) => {
                    markdown += `- ${solution}\n`;
                });
                markdown += "\n";
            }

            if (doc.relatedErrors.length > 0) {
                markdown += `### Related Errors\n\n`;
                markdown += doc.relatedErrors.join(", ") + "\n\n";
            }

            markdown += "---\n\n";
        }

        return markdown;
    }

    /**
     * Gerar JSON da documentação
     */
    generateJSON(): string {
        const docs = this.generateFullDocumentation();
        return JSON.stringify(
            {
                generated: new Date().toISOString(),
                totalErrors: docs.length,
                errors: docs,
            },
            null,
            2,
        );
    }
}

/**
 * Gerador de best practices
 */
export class BestPracticesGenerator {
    /**
     * Gerar recomendações baseadas em padrões observados
     */
    generateRecommendations(): string[] {
        const recommendations: string[] = [];
        const perfStats = performanceMonitor.getAllStats();
        const errorGroups = errorAggregator.getAllGroups();

        // Análise de performance
        const slowEndpoints = perfStats.filter((s) => s.p95 > 2000);
        if (slowEndpoints.length > 0) {
            recommendations.push(
                `⚡ ${slowEndpoints.length} endpoints com P95 > 2s. Considere adicionar cache ou otimizar queries.`,
            );
        }

        // Análise de erros
        const networkErrors = errorGroups.filter((g) =>
            g.code.includes("NETWORK"),
        ).length;
        if (networkErrors > 2) {
            recommendations.push(
                `🌐 Múltiplos erros de rede detectados. Implemente offline-first com service workers.`,
            );
        }

        const validationErrors = errorGroups.filter((g) =>
            g.code.includes("VALIDATION"),
        ).length;
        if (validationErrors > 3) {
            recommendations.push(
                `📝 Muitos erros de validação. Melhore validação client-side e mensagens de erro.`,
            );
        }

        // Análise de taxa de erro
        const highErrorRate = perfStats.filter((s) => s.errorRate > 0.1);
        if (highErrorRate.length > 0) {
            recommendations.push(
                `⚠️ ${highErrorRate.length} endpoints com taxa de erro > 10%. Adicione circuit breakers.`,
            );
        }

        return recommendations;
    }

    /**
     * Gerar code snippets úteis
     */
    generateCodeSnippets(): Record<string, string> {
        return {
            "Error Handling com Recovery": `
import { useErrorHandler, recoveryManager } from "@/lib/errors";

const { handleError } = useErrorHandler();

try {
  const data = await apiClient.get('/data');
} catch (error) {
  const appError = handleError(error);
  
  // Tentar recuperação automática
  const recovery = await recoveryManager.attemptRecovery(appError, {
    cacheKey: 'data',
    operation: () => apiClient.get('/data'),
  });
  
  if (recovery.recovered) {
    console.log('Recovered!', recovery.result);
  }
}
      `,

            "Contextual Error Handling": `
import { useContextualErrorHandler } from "@/lib/errors";

const { handleError } = useContextualErrorHandler('auth');

try {
  await login(email, password);
} catch (error) {
  const result = handleError(error);
  
  // result.message - mensagem amigável
  // result.action - ação de recuperação
  // result.actionLabel - label do botão
  
  if (result.action) {
    await result.action();
  }
}
      `,

            "Performance Monitoring": `
import { performanceMonitor } from "@/lib/errors";

const startTime = Date.now();

try {
  const data = await fetchData();
  
  performanceMonitor.track({
    endpoint: '/api/data',
    method: 'GET',
    duration: Date.now() - startTime,
    status: 200,
    timestamp: Date.now(),
  });
} catch (error) {
  performanceMonitor.track({
    endpoint: '/api/data',
    method: 'GET',
    duration: Date.now() - startTime,
    status: error.response?.status || 0,
    timestamp: Date.now(),
  });
}
      `,
        };
    }
}

/**
 * Instâncias globais
 */
export const errorDocGenerator = new ErrorDocumentationGenerator();
export const bestPracticesGenerator = new BestPracticesGenerator();
