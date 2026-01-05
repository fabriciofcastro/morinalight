import { Injectable } from '@nestjs/common';
import type { AuditReport } from '../domain/types/audit-types';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Serviço para exportação de relatórios de auditoria em PDF
 */
@Injectable()
export class PdfExportService {
    /**
     * Gera PDF do relatório de auditoria
     */
    async generateAuditReportPDF(report: AuditReport): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });

                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                this.addHeader(doc, report);

                // Summary Section
                this.addSummarySection(doc, report);

                // Anomalies Sections
                this.addAnomaliesSection(doc, report);

                // Recommendations
                this.addRecommendationsSection(doc, report);

                // Footer
                this.addFooter(doc, report);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Adiciona cabeçalho do documento
     */
    private addHeader(doc: PDFKit.PDFDocument, report: AuditReport) {
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('Relatório de Auditoria de Permissões', { align: 'center' });

        doc.moveDown(0.5);

        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Data: ${new Date(report.timestamp).toLocaleString('pt-BR')}`, {
                align: 'center',
            });

        doc
            .text(`ID do Relatório: ${report.id}`, { align: 'center' })
            .moveDown(2);

        // Linha separadora
        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();

        doc.moveDown();
    }

    /**
     * Adiciona seção de resumo
     */
    private addSummarySection(doc: PDFKit.PDFDocument, report: AuditReport) {
        doc.fontSize(16).font('Helvetica-Bold').text('Resumo Executivo');

        doc.moveDown(0.5);

        // Score de Conformidade
        const score = report.summary.conformityScore;
        const scoreColor = this.getScoreColor(score);

        doc.fontSize(12).font('Helvetica');

        doc.text(`Score de Conformidade: ${score}%`, { continued: true });
        doc.font('Helvetica-Bold').fillColor(scoreColor).text(` [${this.getScoreStatus(score)}]`);
        doc.fillColor('black');

        doc.moveDown(0.5);

        // Métricas
        doc.font('Helvetica').fontSize(11);
        doc.text(`Total de Permissões: ${report.summary.totalPermissions}`);
        doc.text(`Total de Usuários: ${report.summary.totalUsers}`);
        doc.text(`Total de Cargos: ${report.summary.totalPositions}`);
        doc.text(`Total de Setores: ${report.summary.totalSectors}`);
        doc.text(`Total de Departamentos: ${report.summary.totalDepartments}`);

        doc.moveDown(0.5);

        // Anomalias
        doc.font('Helvetica-Bold').text('Anomalias Encontradas:');
        doc.font('Helvetica');
        doc.text(`Total: ${report.summary.anomaliesFound}`);
        doc.fillColor('red').text(`  • Críticas: ${report.summary.criticalIssues}`);
        doc.fillColor('orange').text(`  • Alta Severidade: ${report.summary.highSeverityIssues}`);
        doc.fillColor('yellow').text(`  • Média Severidade: ${report.summary.mediumSeverityIssues}`);
        doc.fillColor('gray').text(`  • Baixa Severidade: ${report.summary.lowSeverityIssues}`);
        doc.fillColor('black');

        doc.moveDown(2);
    }

    /**
     * Adiciona seções de anomalias
     */
    private addAnomaliesSection(doc: PDFKit.PDFDocument, report: AuditReport) {
        doc.fontSize(16).font('Helvetica-Bold').text('Detalhamento de Anomalias');
        doc.moveDown();

        // Permissões Órfãs
        this.addAnomalyCategory(
            doc,
            'Permissões Órfãs',
            report.orphanedPermissions.length,
            'Permissões atribuídas a entidades que não existem mais',
        );

        // Conflitos
        this.addAnomalyCategory(
            doc,
            'Conflitos de Permissões',
            report.conflicts.length,
            'Permissões contraditórias para o mesmo recurso',
        );

        // Excessivas
        this.addAnomalyCategory(
            doc,
            'Permissões Excessivas',
            report.excessivePermissions.length,
            'Permissões redundantes ou desnecessárias',
        );

        // Hierarquia
        this.addAnomalyCategory(
            doc,
            'Inconsistências Hierárquicas',
            report.hierarchyIssues.length,
            'Problemas na hierarquia de permissões',
        );

        // Gaps de Auditoria
        this.addAnomalyCategory(
            doc,
            'Gaps de Auditoria',
            report.auditGaps.length,
            'Mudanças sem registro adequado',
        );

        // Obsoletas
        this.addAnomalyCategory(
            doc,
            'Permissões Obsoletas',
            report.obsoletePermissions.length,
            'Permissões não utilizadas',
        );

        // Violações de SoD
        this.addAnomalyCategory(
            doc,
            'Violações de Segregação de Funções',
            report.sodViolations.length,
            'Usuários com permissões conflitantes',
        );

        doc.moveDown(2);
    }

    /**
     * Adiciona categoria de anomalia
     */
    private addAnomalyCategory(
        doc: PDFKit.PDFDocument,
        title: string,
        count: number,
        description: string,
    ) {
        doc.fontSize(12).font('Helvetica-Bold').text(`${title}: ${count}`);
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray').text(description);
        doc.fillColor('black');
        doc.moveDown(0.5);
    }

    /**
     * Adiciona seção de recomendações
     */
    private addRecommendationsSection(doc: PDFKit.PDFDocument, report: AuditReport) {
        if (report.recommendations.length === 0) {
            return;
        }

        doc.addPage();

        doc.fontSize(16).font('Helvetica-Bold').text('Recomendações');
        doc.moveDown();

        doc.fontSize(11).font('Helvetica');

        report.recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`);
            doc.moveDown(0.3);
        });

        doc.moveDown(2);
    }

    /**
     * Adiciona rodapé
     */
    private addFooter(doc: PDFKit.PDFDocument, report: AuditReport) {
        const pages = doc.bufferedPageRange();

        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            doc
                .fontSize(9)
                .font('Helvetica')
                .text(
                    `Página ${i + 1} de ${pages.count} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' },
                );
        }
    }

    /**
     * Retorna cor baseada no score
     */
    private getScoreColor(score: number): string {
        if (score >= 95) return 'green';
        if (score >= 80) return 'blue';
        if (score >= 60) return 'orange';
        return 'red';
    }

    /**
     * Retorna status baseado no score
     */
    private getScoreStatus(score: number): string {
        if (score >= 95) return 'EXCELENTE';
        if (score >= 80) return 'BOM';
        if (score >= 60) return 'ATENÇÃO';
        return 'CRÍTICO';
    }
}
