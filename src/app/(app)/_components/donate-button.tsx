import { cn } from "@/lib/utils";
import { Gift } from "lucide-react";
import Link from "next/link";

export default function DonateButton({ active }: { active: boolean }) {
  return (
    <div className="relative flex flex-1 flex-col items-center pb-2">
      <Link
        href="/doar"
        aria-label="Doar item"
        className={cn(
          "relative flex h-13 w-13 items-center justify-center rounded-full",
          "-translate-y-5.5 transition-all duration-200 [-webkit-tap-highlight-color:transparent]",
          active
            ? "bg-gradient-to-br from-secondary to-amber-400 text-secondary-foreground"
            : "bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground",
        )}
      >
        <Gift className="relative z-10 h-6 w-6" strokeWidth={1.8} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-4px] rounded-full border border-primary/40"
        />
      </Link>
      <span
        className={cn(
          "-mt-2.5 text-[0.6rem] font-bold leading-none tracking-widest",
          active ? "text-secondary" : "text-primary",
        )}
      >
        Doar
      </span>
    </div>
  );
}
