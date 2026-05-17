import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/feed/route";
import { callHandler } from "../../helpers/api";
import { makeProductApiResponse } from "../../helpers/factories";
import { setupPrismaMock } from "../../helpers/prisma";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({ methods: ["$transaction"] });

const callGet = (url = "/api/feed") =>
  callHandler({ handler, url });

describe("GET /api/feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("retorna lista de produtos com paginação padrão", async () => {
      mock.method("$transaction").mockResolvedValue([
        [makeProductApiResponse() as any],
        1,
      ]);

      const { status, body } = await callGet();

      expect(status).toBe(200);
      expect(body.products).toHaveLength(1);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("calcula e formata a distância em metros quando coordenadas são fornecidas", async () => {
      mock.method("$transaction").mockResolvedValue([
        [makeProductApiResponse({ pickupLatitude: -12.2664, pickupLongitude: -38.9663 }) as any],
        1,
      ]);

      const { body } = await callGet("/api/feed?lat=-12.2664&lng=-38.9663");

      expect(body.products[0].distanceFormatted).toBe("0 m");
      expect(body.products[0].distanceMeters).toBe(0);
    });

    it("formata distância em km quando >= 1000 m", async () => {
      mock.method("$transaction").mockResolvedValue([
        [makeProductApiResponse({ pickupLatitude: -12.2664, pickupLongitude: -38.9663 }) as any],
        1,
      ]);

      const { body } = await callGet("/api/feed?lat=-12.2219&lng=-38.9663");

      expect(body.products[0].distanceFormatted).toMatch(/km$/);
    });

    it("exclui produtos do próprio usuário logado", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      await callGet();

      expect(mock.method("$transaction")).toHaveBeenCalledWith([
        expect.objectContaining({
          spec: expect.objectContaining({
            action: "findMany",
            model: "Product",
            args: expect.objectContaining({
              where: expect.objectContaining({
                donorId: { not: "cmofytoqj00003j6tdv6lipwy" },
              }),
            }),
          }),
        }),
        expect.anything(),
      ]);
    });

    it("filtra por categoria quando o parâmetro é enviado", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      await callGet("/api/feed?category=CLOTHING");

      expect(mock.method("$transaction")).toHaveBeenCalledWith([
        expect.objectContaining({
          spec: expect.objectContaining({
            args: expect.objectContaining({
              where: expect.objectContaining({
                category: "CLOTHING",
              }),
            }),
          }),
        }),
        expect.anything(),
      ]);
    });

    it("não aplica filtro de categoria quando category=ALL", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      await callGet("/api/feed?category=ALL");

      const callArg = mock.method("$transaction").mock.calls[0][0] as any;

      expect(callArg[0].spec.args.where.category).toBeUndefined();
    });

    it("filtra por busca textual quando search é enviado", async () => {
      mock.method("$transaction").mockResolvedValue([[], 0]);

      await callGet("/api/feed?search=nike");

      expect(mock.method("$transaction")).toHaveBeenCalledWith([
        expect.objectContaining({
          spec: expect.objectContaining({
            args: expect.objectContaining({
              where: expect.objectContaining({
                OR: [
                  { title: { contains: "nike", mode: "insensitive" } },
                  { description: { contains: "nike", mode: "insensitive" } },
                ],
              }),
            }),
          }),
        }),
        expect.anything(),
      ]);
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.method("$transaction").mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callGet();

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao buscar produtos" });
    });
  });
});