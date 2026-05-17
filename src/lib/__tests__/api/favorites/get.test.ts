import { describe, it, expect, vi } from "vitest";
import * as handler from "@/app/api/favorites/route";
import { callHandler } from "../../helpers/api";
import { setupPrismaMock } from "../../helpers/prisma";
import { makeFavorite } from "../../helpers/factories";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({ methods: ["$transaction"] });

const callGet = (url = "/api/favorites") =>
  callHandler({ handler, url });

describe("GET /api/favorites", () => {
  describe("sucesso", () => {
    it("retorna favoritos com campos achatados e favoritedAt", async () => {
      mock.method("$transaction").mockResolvedValue([[makeFavorite()], 1]);

      const { status, body } = await callGet();

      expect(status).toBe(200);
      expect(body.favorites).toHaveLength(1);
      expect(body.favorites[0]).toMatchObject({
        id: "prod-1",
        title: "Camiseta Nike",
        favoritedAt: expect.any(String),
      });
    });

    it("retorna paginação padrão (page=1, limit=20)", async () => {
      mock.method("$transaction").mockResolvedValue([[makeFavorite()], 1]);

      const { body } = await callGet();

      expect(body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("respeita page e limit enviados na query", async () => {
      mock.method("$transaction").mockResolvedValue([[], 50]);

      const { body } = await callGet("/api/favorites?page=3&limit=10");

      expect(body.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });

    it("retorna lista vazia quando usuário não tem favoritos", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      const { status, body } = await callGet();

      expect(status).toBe(200);
      expect(body.favorites).toHaveLength(0);
      expect(body.pagination).toMatchObject({ total: 0, totalPages: 0 });
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.method("$transaction").mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callGet();

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao buscar favoritos" });
    });
  });
});