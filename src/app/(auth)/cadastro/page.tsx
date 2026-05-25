"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import FormField from "@/components/form-field";
import FieldError from "@/components/field-error";

type FormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
};

export default function CadastroPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<FormState>({
    name: "",
    email: "",
    password: "",
    phone: "",
    cpf: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage("Nome é obrigatório.");
      return;
    }
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
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || null,
          cpf: form.cpf.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zipCode: form.zipCode.trim() || null,
          bio: form.bio.trim() || null,
        }),
      });

      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok) {
        setErrorMessage(data?.message ?? "Erro ao cadastrar. Tente novamente.");
        return;
      }

      // Cadastro bem-sucedido: redirecionar para a home
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
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-mix"
      />
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
            <h1 className="text-xl font-semibold">Criar conta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha seus dados para realizar o cadastro.
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
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Seu nome"
              />
              <FieldError message={!form.name.trim() ? "" : undefined} />
            </FormField>

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
            </FormField>

            <FormField>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField>
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </FormField>

              <FormField>
                <Label htmlFor="cpf">CPF (opcional)</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => setField("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </FormField>
            </div>

            <FormField>
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                placeholder="Conte um pouco sobre você"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField>
                <Label htmlFor="city">Cidade (opcional)</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="Sua cidade"
                />
              </FormField>

              <FormField>
                <Label htmlFor="state">Estado (opcional)</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  placeholder="UF"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField>
                <Label htmlFor="zipCode">CEP (opcional)</Label>
                <Input
                  id="zipCode"
                  value={form.zipCode}
                  onChange={(e) => setField("zipCode", e.target.value)}
                  placeholder="00000-000"
                />
              </FormField>

              <FormField>
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Rua, número"
                />
              </FormField>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>

            <div className="pt-3">
              <Button variant="outline" className="w-full h-9 rounded-xl" asChild>
                <Link href="/login">Voltar para o login</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



