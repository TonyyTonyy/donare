import type { Favorite, Product, User, Notification, Request } from "@/generated/prisma/client";

export function makeUser(
  overrides?: Partial<User>
): Pick<User, "id" | "name" | "nickname" | "avatar" | "reputationScore"> {
  return {
    id: "cmofytoqj00003j6tdv6lipwy",
    name: "João Silva",
    nickname: "joao",
    avatar: null,
    reputationScore: 4.8,
    ...overrides,
  };
}

export function makeProduct(overrides?: Partial<Product>) {
  return {
    id: "prod-1",
    title: "Camiseta Nike",
    description: "Em ótimo estado",
    category: "CLOTHING" as const,
    condition: "GOOD" as const,
    status: "ACTIVE" as const,
    images: ["img1.jpg"],
    primaryImageIndex: 0,
    size: "M",
    brand: "Nike",
    isWorking: null,
    pickupType: "NEUTRAL_POINT" as const,
    pickupAddress: null,
    pickupCity: "Feira de Santana",
    pickupLatitude: null,
    pickupLongitude: null,
    pickupInstructions: null,
    donorId: "cmofytoqj00003j6tdv6lipwy",
    viewCount: 10,
    requestCount: 2,
    autoAcceptFirstRequest: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    publishedAt: null,
    reservedAt: null,
    donatedAt: null,
    expiresAt: null,
    donor: makeUser(),
    ...overrides,
  };
}

export function makeFavorite(
  overrides?: Partial<Favorite & { product: ReturnType<typeof makeProduct> }>
) {
  return {
    id: "fav-1",
    userId: "cmofytoqj00003j6tdv6lipwy",
    productId: "prod-1",
    createdAt: new Date("2024-03-01"),
    product: makeProduct(),
    ...overrides,
  };
}

export function makePagination(overrides?: Partial<{
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}>) {
  return {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    ...overrides,
  };
}

export function makeProductApiResponse(
  overrides?: Partial<ReturnType<typeof makeProduct>> & {
    distanceMeters?: number;
    distanceFormatted?: string | null;
    favorites?: { id: string }[];
    _count?: { favorites: number };
  }
) {
  return {
    ...makeProduct(),
    favorites: [],
    _count: { favorites: 0 },
    distanceMeters: Infinity,
    distanceFormatted: null,
    ...overrides,
  };
}

export function makeRequest(overrides?: Partial<Request>) {
  return {
    id: "req-1",
    productId: "prod-1",
    requesterId: "cmni4drrf00003j6t0lua216x",
    status: "PENDING" as const,
    message: null,
    confirmedByDonor: false,
    confirmedByRequester: false,
    confirmationCode: null,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    respondedAt: null,
    completedAt: null,
    ...overrides,
  };
}

// GET /api/requests (inclui produto-> dono e solicitante).
export function makeRequestWithRelations(
  overrides?: Partial<ReturnType<typeof makeRequest>> & {
    product?: ReturnType<typeof makeProduct>;
    requester?: ReturnType<typeof makeUser>;
  }
) {
  const { product, requester, ...rest } = overrides ?? {};
  return {
    ...makeRequest(rest),
    product: product ?? makeProduct(),
    requester: requester ?? makeUser({ id: "cmni4drrf00003j6t0lua216x", name: "Maria Souza", nickname: "maria" }),
  };
}

export function makeNotification(overrides?: Partial<Notification>) {
  return {
    id: "notif-1",
    userId: "cmofytoqj00003j6tdv6lipwy",
    type: "REQUEST_RECEIVED" as const,
    title: "Nova solicitação!",
    message: 'Alguém tem interesse no seu produto "Camiseta Nike"',
    data: { productId: "prod-1", requestId: "req-1" },
    actionUrl: "/solicitacoes/req-1",
    actionLabel: "Ver solicitação",
    read: false,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    ...overrides,
  };
}