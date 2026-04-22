"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Topbar({ user, onMenuClick }: { user: any, onMenuClick: () => void }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-[var(--color-text-primary)]" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-heading font-semibold text-[var(--color-text-primary)] hidden md:block">
          Season Overview
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{user?.name}</span>
          <Badge variant="outline" className="text-[10px] uppercase bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]">
            {user?.role?.replace("_", " ")}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
          Logout
        </Button>
      </div>
    </header>
  );
}
