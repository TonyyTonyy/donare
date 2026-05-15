import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = "cmofytoqj00003j6tdv6lipwy";

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { donorId: userId },
        include: {
          _count: {
            select: { requests: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where: { donorId: userId } }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error("[GET /api/user/products]", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
