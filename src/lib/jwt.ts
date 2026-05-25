import jwt from "jsonwebtoken";

const DEFAULT_ISSUER = "donare";


function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no ambiente.");
  }
  return secret;
}

export type AccessTokenPayload = {
  sub: string; // userId
};

export function signAccessToken(payload: AccessTokenPayload, opts?: { expiresIn?: string }) {
  const secret = getJwtSecret();

  const expiresIn = opts?.expiresIn ?? "30d";

  // jsonwebtoken tipa de forma diferente dependendo de versão/config TS,
  // então fazemos cast para evitar incompatibilidade de overload.
  return (jwt as any).sign(
    {
      sub: payload.sub,
    },
    secret,
    {
      expiresIn,
      issuer: DEFAULT_ISSUER,
    }
  );
}


export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = getJwtSecret();

  const decoded = (jwt as any).verify(token, secret, {
    issuer: DEFAULT_ISSUER,
  });

  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Token inválido");
  }

  const sub = (decoded as any).sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("Token inválido: sub ausente");
  }

  return { sub };
}

