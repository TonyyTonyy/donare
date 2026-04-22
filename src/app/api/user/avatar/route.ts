import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

      const userId = "cmni4drrf00003j6t0lua216x"

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WebP" },
        { status: 415 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5 MB" },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const avatarUrl = `data:${file.type};base64,${base64}`;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl, updatedAt: new Date() },
      select: { avatar: true },
    });

    return NextResponse.json({ avatar: updated.avatar });
  } catch (err) {
    console.error("[POST /api/user/avatar]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}