"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  donor: {
    id: string;
    name: string;
    avatar: string;
    reputationScore: number;
    isTrusted?: boolean;
  };
  favoritedAt?: string;
}

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onRequestInterest?: (product: Product) => void;
  onClick?: (product: Product) => void;
  variant?: "feed" | "favorites";
}

const CATEGORY_COLORS: Record<string, string> = {
  CLOTHING: "bg-rose-100 text-rose-700",
  FURNITURE: "bg-amber-100 text-amber-700",
  ELECTRONICS: "bg-blue-100 text-blue-700",
  BOOKS: "bg-purple-100 text-purple-700",
  TOYS: "bg-orange-100 text-orange-700",
  SPORTS: "bg-green-100 text-green-700",
  KITCHEN: "bg-teal-100 text-teal-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export function ProductCard({
  product,
  isFavorited = false,
  onToggleFavorite,
  onRequestInterest,
  onClick,
  variant = "feed",
}: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [imgError, setImgError] = useState(false);

  const isReserved = product.status === "RESERVED";
  const isDonated = product.status === "DONATED";
  const isUnavailable = isReserved || isDonated;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-card rounded-2xl overflow-hidden",
        "border border-border shadow-sm hover:shadow-md",
        "transition-all duration-200 cursor-pointer",
        isUnavailable && "opacity-75"
      )}
      onClick={() => onClick?.(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imgError ? (
          <Image
            src={product.images[currentImage] ?? "/placeholder.svg"}
            alt={product.title}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              isUnavailable && "grayscale-[30%]"
            )}
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              {isReserved ? "Reservado" : "Doado"}
            </span>
          </div>
        )}

        {product.images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-full transition-all",
                    idx === currentImage
                      ? "w-3 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              CATEGORY_COLORS[product.category] ?? "bg-gray-100 text-gray-700"
            )}
          >
            {product.categoryLabel}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(product.id);
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all",
            isFavorited
              ? "bg-red-500 text-white"
              : "bg-white/80 hover:bg-white text-gray-500 hover:text-red-500"
          )}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={isFavorited ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
          {product.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <span className="text-[11px] text-muted-foreground font-medium">
          {product.conditionLabel}
        </span>

        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-border">
          {product.distanceFormatted && (
            <div className="flex items-center gap-1 text-accent-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-[11px] font-medium">
                {product.distanceFormatted}
              </span>
            </div>
          )}

          {product.donor.isTrusted && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-semibold text-amber-600">
                {product.donor.reputationScore}
              </span>
            </div>
          )}
        </div>

        {!isUnavailable && variant === "feed" && (
          <Button
            size="sm"
            className="mt-2 w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onRequestInterest?.(product);
            }}
          >
            Tenho interesse
          </Button>
        )}
      </div>
    </div>
  );
}