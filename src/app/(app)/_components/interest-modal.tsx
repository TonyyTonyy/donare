"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, MapPin, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "./product-detail-dialog";

interface InterestModalProps {
  product: ProductDetail | null;
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "loading" | "success" | "error";

const MESSAGE_SUGGESTIONS = [
  "Olá! Tenho muito interesse neste item. Quando posso retirar?",
  "Oi! Ainda está disponível? Posso retirar ainda esta semana.",
  "Boa tarde! Este produto ainda está disponível para doação?",
];

export function InterestModal({ product, open, onClose }: InterestModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 300;

  const handleMessageChange = (val: string) => {
    if (val.length <= MAX_CHARS) {
      setMessage(val);
      setCharCount(val.length);
    }
  };

  const handleSuggestion = (text: string) => {
    handleMessageChange(text);
  };

  const handleSubmit = async () => {
    if (!product) return;
    setStep("loading");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Falha ao enviar");
      setStep("success");
    } catch {
      setStep("error");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setMessage("");
      setCharCount(0);
    }, 300);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md w-full rounded-2xl p-0 overflow-hidden gap-0">
        {step === "success" && (
          <div className="flex flex-col items-center justify-center gap-5 py-12 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-xl">
                Solicitação enviada!
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                O doador foi notificado. Você receberá uma resposta em até{" "}
                <strong>48 horas</strong>. Fique de olho nas suas mensagens!
              </p>
            </div>
            <div className="w-full space-y-2">
              <Button
                className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold"
                onClick={handleClose}
              >
                Entendido 🎉
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 rounded-xl text-sm text-muted-foreground"
                onClick={handleClose}
              >
                Ver minhas solicitações
              </Button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">😕</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                Ops, algo deu errado
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não conseguimos enviar sua solicitação. Tente novamente.
              </p>
            </div>
            <div className="w-full space-y-2">
              <Button
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold"
                onClick={() => setStep("form")}
              >
                Tentar novamente
              </Button>
              <Button
                variant="ghost"
                className="w-full h-10 rounded-xl text-sm"
                onClick={handleClose}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {(step === "form" || step === "loading") && (
          <>
            <DialogHeader className="px-5 pt-5 pb-0">
              <DialogTitle className="text-lg font-bold text-foreground">
                Tenho interesse
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Envie uma mensagem para o doador explicando sua necessidade.
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 pt-4 pb-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-card">
                  <Image
                    src={product.images[0] ?? "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.conditionLabel}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-4 h-4 rounded-full overflow-hidden">
                      <Image
                        src={product.donor.avatar}
                        alt={product.donor.name}
                        width={16}
                        height={16}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.donor.nickname ?? product.donor.name}
                    </span>
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-amber-600">
                      {product.donor.reputationScore}
                    </span>
                  </div>
                </div>
                {product.distanceFormatted && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground flex-shrink-0">
                    <MapPin className="w-3 h-3" />
                    {product.distanceFormatted}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="text-xs font-semibold text-muted-foreground">
                    Mensagem para o doador{" "}
                    <span className="font-normal">(opcional)</span>
                  </label>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Ex: Olá! Tenho muito interesse neste item..."
                  className="resize-none rounded-xl text-sm min-h-[100px] border-border focus-visible:ring-ring"
                  disabled={step === "loading"}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-muted-foreground">
                    Uma mensagem aumenta suas chances de ser aceito!
                  </p>
                  <span
                    className={cn(
                      "text-[11px] font-medium tabular-nums",
                      charCount > MAX_CHARS * 0.9
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {message === "" && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Sugestões rápidas
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {MESSAGE_SUGGESTIONS.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(text)}
                        disabled={step === "loading"}
                        className="text-left text-xs px-3 py-2.5 rounded-xl bg-muted hover:bg-accent text-foreground border border-border hover:border-primary/30 transition-colors leading-relaxed"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 leading-relaxed">
                📋 O doador tem <strong>48 horas</strong> para responder. Se aceito,
                vocês combinam o local de retirada pelo chat.
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-border text-sm"
                  onClick={handleClose}
                  disabled={step === "loading"}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm"
                  onClick={handleSubmit}
                  disabled={step === "loading"}
                >
                  {step === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar solicitação"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}