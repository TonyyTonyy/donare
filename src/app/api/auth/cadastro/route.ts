import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { signAccessToken } from "@/lib/jwt";


type CadastroBody = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  cpf?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  bio?: string | null;
};

function normalizeNullableString(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CadastroBody>;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name) {
      return NextResponse.json({ message: "Nome é obrigatório." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ message: "Email é obrigatório." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "Senha é obrigatória (mínimo 6 caracteres)." },
        { status: 400 }
      );
    }

    const phone = normalizeNullableString(body.phone);
    const cpf = normalizeNullableString(body.cpf);
    const address = normalizeNullableString(body.address);
    const city = normalizeNullableString(body.city);
    const state = normalizeNullableString(body.state);
    const zipCode = normalizeNullableString(body.zipCode);
    const bio = normalizeNullableString(body.bio);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone,
        cpf,
        address,
        city,
        state,
        zipCode,
        bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const res = NextResponse.json({ ok: true, user }, { status: 201 });

    const maxAgeSeconds = 60 * 60 * 24 * 30; // 30 dias

    const accessToken = signAccessToken({ sub: String(user.id) });

    res.cookies.set({
      name: "access_token",
      value: accessToken,

      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return res;
  } catch (err: any) {
    const message = String(err?.message ?? "");

    // Prisma unique constraint (P2002)
    if (err?.code === "P2002" || message.toLowerCase().includes("unique")) {
      return NextResponse.json(
        {
          message:
            "Já existe uma conta com esses dados (email/telefone/CPF). Verifique e tente novamente.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Erro ao cadastrar usuário. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

