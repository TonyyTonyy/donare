"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { categoryLabels, conditionLabels } from '../../../doar/_components/donation-labels'
interface ProductWithCount {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  status: string;
  images: string[];
  createdAt: string;
  _count: { requests: number };
}

interface MeusAnunciosProps {
  onSelectProduct: (product: ProductWithCount) => void;
}

export function MeusAnuncios({ onSelectProduct }: MeusAnunciosProps) {
  const [products, setProducts] = useState<ProductWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/products?limit=100");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return <MeusAnunciosSkeleton />;
  }

  if (products.length === 0) {
    return <EmptyMeusAnuncios />;
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelectProduct(product)}
          className={cn(
            "w-full text-left flex items-center gap-3 p-3",
            "bg-card rounded-2xl border border-border",
            "hover:border-primary/40 hover:shadow-sm transition-all"
          )}
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                📦
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground line-clamp-1 leading-tight">
              {product.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {categoryLabels[product.category]} · {conditionLabels[product.condition]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.status === "ACTIVE"
                ? "Disponível"
                : product.status === "RESERVED"
                ? "Reservado"
                : product.status === "DONATED"
                ? "Doado"
                : product.status}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                product._count.requests > 0
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {product._count.requests}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {product._count.requests === 1 ? "interessado" : "interessados"}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function MeusAnunciosSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyMeusAnuncios() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-3xl">📋</span>
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">Nenhum anúncio ainda</p>
        <p className="text-xs text-muted-foreground mt-1">
          Seus produtos doados aparecerão aqui
        </p>
      </div>
    </div>
  );
}
