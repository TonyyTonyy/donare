import { beforeEach, vi, type MockInstance } from "vitest";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@/generated/prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Métodos especiais do cliente Prisma que começam com $ */
type PrismaClientMethods = {
  [K in keyof PrismaClient as K extends `$${string}` ? K : never]: PrismaClient[K];
};

type MockablePrismaMethod = keyof PrismaClientMethods;

type PrismaModelName = keyof {
  [K in keyof PrismaClient as PrismaClient[K] extends { findMany: unknown }
    ? K
    : never]: true;
};

type PrismaModelOperations<M extends PrismaModelName> =
  PrismaClient[M] extends object
    ? {
        [Op in keyof PrismaClient[M]]: PrismaClient[M][Op] extends (
          ...args: any[]
        ) => any      
          ? MockInstance
          : never;
      }
    : never;

/** Shape retornado pelo setupPrismaMock */
type PrismaMockHandle = {
  /** Acessa o mock de um método especial: handle.method("$transaction") */
  method: <K extends MockablePrismaMethod>(name: K) => MockInstance;

  /** Acessa o mock de uma operação de model: handle.model("user").findMany */
  model: <M extends PrismaModelName>(name: M) => PrismaModelOperations<M>;

  /** Reseta todos os mocks manualmente (útil dentro de um it/test) */
  resetAll: () => void;
};

// ─── Helper principal ─────────────────────────────────────────────────────────

interface SetupPrismaMockOptions {
  /**
   * Métodos especiais ($transaction, $queryRaw, $executeRaw…) para mockar.
   * @default ["$transaction"]
   */
  methods?: readonly MockablePrismaMethod[];

  /**
   * Models e suas operações para mockar.
   * @example { user: ["findMany", "findUnique", "create"] }
   */
  models?: Partial<Record<PrismaModelName, string[]>>;

  /**
   * Reseta os mocks automaticamente antes de cada teste.
   * @default true
   */
  autoReset?: boolean;
}

export function setupPrismaMock(
  options: SetupPrismaMockOptions = {}
): PrismaMockHandle {
  const {
    methods = ["$transaction"],
    models = {},
    autoReset = true,
  } = options;

  // Registros internos
  const methodMocks = new Map<MockablePrismaMethod, MockInstance>();
  const modelMocks = new Map<string, Map<string, MockInstance>>();

  // ── Inicialização ──────────────────────────────────────────────────────────

  function initMocks() {
    // Métodos especiais ($transaction, $queryRaw, …)
    for (const methodName of methods) {
      const mock = vi.fn();
      methodMocks.set(methodName, mock);
      (prisma as unknown as Record<string, unknown>)[methodName] = mock;
    }

    // Models (prisma.user.findMany, etc.)
    for (const [modelName, operations] of Object.entries(models)) {
      const opMocks = new Map<string, MockInstance>();
      const modelProxy: Record<string, MockInstance> = {};

      for (const op of operations ?? []) {
        const mock = vi.fn();
        opMocks.set(op, mock);
        modelProxy[op] = mock;
      }

      modelMocks.set(modelName, opMocks);

      // Preserva outras propriedades do model original
      (prisma as unknown as Record<string, unknown>)[modelName] = new Proxy(
        (prisma as unknown as Record<string, unknown>)[modelName] as object,
        {
          get(target, prop: string) {
            return modelProxy[prop] ?? Reflect.get(target, prop);
          },
        }
      );
    }
  }

  function resetMocks() {
    methodMocks.forEach((mock) => mock.mockReset());
    modelMocks.forEach((ops) => ops.forEach((mock) => mock.mockReset()));
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  if (autoReset) {
    beforeEach(() => {
      initMocks();
    });
  } else {
    initMocks();
  }

  // ── Handle público ─────────────────────────────────────────────────────────

  return {
    method<K extends MockablePrismaMethod>(name: K): MockInstance {
      const mock = methodMocks.get(name);
      if (!mock) {
        throw new Error(
          `[setupPrismaMock] Método "${String(name)}" não foi registrado. ` +
            `Adicione-o em options.methods.`
        );
      }
      return mock;
    },

    model<M extends PrismaModelName>(name: M): PrismaModelOperations<M> {
      const ops = modelMocks.get(name as string);
      if (!ops) {
        throw new Error(
          `[setupPrismaMock] Model "${String(name)}" não foi registrado. ` +
            `Adicione-o em options.models.`
        );
      }
      return Object.fromEntries(ops) as PrismaModelOperations<M>;
    },

    resetAll: resetMocks,
  };
}