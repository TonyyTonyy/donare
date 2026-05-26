import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json(
      {
        ok: true,
        message: "Logout realizado com sucesso.",
      },
      { status: 200 }
    );

    // Remove o cookie sobrescrevendo ele expirado
    res.cookies.set({
      name: "access_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { message: "Erro ao realizar logout." },
      { status: 500 }
    );
  }
}