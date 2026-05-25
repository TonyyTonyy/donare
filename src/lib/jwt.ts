import { jwtVerify, SignJWT } from "jose";

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

export async function signAccessToken(
  payload: AccessTokenPayload,
  opts?: { expiresIn?: string }
) {
  const secret = getJwtSecret();
  const expiresIn = opts?.expiresIn ?? "30d";

  // jose entende exp em segundos/ ms via Date, então convertemos usando o expiresIn.
  // Para manter compatibilidade com o que já existe no projeto, aceitamos apenas "30d" ou "Xd".
  const match = /^([0-9]+)d$/i.exec(expiresIn);
  const days = match ? Number(match[1]) : 30;

  const alg = "HS256" as const;

  const jwt = await new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg })
    .setIssuer(DEFAULT_ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(new TextEncoder().encode(secret));

  return jwt;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const secret = getJwtSecret();

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer: DEFAULT_ISSUER,
  });

  const sub = payload.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("Token inválido: sub ausente");
  }

  return { sub };
}


