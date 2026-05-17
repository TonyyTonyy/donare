import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "@/app/api/requests/route";
import { callHandler } from "../../helpers/api";
import { setupPrismaMock } from "../../helpers/prisma";
import { makeProduct, makeRequest, makeUser } from "../../helpers/factories";

vi.mock("@/lib/prisma");

const mock = setupPrismaMock({
  methods: ["$transaction"],
  models: {
    product: ["findUnique"],
    request: ["findUnique"],
    user:    ["findUnique"],
  },
});

const REQUESTER_ID = "cmni4drrf00003j6t0lua216x";

const makeActiveProduct = (overrides?: Record<string, unknown>) =>
  makeProduct({
    status: "ACTIVE",
    donorId: "cmofytoqj00003j6tdv6lipwy",
    autoAcceptFirstRequest: false,
    ...overrides,
  });

const makeRequester = (overrides?: Record<string, unknown>) =>
  makeUser({
    id: REQUESTER_ID,
    currentActiveRequests: 0,
    maxSimultaneousRequests: 3,
    ...overrides,
  } as any);

function setupCallbackTransactionMock(newRequest = makeRequest()) {
  const mockTx = {
    request: {
      create: vi.fn().mockResolvedValue(newRequest),
      update: vi.fn().mockResolvedValue({ ...newRequest, status: "ACCEPTED" }),
    },
    user:         { update: vi.fn().mockResolvedValue({}) },
    notification: { create: vi.fn().mockResolvedValue({}) },
    product:      { update: vi.fn().mockResolvedValue({}) },
  };

  mock.method("$transaction").mockImplementation(async (fn: any) => fn(mockTx));

  return mockTx;
}

const callPost = (body?: Record<string, unknown>) =>
  callHandler({ handler, url: "/api/requests", method: "POST", body });

describe("POST /api/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sucesso", () => {
    it("cria a solicitação e retorna 201", async () => {
      mock.model("product").findUnique.mockResolvedValue(makeActiveProduct() as any);
      mock.model("request").findUnique.mockResolvedValue(null);
      mock.model("user").findUnique.mockResolvedValue(makeRequester() as any);
      setupCallbackTransactionMock();

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(201);
      expect(body.request).toMatchObject({ id: "req-1", productId: "prod-1" });
    });

    it("cria a solicitação com mensagem opcional", async () => {
      mock.model("product").findUnique.mockResolvedValue(makeActiveProduct() as any);
      mock.model("request").findUnique.mockResolvedValue(null);
      mock.model("user").findUnique.mockResolvedValue(makeRequester() as any);
      const mockTx = setupCallbackTransactionMock();

      await callPost({ productId: "prod-1", message: "Posso buscar amanhã!" });

      expect(mockTx.request.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: "Posso buscar amanhã!",
          status: "PENDING",
        }),
      });
    });

    it("cria notificação para o doador na transação", async () => {
      const product = makeActiveProduct({ title: "Camiseta Nike" });
      mock.model("product").findUnique.mockResolvedValue(product as any);
      mock.model("request").findUnique.mockResolvedValue(null);
      mock.model("user").findUnique.mockResolvedValue(makeRequester() as any);
      const mockTx = setupCallbackTransactionMock();

      await callPost({ productId: "prod-1" });

      expect(mockTx.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: product.donorId,
          type: "REQUEST_RECEIVED",
          title: "Nova solicitação!",
        }),
      });
    });
  });

  describe("erros de validação", () => {
    it("retorna 400 quando productId não é enviado", async () => {
      const { status, body } = await callPost({});

      expect(status).toBe(400);
      expect(body).toEqual({ error: "productId é obrigatório" });
    });

    it("retorna 400 quando o solicitante tenta pedir o próprio produto", async () => {
      mock.model("product").findUnique.mockResolvedValue(
        makeActiveProduct({ donorId: REQUESTER_ID }) as any
      );

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(400);
      expect(body).toEqual({ error: "Você não pode solicitar seu próprio produto" });
    });
  });

  describe("conflito e disponibilidade", () => {
    it("retorna 404 quando o produto não é encontrado", async () => {
      mock.model("product").findUnique.mockResolvedValue(null);

      const { status, body } = await callPost({ productId: "prod-inexistente" });

      expect(status).toBe(404);
      expect(body).toEqual({ error: "Produto não encontrado" });
    });

    it("retorna 409 quando o produto não está ACTIVE", async () => {
      mock.model("product").findUnique.mockResolvedValue(
        makeActiveProduct({ status: "RESERVED" }) as any
      );

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(409);
      expect(body).toEqual({ error: "Produto não disponível" });
    });

    it("retorna 409 quando o usuário já solicitou o mesmo produto", async () => {
      mock.model("product").findUnique.mockResolvedValue(makeActiveProduct() as any);
      mock.model("request").findUnique.mockResolvedValue(makeRequest() as any);

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(409);
      expect(body).toEqual({ error: "Você já solicitou este produto" });
    });

    it("retorna 429 quando o usuário atingiu o limite de solicitações ativas", async () => {
      mock.model("product").findUnique.mockResolvedValue(makeActiveProduct() as any);
      mock.model("request").findUnique.mockResolvedValue(null);
      mock.model("user").findUnique.mockResolvedValue(
        makeRequester({ currentActiveRequests: 3, maxSimultaneousRequests: 3 }) as any
      );

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(429);
      expect(body).toEqual({ error: "Limite de 3 solicitações ativas atingido" });
    });
  });

  describe("erros", () => {
    it("retorna 500 quando o banco falha", async () => {
      mock.model("product").findUnique.mockRejectedValue(new Error("Connection refused"));

      const { status, body } = await callPost({ productId: "prod-1" });

      expect(status).toBe(500);
      expect(body).toEqual({ error: "Erro ao criar solicitação" });
    });
  });
});