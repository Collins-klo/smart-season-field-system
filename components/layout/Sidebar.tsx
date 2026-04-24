"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Leaf, LayoutDashboard, Map, Users, Activity, Settings } from "lucide-react";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
    <aside 
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card h-full z-40 transition-[width] duration-300 ease-in-out overflow-hidden flex-shrink-0",
        open ? "w-60" : "w-[72px]"
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="p-4 flex items-center gap-4 border-b border-border h-16 shrink-0 w-60">
        <div className="flex items-center justify-center p-1 w-8 h-8 shrink-0">
          <Leaf className="w-6 h-6 text-primary" />
        </div>
        <span 
          className={cn(
             "text-xl font-heading font-bold text-foreground transition-opacity duration-300 whitespace-nowrap",
             open ? "opacity-100" : "opacity-0"
          )}
        >
          SmartSeason
        </span>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              title={!open ? link.name : undefined}
              className={cn(
                "flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-[216px]",
                isActive 
                  ? "bg-primary/10 text-primary border-l-4 border-primary rounded-l-none" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn(
                "transition-opacity duration-300 whitespace-nowrap",
                open ? "opacity-100" : "opacity-0"
              )}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 border-t border-border w-60 overflow-hidden", open ? "opacity-100" : "opacity-0 transition-opacity")}>
        <p className="text-xs text-muted-foreground px-2 whitespace-nowrap">© 2026 Shamba Records</p>
      </div>
    </aside>
  );
}
