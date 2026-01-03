import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAccessToken } from "@/lib/auth"

// GET /api/analytics/schedules - List all report schedules for user/org
export async function GET(req: NextRequest) {
    try {
        const userEmail = getAuthenticatedUserEmail(req)
        if (!userEmail) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const prisma = await getPrismaClient()
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
        }

        const { searchParams } = new URL(req.url)
        const orgId = searchParams.get("orgId")

        if (!orgId) {
            return NextResponse.json(
                { error: "orgId é obrigatório" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        const schedules = await prisma.reportSchedule.findMany({
            where: {
                orgId,
                userId: user.id,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(schedules)
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error)
        return NextResponse.json(
            { error: "Erro ao buscar agendamentos" },
            { status: 500 }
        )
    }
}

// POST /api/analytics/schedules - Create new report schedule
export async function POST(req: NextRequest) {
    try {
        const userEmail = getAuthenticatedUserEmail(req)
        if (!userEmail) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const prisma = await getPrismaClient()
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        const body = await req.json()
        const {
            orgId,
            name,
            description,
            reportType,
            frequency,
            dayOfWeek,
            dayOfMonth,
            timeOfDay,
            parameters,
            format,
            recipients,
        } = body

        if (!orgId || !name || !reportType || !frequency || !recipients) {
            return NextResponse.json(
                {
                    error:
                        "orgId, name, reportType, frequency e recipients são obrigatórios",
                },
                { status: 400 }
            )
        }

        // Calculate next run time
        const nextRunAt = calculateNextRun(
            frequency,
            dayOfWeek,
            dayOfMonth,
            timeOfDay
        )

        const schedule = await prisma.reportSchedule.create({
            data: {
                orgId,
                userId: user.id,
                name,
                description,
                reportType,
                frequency,
                dayOfWeek,
                dayOfMonth,
                timeOfDay,
                parameters,
                format: format || "pdf",
                recipients,
                nextRunAt,
            },
        })

        return NextResponse.json(schedule, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar agendamento:", error)
        return NextResponse.json(
            { error: "Erro ao criar agendamento" },
            { status: 500 }
        )
    }
}

// PATCH /api/analytics/schedules - Update report schedule
export async function PATCH(req: NextRequest) {
    try {
        const userEmail = getAuthenticatedUserEmail(req)
        if (!userEmail) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const prisma = await getPrismaClient()
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        const body = await req.json()
        const {
            id,
            name,
            description,
            reportType,
            frequency,
            dayOfWeek,
            dayOfMonth,
            timeOfDay,
            parameters,
            format,
            recipients,
            isActive,
        } = body

        if (!id) {
            return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
        }

        // Verify ownership
        const existing = await prisma.reportSchedule.findUnique({
            where: { id },
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
        }

        // Recalculate next run if schedule changed
        let nextRunAt = existing.nextRunAt
        if (frequency || dayOfWeek || dayOfMonth || timeOfDay) {
            nextRunAt = calculateNextRun(
                frequency || existing.frequency,
                dayOfWeek !== undefined ? dayOfWeek : existing.dayOfWeek,
                dayOfMonth !== undefined ? dayOfMonth : existing.dayOfMonth,
                timeOfDay || existing.timeOfDay
            )
        }

        const schedule = await prisma.reportSchedule.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(reportType && { reportType }),
                ...(frequency && { frequency }),
                ...(dayOfWeek !== undefined && { dayOfWeek }),
                ...(dayOfMonth !== undefined && { dayOfMonth }),
                ...(timeOfDay && { timeOfDay }),
                ...(parameters && { parameters }),
                ...(format && { format }),
                ...(recipients && { recipients }),
                ...(isActive !== undefined && { isActive }),
                nextRunAt,
            },
        })

        return NextResponse.json(schedule)
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error)
        return NextResponse.json(
            { error: "Erro ao atualizar agendamento" },
            { status: 500 }
        )
    }
}

// DELETE /api/analytics/schedules - Delete report schedule
export async function DELETE(req: NextRequest) {
    try {
        const userEmail = getAuthenticatedUserEmail(req)
        if (!userEmail) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const prisma = await getPrismaClient()
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
        }

        // Verify ownership
        const existing = await prisma.reportSchedule.findUnique({
            where: { id },
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
        }

        await prisma.reportSchedule.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Erro ao deletar agendamento:", error)
        return NextResponse.json(
            { error: "Erro ao deletar agendamento" },
            { status: 500 }
        )
    }
}

// Helper function to calculate next run time
function calculateNextRun(
    frequency: string,
    dayOfWeek?: number | null,
    dayOfMonth?: number | null,
    timeOfDay?: string | null
): Date {
    const now = new Date()
    const [hours, minutes] = (timeOfDay || "09:00").split(":").map(Number)

    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    switch (frequency) {
        case "daily":
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1)
            }
            break

        case "weekly":
            const targetDay = dayOfWeek || 1 // Default to Monday
            const currentDay = nextRun.getDay()
            let daysUntilTarget = targetDay - currentDay
            if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextRun <= now)) {
                daysUntilTarget += 7
            }
            nextRun.setDate(nextRun.getDate() + daysUntilTarget)
            break

        case "monthly":
            const targetDate = dayOfMonth || 1
            nextRun.setDate(targetDate)
            if (nextRun <= now) {
                nextRun.setMonth(nextRun.getMonth() + 1)
            }
            break

        case "quarterly":
            const targetDateQ = dayOfMonth || 1
            nextRun.setDate(targetDateQ)
            // Find next quarter
            const currentMonth = nextRun.getMonth()
            const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3
            nextRun.setMonth(nextQuarterMonth)
            if (nextRun <= now) {
                nextRun.setMonth(nextRun.getMonth() + 3)
            }
            break
    }

    return nextRun
}

function getAuthenticatedUserEmail(req: NextRequest): string | null {
    const token = req.cookies.get("auth-token")?.value
    if (!token) return null
    try {
        const payload = verifyAccessToken(token)
        return payload.email
    } catch {
        return null
    }
}
