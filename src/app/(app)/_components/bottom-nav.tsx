"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import NavItem from "./nav-item";
import DonateButton from "./donate-button";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 flex-shrink-0">
      <div
        className={cn(
          "flex items-center justify-around px-2",
          "h-16 pb-[env(safe-area-inset-bottom,12px)]",
          "bg-card/85 backdrop-blur-xl backdrop-saturate-150",
          "border-t border-border/70",
        )}
      >
        <NavItem item={navItems[0]} active={pathname === navItems[0].href} />
        <NavItem item={navItems[1]} active={pathname === navItems[1].href} />
        <DonateButton active={pathname === "/doar"} />
        <NavItem item={navItems[2]} active={pathname === navItems[2].href} />
        <NavItem item={navItems[3]} active={pathname === navItems[3].href} />
      </div>
    </nav>
  );
}