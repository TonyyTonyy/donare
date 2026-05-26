"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, MessageSquare, Package, MapPin, Mail, Shield,
  Lock, CreditCard, Ruler, Globe, Ban, Cloud, HardDrive,
  Trash2, FileText, Star, Info, ChevronRight, LogOut,
  Camera, Edit2, ArrowLeft, MoreHorizontal, Check, Loader2
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type ReputationLevel =
  | "NEWCOMER" | "BEGINNER" | "REGULAR"
  | "TRUSTED" | "VERIFIED" | "ELITE";

interface UserProfile {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  karmaPoints: number;
  reputationLevel: ReputationLevel;
  totalDonations: number;
  totalReceived: number;
  createdAt: string;
  showRealName: boolean;
  showStats: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  pushEnabled: boolean;
  emailNotifications: boolean;
  notifyNewProducts: boolean;
  notifyMessages: boolean;
  notifyRequests: boolean;
}

interface UserBadge {
  id: string;
  badge: {
    name: string;
    description: string;
    icon: string;
    requirement: string;
  };
  isUnlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPunctual: boolean;
  isCommunicative: boolean;
  isAsDescribed: boolean;
  isRespectful: boolean;
  wouldRecommend: boolean;
  createdAt: string;
  reviewer: {
    name: string;
    nickname: string | null;
    avatar: string | null;
  };
}

const LEVEL_CONFIG: Record<ReputationLevel, { label: string; xpMin: number; xpMax: number; color: string }> = {
  NEWCOMER: { label: "Novato", xpMin: 0, xpMax: 50, color: "#abbab3" },
  BEGINNER: { label: "Iniciante", xpMin: 51, xpMax: 100, color: "#47cfeb" },
  REGULAR: { label: "Regular", xpMin: 101, xpMax: 250, color: "#26d968" },
  TRUSTED: { label: "Confiável", xpMin: 251, xpMax: 500, color: "#26d968" },
  VERIFIED: { label: "Verificado", xpMin: 501, xpMax: 1000, color: "#f4ca25" },
  ELITE: { label: "Elite", xpMin: 1001, xpMax: 9999, color: "#f4ca25" },
};

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-secondary text-secondary-foreground" : "text-muted fill-muted"}
        />
      ))}
    </div>
  );
}

function ToggleRow({
  label, description, checked, onCheckedChange,
}: { label: string; description?: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 pr-3">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsRow({
  icon: Icon, label, description, value, onClick,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full py-3.5 px-4 border-t border-border first:border-0 text-left hover:bg-muted/40 transition-colors"
    >
      <span className="w-7 flex justify-center text-muted-foreground">
        <Icon size={16} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {value ? (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{value}</span>
      ) : (
        <ChevronRight size={14} className="text-muted-foreground" />
      )}
    </button>
  );
}

