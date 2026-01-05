import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { TimeWindow } from '@prisma/client';

/**
 * TbacService - Time-Based Access Control Service
 * Gerencia janelas de tempo e valida acesso temporal
 */
@Injectable()
export class TbacService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Verifica se o usuário pode acessar no momento atual
     */
    async isAccessAllowedNow(userId: string): Promise<boolean> {
        const activeWindows = await this.getActiveTimeWindows(userId);

        if (activeWindows.length === 0) {
            // Se não há janelas de tempo configuradas, permite acesso
            return true;
        }

        const now = new Date();

        // Verifica se está dentro de pelo menos uma janela de tempo
        return activeWindows.some(window => this.validateTimeWindow(window, now));
    }

    /**
     * Retorna as janelas de tempo ativas para o usuário
     */
    async getActiveTimeWindows(userId: string): Promise<TimeWindow[]> {
        // Busca janelas de tempo atribuídas diretamente ao usuário
        const userWindows = await this.prisma.timeWindow.findMany({
            where: {
                active: true,
                userAssignments: {
                    some: {
                        userId,
                    },
                },
            },
        });

        // Busca janelas de tempo atribuídas às roles do usuário
        const roleWindows = await this.prisma.timeWindow.findMany({
            where: {
                active: true,
                roleAssignments: {
                    some: {
                        role: {
                            users: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                },
            },
        });

        // Combina e remove duplicatas
        const allWindows = [...userWindows, ...roleWindows];
        const uniqueWindows = Array.from(
            new Map(allWindows.map(w => [w.id, w])).values()
        );

        return uniqueWindows;
    }

    /**
     * Valida se uma janela de tempo permite acesso no timestamp fornecido
     */
    validateTimeWindow(timeWindow: TimeWindow, timestamp: Date): boolean {
        // Converte para o timezone da janela
        const tz = timeWindow.timezone || 'UTC';
        const localTime = new Date(timestamp.toLocaleString('en-US', { timeZone: tz }));

        const currentHour = localTime.getHours();
        const currentMinute = localTime.getMinutes();
        const currentDay = localTime.getDay(); // 0 = Sunday

        // Verifica dia da semana
        if (!timeWindow.daysOfWeek.includes(currentDay)) {
            return false;
        }

        // Parse startTime e endTime (formato "HH:mm")
        const [startHour, startMinute] = timeWindow.startTime.split(':').map(Number);
        const [endHour, endMinute] = timeWindow.endTime.split(':').map(Number);

        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        // Verifica se está dentro do horário
        if (endTimeInMinutes > startTimeInMinutes) {
            // Caso normal: 08:00 - 18:00
            return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
        } else {
            // Caso que cruza meia-noite: 22:00 - 06:00
            return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes;
        }
    }

    /**
     * Cria acesso emergencial temporário para um usuário
     * @param userId ID do usuário
     * @param durationMinutes Duração em minutos
     */
    async createEmergencyAccess(
        userId: string,
        durationMinutes: number,
        orgId: string
    ): Promise<TimeWindow> {
        const now = new Date();
        const endTime = new Date(now.getTime() + durationMinutes * 60000);

        // Cria janela de tempo emergencial
        const emergencyWindow = await this.prisma.timeWindow.create({
            data: {
                orgId,
                name: `Acesso Emergencial - ${now.toISOString()}`,
                startTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
                endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
                daysOfWeek: [now.getDay()],
                timezone: 'America/Sao_Paulo',
                active: true,
            },
        });

        // Atribui ao usuário
        await this.prisma.userTimeWindow.create({
            data: {
                userId,
                timeWindowId: emergencyWindow.id,
            },
        });

        // Agenda desativação automática
        setTimeout(async () => {
            await this.prisma.timeWindow.update({
                where: { id: emergencyWindow.id },
                data: { active: false },
            });
        }, durationMinutes * 60000);

        return emergencyWindow;
    }

    /**
     * Cria uma janela de tempo
     */
    async createTimeWindow(data: {
        orgId: string;
        name: string;
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
        timezone?: string;
    }): Promise<TimeWindow> {
        return this.prisma.timeWindow.create({
            data: {
                ...data,
                timezone: data.timezone || 'America/Sao_Paulo',
            },
        });
    }

    /**
     * Atribui janela de tempo a um usuário
     */
    async assignToUser(timeWindowId: string, userId: string): Promise<void> {
        await this.prisma.userTimeWindow.create({
            data: {
                timeWindowId,
                userId,
            },
        });
    }

    /**
     * Atribui janela de tempo a uma role
     */
    async assignToRole(timeWindowId: string, roleId: string): Promise<void> {
        await this.prisma.roleTimeWindow.create({
            data: {
                timeWindowId,
                roleId,
            },
        });
    }

    /**
     * Lista janelas de tempo de uma organização
     */
    async listByOrganization(orgId: string): Promise<TimeWindow[]> {
        return this.prisma.timeWindow.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Atualiza janela de tempo
     */
    async updateTimeWindow(
        id: string,
        data: Partial<{
            name: string;
            startTime: string;
            endTime: string;
            daysOfWeek: number[];
            timezone: string;
            active: boolean;
        }>
    ): Promise<TimeWindow> {
        return this.prisma.timeWindow.update({
            where: { id },
            data,
        });
    }

    /**
     * Deleta janela de tempo
     */
    async deleteTimeWindow(id: string): Promise<void> {
        await this.prisma.timeWindow.delete({
            where: { id },
        });
    }
}
