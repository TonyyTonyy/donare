import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/favorites/route";
import { callHandler } from "../../helpers/api";
import { setupPrismaMock } from "../../helpers/prisma";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({ methods: ["$transaction"] });

const callDelete = (url = "/api/favorites?productId=prod-1") =>
  callHandler({ handler, url, method: "DELETE" });

describe("DELETE /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("remove o favorito e retorna mensagem de confirmação", async () => {
      mock.method("$transaction").mockResolvedValue([{}]);

      const { status, body } = await callDelete();

      expect(status).toBe(200);
      expect(body).toEqual({ message: "Removido dos favoritos" });
    });

    it("remove favorito usando userId e productId corretos", async () => {
      mock.method("$transaction").mockResolvedValue([{}]);

      await callDelete("/api/favorites?productId=prod-abc");

      expect(mock.method("$transaction")).toHaveBeenCalledWith(
        expect.any(Array)
      );
    });
  });

  describe("erros de validação", () => {
    it("retorna 400 quando productId não é enviado", async () => {
      const { status, body } = await callDelete("/api/favorites");

      expect(status).toBe(400);
      expect(body).toEqual({ error: "productId é obrigatório" });
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.method("$transaction").mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callDelete();

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao remover favorito" });
    });
  });
});