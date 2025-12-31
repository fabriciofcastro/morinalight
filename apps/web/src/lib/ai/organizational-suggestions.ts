/**
 * AI Organizational Suggestions
 * 
 * Fornece sugestões inteligentes para estrutura organizacional
 * baseadas em melhores práticas e análise de contexto da empresa.
 */

export interface OrganizationalContext {
    companySize: 'small' | 'medium' | 'large' | 'enterprise';
    sector: string;
    currentDepartments: string[];
    employeeCount?: number;
    branches?: number;
}

export interface DepartmentSuggestion {
    name: string;
    description: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    suggestedSectors?: string[];
    estimatedHeadcount?: number;
}

export interface HierarchySuggestion {
    structure: 'flat' | 'hierarchical' | 'matrix';
    levels: number;
    reasoning: string;
    pros: string[];
    cons: string[];
}

export interface OrganizationalSuggestions {
    departments: DepartmentSuggestion[];
    hierarchy: HierarchySuggestion;
    gaps: string[];
    recommendations: string[];
}

/**
 * Gera sugestões baseadas em regras e melhores práticas
 */
export function generateOrganizationalSuggestions(
    context: OrganizationalContext
): OrganizationalSuggestions {
    const { companySize, sector, currentDepartments, employeeCount = 0 } = context;

    // Departamentos base para qualquer empresa
    const baseDepartments: DepartmentSuggestion[] = [
        {
            name: 'Recursos Humanos',
            description: 'Gestão de pessoas, recrutamento e desenvolvimento',
            reason: 'Essencial para gestão de talentos e compliance trabalhista',
            priority: 'high',
            estimatedHeadcount: companySize === 'small' ? 2 : companySize === 'medium' ? 5 : 10,
        },
        {
            name: 'Financeiro',
            description: 'Contabilidade, contas a pagar/receber, tesouraria',
            reason: 'Fundamental para saúde financeira e compliance fiscal',
            priority: 'high',
            estimatedHeadcount: companySize === 'small' ? 3 : companySize === 'medium' ? 8 : 15,
        },
        {
            name: 'Comercial',
            description: 'Vendas, relacionamento com clientes, pós-venda',
            reason: 'Motor de crescimento e geração de receita',
            priority: 'high',
            estimatedHeadcount: companySize === 'small' ? 5 : companySize === 'medium' ? 15 : 30,
        },
    ];

    // Departamentos específicos por setor
    const sectorSpecificDepartments: Record<string, DepartmentSuggestion[]> = {
        textile: [
            {
                name: 'Produção',
                description: 'Manufatura, controle de qualidade, logística interna',
                reason: 'Core do negócio têxtil',
                priority: 'high',
                estimatedHeadcount: companySize === 'small' ? 20 : companySize === 'medium' ? 50 : 100,
            },
            {
                name: 'Desenvolvimento de Produto',
                description: 'Design, modelagem, prototipagem',
                reason: 'Inovação e diferenciação de mercado',
                priority: 'medium',
                estimatedHeadcount: companySize === 'small' ? 3 : companySize === 'medium' ? 8 : 15,
            },
            {
                name: 'Compras',
                description: 'Aquisição de matéria-prima, negociação com fornecedores',
                reason: 'Gestão de custos e supply chain',
                priority: 'high',
                estimatedHeadcount: companySize === 'small' ? 2 : companySize === 'medium' ? 5 : 10,
            },
        ],
        technology: [
            {
                name: 'Desenvolvimento',
                description: 'Engenharia de software, DevOps, QA',
                reason: 'Core do negócio de tecnologia',
                priority: 'high',
                estimatedHeadcount: companySize === 'small' ? 10 : companySize === 'medium' ? 30 : 80,
            },
            {
                name: 'Produto',
                description: 'Product management, UX/UI, análise de dados',
                reason: 'Direcionamento estratégico e experiência do usuário',
                priority: 'high',
                estimatedHeadcount: companySize === 'small' ? 3 : companySize === 'medium' ? 8 : 15,
            },
        ],
        retail: [
            {
                name: 'Operações de Loja',
                description: 'Gestão de pontos de venda, merchandising',
                reason: 'Experiência do cliente e execução no PDV',
                priority: 'high',
                estimatedHeadcount: companySize === 'small' ? 15 : companySize === 'medium' ? 40 : 100,
            },
            {
                name: 'E-commerce',
                description: 'Vendas online, marketing digital, logística reversa',
                reason: 'Canal de crescimento essencial',
                priority: 'medium',
                estimatedHeadcount: companySize === 'small' ? 5 : companySize === 'medium' ? 12 : 25,
            },
        ],
    };

    // Departamentos de suporte (para empresas médias/grandes)
    const supportDepartments: DepartmentSuggestion[] = companySize !== 'small' ? [
        {
            name: 'TI',
            description: 'Infraestrutura, suporte, segurança da informação',
            reason: 'Suporte tecnológico e segurança',
            priority: companySize === 'medium' ? 'medium' : 'high',
            estimatedHeadcount: companySize === 'medium' ? 3 : 8,
        },
        {
            name: 'Marketing',
            description: 'Branding, comunicação, marketing digital',
            reason: 'Posicionamento de marca e geração de demanda',
            priority: 'medium',
            estimatedHeadcount: companySize === 'medium' ? 4 : 10,
        },
        {
            name: 'Jurídico',
            description: 'Contratos, compliance, propriedade intelectual',
            reason: 'Gestão de riscos legais',
            priority: companySize === 'large' || companySize === 'enterprise' ? 'high' : 'low',
            estimatedHeadcount: companySize === 'medium' ? 2 : 6,
        },
    ] : [];

    // Combinar departamentos
    const allSuggestions = [
        ...baseDepartments,
        ...(sectorSpecificDepartments[sector] || []),
        ...supportDepartments,
    ];

    // Filtrar departamentos já existentes
    const newSuggestions = allSuggestions.filter(
        (dept) => !currentDepartments.some(
            (existing) => existing.toLowerCase().includes(dept.name.toLowerCase())
        )
    );

    // Sugestão de hierarquia
    const hierarchySuggestion: HierarchySuggestion =
        companySize === 'small'
            ? {
                structure: 'flat',
                levels: 2,
                reasoning: 'Empresas pequenas se beneficiam de estruturas enxutas com comunicação direta',
                pros: ['Agilidade', 'Comunicação rápida', 'Menos burocracia'],
                cons: ['Pode dificultar crescimento', 'Sobrecarga de gestores'],
            }
            : companySize === 'medium'
                ? {
                    structure: 'hierarchical',
                    levels: 3,
                    reasoning: 'Estrutura balanceada entre controle e agilidade',
                    pros: ['Clareza de responsabilidades', 'Escalabilidade', 'Especialização'],
                    cons: ['Possível silo entre áreas', 'Comunicação mais lenta'],
                }
                : {
                    structure: 'matrix',
                    levels: 4,
                    reasoning: 'Grandes empresas precisam de estruturas complexas para gestão eficiente',
                    pros: ['Máxima especialização', 'Uso eficiente de recursos', 'Flexibilidade'],
                    cons: ['Complexidade', 'Possíveis conflitos de prioridade', 'Requer maturidade'],
                };

    // Identificar gaps
    const gaps: string[] = [];
    if (!currentDepartments.some(d => d.toLowerCase().includes('rh') || d.toLowerCase().includes('recursos humanos'))) {
        gaps.push('Falta departamento de RH - crítico para gestão de pessoas');
    }
    if (!currentDepartments.some(d => d.toLowerCase().includes('financeiro') || d.toLowerCase().includes('contabil'))) {
        gaps.push('Falta departamento Financeiro - essencial para compliance');
    }
    if (companySize !== 'small' && !currentDepartments.some(d => d.toLowerCase().includes('ti') || d.toLowerCase().includes('tecnologia'))) {
        gaps.push('Recomendado ter departamento de TI para suporte tecnológico');
    }

    // Recomendações gerais
    const recommendations: string[] = [
        `Para uma empresa ${companySize === 'small' ? 'pequena' : companySize === 'medium' ? 'média' : 'grande'}, recomendamos ${hierarchySuggestion.levels} níveis hierárquicos`,
        'Considere criar setores dentro dos departamentos para melhor organização',
        'Defina claramente os cargos e responsabilidades de cada posição',
        'Implemente um sistema de avaliação de desempenho',
    ];

    if (employeeCount > 50) {
        recommendations.push('Com mais de 50 funcionários, considere implementar um sistema de gestão de pessoas (HRIS)');
    }

    return {
        departments: newSuggestions,
        hierarchy: hierarchySuggestion,
        gaps,
        recommendations,
    };
}

/**
 * Formata sugestões para prompt do Gemini AI
 */
export function formatPromptForAI(context: OrganizationalContext): string {
    return `Você é um consultor organizacional especializado em estrutura empresarial.

Analise o seguinte contexto:
- Tamanho da empresa: ${context.companySize}
- Setor: ${context.sector}
- Departamentos atuais: ${context.currentDepartments.join(', ') || 'Nenhum'}
- Número de funcionários: ${context.employeeCount || 'Não informado'}

Forneça sugestões específicas e práticas para:
1. Departamentos que deveriam ser criados (com justificativa)
2. Estrutura hierárquica ideal (flat, hierarchical, matrix)
3. Gaps organizacionais críticos
4. Recomendações de melhores práticas

Seja específico e prático, focando em ações concretas.`;
}
