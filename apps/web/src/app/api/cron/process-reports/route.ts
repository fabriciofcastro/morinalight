import { getPrismaClient } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * Cron job endpoint to process scheduled reports
 * This should be called periodically (e.g., every hour) by a cron service
 * 
 * Example with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-reports",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = req.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const prisma = await getPrismaClient()
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
        }

        const now = new Date()

        // Find all active schedules that are due to run
        const dueSchedules = await prisma.reportSchedule.findMany({
            where: {
                isActive: true,
                nextRunAt: {
                    lte: now,
                },
            },
        })

        const results = []

        for (const schedule of dueSchedules) {
            try {
                // Generate and send report
                await generateAndSendReport(schedule)

                // Calculate next run time
                const nextRunAt = calculateNextRun(
                    schedule.frequency,
                    schedule.dayOfWeek,
                    schedule.dayOfMonth,
                    schedule.timeOfDay
                )

                // Update schedule
                await prisma.reportSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        lastRunAt: now,
                        nextRunAt,
                    },
                })

                results.push({
                    scheduleId: schedule.id,
                    status: "success",
                    nextRunAt,
                })
            } catch (error) {
                console.error(`Erro ao processar agendamento ${schedule.id}:`, error)
                results.push({
                    scheduleId: schedule.id,
                    status: "error",
                    error: error instanceof Error ? error.message : "Erro desconhecido",
                })
            }
        }

        return NextResponse.json({
            processed: results.length,
            results,
        })
    } catch (error) {
        console.error("Erro ao processar relatórios agendados:", error)
        return NextResponse.json(
            { error: "Erro ao processar relatórios" },
            { status: 500 }
        )
    }
}

// Helper function to generate and send report
async function generateAndSendReport(schedule: any) {
    const prisma = await getPrismaClient()
    if (!prisma) throw new Error("Database unavailable for report generation")

    console.log(`Gerando relatório: ${schedule.name} - Org: ${schedule.orgId}`)

    // 1. Fetch data based on report type
    let data: any[] = []
    let columns: string[] = []

    if (schedule.reportType === "certifications") {
        const certifications = await prisma.organizationCertification.findMany({
            where: { orgId: schedule.orgId },
            include: { certification: true }
        })

        // Apply filters if present in parameters
        let filtered = certifications.map((c: any) => ({
            title: c.certification.title,
            status: c.status,
            progress: c.progress,
            score: c.score,
            category: c.certification.category,
            updatedAt: c.updatedAt
        }))

        if (schedule.parameters?.filterValues) {
            const filters = schedule.parameters.filterValues
            filtered = filtered.filter((item: any) => {
                return filters.every((fv: any) => {
                    if (!fv.value) return true
                    switch (fv.fieldId) {
                        case 'status': return item.status === fv.value
                        case 'category': return item.category === fv.value
                        case 'progress': return item.progress >= Number(fv.value)
                        default: return true
                    }
                })
            })
        }

        data = filtered
        columns = ["Título", "Status", "Progresso (%)", "Score", "Categoria", "Última Atualização"]
    } else {
        // Fallback for other types
        data = [{ info: "Relatório de tipo não suportado ainda." }]
    }

    // 2. Generate File Buffer
    let attachment: { content: Buffer | string; filename: string; contentType: string } | null = null

    if (schedule.format === "pdf") {
        const { jsPDF } = await import("jspdf")
        const doc = new jsPDF()

        doc.setFontSize(18)
        doc.text(schedule.name, 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 30)

        // Use jspdf-autotable for professional tables
        const autoTable = (await import("jspdf-autotable")).default

        // Prepare data for autotable
        const tableData = data.map(item => [
            item.title,
            item.status,
            `${item.progress}%`,
            item.score,
            item.category,
            new Date(item.updatedAt).toLocaleDateString("pt-BR")
        ])

        autoTable(doc, {
            startY: 40,
            head: [columns],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }, // blue-600
        })

        const pdfBase64 = doc.output("datauristring").split(",")[1] as string
        attachment = {
            content: pdfBase64,
            filename: `${schedule.name.replace(/\s+/g, "_")}.pdf`,
            contentType: "application/pdf"
        }
    } else if (schedule.format === "excel") {
        const XLSX = await import("xlsx")
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório")
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

        attachment = {
            content: buffer.toString("base64"),
            filename: `${schedule.name.replace(/\s+/g, "_")}.xlsx`,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    }

    // 3. Send email using Resend
    if (process.env.RESEND_API_KEY) {
        try {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)

            const recipients = Array.isArray(schedule.recipients)
                ? schedule.recipients
                : [schedule.recipients]

            await resend.emails.send({
                from: process.env.EMAIL_FROM || "reports@morinalight.com",
                to: recipients,
                subject: `Relatório Agendado: ${schedule.name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2563eb;">Relatório: ${schedule.name}</h2>
                        <p>Olá, o relatório que você agendou acaba de ser gerado.</p>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Tipo:</strong> ${schedule.reportType}</li>
                            <li><strong>Formato:</strong> ${schedule.format}</li>
                            <li><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</li>
                        </ul>
                        <p>O arquivo está em anexo a este email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #666;">Enviado automaticamente por Morina Light Analytics.</p>
                    </div>
                `,
                attachments: attachment ? [
                    {
                        filename: attachment.filename,
                        content: attachment.content as any,
                    }
                ] : []
            })

            console.log(`Email enviado com sucesso para:`, recipients)
        } catch (emailError) {
            console.error("Erro ao enviar email:", emailError)
        }
    } else {
        console.log("RESEND_API_KEY não configurado - email enviado apenas para log")
    }
}


// Helper function to calculate next run time (same as in schedules route)
function calculateNextRun(
    frequency: string,
    dayOfWeek?: number | null,
    dayOfMonth?: number | null,
    timeOfDay?: string | null
): Date {
    const now = new Date()
    const [hours = 9, minutes = 0] = (timeOfDay || "09:00").split(":").map(Number)

    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    switch (frequency) {
        case "daily":
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1)
            }
            break

        case "weekly":
            const targetDay = dayOfWeek || 1
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
