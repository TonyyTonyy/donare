"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Search, Ban, Unlock, X, MapPin, Calendar, AlertTriangle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlockedUser {
  id: string;
  blockedId: string; 
  reason: string | null;
  createdAt: string;
  blocked: {
    name: string;
    nickname: string | null;
    avatar: string | null;
    city: string | null;
    state: string | null;
  };
}

const AVATAR_COLORS = [
  { bg: "bg-[#0d4a23]", text: "text-[#26d968]" },
  { bg: "bg-[#6b5705]", text: "text-[#f4ca25]" },
  { bg: "bg-[#0a3040]", text: "text-[#47cfeb]" },
  { bg: "bg-[#2a1040]", text: "text-[#bb67e4]" },
  { bg: "bg-[#401010]", text: "text-[#f05f42]" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-1">
        {query ? <Search size={24} className="text-muted-foreground" /> : <Ban size={24} className="text-muted-foreground" />}
      </div>
      <p className="text-base font-semibold">
        {query ? "Nenhum resultado" : "Nenhum bloqueio ativo"}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
        {query
          ? "Não encontramos usuários bloqueados com esse nome."
          : "Você não bloqueou nenhum usuário. Quando bloquear alguém, ele aparecerá aqui."}
      </p>
    </div>
  );
}

function BlockCard({
  block,
  index,
  expanded,
  onToggle,
  onUnblock,
}: {
  block: BlockedUser;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUnblock: () => void;
}) {
  const color = avatarColor(index);
  const displayName = block.blocked.name;

  return (
    <div className="px-5">
      <div
        className={cn(
          "bg-card border border-border p-3.5 flex items-center gap-3 transition-all",
          expanded
            ? "rounded-t-xl border-destructive/50 bg-destructive/5"
            : "rounded-xl"
        )}
      >
        <Avatar className={cn("w-12 h-12 border-2 flex-shrink-0", color.bg)}>
          <AvatarImage src={block.blocked.avatar ?? undefined} />
          <AvatarFallback className={cn("text-sm font-semibold", color.bg, color.text)}>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            @{block.blocked.nickname ?? displayName.toLowerCase().replace(" ", ".")}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
            {block.blocked.city && (
              <>
                <MapPin size={10} className="flex-shrink-0" />
                <span>{block.blocked.city}, {block.blocked.state}</span>
                <span className="w-1 h-1 rounded-full bg-border flex-shrink-0" />
              </>
            )}
            <Calendar size={10} className="flex-shrink-0" />
            <span>{formatDate(block.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/40 px-2 py-0.5 rounded-full">
            Bloqueado
          </span>
          <button
            onClick={onToggle}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
              expanded
                ? "bg-destructive/20 border-destructive/50 text-destructive"
                : "bg-muted border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive"
            )}
          >
            {expanded ? <X size={14} /> : <span className="text-sm leading-none">⋯</span>}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-destructive/5 border border-t-0 border-destructive/50 rounded-b-xl px-4 py-3.5">
          {block.reason && (
            <div className="bg-muted/60 border border-border rounded-lg px-3 py-2.5 mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Motivo do bloqueio
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{block.reason}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5"
              onClick={onUnblock}
            >
              <Unlock size={13} />
              Desbloquear
            </Button>
            <Button size="sm" variant="outline" onClick={onToggle}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GerenciarBloqueiosPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<BlockedUser | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/user/blocks")
      .then((r) => r.json())
      .then(({ blocks }) => setBlocks(blocks ?? []))
      .catch(() => toast.error("Erro ao carregar bloqueios."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = blocks.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.blocked.name.toLowerCase().includes(q) ||
      (b.blocked.nickname ?? "").toLowerCase().includes(q)
    );
  });

  function handleUnblock(block: BlockedUser) {
    setConfirmBlock(block);
  }

  function confirmUnblock() {
    if (!confirmBlock) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/user/blocks?userId=${confirmBlock.blockedId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        setBlocks((prev) => prev.filter((b) => b.id !== confirmBlock.id));
        setExpandedId(null);
        toast.success(`${confirmBlock.blocked.name} foi desbloqueado.`);
      } catch {
        toast.error("Não foi possível desbloquear. Tente novamente.");
      } finally {
        setConfirmBlock(null);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background pb-10" style={{ margin: "0 auto" }}>

      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-base font-semibold">Bloqueios</h1>
        <div className="w-9" />
      </header>

      <div className="sticky top-[57px] z-[9] bg-background px-5 pt-3.5 pb-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar usuário bloqueado…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {!loading && blocks.length > 0 && (
        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-xs text-muted-foreground">
            {query
              ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`
              : `${blocks.length} usuário${blocks.length !== 1 ? "s" : ""} bloqueado${blocks.length !== 1 ? "s" : ""}`}
          </span>
          <span className="text-xs font-semibold bg-muted border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
            {blocks.length}
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 px-5 pt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="space-y-2.5 pt-1">
          {filtered.map((block, i) => (
            <BlockCard
              key={block.id}
              block={block}
              index={i}
              expanded={expandedId === block.id}
              onToggle={() => setExpandedId((prev) => (prev === block.id ? null : block.id))}
              onUnblock={() => handleUnblock(block)}
            />
          ))}
        </div>
      )}

      {!loading && blocks.length > 0 && (
        <div className="flex items-start gap-2.5 mx-5 mt-6 p-3.5 bg-muted/40 border border-border rounded-xl">
          <AlertTriangle size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Usuários bloqueados não podem ver seus itens, enviar mensagens ou fazer solicitações. 
            Ao desbloquear, essas permissões são restauradas imediatamente.
          </p>
        </div>
      )}

      <AlertDialog open={!!confirmBlock} onOpenChange={(o) => !o && setConfirmBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-13 h-13 rounded-full bg-destructive/15 border border-destructive/40 flex items-center justify-center mx-auto mb-2">
              <Unlock size={22} className="" />
            </div>
            <AlertDialogTitle className="text-center">Desbloquear usuário?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Você está prestes a desbloquear{" "}
              <span className="font-semibold">{confirmBlock?.blocked.name}</span>.
              Ele poderá ver seus itens e enviar mensagens novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnblock}
              disabled={isPending}
            >
              {isPending ? "Desbloqueando…" : "Desbloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}