import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Use ACCEPTED ou REJECTED." },
        { status: 400 }
      );
    }

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: { product: true },
    });

    if (!req) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      );
    }

    if (req.status !== "PENDING") {
      return NextResponse.json(
        { error: "Esta solicitação já foi respondida" },
        { status: 409 }
      );
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    if (status === "ACCEPTED") {
      await prisma.product.update({
        where: { id: req.productId },
        data: { status: "RESERVED", reservedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          userId: req.requesterId,
          type: "REQUEST_ACCEPTED",
          title: "Solicitação aceita! 🎉",
          message: `Seu interesse no produto "${req.product.title}" foi aceito!`,
          data: { productId: req.productId, requestId: req.id },
          actionUrl: `/interesses`,
          actionLabel: "Ver detalhes",
        },
      });
    } else {
      await prisma.user.update({
        where: { id: req.requesterId },
        data: { currentActiveRequests: { decrement: 1 } },
      });

      await prisma.notification.create({
        data: {
          userId: req.requesterId,
          type: "REQUEST_REJECTED",
          title: "Solicitação recusada",
          message: `Seu interesse no produto "${req.product.title}" não foi aceito desta vez.`,
          data: { productId: req.productId, requestId: req.id },
        },
      });
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("[PATCH /api/requests/[requestId]]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar solicitação" },
      { status: 500 }
    );
  }
}
