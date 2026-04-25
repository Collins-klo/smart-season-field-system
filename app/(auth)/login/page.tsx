"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] relative">
      <div className="absolute inset-0 bg-repeat opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/grain.png')" }}></div>
      <Card className="w-full max-w-md border-[var(--color-border)] shadow-md z-10 mx-4 bg-[var(--color-surface)]">
        <CardHeader className="space-y-1 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[var(--color-brand-xlight)] rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-[var(--color-brand-primary)]" />
          </div>
          <CardTitle className="text-3xl font-heading font-medium tracking-tight text-[var(--color-text-primary)]">
            SmartSeason
          </CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">
            Field monitoring for the modern farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)]">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="agent@smartseason.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[var(--color-border)] focus:ring-[var(--color-ring)]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">Password</label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[var(--color-border)] focus:ring-[var(--color-ring)]"
              />
            </div>
            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-white transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--color-text-muted)]">
                Demo Accounts:<br />
                admin@smartseason.co / admin123<br />
                james@smartseason.co / agent123<br />
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
