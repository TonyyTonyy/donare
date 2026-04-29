import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const requesterId = "cmni4drrf00003j6t0lua216x"

    const body = await request.json();
    const { productId, message } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId é obrigatório" },
        { status: 400 }
      );
    }
    
     const product = await prisma.product.findUnique({
       where: { id: productId },
       include: { donor: { select: { id: true } } },
     });
    
     if (!product) {
       return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
     }
     if (product.status !== "ACTIVE") {
       return NextResponse.json({ error: "Produto não disponível" }, { status: 409 });
     }
     if (product.donorId === requesterId) {
       return NextResponse.json({ error: "Você não pode solicitar seu próprio produto" }, { status: 400 });
     }

     const existing = await prisma.request.findUnique({
       where: { productId_requesterId: { productId, requesterId } },
     });
     if (existing) {
       return NextResponse.json({ error: "Você já solicitou este produto" }, { status: 409 });
     }

     // Check max simultaneous requests
     const user = await prisma.user.findUnique({ where: { id: requesterId } });
     if (user!.currentActiveRequests >= user!.maxSimultaneousRequests) {
       return NextResponse.json(
         { error: `Limite de ${user!.maxSimultaneousRequests} solicitações ativas atingido` },
         { status: 429 }
       );
     }
    
     const [req] = await prisma.$transaction(async (tx) => {
       const newRequest = await tx.request.create({
         data: { productId, requesterId, message, status: "PENDING" },
       });
    
       await tx.user.update({
         where: { id: requesterId },
         data: { currentActiveRequests: { increment: 1 } },
       });
    
       await tx.notification.create({
         data: {
           userId: product.donorId,
           type: "REQUEST_RECEIVED",
           title: "Nova solicitação!",
           message: `Alguém tem interesse no seu produto "${product.title}"`,
           data: { productId, requestId: newRequest.id },
           actionUrl: `/solicitacoes/${newRequest.id}`,
           actionLabel: "Ver solicitação",
         },
       });

       if (product.autoAcceptFirstRequest) {
         await tx.request.update({
           where: { id: newRequest.id },
           data: { status: "ACCEPTED", respondedAt: new Date() },
         });
         await tx.product.update({
           where: { id: productId },
           data: { status: "RESERVED" },
         });
       }
    
       return [newRequest];
     });
    
     return NextResponse.json({ request: req }, { status: 201 });


  } catch (error) {
    console.error("[POST /api/requests]", error);
    return NextResponse.json(
      { error: "Erro ao criar solicitação" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = "cmni4drrf00003j6t0lua216x"

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") ?? "requester";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

     const where = role === "donor"
       ? { product: { donorId: userId } }
       : { requesterId: userId };
    
     const [requests, total] = await prisma.$transaction([
       prisma.request.findMany({
         where,
         include: { product: { include: { donor: true } }, requester: true },
         orderBy: { createdAt: "desc" },
         skip: (page - 1) * limit,
         take: limit,
       }),
       prisma.request.count({ where }),
     ]);
     return NextResponse.json({ requests, pagination: { page, limit, total } });
  } catch (error) {
    console.error("[GET /api/requests]", error);
    return NextResponse.json({ error: "Erro ao buscar solicitações" }, { status: 500 });
  }
}