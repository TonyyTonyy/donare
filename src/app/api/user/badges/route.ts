import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(_req)


    const allBadges = await prisma.badge.findMany({
      orderBy: { order: "asc" },
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: userId },
      select: {
        badgeId: true,
        progress: true,
        isUnlocked: true,
        unlockedAt: true,
      },
    });

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    const result = allBadges.map((badge) => {
      const userBadge = userBadgeMap.get(badge.id);
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        requirement: badge.requirement,
        requirementValue: badge.requirementValue,
        karmaReward: badge.karmaReward,
        progress: userBadge?.progress ?? 0,
        isUnlocked: userBadge?.isUnlocked ?? false,
        unlockedAt: userBadge?.unlockedAt ?? null,
        progressPercent: Math.min(
          100,
          Math.round(((userBadge?.progress ?? 0) / badge.requirementValue) * 100)
        ),
      };
    });

    return NextResponse.json({
      badges: result,
      unlocked: result.filter((b) => b.isUnlocked).length,
      total: result.length,
    });
  } catch (err: any) {
    console.error("[GET /api/user/badges]", err);

    if (String(err?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

}