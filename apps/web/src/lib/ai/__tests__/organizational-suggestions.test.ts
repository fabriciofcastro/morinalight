/**
 * Testes Unitários - AI Suggestions
 */

import { describe, it, expect } from 'vitest';
import {
    generateOrganizationalSuggestions,
    formatPromptForAI,
    type OrganizationalContext,
} from '../organizational-suggestions';

describe('AI Organizational Suggestions', () => {
    describe('generateOrganizationalSuggestions', () => {
        it('deve gerar sugestões para empresa pequena do setor têxtil', () => {
            const context: OrganizationalContext = {
                companySize: 'small',
                sector: 'textile',
                currentDepartments: [],
                employeeCount: 20,
            };

            const result = generateOrganizationalSuggestions(context);

            // Deve sugerir departamentos base
            expect(result.departments).toBeDefined();
            expect(result.departments.length).toBeGreaterThan(0);

            // Deve incluir RH, Financeiro, Comercial
            const deptNames = result.departments.map(d => d.name);
            expect(deptNames).toContain('Recursos Humanos');
            expect(deptNames).toContain('Financeiro');
            expect(deptNames).toContain('Comercial');

            // Deve incluir departamentos específicos do setor têxtil
            expect(deptNames).toContain('Produção');
            expect(deptNames).toContain('Compras');
        });

        it('deve recomendar estrutura flat para empresas pequenas', () => {
            const context: OrganizationalContext = {
                companySize: 'small',
                sector: 'technology',
                currentDepartments: [],
            };

            const result = generateOrganizationalSuggestions(context);

            expect(result.hierarchy.structure).toBe('flat');
            expect(result.hierarchy.levels).toBe(2);
        });

        it('deve recomendar estrutura hierarchical para empresas médias', () => {
            const context: OrganizationalContext = {
                companySize: 'medium',
                sector: 'retail',
                currentDepartments: [],
            };

            const result = generateOrganizationalSuggestions(context);

            expect(result.hierarchy.structure).toBe('hierarchical');
            expect(result.hierarchy.levels).toBe(3);
        });

        it('deve recomendar estrutura matrix para grandes empresas', () => {
            const context: OrganizationalContext = {
                companySize: 'enterprise',
                sector: 'technology',
                currentDepartments: [],
            };

            const result = generateOrganizationalSuggestions(context);

            expect(result.hierarchy.structure).toBe('matrix');
            expect(result.hierarchy.levels).toBe(4);
        });

        it('deve identificar gaps quando faltam departamentos críticos', () => {
            const context: OrganizationalContext = {
                companySize: 'medium',
                sector: 'textile',
                currentDepartments: ['Produção'], // Faltam RH e Financeiro
            };

            const result = generateOrganizationalSuggestions(context);

            expect(result.gaps.length).toBeGreaterThan(0);
            expect(result.gaps.some(gap => gap.includes('RH'))).toBe(true);
            expect(result.gaps.some(gap => gap.includes('Financeiro'))).toBe(true);
        });

        it('não deve sugerir departamentos que já existem', () => {
            const context: OrganizationalContext = {
                companySize: 'small',
                sector: 'textile',
                currentDepartments: ['Recursos Humanos', 'Financeiro', 'Comercial'],
            };

            const result = generateOrganizationalSuggestions(context);

            const deptNames = result.departments.map(d => d.name);
            expect(deptNames).not.toContain('Recursos Humanos');
            expect(deptNames).not.toContain('Financeiro');
            expect(deptNames).not.toContain('Comercial');
        });

        it('deve incluir estimativa de headcount nas sugestões', () => {
            const context: OrganizationalContext = {
                companySize: 'medium',
                sector: 'textile',
                currentDepartments: [],
            };

            const result = generateOrganizationalSuggestions(context);

            result.departments.forEach(dept => {
                expect(dept.estimatedHeadcount).toBeDefined();
                expect(dept.estimatedHeadcount).toBeGreaterThan(0);
            });
        });

        it('deve atribuir prioridades corretas aos departamentos', () => {
            const context: OrganizationalContext = {
                companySize: 'small',
                sector: 'textile',
                currentDepartments: [],
            };

            const result = generateOrganizationalSuggestions(context);

            // RH, Financeiro e Comercial devem ter prioridade alta
            const highPriority = result.departments.filter(d => d.priority === 'high');
            expect(highPriority.length).toBeGreaterThan(0);
        });

        it('deve gerar recomendações contextuais', () => {
            const context: OrganizationalContext = {
                companySize: 'medium',
                sector: 'textile',
                currentDepartments: [],
                employeeCount: 75,
            };

            const result = generateOrganizationalSuggestions(context);

            expect(result.recommendations).toBeDefined();
            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(r => r.includes('HRIS'))).toBe(true);
        });
    });

    describe('formatPromptForAI', () => {
        it('deve formatar prompt corretamente', () => {
            const context: OrganizationalContext = {
                companySize: 'medium',
                sector: 'textile',
                currentDepartments: ['RH', 'Financeiro'],
                employeeCount: 100,
            };

            const prompt = formatPromptForAI(context);

            expect(prompt).toContain('medium');
            expect(prompt).toContain('textile');
            expect(prompt).toContain('RH, Financeiro');
            expect(prompt).toContain('100');
        });

        it('deve lidar com departamentos vazios', () => {
            const context: OrganizationalContext = {
                companySize: 'small',
                sector: 'technology',
                currentDepartments: [],
            };

            const prompt = formatPromptForAI(context);

            expect(prompt).toContain('Nenhum');
        });
    });
});
