import { ProductCategory } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

export async function GET(request: NextRequest) {
    /* const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    } */

    const userId = "cmofytoqj00003j6tdv6lipwy"

    const { searchParams } = new URL(request.url);

    const userLat = parseFloat(searchParams.get("lat") ?? "0");
    const userLng = parseFloat(searchParams.get("lng") ?? "0");

    const radiusMeters = parseInt(searchParams.get("radius") ?? "5000", 10);
    const category = searchParams.get("category") ?? "ALL";
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    try {
        const products = await prisma.product.findMany({
            where: {
                status: "ACTIVE",
                donorId: { not: userId },
                ...(category !== "ALL" && { category: category as ProductCategory }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }),
            },
            include: {
                donor: {
                    select: {
                        id: true,
                        name: true,
                        nickname: true,
                        avatar: true,
                        reputationScore: true,
                        reputationLevel: true,
                        totalDonations: true,
                    },
                },
                favorites: {
                    where: { userId },
                    select: { id: true },
                },
                _count: { select: { favorites: true } },
            },
        });

        const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

        const withDistance = products
            .map((product) => {
                if (!hasUserLocation || !product.pickupLatitude || !product.pickupLongitude) {
                    return {
                        ...product,
                        distanceMeters: Infinity,
                        distanceFormatted: null,
                    };
                }

                const distanceMeters = haversineDistance(
                    userLat,
                    userLng,
                    product.pickupLatitude,
                    product.pickupLongitude
                );

                return {
                    ...product,
                    distanceMeters,
                    distanceFormatted: formatDistance(distanceMeters),
                };
            })
            .sort((a, b) => a.distanceMeters - b.distanceMeters);

        const total = withDistance.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginated = withDistance.slice(offset, offset + limit);

        return NextResponse.json({
            products: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("[GET /api/products]", error);
        return NextResponse.json(
            { error: "Erro ao buscar produtos" },
            { status: 500 }
        );
    }
}