import { Injectable } from '@nestjs/common';

export interface SentimentAnalysis {
    score: number; // -1 (negative) to 1 (positive)
    magnitude: number; // 0 to infinity
    sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    confidence: number;
}

export interface SuspiciousPattern {
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    examples: string[];
}

export interface TextClassification {
    category: string;
    confidence: number;
    subcategories: string[];
}

export interface TextSuggestion {
    original: string;
    suggested: string;
    reason: string;
    improvement: number; // 0-100%
}

/**
 * Serviço de NLP para análise de texto
 * Analisa justificativas de permissões e detecta padrões suspeitos
 */
@Injectable()
export class NLPAnalysisService {
    // Padrões suspeitos conhecidos
    private readonly SUSPICIOUS_PATTERNS: SuspiciousPattern[] = [
        {
            pattern: 'urgente|emergência|imediato',
            severity: 'high',
            description: 'Urgência excessiva pode indicar tentativa de bypass',
            examples: ['preciso urgente', 'emergência crítica'],
        },
        {
            pattern: 'temporário|provisório|teste',
            severity: 'medium',
            description: 'Permissões temporárias frequentemente se tornam permanentes',
            examples: ['acesso temporário', 'apenas para teste'],
        },
        {
            pattern: 'todos|geral|completo|total',
            severity: 'high',
            description: 'Solicitação de acesso muito amplo',
            examples: ['acesso total', 'permissão geral'],
        },
        {
            pattern: 'admin|root|super',
            severity: 'critical',
            description: 'Solicitação de privilégios administrativos',
            examples: ['preciso admin', 'acesso root'],
        },
        {
            pattern: 'chefe mandou|ordem|determinação',
            severity: 'medium',
            description: 'Justificativa baseada em autoridade sem contexto',
            examples: ['chefe mandou', 'por ordem'],
        },
    ];

    // Palavras-chave por categoria
    private readonly CATEGORY_KEYWORDS = {
        financial: ['pagamento', 'financeiro', 'contábil', 'fatura', 'cobrança'],
        hr: ['funcionário', 'rh', 'salário', 'folha', 'admissão'],
        it: ['sistema', 'servidor', 'deploy', 'código', 'banco de dados'],
        sales: ['venda', 'cliente', 'proposta', 'desconto', 'pedido'],
        compliance: ['auditoria', 'compliance', 'regulatório', 'conformidade'],
    };

    /**
     * Analisa sentimento de texto
     */
    async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
        console.log(`📝 Analyzing sentiment: "${text.substring(0, 50)}..."`);

        // Palavras positivas e negativas (simplificado)
        const positiveWords = ['necessário', 'importante', 'essencial', 'produtivo', 'eficiente'];
        const negativeWords = ['problema', 'erro', 'falha', 'bloqueado', 'impedido'];

        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        let magnitude = 0;

        for (const word of words) {
            if (positiveWords.some(pw => word.includes(pw))) {
                score += 0.5;
                magnitude += 1;
            }
            if (negativeWords.some(nw => word.includes(nw))) {
                score -= 0.5;
                magnitude += 1;
            }
        }

        // Normalizar score
        score = Math.max(-1, Math.min(1, score / words.length * 10));
        magnitude = magnitude / words.length * 10;

        const sentiment = this.getSentimentLabel(score);
        const confidence = Math.abs(score);

        console.log(`  ✓ Sentiment: ${sentiment} (score: ${score.toFixed(2)}, confidence: ${(confidence * 100).toFixed(0)}%)`);

