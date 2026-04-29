"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Star,
    ChevronLeft,
    ChevronRight,
    Eye,
    Package,
    Calendar,
    Award,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductDetail {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryLabel: string;
    condition: string;
    conditionLabel: string;
    status: string;
    images: string[];
    brand?: string;
    size?: string;
    isWorking?: boolean;
    pickupCity?: string;
    pickupInstructions?: string;
    distanceFormatted?: string;
    viewCount?: number;
    requestCount?: number;
    createdAt?: string;
    donor: {
        id: string;
        name: string;
        nickname?: string;
        avatar: string;
        reputationScore: number;
        isTrusted?: boolean;
        totalDonations?: number;
    };
}

const CONDITION_COLORS: Record<string, string> = {
    NEW: "bg-emerald-100 text-emerald-700 border-emerald-200",
    LIKE_NEW: "bg-teal-100 text-teal-700 border-teal-200",
    GOOD: "bg-blue-100 text-blue-700 border-blue-200",
    FAIR: "bg-amber-100 text-amber-700 border-amber-200",
};

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

interface ProductDetailDialogProps {
    product: ProductDetail | null;
    open: boolean;
    onClose: () => void;
    onRequestInterest: (product: ProductDetail) => void;
}

export function ProductDetailDialog({
    product,
    open,
    onClose,
    onRequestInterest,
}: ProductDetailDialogProps) {
    const [currentImage, setCurrentImage] = useState(0);
    const [imgError, setImgError] = useState(false);

    if (!product) return null;

    const isUnavailable =
        product.status === "RESERVED" || product.status === "DONATED";
    const validImages = (product.images || []).filter(
        (img) => typeof img === "string" && img.trim() !== ""
    );

    const images = validImages.length > 0
        ? validImages
        : ["/placeholder.svg"];

    const avatarSrc =
        typeof product.donor.avatar === "string" &&
            product.donor.avatar.trim() !== ""
            ? product.donor.avatar
            : "/placeholder-avatar.png";

    const handlePrev = () =>
        setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1));
    const handleNext = () =>
        setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1));

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    onClose();
                    setCurrentImage(0);
                    setImgError(false);
                }
            }}
        >
            <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-2xl gap-0 max-h-[90dvh] flex flex-col">
                <DialogHeader className="sr-only">
                    <DialogTitle className="sr-only font-semibold text-foreground text-lg">
                        {product.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only text-muted-foreground text-sm">
                        {product.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="relative aspect-[4/3] bg-muted flex-shrink-0">
                    {!imgError ? (
                        <Image
                            src={images[currentImage] || "/placeholder.svg"}
                            alt={product.title}
                            fill
                            className="object-cover"
                            onError={() => setImgError(true)}
                            sizes="(max-width: 640px) 100vw, 512px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}

                    {isUnavailable && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="bg-white/95 text-gray-800 font-semibold px-4 py-1.5 rounded-full text-sm">
                                {product.status === "RESERVED" ? "Reservado" : "Já doado"}
                            </span>
                        </div>
                    )}

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImage(i)}
                                        className={cn(
                                            "rounded-full transition-all",
                                            i === currentImage
                                                ? "w-4 h-1.5 bg-white"
                                                : "w-1.5 h-1.5 bg-white/50"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                                {currentImage + 1}/{images.length}
                            </span>
                        </>
                    )}

                    <span
                        className={cn(
                            "absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full",
                            CATEGORY_COLORS[product.category] ?? "bg-gray-100 text-gray-700"
                        )}
                    >
                        {product.categoryLabel}
                    </span>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="px-5 py-4 space-y-4">
                        <div>
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-bold text-foreground text-xl leading-tight flex-1">
                                    {product.title}
                                </h2>
                                <span
                                    className={cn(
                                        "text-xs font-semibold px-2 py-1 rounded-lg border flex-shrink-0",
                                        CONDITION_COLORS[product.condition] ??
                                        "bg-gray-100 text-gray-700"
                                    )}
                                >
                                    {product.conditionLabel}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {product.distanceFormatted && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        {product.distanceFormatted}
                                    </span>
                                )}
                                {product.viewCount !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {product.viewCount} views
                                    </span>
                                )}
                                {product.requestCount !== undefined && product.requestCount > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600">
                                        <AlertCircle className="w-3 h-3" />
                                        {product.requestCount} interesse{product.requestCount !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                Descrição
                            </h3>
                            <p className="text-sm text-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {(product.brand || product.size || product.isWorking !== undefined) && (
                            <div className="flex flex-wrap gap-2">
                                {product.brand && (
                                    <span className="text-xs bg-muted text-foreground px-3 py-1.5 rounded-lg font-medium">
                                        Marca: {product.brand}
                                    </span>
                                )}
                                {product.size && (
                                    <span className="text-xs bg-muted text-foreground px-3 py-1.5 rounded-lg font-medium">
                                        Tamanho: {product.size}
                                    </span>
                                )}
                                {product.isWorking !== undefined && (
                                    <span
                                        className={cn(
                                            "text-xs px-3 py-1.5 rounded-lg font-medium",
                                            product.isWorking
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                        )}
                                    >
                                        {product.isWorking ? "✓ Funcionando" : "✗ Com defeito"}
                                    </span>
                                )}
                            </div>
                        )}

                        <Separator />

                        {(product.pickupCity || product.pickupInstructions) && (
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    Retirada
                                </h3>
                                {product.pickupCity && (
                                    <p className="text-sm text-foreground flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                        {product.pickupCity}
                                    </p>
                                )}
                                {product.pickupInstructions && (
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {product.pickupInstructions}
                                    </p>
                                )}
                            </div>
                        )}

                        <Separator />

                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Doador
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                    <Image
                                        src={avatarSrc}
                                        alt={product.donor.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground truncate">
                                        {product.donor.nickname
                                            ? `@${product.donor.nickname}`
                                            : product.donor.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-semibold text-amber-600">
                                                {product.donor.reputationScore}
                                            </span>
                                        </div>
                                        {product.donor.totalDonations !== undefined && (
                                            <span className="text-xs text-muted-foreground">
                                                · {product.donor.totalDonations} doações
                                            </span>
                                        )}
                                        {product.donor.isTrusted && (
                                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary">
                                                <Award className="w-3 h-3" />
                                                Confiável
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {product.createdAt && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Publicado {formatRelativeDate(product.createdAt)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-border bg-card flex-shrink-0">
                    {isUnavailable ? (
                        <div className="text-center py-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {product.status === "RESERVED"
                                    ? "Este produto está reservado para outro usuário"
                                    : "Este produto já foi doado"}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-2 rounded-xl"
                                onClick={onClose}
                            >
                                Voltar para o feed
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl"
                            onClick={() => onRequestInterest(product)}
                        >
                            Tenho interesse
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    return `há ${Math.floor(diffDays / 30)} meses`;
}