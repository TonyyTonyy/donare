"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import FormField from "@/components/form-field";
import FieldError from "@/components/field-error";

type FormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<FormState>({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.email.trim()) {
      setErrorMessage("Email é obrigatório.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setErrorMessage("Senha é obrigatória (mínimo 6 caracteres).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok) {
        setErrorMessage(data?.message ?? "Erro ao fazer login. Tente novamente.");
        return;
      }

      // Login bem-sucedido: redirecionar para a home
      router.replace("/");
    } catch {
      setErrorMessage("Erro de rede. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 bg-gradient-mix" />
      <div
        aria-hidden
        className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-water/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.02),transparent)] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.35),transparent)]"
      />

      <Card className="w-full max-w-xl bg-card/80 backdrop-blur-xl border-border shadow-lg relative">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6 pt-4">
            <div className="flex items-start justify-center">
              <div className="text-4xl font-extrabold tracking-tight">DONARE</div>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-xl font-semibold">Entrar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use seu email e senha para continuar.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-4 rounded-2xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
              {errorMessage}
            </div>
          ) : null}

          <Separator className="my-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="voce@exemplo.com"
              />
              <FieldError message={!form.email.trim() ? "" : undefined} />
            </FormField>

            <FormField>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••"
              />
            </FormField>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <div className="pt-3 flex flex-col gap-2">
              <Button variant="outline" className="w-full h-9 rounded-xl" asChild>
                <Link href="/cadastro">Criar conta</Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Não tem conta? Cadastre-se.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

