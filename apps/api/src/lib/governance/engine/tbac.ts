import { GovernancePolicy, WorkingHours } from "../types/policy.types";
import { AccessContext } from "../types/context.types";

export type ShiftType = 'REGULAR' | 'OVERTIME' | 'OUTSIDE_SHIFT';

export interface TBACResult {
    allowed: boolean;
    shift: ShiftType;
    requiresLegalAck: boolean;
    violation?: string;
}

export class TBACModule {
    /**
     * Avalia regras temporais (Jornada, Turnos, Horários)
     */
    static evaluate(context: AccessContext, policy: GovernancePolicy): TBACResult {
        const { timestamp } = context;
        const workingHours = policy.working_hours.default;

        // 1. Verifica se é dia útil
        if (!this.isBusinessDay(timestamp, workingHours.days)) {
            return {
                allowed: true, // TBAC geralmente não bloqueia, ele classifica. O bloqueio vem da política.
                shift: 'OVERTIME',
                requiresLegalAck: true,
                violation: 'NON_BUSINESS_DAY'
            };
        }

        // 2. Verifica horário
        if (!this.isWithinHours(timestamp, workingHours.start, workingHours.end, policy.working_hours.tolerance_minutes)) {
            return {
                allowed: true,
                shift: 'OVERTIME',
                requiresLegalAck: true,
                violation: 'OUTSIDE_HOURS'
            };
        }

        // 3. Regular
        return {
            allowed: true,
            shift: 'REGULAR',
            requiresLegalAck: false
        };
    }

    /**
     * Verifica se a data atual (UTC ou Local) cai em um dos dias permitidos.
     * Dias: MON, TUE, WED, THU, FRI, SAT, SUN
     */
    static isBusinessDay(date: Date, allowedDays: string[]): boolean {
        const daysMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const currentDay = daysMap[date.getDay()];
        return allowedDays.includes(currentDay);
    }

    /**
     * Verifica se o horário está dentro do intervalo start-end.
     * Formato start/end: "HH:mm"
     */
    static isWithinHours(date: Date, start: string, end: string, toleranceMinutes: number = 0): boolean {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const currentTime = hours * 60 + minutes;

        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startTime = startH * 60 + startM - toleranceMinutes;
        const endTime = endH * 60 + endM + toleranceMinutes;

        return currentTime >= startTime && currentTime <= endTime;
    }
}