        return {
            score,
            magnitude,
            sentiment,
            confidence,
        };
    }

    /**
     * Detecta padrões suspeitos em texto
     */
    async detectSuspiciousPatterns(text: string): Promise<{
        suspicious: boolean;
        patterns: SuspiciousPattern[];
        overallSeverity: 'low' | 'medium' | 'high' | 'critical';
        recommendation: string;
    }> {
        console.log(`🔍 Detecting suspicious patterns in text...`);

        const detectedPatterns: SuspiciousPattern[] = [];
        const textLower = text.toLowerCase();

        for (const pattern of this.SUSPICIOUS_PATTERNS) {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(textLower)) {
                detectedPatterns.push(pattern);
                console.log(`  ⚠️  Found pattern: ${pattern.description} (${pattern.severity})`);
            }
        }

        const suspicious = detectedPatterns.length > 0;
        const overallSeverity = this.calculateOverallSeverity(detectedPatterns);
        const recommendation = this.generateRecommendation(detectedPatterns);

        console.log(`  ${suspicious ? '⚠️' : '✓'} Suspicious: ${suspicious}, Severity: ${overallSeverity}`);

        return {
            suspicious,
            patterns: detectedPatterns,
            overallSeverity,
            recommendation,
        };
    }

    /**
     * Classifica texto automaticamente
     */
    async classifyText(text: string): Promise<TextClassification> {
        console.log(`🏷️  Classifying text...`);

        const textLower = text.toLowerCase();
        const scores: Record<string, number> = {};

        // Calcular score para cada categoria
        for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
            scores[category] = keywords.filter(kw => textLower.includes(kw)).length;
        }

        // Encontrar categoria com maior score
        const category = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';

        const totalKeywords = Object.values(scores).reduce((sum, s) => sum + s, 0);
        const confidence = totalKeywords > 0 ? scores[category] / totalKeywords : 0.5;

        // Identificar subcategorias
        const subcategories = this.identifySubcategories(textLower, category);

        console.log(`  ✓ Category: ${category} (confidence: ${(confidence * 100).toFixed(0)}%)`);

        return {
            category,
            confidence,
            subcategories,
        };
    }

    /**
     * Gera sugestões automáticas de texto
     */
    async generateSuggestions(text: string): Promise<TextSuggestion[]> {
        console.log(`💡 Generating text suggestions...`);

        const suggestions: TextSuggestion[] = [];

        // Sugestão 1: Remover urgência excessiva
        if (/urgente|emergência/i.test(text)) {
            suggestions.push({
                original: text,
                suggested: text.replace(/urgente|emergência/gi, 'necessário'),
                reason: 'Remover senso de urgência excessiva',
                improvement: 30,
            });
            console.log(`  💡 Suggestion: Remove excessive urgency`);
        }

        // Sugestão 2: Adicionar contexto
        if (text.split(' ').length < 10) {
            suggestions.push({
                original: text,
                suggested: `${text}. Contexto: [adicionar detalhes sobre o motivo e duração esperada]`,
                reason: 'Adicionar mais contexto e justificativa',
                improvement: 40,
            });
            console.log(`  💡 Suggestion: Add more context`);
        }

        // Sugestão 3: Ser mais específico
        if (/todos|geral|completo/i.test(text)) {
            suggestions.push({
                original: text,
                suggested: text.replace(/todos|geral|completo/gi, 'específico'),
                reason: 'Ser mais específico sobre o escopo necessário',
                improvement: 50,
            });
            console.log(`  💡 Suggestion: Be more specific`);
        }

        // Sugestão 4: Adicionar prazo
        if (!/prazo|até|durante|por/i.test(text)) {
            suggestions.push({
                original: text,
                suggested: `${text}. Prazo: [especificar duração]`,
                reason: 'Adicionar prazo para a permissão',
                improvement: 35,
            });
            console.log(`  💡 Suggestion: Add timeframe`);
        }

        console.log(`  ✓ Generated ${suggestions.length} suggestions`);

        return suggestions;
    }

    /**
     * Analisa qualidade da justificativa
     */
    async analyzeJustificationQuality(text: string): Promise<{
        score: number; // 0-100
        level: 'poor' | 'fair' | 'good' | 'excellent';
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
    }> {
        console.log(`📊 Analyzing justification quality...`);

        let score = 50; // Base score
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const suggestions: string[] = [];

        // Critério 1: Comprimento (10-100 palavras ideal)
        const wordCount = text.split(/\s+/).length;
        if (wordCount >= 10 && wordCount <= 100) {
            score += 15;
            strengths.push('Comprimento adequado');
        } else if (wordCount < 10) {
            score -= 15;
            weaknesses.push('Justificativa muito curta');
            suggestions.push('Adicionar mais detalhes e contexto');
        } else {
            score -= 5;
            weaknesses.push('Justificativa muito longa');
            suggestions.push('Ser mais conciso');
        }

        // Critério 2: Especificidade
        if (/específico|detalhado|preciso/i.test(text)) {
            score += 10;
            strengths.push('Demonstra especificidade');
        } else if (/geral|todos|qualquer/i.test(text)) {
            score -= 10;
            weaknesses.push('Falta especificidade');
            suggestions.push('Ser mais específico sobre o que é necessário');
        }

        // Critério 3: Contexto de negócio
        if (/projeto|cliente|processo|sistema/i.test(text)) {
            score += 15;
            strengths.push('Inclui contexto de negócio');
        } else {
            score -= 10;
            weaknesses.push('Falta contexto de negócio');
            suggestions.push('Explicar o contexto e motivo da solicitação');
        }

        // Critério 4: Prazo/Temporalidade
        if (/prazo|até|durante|temporário|permanente/i.test(text)) {
            score += 10;
            strengths.push('Define temporalidade');
        } else {
            score -= 5;
            weaknesses.push('Não especifica duração');
            suggestions.push('Indicar se é temporário ou permanente');
        }

        // Critério 5: Ausência de padrões suspeitos
        const suspicious = await this.detectSuspiciousPatterns(text);
        if (!suspicious.suspicious) {
            score += 10;
            strengths.push('Sem padrões suspeitos');
        } else {
            score -= 20;
            weaknesses.push('Contém padrões suspeitos');
            suggestions.push('Evitar urgência excessiva e solicitações muito amplas');
        }

        // Normalizar score
        score = Math.max(0, Math.min(100, score));
        const level = this.getQualityLevel(score);

        console.log(`  ✓ Quality: ${level} (score: ${score}/100)`);
        console.log(`  ✓ Strengths: ${strengths.length}, Weaknesses: ${weaknesses.length}`);

        return {
            score,
            level,
            strengths,
            weaknesses,
            suggestions,
        };
    }

    /**
     * Extrai entidades nomeadas do texto
     */
    async extractEntities(text: string): Promise<{
        systems: string[];
        departments: string[];
        people: string[];
        dates: string[];
        projects: string[];
    }> {
        console.log(`🔎 Extracting entities from text...`);

        // Padrões simples para extração
        const systems = this.extractByPattern(text, /sistema\s+(\w+)|(\w+)\s+system/gi);
        const departments = this.extractByPattern(text, /(departamento|área|setor)\s+(\w+)/gi);
        const dates = this.extractByPattern(text, /\d{1,2}\/\d{1,2}\/\d{2,4}|até\s+(\w+)/gi);
        const projects = this.extractByPattern(text, /projeto\s+(\w+)/gi);

        console.log(`  ✓ Found: ${systems.length} systems, ${departments.length} departments, ${dates.length} dates`);

        return {
            systems,
            departments,
            people: [],
            dates,
            projects,
        };
    }

    // Helper methods
    private getSentimentLabel(score: number): SentimentAnalysis['sentiment'] {
        if (score <= -0.6) return 'very_negative';
        if (score <= -0.2) return 'negative';
        if (score >= 0.6) return 'very_positive';
        if (score >= 0.2) return 'positive';
        return 'neutral';
    }

    private calculateOverallSeverity(patterns: SuspiciousPattern[]): 'low' | 'medium' | 'high' | 'critical' {
        if (patterns.some(p => p.severity === 'critical')) return 'critical';
        if (patterns.some(p => p.severity === 'high')) return 'high';
        if (patterns.some(p => p.severity === 'medium')) return 'medium';
        return 'low';
    }

    private generateRecommendation(patterns: SuspiciousPattern[]): string {
        if (patterns.length === 0) {
            return 'Justificativa parece adequada';
        }

        const critical = patterns.filter(p => p.severity === 'critical').length;
        const high = patterns.filter(p => p.severity === 'high').length;

        if (critical > 0) {
            return 'Requer revisão imediata - padrões críticos detectados';
        }
        if (high > 0) {
            return 'Requer revisão - padrões de alto risco detectados';
        }
        return 'Revisar justificativa antes de aprovar';
    }

    private identifySubcategories(text: string, category: string): string[] {
        const subcategories: string[] = [];

        if (category === 'financial') {
            if (text.includes('pagamento')) subcategories.push('payments');
            if (text.includes('fatura')) subcategories.push('invoicing');
        } else if (category === 'it') {
            if (text.includes('deploy')) subcategories.push('deployment');
            if (text.includes('banco')) subcategories.push('database');
        }

        return subcategories;
    }

    private getQualityLevel(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    private extractByPattern(text: string, pattern: RegExp): string[] {
        const matches = text.match(pattern);
        return matches ? [...new Set(matches)] : [];
    }
}
