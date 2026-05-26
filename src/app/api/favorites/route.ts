import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from '@/lib/auth'


export async function GET(request: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(request)
     

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    
     const [favorites, total] = await prisma.$transaction([
       prisma.favorite.findMany({
         where: { userId },
         include: {
           product: {
             include: {
               donor: {
                 select: {
                   id: true,
                   name: true,
                   nickname: true,
                   avatar: true,
                   reputationScore: true,
                 },
               },
             },
           },
         },
         orderBy: { createdAt: "desc" },
         skip: (page - 1) * limit,
         take: limit,
       }),
       prisma.favorite.count({ where: { userId } }),
     ]);
    
     return NextResponse.json({
       favorites: favorites.map((f) => ({ ...f.product, favoritedAt: f.createdAt })),
       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
     });

  } catch (error: any) {
    console.error("[GET /api/favoritos]", error);

    if (String(error?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro ao buscar favoritos" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
     /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(request)


    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 });
    }

     const existing = await prisma.favorite.findUnique({
       where: { userId_productId: { userId: userId, productId } },
     });
     if (existing) {
       return NextResponse.json({ error: "Produto já favoritado" }, { status: 409 });
     }
     const favorite = await prisma.favorite.create({
       data: { userId: userId, productId },
     });
     return NextResponse.json({ favorite }, { status: 201 });

  } catch (error: any) {
    console.error("[POST /api/favoritos]", error);

    if (String(error?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro ao favoritar" }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = await getUserIdFromRequest(request)
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 });
    }

     await prisma.favorite.delete({
       where: { userId_productId: { userId: userId, productId } },
     });

    return NextResponse.json({ message: "Removido dos favoritos" });
  } catch (error: any) {
    console.error("[DELETE /api/favoritos]", error);

    if (String(error?.message ?? "").includes("Não autenticado")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    return NextResponse.json({ error: "Erro ao remover favorito" }, { status: 500 });
  }
}
