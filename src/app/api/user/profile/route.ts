import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const profilePatchSchema = z.object({
  name:     z.string().min(2).max(100).optional(),
  nickname: z.string().min(2).max(50).regex(/^[a-z0-9._]+$/, "Apenas letras, números, pontos e _").optional().nullable(),
  bio:      z.string().max(300).optional().nullable(),
  phone:    z.string().min(10).max(15).optional().nullable(),
  city:     z.string().max(100).optional().nullable(),
  state:    z.string().max(2).optional().nullable(),
  zipCode:  z.string().max(9).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = "cmofytoqj00003j6tdv6lipwy"

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        bio: true,
        phone: true,
        city: true,
        state: true,
        zipCode: true,
        karmaPoints: true,
        reputationLevel: true,
        reputationScore: true,
        totalDonations: true,
        totalReceived: true,
        verificationLevel: true,
        showRealName: true,
        showStats: true,
        showLocation: true,
        allowMessages: true,
        pushEnabled: true,
        emailNotifications: true,
        notifyNewProducts: true,
        notifyMessages: true,
        notifyRequests: true,
        createdAt: true,
        userBadges: {
          include: {
            badge: {
              select: { name: true, description: true, icon: true, requirement: true, order: true },
            },
          },
          orderBy: { badge: { order: "asc" } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("[GET /api/user/profile]", err);
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
    const parsed = profilePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Verificar unicidade do nickname (se alterado)
    if (data.nickname) {
      const existing = await prisma.user.findFirst({
        where: { nickname: data.nickname, NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Apelido já em uso" }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        bio: true,
        phone: true,
        city: true,
        state: true,
        zipCode: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}