import { cn } from "@/lib/utils";
import { BottomNav } from "./_components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background bg-gradient-mix">
      <div
        className={cn(
          "relative flex w-full flex-col overflow-hidden",
          "h-dvh max-h-[932px]",
          "bg-background",
          "sm:rounded-[2.0rem]",
          "shadow-layer",
        )}
      >
        <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] p-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}