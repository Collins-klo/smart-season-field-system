"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Topbar({ user, onMenuClick }: { user: any, onMenuClick: () => void }) {
  return (
    <header className="h-14 mt-4 mx-4 md:mx-6 flex flex-shrink-0 items-center justify-between px-6 rounded-full border border-border bg-card shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-heading font-semibold text-foreground hidden md:block">
          Season Overview
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-border bg-[#b6e3f4] flex shrink-0 items-center justify-center p-0.5">
            <img
              src={`https://robohash.org/${encodeURIComponent(user?.name || 'User')}?set=set2&size=100x100`}
              alt={user?.name || "Avatar"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
            <Badge variant="outline" className="text-[10px] uppercase bg-muted text-muted-foreground border-border">
              {user?.role?.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
          Logout
        </Button>
      </div>
    </header>
  );
}
