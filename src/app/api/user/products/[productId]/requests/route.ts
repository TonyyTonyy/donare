import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const requests = await prisma.request.findMany({
      where: { productId },
      include: {
        requester: {
            select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true,
            reputationScore: true,
            reputationLevel: true,
            totalDonations: true,
            totalReceived: true,
            showRealName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[GET /api/user/products/[productId]/requests]", error);
    return NextResponse.json(
      { error: "Erro ao buscar interessados" },
      { status: 500 }
    );
  }
}
