import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const settingsPatchSchema = z.object({
    showRealName: z.boolean().optional(),
    showStats: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    allowMessages: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    notifyNewProducts: z.boolean().optional(),
    notifyMessages: z.boolean().optional(),
    notifyRequests: z.boolean().optional(),
    defaultSearchRadius: z.number().int().min(500).max(50000).optional(),
}).strict();


export async function GET(_req: NextRequest) {
    try {
        /* const session = await auth();
        if (!session?.user?.id) {
          return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        } */

        const userId = "cmofytoqj00003j6tdv6lipwy"

        const settings = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                showRealName: true,
                showStats: true,
                showLocation: true,
                allowMessages: true,
                pushEnabled: true,
                emailNotifications: true,
                notifyNewProducts: true,
                notifyMessages: true,
                notifyRequests: true,
                defaultSearchRadius: true,
            },
        });

        if (!settings) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        return NextResponse.json(settings);
    } catch (err) {
        console.error("[GET /api/user/settings]", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        /* const session = await auth();
        if (!session?.user?.id) {
          return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        } */

        const userId = "cmofytoqj00003j6tdv6lipwy"

        const body = await req.json();
        const parsed = settingsPatchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { ...parsed.data, updatedAt: new Date() },
            select: {
                showRealName: true,
                showStats: true,
                showLocation: true,
                allowMessages: true,
                pushEnabled: true,
                emailNotifications: true,
                notifyNewProducts: true,
                notifyMessages: true,
                notifyRequests: true,
                defaultSearchRadius: true,
            },
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error("[PATCH /api/user/settings]", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}