function BadgeCard({ ub }: { ub: UserBadge }) {
  const isElite =
    ub.badge.name.toLowerCase().includes("elite") ||
    ub.badge.name.toLowerCase().includes("lendário");

  return (
    <div
      className={[
        "flex-none w-20 rounded-xl border p-2.5 text-center select-none",
        ub.isUnlocked
          ? isElite
            ? "border-secondary-400/20 bg-secondary-400/40"
            : "border-primary-400/20 bg-primary-400/40"
          : "border-border opacity-40 grayscale",
      ].join(" ")}
    >
      <span className="text-2xl block mb-1.5">{ub.badge.icon}</span>
      <p
        className={[
          "text-[10px] font-medium leading-tight",
          ub.isUnlocked
            ? isElite ? "text-secondary-foreground" : "text-primary"
            : "text-muted-foreground",
        ].join(" ")}
      >
        {ub.badge.name}
      </p>
      {!ub.isUnlocked && (
        <div className="mt-1.5 h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-muted-foreground rounded-full"
            style={{
              width: `${Math.min(
                100,
                (ub.progress / parseInt(ub.badge.requirement)) * 100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-20 h-20 rounded-full" />
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-1.5 w-[280px] rounded-full" />
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    bio: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Falha ao carregar perfil");
        const data: UserProfile = await res.json();
        setUser(data);
        setFormData({
          name: data.name,
          nickname: data.nickname ?? "",
          bio: data.bio ?? "",
          phone: data.phone ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipCode: data.zipCode ?? "",
        });
      } catch {
        toast.error("Não foi possível carregar o perfil.");
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/user/badges");
        if (!res.ok) throw new Error();
        const data: UserBadge[] = await res.json();
        setBadges(data);
      } catch {
        // silently fail
      } finally {
        setLoadingBadges(false);
      }
    }
    fetchBadges();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/user/reviews");
        if (!res.ok) throw new Error();
        const data: Review[] = await res.json();
        setReviews(data);
      } catch {
        // silently fail
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  const lvl = user ? LEVEL_CONFIG[user.reputationLevel] : null;
  const xpProgress =
    user && lvl
      ? ((user.karmaPoints - lvl.xpMin) / (lvl.xpMax - lvl.xpMin)) * 100
      : 0;
  const nextLevel =
    user && lvl
      ? user.karmaPoints < lvl.xpMax
        ? lvl.xpMax - user.karmaPoints
        : 0
      : 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.length === 0 || !avgRating || !reviews ? 0 : reviews.filter((r) => r.rating === star).length,
  }));

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    })
    : "";

  async function handleSaveProfile() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
        const updated: UserProfile = await res.json();
        setUser(updated);
        toast.success("Perfil atualizado com sucesso!");
      } catch {
        toast.error("Não foi possível salvar. Tente novamente.");
      }
    });
  }

  async function handleSaveSettings(patch: Partial<UserProfile>) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      setUser((prev) => (prev ? {
        ...prev, ...Object.fromEntries(
          Object.keys(patch).map((k) => [k, (user as any)?.[k]])
        )
      } : prev));
      toast.error("Erro ao salvar preferência.");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => (prev ? { ...prev, avatar: previewUrl } : prev));

    try {
      const body = new FormData();
      body.append("avatar", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setUser((prev) => (prev ? { ...prev, avatar: url } : prev));
    } catch {
      toast.error("Erro ao enviar avatar.");
      setUser((prev) => (prev ? { ...prev, avatar: user?.avatar ?? null } : prev));
    }
  }

  function handleCancelEdit() {
    if (!user) return;
    setFormData({
      name: user.name,
      nickname: user.nickname ?? "",
      bio: user.bio ?? "",
      phone: user.phone ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      zipCode: user.zipCode ?? "",
    });
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="min-h-screen bg-background pb-10" style={{ margin: "0 auto" }}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-base font-semibold">Meu Perfil</h1>
        <div className="w-9" />
      </header>

      <section className="px-5 pt-6 pb-5 bg-background border-b border-border">
        <div className="flex flex-col items-center">

          {loadingUser ? (
            <ProfileHeaderSkeleton />
          ) : user ? (
            <>
              <div className="relative mb-4">
                <Avatar className="w-20 h-20 border-[3px] border-primary-400/20">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="text-2xl font-bold text-primary bg-primary-400/40">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-secondary-400/40 flex items-center justify-center border-2 border-secondary-400/20"
                >
                  <Camera size={16} className="text-secondary-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                @{user.nickname ?? user.name.toLowerCase().replace(" ", ".")}
                {user.city && ` · ${user.city}, ${user.state}`}
              </p>

              <div className="flex gap-2 mt-3">
                <span className="flex items-center gap-1.5 bg-secondary-400/40 text-secondary-foreground border border-secondary-400/20 text-xs font-semibold px-3 py-1 rounded-full">
                  <Star size={11} className="fill-secondary" />
                  {lvl?.label}
                </span>
                <span className="flex items-center gap-1.5 bg-primary-400/40 text-primary border border-primary-400/20 text-xs font-semibold px-3 py-1 rounded-full">
                  ▲ Nível {Object.keys(LEVEL_CONFIG).indexOf(user.reputationLevel) + 1}
                </span>
              </div>

              <div className="w-full max-w-[280px] mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{user.karmaPoints} karma</span>
                  <span>
                    {nextLevel > 0
                      ? `Faltam ${nextLevel} para o próximo nível`
                      : "Nível máximo"}
                  </span>
                </div>
                <Progress value={Math.min(100, xpProgress)} className="h-1.5" />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8">
              Não foi possível carregar o perfil.
            </p>
          )}

          {user && (
            <Tabs defaultValue="visao-geral" className="w-full mt-5">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
                <TabsTrigger value="editar" className="text-xs">Editar</TabsTrigger>
                <TabsTrigger value="avaliacoes" className="text-xs">Avaliações</TabsTrigger>
                <TabsTrigger value="config" className="text-xs">Config.</TabsTrigger>
              </TabsList>

              <TabsContent value="visao-geral" className="mt-5 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Estatísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { icon: "📤", val: user.totalDonations, label: "Doações realizadas", color: "text-primary" },
                      { icon: "📥", val: user.totalReceived, label: "Doações recebidas", color: "text-primary" },
                      { icon: "✦", val: user.karmaPoints, label: "Karma total", color: "text-secondary-foreground" },
                      { icon: "📅", val: memberSince, label: "Membro desde", color: "text-foreground" },
                    ].map((s) => (
                      <Card key={s.label} className="bg-card border-border">
                        <CardContent className="p-3.5">
                          <span className="text-lg">{s.icon}</span>
                          <p className={`text-2xl font-bold mt-1.5 leading-none ${s.color}`}>{s.val}</p>
                          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Conquistas
                  </h3>
                  {loadingBadges ? (
                    <div className="flex gap-2.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="flex-none w-20 h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : badges.length > 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
                      {badges.map((ub) => <BadgeCard key={ub.id} ub={ub} />)}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma conquista ainda.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="editar" className="mt-5 space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Informações Pessoais
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name" className="text-xs mb-1.5 block">Nome completo</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nickname" className="text-xs mb-1.5 block">Apelido</Label>
                        <Input
                          id="nickname"
                          value={formData.nickname}
                          onChange={(e) => setFormData((p) => ({ ...p, nickname: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-xs mb-1.5 block">Bio curta</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone" className="text-xs mb-1.5 block">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-xs mb-1.5 block">Cidade</Label>
                        <Input
                          id="city"
                          value={`${formData.city}${formData.state ? `, ${formData.state}` : ""}`}
                          onChange={(e) => {
                            const [city, state = ""] = e.target.value.split(",");
                            setFormData((p) => ({
                              ...p,
                              city: city.trim(),
                              state: state.trim(),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="zipCode" className="text-xs mb-1.5 block">CEP</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData((p) => ({ ...p, zipCode: e.target.value }))}
                        className="max-w-[160px]"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Privacidade do Perfil
                  </h3>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 divide-y divide-border">
                      <ToggleRow
                        label="Mostrar nome real"
                        description="Exibir nome completo publicamente"
                        checked={user.showRealName}
                        onCheckedChange={(v) => handleSaveSettings({ showRealName: v })}
                      />
                      <ToggleRow
                        label="Mostrar localização"
                        description="Cidade visível no perfil"
                        checked={user.showLocation}
                        onCheckedChange={(v) => handleSaveSettings({ showLocation: v })}
                      />
                      <ToggleRow
                        label="Mostrar estatísticas"
                        description="Karma e contadores públicos"
                        checked={user.showStats}
                        onCheckedChange={(v) => handleSaveSettings({ showStats: v })}
                      />
                      <ToggleRow
                        label="Aceitar mensagens"
                        description="Receber mensagens de outros usuários"
                        checked={user.allowMessages}
                        onCheckedChange={(v) => handleSaveSettings({ allowMessages: v })}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleSaveProfile} disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Salvando…
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="avaliacoes" className="mt-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avaliações Recebidas
                </h3>

                {loadingReviews ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma avaliação ainda.
                  </p>
                ) : (
                  <>
                    <Card className="bg-card border-border">
                      <CardContent className="p-4 flex gap-5">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-secondary-foreground">
                            {avgRating.toFixed(1)}
                          </span>
                          <StarRating rating={Math.round(avgRating)} size={13} />
                          <span className="text-xs text-muted-foreground mt-1">
                            {reviews.length} avaliações
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          {ratingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="w-2">{star}</span>
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary-400/40 rounded-full"
                                  style={{ width: `${(count / reviews.length) * 100}%` }}
                                />
                              </div>
                              <span className="w-3 text-right">{count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-3">
                      {reviews.length > 0 && reviews.map((review) => (
                        <Card key={review.id} className="bg-card border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src={review.reviewer.avatar ?? undefined} />
                                <AvatarFallback className="text-xs font-semibold text-primary bg-primary-400/40">
                                  {getInitials(review.reviewer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{review.reviewer.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString("pt-BR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <StarRating rating={review.rating} size={13} />
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                {review.comment}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {review.isPunctual && (
                                <Badge variant="ghost" className="text-[10px] text-primary bg-primary-400/40 border border-muted">
                                  Pontual
                                </Badge>
                              )}
                              {review.isCommunicative && (
                                <Badge variant="ghost" className="text-[10px] text-primary bg-primary-400/40 border border-muted">
                                  Comunicativo
                                </Badge>
                              )}
                              {review.isAsDescribed && (
                                <Badge variant="ghost" className="text-[10px] text-primary bg-primary-400/40 border border-muted">
                                  Como descrito
                                </Badge>
                              )}
                              {review.isRespectful && (
                                <Badge variant="ghost" className="text-[10px] text-primary bg-primary-400/40 border border-muted">
                                  Respeitoso
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="config" className="mt-5 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                    Notificações
                  </h3>
                  <Card className="bg-card border-border overflow-hidden p-0">
                    <CardContent className="p-4 divide-y divide-border">
                      <ToggleRow label="Notificações push" description="Ativar todas as notificações" checked={user.pushEnabled} onCheckedChange={(v) => handleSaveSettings({ pushEnabled: v })} />
                      <ToggleRow label="Mensagens" description="Novas mensagens no chat" checked={user.notifyMessages} onCheckedChange={(v) => handleSaveSettings({ notifyMessages: v })} />
                      <ToggleRow label="Solicitações" description="Pedidos nos seus itens" checked={user.notifyRequests} onCheckedChange={(v) => handleSaveSettings({ notifyRequests: v })} />
                      <ToggleRow label="Itens próximos" description="Novos produtos na sua região" checked={user.notifyNewProducts} onCheckedChange={(v) => handleSaveSettings({ notifyNewProducts: v })} />
                      <ToggleRow label="E-mail" description="Resumos e alertas por e-mail" checked={user.emailNotifications} onCheckedChange={(v) => handleSaveSettings({ emailNotifications: v })} />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                    Preferências
                  </h3>
                  <Card className="bg-card border-border overflow-hidden p-0 gap-0">
                    <SettingsRow icon={Shield} label="Verificar telefone" description={user.phone ? `+55 ${user.phone}` : undefined} value="✓ ok" />
                    <SettingsRow icon={Ruler} label="Raio de busca" description="Distância máxima de itens" value="10 km" />
                    <SettingsRow icon={Globe} label="Idioma" value="Português BR" />
                  </Card>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                    Sobre o App
                  </h3>
                  <Card className="bg-card border-border overflow-hidden p-0 gap-0">
                    <SettingsRow icon={FileText} label="Termos de uso" />
                    <SettingsRow icon={Shield} label="Política de privacidade" />
                    <SettingsRow icon={Star} label="Avaliar o app" />
                    <SettingsRow icon={Info} label="Versão do app" value="2.1.4" />
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3 pb-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/logout", {
                          method: "POST",
                        });

                        if (!res.ok) {
                          throw new Error();
                        }

                        toast.success("Logout realizado com sucesso!");

                        router.push("/login");
                        router.refresh();
                      } catch {
                        toast.error("Erro ao sair da conta.");
                      }
                    }}
                  >
                    <LogOut size={15} className="mr-2" />
                    Sair da conta
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => router.push("/perfil/bloqueios")}>
                    <Ban size={15} className="mr-2" />
                    Gerenciar bloqueios
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (confirm("Tem certeza? Esta ação é irreversível.")) {
                        router.push("/perfil/excluir-conta");
                      }
                    }}
                  >
                    <Trash2 size={15} className="mr-2" />
                    Excluir minha conta
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground pb-2">
                  Donare · Feito com ❤️ em {new Date().getFullYear()}
                </p>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
}