import { ProductCategory } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

export async function GET(request: NextRequest) {
  const userId = "cmni4drrf00003j6t0lua216x";

  const { searchParams } = new URL(request.url);

  // parseFloat("") retorna NaN → hasUserLocation = false quando não enviado
  const userLat = parseFloat(searchParams.get("lat") ?? "");
  const userLng = parseFloat(searchParams.get("lng") ?? "");
  const category = searchParams.get("category") ?? "ALL";
  const search   = searchParams.get("search")   ?? "";
  const page     = parseInt(searchParams.get("page")  ?? "1",  10);
  const limit    = parseInt(searchParams.get("limit") ?? "20", 10);

  try {
    const where = {
      status: "ACTIVE" as const,
      donorId: { not: userId },
      ...(category !== "ALL" && { category: category as ProductCategory }),
      ...(search && {
        OR: [
          { title:       { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // ✅ $transaction com array — alinhado com setupTransactionMock
    const [rawProducts, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true, name: true, nickname: true,
              avatar: true, reputationScore: true,
            },
          },
          favorites: { where: { userId }, select: { id: true } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.product.count({ where }),
    ]) as [any[], number];

    const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

    const withDistance = rawProducts
      .map((product) => {
        if (!hasUserLocation || !product.pickupLatitude || !product.pickupLongitude) {
          return { ...product, distanceMeters: Infinity, distanceFormatted: null };
        }
        const distanceMeters = haversineDistance(
          userLat, userLng,
          product.pickupLatitude, product.pickupLongitude,
        );
        return { ...product, distanceMeters, distanceFormatted: formatDistance(distanceMeters) };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const totalPages = Math.ceil(total / limit);
    const offset     = (page - 1) * limit;
    const paginated  = withDistance.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginated,
      pagination: {
        page, limit, total, totalPages,
        hasNextPage:     page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/feed]", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}