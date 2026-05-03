"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Star,
  MessageCircle,
  Calendar,
  Award,
} from "lucide-react";

interface Interessado {
  id: string;
  requesterId: string;
  status: string;
  message: string | null;
  createdAt: string;
  confirmedByDonor: boolean;
  confirmedByRequester: boolean;
  requester: {
    id: string;
    name: string;
    nickname: string | null;
    avatar: string | null;
    reputationScore: number;
    reputationLevel: string;
    totalDonations: number;
    totalReceived: number;
    showRealName: boolean;
    createdAt: string;
  };
}

interface InteressadosProps {
  productId: string;
  onUpdate?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
  EXPIRED: "Expirado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-primary/10 text-primary",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const REPUTATION_LABELS: Record<string, string> = {
  NEWCOMER: "Novato",
  BEGINNER: "Iniciante",
  REGULAR: "Regular",
  TRUSTED: "Confiável",
  VERIFIED: "Verificado",
  ELITE: "Elite",
};

export function Interessados({ productId, onUpdate }: InteressadosProps) {
  const [requests, setRequests] = useState<Interessado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<"ACCEPTED" | "REJECTED" | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/user/products/${productId}/requests`
      );
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (
    requestId: string,
    action: "ACCEPTED" | "REJECTED"
  ) => {
    setLoadingAction(action);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: action }
              : r
          )
        );
        onUpdate?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  if (isLoading) {
    return <InteressadosSkeleton />;
  }

  if (requests.length === 0) {
    return <EmptyInteressados />;
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className={cn(
            "flex flex-col gap-3 p-4 bg-card rounded-2xl border border-border",
            "transition-all"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {req.requester.avatar ? (
                <Image
                  src={req.requester.avatar}
                  alt={req.requester.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {req.requester.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-foreground leading-tight">
                  {req.requester.showRealName
                    ? req.requester.name
                    : req.requester.nickname ?? req.requester.name}
                </p>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                >
                  {REPUTATION_LABELS[req.requester.reputationLevel] ??
                    req.requester.reputationLevel}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>
                    {req.requester.totalDonations} doaç
                    {req.requester.totalDonations !== 1 ? "ões" : "ão"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>{req.requester.reputationScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Membro desde{" "}
                    {new Date(req.requester.createdAt).toLocaleDateString(
                      "pt-BR",
                      { month: "short", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Badge
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0",
                STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700"
              )}
            >
              {STATUS_LABELS[req.status] ?? req.status}
            </Badge>
          </div>

          {req.message && (
            <div className="flex items-start gap-2 bg-muted/60 rounded-xl p-3">
              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {req.message}
              </p>
            </div>
          )}

          {req.status === "PENDING" && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-semibold",
                  "bg-green-600 hover:bg-green-700 text-white",
                  "transition-opacity",
                  loadingAction !== null && loadingAction !== "ACCEPTED"
                    ? "opacity-40 pointer-events-none"
                    : ""
                )}
                onClick={() => handleAction(req.id, "ACCEPTED")}
                disabled={loadingAction !== null}
              >
                {loadingAction === "ACCEPTED" ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Aceitar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-semibold",
                  "border-red-200 text-red-600 hover:bg-red-50",
                  "transition-opacity",
                  loadingAction !== null && loadingAction !== "REJECTED"
                    ? "opacity-40 pointer-events-none"
                    : ""
                )}
                onClick={() => handleAction(req.id, "REJECTED")}
                disabled={loadingAction !== null}
              >
                {loadingAction === "REJECTED" ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Recusar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function InteressadosSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 p-4 bg-card rounded-2xl border border-border"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-xl" />
            <Skeleton className="h-9 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyInteressados() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-3xl">👥</span>
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">
          Ninguém se interessou ainda
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Quando alguém se candidatar, aparecerá aqui
        </p>
      </div>
    </div>
  );
}
