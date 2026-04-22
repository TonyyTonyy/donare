"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell, MessageSquare, Package, MapPin, Mail, Shield,
  Lock, CreditCard, Ruler, Globe, Ban, Cloud, HardDrive,
  Trash2, FileText, Star, Info, ChevronRight, LogOut,
  Camera, Edit2, ArrowLeft, MoreHorizontal, Check
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
  NEWCOMER:  { label: "Novato",    xpMin: 0,    xpMax: 50,   color: "#abbab3" },
  BEGINNER:  { label: "Iniciante", xpMin: 51,   xpMax: 100,  color: "#47cfeb" },
  REGULAR:   { label: "Regular",   xpMin: 101,  xpMax: 250,  color: "#26d968" },
  TRUSTED:   { label: "Confiável", xpMin: 251,  xpMax: 500,  color: "#26d968" },
  VERIFIED:  { label: "Verificado",xpMin: 501,  xpMax: 1000, color: "#f4ca25" },
  ELITE:     { label: "Elite",     xpMin: 1001, xpMax: 9999, color: "#f4ca25" },
};

const MOCK_USER: UserProfile = {
  id: "cuid123",
  name: "Maria Rodrigues",
  nickname: "malu.doe",
  avatar: null,
  bio: "Adoro ajudar o próximo! Geralmente doo roupas e eletrodomésticos 💚",
  phone: "(71) 99999-0001",
  city: "Salvador",
  state: "BA",
  zipCode: "41720-052",
  karmaPoints: 680,
  reputationLevel: "TRUSTED",
  totalDonations: 47,
  totalReceived: 12,
  createdAt: "2024-03-01T00:00:00Z",
  showRealName: true,
  showStats: true,
  showLocation: true,
  allowMessages: true,
  pushEnabled: true,
  emailNotifications: true,
  notifyNewProducts: false,
  notifyMessages: true,
  notifyRequests: true,
};

