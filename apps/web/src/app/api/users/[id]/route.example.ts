/**
 * Protected API Route Example
 * 
 * Exemplo de rota API protegida com RBAC
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";
import { userRepository } from "@/lib/repositories";

/**
 * GET /api/users/[id]
 * Buscar usuário por ID
 */
export async function GET(
    request: NextRequest,
    context: { params: { id: string } },
) {
    // Verificar permissão de leitura
    const authResult = await requirePermission(ACTIONS.READ, RESOURCES.USERS)(
        request,
        context,
    );
    if (authResult) return authResult;

    try {
        const user = await userRepository.findById(context.params.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * PUT /api/users/[id]
 * Atualizar usuário
 */
export async function PUT(
    request: NextRequest,
    context: { params: { id: string } },
) {
    // Verificar permissão de atualização
    const authResult = await requirePermission(ACTIONS.UPDATE, RESOURCES.USERS)(
        request,
        context,
    );
    if (authResult) return authResult;

    try {
        const data = await request.json();
        const user = await userRepository.update(context.params.id, data);

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Deletar usuário
 */
export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } },
) {
    // Verificar permissão de exclusão
    const authResult = await requirePermission(ACTIONS.DELETE, RESOURCES.USERS)(
        request,
        context,
    );
    if (authResult) return authResult;

    try {
        await userRepository.delete(context.params.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * RESULTADO:
 * 
 * ✅ Rota protegida com RBAC
 * ✅ JWT validado automaticamente
 * ✅ Permissões verificadas
 * ✅ Audit log automático
 * ✅ Type-safe
 * 
 * Apenas usuários com permissão podem acessar!
 */
