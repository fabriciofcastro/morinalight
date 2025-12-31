export interface BusinessHoursShift {
    start: string; // "08:00"
    end: string;   // "18:00"
}

export interface BusinessHours {
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, etc.
    isOpen: boolean;
    shifts: BusinessHoursShift[];
}

export interface BranchBusinessHours {
    branchId: string;
    hours: BusinessHours[];
    specialDates?: SpecialDate[];
    timezone?: string;
}

export interface SpecialDate {
    date: string; // ISO date
    isOpen: boolean;
    reason?: string; // "Feriado", "Manutenção", etc.
    shifts?: BusinessHoursShift[];
}

export const DAY_LABELS: Record<number, string> = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
};

export const DAY_SHORT_LABELS: Record<number, string> = {
    0: "Dom",
    1: "Seg",
    2: "Ter",
    3: "Qua",
    4: "Qui",
    5: "Sex",
    6: "Sáb",
};

// Templates pré-definidos
export const BUSINESS_HOURS_TEMPLATES = {
    "weekdays": {
        name: "Segunda a Sexta (8h-18h)",
        hours: [
            { dayOfWeek: 0 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 1 as const, isOpen: true, shifts: [{ start: "08:00", end: "18:00" }] },
            { dayOfWeek: 2 as const, isOpen: true, shifts: [{ start: "08:00", end: "18:00" }] },
            { dayOfWeek: 3 as const, isOpen: true, shifts: [{ start: "08:00", end: "18:00" }] },
            { dayOfWeek: 4 as const, isOpen: true, shifts: [{ start: "08:00", end: "18:00" }] },
            { dayOfWeek: 5 as const, isOpen: true, shifts: [{ start: "08:00", end: "18:00" }] },
            { dayOfWeek: 6 as const, isOpen: false, shifts: [] },
        ],
    },
    "weekdays-saturday": {
        name: "Segunda a Sábado (8h-12h / 13h-17h)",
        hours: [
            { dayOfWeek: 0 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 1 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }] },
            { dayOfWeek: 2 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }] },
            { dayOfWeek: 3 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }] },
            { dayOfWeek: 4 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }] },
            { dayOfWeek: 5 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }, { start: "13:00", end: "17:00" }] },
            { dayOfWeek: 6 as const, isOpen: true, shifts: [{ start: "08:00", end: "12:00" }] },
        ],
    },
    "24-7": {
        name: "24/7 (Sempre aberto)",
        hours: [
            { dayOfWeek: 0 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 1 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 2 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 3 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 4 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 5 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
            { dayOfWeek: 6 as const, isOpen: true, shifts: [{ start: "00:00", end: "23:59" }] },
        ],
    },
    "custom": {
        name: "Personalizado",
        hours: [
            { dayOfWeek: 0 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 1 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 2 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 3 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 4 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 5 as const, isOpen: false, shifts: [] },
            { dayOfWeek: 6 as const, isOpen: false, shifts: [] },
        ],
    },
};
