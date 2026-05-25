import type { NextRequest } from "next/server";

import { verifyAccessToken } from "@/lib/jwt";

const AUTH_COOKIE_NAME = "access_token";

export async function getUserIdFromRequest(req: NextRequest): Promise<string> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new Error("Não autenticado");
  }

  const payload = await verifyAccessToken(token);
  return payload.sub;
}