const MOCK_BADGES: UserBadge[] = [
  { id: "1", badge: { name: "Doador Elite", description: "50+ doações", icon: "🌟", requirement: "50 doações" }, isUnlocked: true, progress: 47, unlockedAt: "2025-01-10T00:00:00Z" },
  { id: "2", badge: { name: "Primeiro Passo", description: "Primeira doação", icon: "🌱", requirement: "1 doação" }, isUnlocked: true, progress: 1, unlockedAt: "2024-03-05T00:00:00Z" },
  { id: "3", badge: { name: "Comunicativo", description: "100 mensagens", icon: "💬", requirement: "100 mensagens" }, isUnlocked: true, progress: 100, unlockedAt: "2024-08-12T00:00:00Z" },
  { id: "4", badge: { name: "Resposta Rápida", description: "Responda em 1h", icon: "⚡", requirement: "10 respostas rápidas" }, isUnlocked: true, progress: 10, unlockedAt: "2024-06-01T00:00:00Z" },
  { id: "5", badge: { name: "100 Doações", description: "Complete 100 doações", icon: "🏆", requirement: "100 doações" }, isUnlocked: false, progress: 47, unlockedAt: null },
  { id: "6", badge: { name: "Parceiro", description: "5 avaliações 5★", icon: "🤝", requirement: "5 avaliações perfeitas" }, isUnlocked: false, progress: 3, unlockedAt: null },
  { id: "7", badge: { name: "Lendário", description: "Elite por 1 ano", icon: "💎", requirement: "1001 karma" }, isUnlocked: false, progress: 680, unlockedAt: null },
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    rating: 5,
    comment: "Ótima doadora! Combinamos tudo pelo app, chegou no horário e o produto estava exatamente como descrito. Super recomendo!",
    isPunctual: true, isCommunicative: true, isAsDescribed: true, isRespectful: true, wouldRecommend: true,
    createdAt: "2025-04-15T00:00:00Z",
    reviewer: { name: "João Costa", nickname: "jcosta", avatar: null },
  },
  {
    id: "r2",
    rating: 5,
    comment: "Pessoa muito gentil e atenciosa. O item estava em perfeito estado, melhor do que esperava. Obrigada!",
    isPunctual: false, isCommunicative: true, isAsDescribed: true, isRespectful: true, wouldRecommend: true,
    createdAt: "2025-03-28T00:00:00Z",
    reviewer: { name: "Ana Silva", nickname: "anasilva", avatar: null },
  },
  {
    id: "r3",
    rating: 4,
    comment: "Tudo certo, só demorou um pouco pra responder mas foi tudo bem no final.",
    isPunctual: false, isCommunicative: false, isAsDescribed: true, isRespectful: true, wouldRecommend: true,
    createdAt: "2025-03-10T00:00:00Z",
    reviewer: { name: "Pedro Lima", nickname: "plima", avatar: null },
  },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-gold text-gold" : "text-muted fill-muted"}
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
  const isGold = ub.badge.name.toLowerCase().includes("elite") || ub.badge.name.toLowerCase().includes("lendário");
  return (
    <div
      className={[
        "flex-none w-20 rounded-xl border p-2.5 text-center select-none",
        ub.isUnlocked
          ? isGold
            ? "border-gold-400/20 bg-gold-400/40"
            : "border-leaf-400/20 leaf-400/40"
          : "border-border opacity-40 grayscale",
      ].join(" ")}
    >
      <span className="text-2xl block mb-1.5">{ub.badge.icon}</span>
      <p
        className={[
          "text-[10px] font-medium leading-tight",
          ub.isUnlocked ? (isGold ? "text-gold" : "text-leaf") : "text-muted-foreground",
        ].join(" ")}
      >
        {ub.badge.name}
      </p>
      {!ub.isUnlocked && (
        <div className="mt-1.5 h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-muted-foreground rounded-full"
            style={{ width: `${Math.min(100, (ub.progress / parseInt(ub.badge.requirement)) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [formData, setFormData] = useState({
    name: MOCK_USER.name,
    nickname: MOCK_USER.nickname ?? "",
    bio: MOCK_USER.bio ?? "",
    phone: MOCK_USER.phone ?? "",
    city: MOCK_USER.city ?? "",
    state: MOCK_USER.state ?? "",
    zipCode: MOCK_USER.zipCode ?? "",
  });

  const lvl = LEVEL_CONFIG[user.reputationLevel];
  const xpProgress = ((user.karmaPoints - lvl.xpMin) / (lvl.xpMax - lvl.xpMin)) * 100;
  const nextLevel = user.karmaPoints < lvl.xpMax ? lvl.xpMax - user.karmaPoints : 0;

  const avgRating = MOCK_REVIEWS.reduce((a, r) => a + r.rating, 0) / MOCK_REVIEWS.length;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: MOCK_REVIEWS.filter((r) => r.rating === star).length,
  }));

  async function handleSaveProfile() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Erro ao salvar");
        const updated = await res.json();
        setUser((prev) => ({ ...prev, ...updated }));
        toast.success("Perfil atualizado com sucesso!");
      } catch {
        toast.error("Não foi possível salvar. Tente novamente.");
      }
    });
  }

  async function handleSaveSettings(patch: Partial<UserProfile>) {
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setUser((prev) => ({ ...prev, ...patch }));
    } catch {
      toast.error("Erro ao salvar preferência.");
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: url }));
    // Real: enviar para /api/user/avatar com multipart/form-data
  }

  function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background pb-10" style={{ maxWidth: 480, margin: "0 auto" }}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-base font-semibold">Meu Perfil</h1>
      </header>

      <section className="px-5 pt-6 pb-5 bg-background border-b border-border">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-20 h-20 border-[3px] border-leaf-400/20">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="text-2xl font-bold text-leaf leaf-400/40">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-gold-400/40 flex items-center justify-center border-2 border-gold-400/20"
            >
              <Camera size={16} className="text-gold" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            @{user.nickname ?? user.name.toLowerCase().replace(" ", ".")}
            {user.city && ` · ${user.city}, ${user.state}`}
          </p>

          <div className="flex gap-2 mt-3">
            <span className="flex items-center gap-1.5 bg-gold-400/40 text-gold border border-gold-400/20 text-xs font-semibold px-3 py-1 rounded-full">
              <Star size={11} className="fill-gold" />
              {lvl.label}
            </span>
            <span className="flex items-center gap-1.5 leaf-400/40 text-leaf border border-leaf-400/20 text-xs font-semibold px-3 py-1 rounded-full">
              ▲ Nível {Object.keys(LEVEL_CONFIG).indexOf(user.reputationLevel) + 1}
            </span>
          </div>

          <div className="w-full max-w-[280px] mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{user.karmaPoints} karma</span>
              <span>{nextLevel > 0 ? `Faltam ${nextLevel} para o próximo nível` : "Nível máximo"}</span>
            </div>
            <Progress value={Math.min(100, xpProgress)} className="h-1.5" />
          </div>

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
                    { icon: "📤", val: user.totalDonations, label: "Doações realizadas", color: "text-leaf" },
                    { icon: "📥", val: user.totalReceived,  label: "Doações recebidas",  color: "text-leaf" },
                    { icon: "✦",  val: user.karmaPoints,   label: "Karma total",         color: "text-gold" },
                    { icon: "📅", val: memberSince,         label: "Membro desde",        color: "text-foreground" },
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
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
                  {MOCK_BADGES.map((ub) => <BadgeCard key={ub.id} ub={ub} />)}
                </div>
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
                        value={`${formData.city}, ${formData.state}`}
                        onChange={(e) => {
                          const [city, state = ""] = e.target.value.split(",");
                          setFormData((p) => ({ ...p, city: city.trim(), state: state.trim() }));
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setFormData({
                    name: user.name, nickname: user.nickname ?? "",
                    bio: user.bio ?? "", phone: user.phone ?? "",
                    city: user.city ?? "", state: user.state ?? "", zipCode: user.zipCode ?? "",
                  })}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-leaf text-background hover:bg-leaf-400/20"
                  onClick={handleSaveProfile}
                  disabled={isPending}
                >
                  {isPending ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="avaliacoes" className="mt-5 space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avaliações Recebidas
              </h3>

              <Card className="bg-card border-border">
                <CardContent className="p-4 flex gap-5">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gold">{avgRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(avgRating)} size={13} />
                    <span className="text-xs text-muted-foreground mt-1">{MOCK_REVIEWS.length} avaliações</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2">{star}</span>
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-400/40 rounded-full"
                            style={{ width: `${(count / MOCK_REVIEWS.length) * 100}%` }}
                          />
                        </div>
                        <span className="w-3 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                {MOCK_REVIEWS.map((review) => (
                  <Card key={review.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={review.reviewer.avatar ?? undefined} />
                          <AvatarFallback className="text-xs font-semibold text-leaf leaf-400/40">
                            {getInitials(review.reviewer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{review.reviewer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <StarRating rating={review.rating} size={13} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.comment}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {review.isPunctual && <Badge variant="ghost" className="text-[10px] text-leaf leaf-400/40 border border-muted">Pontual</Badge>}
                        {review.isCommunicative && <Badge variant="ghost" className="text-[10px] text-leaf leaf-400/40 border border-muted">Comunicativo</Badge>}
                        {review.isAsDescribed && <Badge variant="ghost" className="text-[10px] text-leaf leaf-400/40 border border-muted">Como descrito</Badge>}
                        {review.isRespectful && <Badge variant="ghost" className="text-[10px] text-leaf leaf-400/40 border border-muted">Respeitoso</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  <SettingsRow icon={Shield} label="Verificar telefone" description="+55 71 9···· ··01" value="✓ ok" />
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
                  onClick={() => router.push("/auth/logout")}
                >
                  <LogOut size={15} className="mr-2" />
                  Sair da conta
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => router.push("/perfil/bloqueios")}
                >
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
        </div>
      </section>
    </div>
  );
}