import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyAccessToken } from "@/lib/auth"

// GET /api/analytics/filters - List all saved filters for user/org
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
        const includeShared = searchParams.get("includeShared") === "true"

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

        const filters = await prisma.filterConfiguration.findMany({
            where: {
                orgId,
                OR: [
                    { userId: user.id },
                    ...(includeShared ? [{ isShared: true }] : []),
                ],
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        })

        return NextResponse.json(filters)
    } catch (error) {
        console.error("Erro ao buscar filtros:", error)
        return NextResponse.json(
            { error: "Erro ao buscar filtros" },
            { status: 500 }
        )
    }
}

// POST /api/analytics/filters - Create new filter configuration
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
        const { orgId, name, description, filterData, isDefault, isShared } = body

        if (!orgId || !name || !filterData) {
            return NextResponse.json(
                { error: "orgId, name e filterData são obrigatórios" },
                { status: 400 }
            )
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.filterConfiguration.updateMany({
                where: { orgId, userId: user.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        const filter = await prisma.filterConfiguration.create({
            data: {
                orgId,
                userId: user.id,
                name,
                description,
                filterData,
                isDefault: isDefault || false,
                isShared: isShared || false,
            },
        })

        return NextResponse.json(filter, { status: 201 })
    } catch (error) {
        console.error("Erro ao criar filtro:", error)
        return NextResponse.json(
            { error: "Erro ao criar filtro" },
            { status: 500 }
        )
    }
}

// PATCH /api/analytics/filters - Update filter configuration
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
        const { id, name, description, filterData, isDefault, isShared } = body

        if (!id) {
            return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
        }

        // Verify ownership
        const existing = await prisma.filterConfiguration.findUnique({
            where: { id },
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.filterConfiguration.updateMany({
                where: {
                    orgId: existing.orgId,
                    userId: user.id,
                    isDefault: true,
                    id: { not: id },
                },
                data: { isDefault: false },
            })
        }

        const filter = await prisma.filterConfiguration.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(filterData && { filterData }),
                ...(isDefault !== undefined && { isDefault }),
                ...(isShared !== undefined && { isShared }),
            },
        })

        return NextResponse.json(filter)
    } catch (error) {
        console.error("Erro ao atualizar filtro:", error)
        return NextResponse.json(
            { error: "Erro ao atualizar filtro" },
            { status: 500 }
        )
    }
}

// DELETE /api/analytics/filters - Delete filter configuration
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
        const existing = await prisma.filterConfiguration.findUnique({
            where: { id },
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
        }

        await prisma.filterConfiguration.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Erro ao deletar filtro:", error)
        return NextResponse.json(
            { error: "Erro ao deletar filtro" },
            { status: 500 }
        )
    }
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
