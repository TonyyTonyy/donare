import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserIdFromRequest } from "@/lib/auth";


export async function GET(_req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

      const userId = await getUserIdFromRequest(_req)

    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({ blocks, total: blocks.length });
  } catch (err: any) {
    console.error("[GET /api/user/blocks]", err);

    if (String(err?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const blockSchema = z.object({
  userIdBlock: z.string().cuid(),
  reason: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(req)

    const body = await req.json();
    const parsed = blockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
    }

    const { userIdBlock, reason } = parsed.data;

    if (userIdBlock === userId) {
      return NextResponse.json({ error: "Você não pode bloquear a si mesmo" }, { status: 400 });
    }

    const block = await prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: userIdBlock,
        },
      },
      create: {
        blockerId: userId,
        blockedId: userIdBlock,
        reason,
      },
      update: {},
    });

    return NextResponse.json(block, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/user/blocks]", err);

    if (String(err?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(req)

    const userIdBlock = req.nextUrl.searchParams.get("userId");
    if (!userIdBlock) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: userId,
        blockedId: userIdBlock,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/user/blocks]", err);

    if (String(err?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}