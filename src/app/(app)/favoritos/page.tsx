"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductCard } from "../_components/product-card";

interface FavoriteProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  conditionLabel: string;
  status: string;
  images: string[];
  distanceFormatted?: string;
  donor: { id: string; name: string; avatar: string; reputationScore: number; isTrusted?: boolean };
  favoritedAt: string;
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [filtered, setFiltered] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "reserved">("all");

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/favorites?limit=100");
      const data = await res.json();
      setFavorites(data.favorites ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    let result = favorites;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "available") {
      result = result.filter((p) => p.status === "ACTIVE");
    } else if (activeFilter === "reserved") {
      result = result.filter((p) => p.status === "RESERVED" || p.status === "DONATED");
    }

    setFiltered(result);
  }, [favorites, search, activeFilter]);

  const removeFavorite = async (productId: string) => {
    setRemovingId(productId);
    try {
      await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  const availableCount = favorites.filter((p) => p.status === "ACTIVE").length;
  const reservedCount = favorites.filter(
    (p) => p.status === "RESERVED" || p.status === "DONATED"
  ).length;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4">
          <div className="flex items-center gap-3 h-14">
            <Link
              href="/"
              className="p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>

            <div className="flex-1">
              <h1 className="font-bold text-foreground text-lg leading-tight">
                Favoritos
              </h1>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  {favorites.length} produto{favorites.length !== 1 ? "s" : ""} salvos
                </p>
              )}
            </div>

            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>

          <div className="relative pb-3">
            <Search className="absolute left-3 top-5 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nos favoritos..."
              className="pl-9 h-10 rounded-xl bg-card border-border text-sm"
            />
          </div>
        </div>
      </header>

      <div className=" px-4">
        {!isLoading && favorites.length > 0 && (
          <div className="flex gap-2 py-3">
            {[
              { key: "all", label: `Todos (${favorites.length})` },
              { key: "available", label: `Disponíveis (${availableCount})` },
              { key: "reserved", label: `Indisponíveis (${reservedCount})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key as typeof activeFilter)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  activeFilter === key
                    ? "bg-primary text-white"
                    : "bg-card text-muted-foreground border border-border"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <FavoritesSkeleton />
        ) : favorites.length === 0 ? (
          <EmptyFavorites />
        ) : filtered.length === 0 ? (
          <NoResultsState search={search} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((product) => (
                <div key={product.id} className="relative group/fav">
                  <ProductCard
                    product={product}
                    isFavorited={true}
                    onToggleFavorite={removeFavorite}
                    variant="favorites"
                  />

                  <button
                    onClick={() => removeFavorite(product.id)}
                    disabled={removingId === product.id}
                    className={cn(
                      "absolute bottom-[52px] right-2 p-1.5 rounded-full",
                      "bg-white/90 hover:bg-red-50 text-muted-foreground hover:text-red-500",
                      "border border-border shadow-sm",
                      "opacity-0 group-hover/fav:opacity-100 transition-all",
                      "sm:opacity-0"
                    )}
                    title="Remover dos favoritos"
                  >
                    {removingId === product.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <p className="text-[10px] text-muted-foreground text-center pb-1">
                    {formatRelativeDate(product.favoritedAt)}
                  </p>
                </div>
              ))}
            </div>

            {reservedCount > 0 && activeFilter !== "reserved" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                <span className="text-base leading-none">💡</span>
                <span>
                  {reservedCount} produto{reservedCount !== 1 ? "s" : ""} reservado{reservedCount !== 1 ? "s" : ""} —
                  fique de olho, pode ficar disponível novamente!
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center">
          <Heart className="w-12 h-12 text-red-200" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-foreground text-lg">
          Nenhum favorito ainda
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          Salve os produtos que te interessam tocando no ❤️ para encontrá-los
          facilmente depois.
        </p>
      </div>

      <Link href="/">
        <Button className="bg-primary text-white hover:bg-primary/90 rounded-xl px-6">
          Explorar produtos
        </Button>
      </Link>
    </div>
  );
}

function NoResultsState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Search className="w-10 h-10 text-muted-foreground" />
      <div>
        <p className="font-semibold text-foreground text-sm">
          Nada encontrado para &ldquo;{search}&rdquo;
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tente um termo diferente
        </p>
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays}d atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atrás`;
  return `${Math.floor(diffDays / 30)}m atrás`;
}