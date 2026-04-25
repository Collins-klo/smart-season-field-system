"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InviteState =
  | { phase: "loading" }
  | { phase: "invalid"; message: string }
  | { phase: "form"; email: string; expiresAt: string }
  | { phase: "success" };

export function AcceptInviteContent() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [state, setState] = useState<InviteState>(() =>
    token ? { phase: "loading" } : { phase: "invalid", message: "Invalid invite link." }
  );
  const [form, setForm] = useState({ name: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Validate token on mount
  useEffect(() => {
    if (!token) return; // already handled via lazy initializer
    fetch(`/api/agents/invite/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setState({ phase: "invalid", message: data.error });
        } else {
          setState({
            phase: "form",
            email: data.email,
            expiresAt: data.expiresAt,
          });
        }
      })
      .catch(() => {
        setState({
          phase: "invalid",
          message: "Could not verify invite link. Please try again.",
        });
      });
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (form.name.trim().length < 2) {
      setFormError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/agents/accept-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            name: form.name.trim(),
            password: form.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        setState({ phase: "success" });
      } catch {
        setFormError("Network error. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] px-8 py-5 flex items-center gap-2.5">
          <div className="rounded-lg bg-[var(--color-brand-primary)] p-1.5">
            <Leaf className="h-5 w-5 text-[var(--color-background)]" />
          </div>
          <span className="text-xl font-heading font-bold text-[var(--color-text-primary)]">
            SmartSeason
          </span>
        </div>

        <div className="px-8 py-8">
          {/* ── Loading ── */}
          {state.phase === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-primary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Verifying your invite…
              </p>
            </div>
          )}

          {/* ── Invalid ── */}
          {state.phase === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="rounded-full bg-red-900/20 p-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-semibold text-[var(--color-text-primary)] mb-2">
                  Invalid Invite
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {state.message}
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm text-[var(--color-brand-primary)] hover:underline"
              >
                Go to login →
              </Link>
            </div>
          )}

          {/* ── Form ── */}
          {state.phase === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-2xl font-heading font-semibold text-[var(--color-text-primary)] mb-1">
                  Set up your account
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  You&apos;ve been invited as a{" "}
                  <span className="font-medium text-[var(--color-brand-primary)]">
                    Field Agent
                  </span>
                  .
                </p>
              </div>

              {/* Email (read-only) */}
              <div className="rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] px-4 py-3 text-sm">
                <span className="text-[var(--color-text-muted)]">
                  Signing up as{" "}
                </span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {state.email}
                </span>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="accept-name"
                  className="text-[var(--color-text-primary)] text-sm font-medium"
                >
                  Your full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input
                    id="accept-name"
                    type="text"
                    required
                    autoFocus
                    placeholder="James Mwangi"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="pl-9 bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-[var(--color-brand-primary)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="accept-password"
                  className="text-[var(--color-text-primary)] text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input
                    id="accept-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className="pl-9 pr-10 bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-[var(--color-brand-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="accept-confirm"
                  className="text-[var(--color-text-primary)] text-sm font-medium"
                >
                  Confirm password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input
                    id="accept-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="pl-9 bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-[var(--color-brand-primary)]"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold h-11 text-base"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create My Account"
                )}
              </Button>

              <p className="text-center text-xs text-[var(--color-text-muted)]">
                This invite expires on{" "}
                {new Date(state.expiresAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            </form>
          )}

          {/* ── Success ── */}
          {state.phase === "success" && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <div className="rounded-full bg-[var(--color-status-active-bg)] p-4 border border-[var(--color-status-active)]/30">
                <CheckCircle2 className="h-8 w-8 text-[var(--color-status-active)]" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-semibold text-[var(--color-text-primary)] mb-2">
                  Account created!
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Your Field Agent account is ready. Log in with your email and
                  the password you just set.
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold px-8"
              >
                Go to Login →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
