import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/requests/route";
import { callHandler } from "../../helpers/api";
import { setupPrismaMock } from "../../helpers/prisma";
import { makeRequestWithRelations } from "../../helpers/factories";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({ methods: ["$transaction"] });

const callGet = (url = "/api/requests") =>
  callHandler({ handler, url });

describe("GET /api/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("retorna solicitações com paginação padrão", async () => {
      mock.method("$transaction").mockResolvedValue([[makeRequestWithRelations()], 1]);

      const { status, body } = await callGet();

      expect(status).toBe(200);
      expect(body.requests).toHaveLength(1);
      expect(body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it("retorna lista vazia quando não há solicitações", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      const { status, body } = await callGet();

      expect(status).toBe(200);
      expect(body.requests).toHaveLength(0);
      expect(body.pagination).toMatchObject({ total: 0 });
    });

    it("respeita page e limit enviados na query", async () => {
      mock.method("$transaction").mockResolvedValue([[], 50]);

      const { body } = await callGet("/api/requests?page=3&limit=10");

      expect(body.pagination).toEqual({ page: 3, limit: 10, total: 50 });
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.method("$transaction").mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callGet();

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao buscar solicitações" });
    });
  });
});