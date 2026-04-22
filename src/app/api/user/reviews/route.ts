import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = "cmni4drrf00003j6t0lua216x"

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const sort  = searchParams.get("sort") === "rating" ? { rating: "desc" as const } : { createdAt: "desc" as const };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { reviewedId: userId } }),
      prisma.review.findMany({
        where:   { reviewedId: userId },
        orderBy: sort,
        skip:    (page - 1) * limit,
        take:    limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          isPunctual: true,
          isCommunicative: true,
          isAsDescribed: true,
          isRespectful: true,
          wouldRecommend: true,
          createdAt: true,
          reviewer: {
            select: {
              name: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { reviewedId: userId },
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

    const avgRating = total > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        avgRating: Number(avgRating.toFixed(2)),
        distribution: [5, 4, 3, 2, 1].map((star) => ({
          star,
          count: distribution.find((d) => d.rating === star)?._count.rating ?? 0,
        })),
      },
    });
  } catch (err) {
    console.error("[GET /api/user/reviews]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}