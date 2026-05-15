"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeusAnuncios } from "./_components/meus-anuncios/meus-anuncios";
import { Interessados } from "./_components/interessados/interessados";

type SubScreen = "meus-anuncios" | "interessados";

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

export default function InteressesPage() {
  const [currentScreen, setCurrentScreen] = useState<SubScreen>("meus-anuncios");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCount | null>(
    null
  );

  const handleSelectProduct = (product: ProductWithCount) => {
    setSelectedProduct(product);
    setCurrentScreen("interessados");
  };

  const handleBack = () => {
    if (selectedProduct) {
      setSelectedProduct(null);
      setCurrentScreen("meus-anuncios");
    }
  };

  const tabs = [
    {
      key: "meus-anuncios" as SubScreen,
      label: "Meus Anúncios",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 h-14 px-4">
          {selectedProduct ? (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <Link
              href="/"
              className="p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
          )}

          <div className="flex-1">
            <h1 className="font-bold text-foreground text-lg leading-tight">
              {selectedProduct ? selectedProduct.title : "Interessados"}
            </h1>
            {selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Pessoas que se interessaram
              </p>
            )}
          </div>

          {!selectedProduct && (
            <Users className="w-5 h-5 text-primary" />
          )}
        </div>

        {!selectedProduct && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCurrentScreen(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    currentScreen === tab.key
                      ? "bg-primary text-white"
                      : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4">
        {currentScreen === "meus-anuncios" && (
          <MeusAnuncios onSelectProduct={handleSelectProduct} />
        )}
        {currentScreen === "interessados" && selectedProduct && (
          <Interessados
            productId={selectedProduct.id}
            onUpdate={() => {}}
          />
        )}
      </main>
    </div>
  );
}
