import { cn } from "@/lib/utils";
import Link from "next/link";
import { navItems } from "./nav-items";

export default function NavItem({
  item,
  active,
}: {
  item: (typeof navItems)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-1.5",
        "no-underline transition-colors duration-100 [-webkit-tap-highlight-color:transparent]",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-100",
          active && "bg-primary/10",
        )}
      >
        <Icon
          strokeWidth={active ? 2.0 : 1.6}
          className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")}
        />

      </span>

      <span
        className={cn(
          "text-[0.6rem] leading-none tracking-wide",
          active ? "font-bold text-primary" : "font-medium",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}