"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bell, MapPin, Search, ChevronDown, RefreshCw, Package, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductCard } from "./_components/product-card";
import { ProductDetail, ProductDetailDialog } from "./_components/product-detail-dialog";
import { InterestModal } from "./_components/interest-modal";

interface Product {
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
}

const CATEGORIES = [
  { value: "ALL", label: "Todos" },
  { value: "CLOTHING", label: "Roupas" },
  { value: "FURNITURE", label: "Móveis" },
  { value: "ELECTRONICS", label: "Eletrônicos" },
  { value: "BOOKS", label: "Livros" },
  { value: "TOYS", label: "Brinquedos" },
  { value: "SPORTS", label: "Esportes" },
  { value: "KITCHEN", label: "Cozinha" },
  { value: "OTHER", label: "Outros" },
];

const RADIUS_OPTIONS = [
  { value: 1000, label: "1 km de você" },
  { value: 2000, label: "2 km de você" },
  { value: 5000, label: "5 km de você" },
  { value: 10000, label: "10 km de você" },
  { value: 20000, label: "20 km de você" },
  { value: 50000, label: "50 km de você" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [category, setCategory] = useState("ALL");
  const [radius, setRadius] = useState(5000);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  const fetchProducts = useCallback(
    async (opts: { pageNum?: number; reset?: boolean } = {}) => {
      const { pageNum = 1, reset = false } = opts;
      if (pageNum === 1) reset ? setIsRefreshing(true) : setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: "20",
          category,
          search,
          radius: String(radius),
          ...(userLocation && {
            lat: String(userLocation.lat),
            lng: String(userLocation.lng),
          }),
        });

        const res = await fetch(`/api/feed?${params}`);
        const data = await res.json();

        setProducts((prev) =>
          reset || pageNum === 1 ? data.products : [...prev, ...data.products]
        );
        const serverFavorited = new Set<string>(
          data.products
            .filter((p: Product & { favorites?: { id: string }[] }) => p.favorites?.length ?? 0 > 0)
            .map((p: Product) => p.id)
        );

        setFavorites((prev) => {
          if (reset || pageNum === 1) return serverFavorited;
          const next = new Set(prev);
          serverFavorited.forEach((id) => next.add(id));
          return next;
        });
        setHasNextPage(data.pagination.hasNextPage);
        setPage(pageNum);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [category, search, radius, userLocation]
  );

  useEffect(() => {
    fetchProducts({ pageNum: 1, reset: true });
  }, [fetchProducts]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          fetchProducts({ pageNum: page + 1 });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, page, fetchProducts]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(value), 400);
  };

  const toggleFavorite = async (productId: string) => {
    const isFav = favorites.has(productId);
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      if (isFav) {
        await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(productId) : next.delete(productId);
        return next;
      });
    }
  };

  const handleRequestInterest = (product: ProductDetail) => {
    setDetailOpen(false);
    setSelectedProduct(product);
    setInterestOpen(true);
  };

  const selectedRadius = RADIUS_OPTIONS.find((r) => r.value === radius)!;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-safe-top">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-lg tracking-tight">
              Donare
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/favoritos"
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="flex gap-2 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar roupas, móveis..."
              className="pl-9 pr-4 h-10 rounded-xl bg-card border-border text-sm focus-visible:ring-ring"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 rounded-xl border-border bg-card whitespace-nowrap text-xs font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {selectedRadius.label}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {RADIUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={cn(
                    "text-sm",
                    radius === opt.value && "text-primary font-semibold"
                  )}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                category === cat.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {locationStatus === "denied" && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 text-xs text-amber-700">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Ative a localização para ver produtos perto de você</span>
          </div>
        )}

        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Atualizando...</span>
          </div>
        )}

        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState radius={selectedRadius.label} />
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {search && ` buscando "${search}"`}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorited={favorites.has(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={(p) => {
                    setSelectedProduct(p as ProductDetail);
                    setDetailOpen(true);
                  }}
                  onRequestInterest={(p) => {
                    setSelectedProduct(p as ProductDetail);
                    setInterestOpen(true);
                  }}
                  variant="feed"
                />
              ))}
            </div>

            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isLoadingMore && (
                <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                  ))}
                </div>
              )}
              {!hasNextPage && products.length > 0 && (
                <p className="text-xs text-muted-foreground py-2">
                  Você viu todos os produtos disponíveis 🎉
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onRequestInterest={handleRequestInterest}
      />

      <InterestModal
        product={selectedProduct}
        open={interestOpen}
        onClose={() => {
          setInterestOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-7 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ radius }: { radius: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-base">
          Nenhum produto disponível
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Não encontramos produtos em {radius} no momento. Tente aumentar o raio
          de busca ou seja o primeiro a doar!
        </p>
      </div>
      <Link href="/doar">
        <Button className="bg-primary text-white hover:bg-primary/90 rounded-xl px-6">
          Doar agora
        </Button>
      </Link>
    </div>
  );
}