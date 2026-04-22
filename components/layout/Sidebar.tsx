"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Leaf, LayoutDashboard, Map, Users, Activity, Settings } from "lucide-react";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Fields", href: "/fields", icon: Map },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Activity Feed", href: "/activity", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const agentLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Fields", href: "/fields", icon: Map },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const links = role === "ADMIN" ? adminLinks : agentLinks;

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)] h-full">
      <div className="p-6 flex items-center gap-2">
        <Leaf className="w-6 h-6 text-[var(--color-brand-primary)]" />
        <span className="text-xl font-heading font-bold text-[var(--color-text-primary)]">SmartSeason</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                isActive 
                  ? "bg-[var(--color-brand-xlight)] text-[var(--color-brand-primary)] border-l-4 border-[var(--color-brand-primary)] rounded-l-none" 
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <link.icon className={cn("w-5 h-5", isActive ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-muted)]")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] px-2">© 2026 Shamba Records</p>
      </div>
    </aside>
  );
}
