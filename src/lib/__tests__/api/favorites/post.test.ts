import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/favorites/route";
import { callHandler } from "../../helpers/api";
import { setupPrismaMock } from "../../helpers/prisma";
import { makeFavorite } from "../../helpers/factories";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({ methods: ["$transaction"] });

const callPost = (body?: Record<string, unknown>, url = "/api/favoritos") =>
  callHandler({ handler, url, method: "POST", body });

describe("POST /api/favoritos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("cria o favorito e retorna 201 com o objeto criado", async () => {
      mock.method("$transaction").mockResolvedValue([null, makeFavorite()]);

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(201);
      expect(body.favorite).toMatchObject({
        id: "fav-1",
        productId: "prod-1",
        userId: "cmofytoqj00003j6tdv6lipwy",
      });
    });

  });

  describe("erros de validação", () => {
    it("retorna 400 quando productId não é enviado no body", async () => {
      const { status, body } = await callPost({});

      expect(status).toBe(400);
      expect(body).toEqual({ error: "productId é obrigatório" });
    });

    it("não chama o banco quando productId está ausente", async () => {
      await callPost({});

      expect(mock.method("$transaction")).not.toHaveBeenCalled();
    });
  });

  describe("conflito", () => {
    it("retorna 409 quando o produto já foi favoritado", async () => {
      mock.method("$transaction").mockResolvedValue([makeFavorite(), null]);

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(409);
      expect(body).toEqual({ error: "Produto já favoritado" });
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.method("$transaction").mockRejectedValue(new Error("Erro ao favoritar"));

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao favoritar" });
    });
  });
});