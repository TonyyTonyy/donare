import { vi } from "vitest";

vi.mock("next/server", () => {
  class NextRequest {
    url: string;

    constructor(url: string) {
      this.url = url;
    }
  }

  const NextResponse = {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  };

  return { NextRequest, NextResponse };
});

interface CallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  body?: Record<string, unknown>;
  handler: any;
}

export async function callHandler({
  handler,
  method = "GET",
  url,
  body,
}: CallOptions) {
  const { NextRequest } = await import("next/server");

  const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`;
  const req = new NextRequest(fullUrl) as any;

  req.json = async () => body ?? {};

  const fn = handler[method];
  const res = await fn(req);

  return {
    status: res.status as number,
    body: (await res.json()) as Record<string, any>,
  };
}