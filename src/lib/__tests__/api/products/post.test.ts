import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/products/route";
import { callHandler } from "../../helpers/api";
import { makeProduct } from "../../helpers/factories";
import { setupPrismaMock } from "../../helpers/prisma";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({
  models: {
    product: ["create"],
  },
});

const makeValidBody = (overrides?: Record<string, unknown>) => ({
  title: "Camiseta Nike",
  description: "Em ótimo estado, usada poucas vezes",
  category: "CLOTHING",
  condition: "GOOD",
  pickupType: "NEUTRAL_POINT",
  pickupCity: "Feira de Santana",
  images: ["img1.jpg"],
  primaryImageIndex: 0,
  ...overrides,
});

const callPost = (body?: Record<string, unknown>, url = "/api/products") =>
  callHandler({ handler, url, method: "POST", body });

describe("POST /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("cria o produto e retorna 201 com o objeto criado", async () => {
      mock.model("product").create.mockResolvedValue(makeProduct() as any);

      const { status, body } = await callPost(makeValidBody());

      expect(status).toBe(201);
      expect(body.product).toMatchObject({
        id: "prod-1",
        title: "Camiseta Nike",
        status: "ACTIVE",
      });
    });

    it("persiste todos os campos obrigatórios enviados", async () => {
      mock.model("product").create.mockResolvedValue(makeProduct() as any);

      const body = makeValidBody({
        size: "M",
        brand: "Nike",
        pickupAddress: "Rua das Flores, 10",
        pickupLatitude: -12.2664,
        pickupLongitude: -38.9663,
        pickupInstructions: "Tocar campainha",
      });

      await callPost(body);

      expect(mock.model("product").create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Camiseta Nike",
            category: "CLOTHING",
            condition: "GOOD",
            pickupType: "NEUTRAL_POINT",
            size: "M",
            brand: "Nike",
          }),
        })
      );
    });
  });

  describe("erros de validação", () => {
    it("retorna 422 quando o body está vazio", async () => {
      const { status, body } = await callPost({});

      expect(status).toBe(422);
      expect(body).toMatchObject({ error: "Dados inválidos" });
      expect(body.details).toBeDefined();
    });

    it("retorna 422 quando title está ausente", async () => {
      const { status, body } = await callPost(makeValidBody({ title: undefined }));

      expect(status).toBe(422);
      expect(body.error).toBe("Dados inválidos");
    });

    it("retorna 422 quando a categoria é inválida", async () => {
      const { status, body } = await callPost(makeValidBody({ category: "INVALID_CATEGORY" }));

      expect(status).toBe(422);
      expect(body.error).toBe("Dados inválidos");
    });

    it("retorna 422 quando condition é inválida", async () => {
      const { status, body } = await callPost(makeValidBody({ condition: "PERFECT" }));

      expect(status).toBe(422);
      expect(body.error).toBe("Dados inválidos");
    });

    it("não chama o banco quando o schema falha", async () => {
      await callPost({});

      expect(mock.model("product").create).not.toHaveBeenCalled();
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.model("product").create.mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callPost(makeValidBody());

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro interno. Tente novamente." });
    });
  });
});