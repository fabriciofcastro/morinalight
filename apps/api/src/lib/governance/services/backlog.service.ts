import { AccessContext, Decision } from "../types/context.types";

export interface BacklogEvent {
    event_id: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    responsible_area: 'SECURITY' | 'COMPLIANCE' | 'HR';
    context: AccessContext;
}

export class BacklogService {
    /**
     * Cria um evento de backlog para análise humana posterior.
     * Dispara quando: Outside Working Hours, Foreign IP, Policy Exception.
     */
    static dispatch(event: BacklogEvent): void {
        // Na implementação real, isso enviaria para SQS/Kafka/Jira
        console.log(`[BACKLOG][${event.severity}] ${event.description}`, {
            user: event.context.userId,
            area: event.responsible_area
        });
    }

    static createEventWhen(decision: Decision, context: AccessContext, reasons: string[]): void {
        if (reasons.includes('OUTSIDE_HOURS')) {
            this.dispatch({
                event_id: crypto.randomUUID(),
                severity: 'INFO',
                description: 'Acesso fora do horário de trabalho',
                responsible_area: 'HR', // RH deve saber
                context
            });
        }

        if (reasons.includes('FOREIGN_IP')) {
            this.dispatch({
                event_id: crypto.randomUUID(),
                severity: 'CRITICAL',
                description: 'Tentativa de acesso de IP estrangeiro',
                responsible_area: 'SECURITY',
                context
            });
        }
    }
}
