import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type LoginBody = {
  email: string;
  password: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<LoginBody>;

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email) {
      return NextResponse.json({ message: "Email é obrigatório." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Senha é obrigatória." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Credenciais inválidas. Verifique o email e a senha." },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { message: "Credenciais inválidas. Verifique o email e a senha." },
        { status: 401 }
      );
    }

    // Persistir autenticação via cookie httpOnly
    const res = NextResponse.json(
      {
        ok: true,
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 200 }
    );

    const maxAgeSeconds = 60 * 60 * 24 * 30; // 30 dias

    res.cookies.set({
      name: "donare_user_id",
      value: String(user.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return res;
  } catch {
    return NextResponse.json(
      { message: "Erro ao realizar login. Tente novamente." },
      { status: 500 }
    );
  }
}

