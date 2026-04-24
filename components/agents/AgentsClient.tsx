"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Copy,
  Check,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  User,
  KeyRound,
  X,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Agent {
  id: string;
  name: string;
  email: string;
  assignedFields: { id: string }[];
  updates: { id: string }[];
  claimedInvite: { id: string } | null;
}

interface Invite {
  id: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  status: "pending" | "expired" | "used";
  token: string;
  claimedBy: { id: string; name: string } | null;
}

interface AgentsClientProps {
  initialAgents: Agent[];
  initialInvites: Invite[];
  appUrl: string;
}

// ─── Modal Wrapper ─────────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Invite Agent Modal ────────────────────────────────────────────────────────
function InviteAgentModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (invite: Invite) => void;
}) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    inviteLink: string;
    emailSent: boolean;
    emailError?: string | null;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setEmail("");
    setError("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/agents/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        setResult({
          inviteLink: data.invite.inviteLink,
          emailSent: data.emailSent,
          emailError: data.emailError,
        });
        // Build mock invite for immediate UI update
        onSuccess({
          id: data.invite.id,
          email: data.invite.email,
          expiresAt: data.invite.expiresAt,
          usedAt: null,
          createdAt: new Date().toISOString(),
          status: "pending",
          token: "",
          claimedBy: null,
        });
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  const copyLink = async () => {
    if (!result?.inviteLink) return;
    await navigator.clipboard.writeText(result.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Field Agent">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Enter the agent&apos;s email address. They&apos;ll receive a secure
            invite link to set up their account.
          </p>

          <div className="space-y-1.5">
            <Label
              htmlFor="invite-email"
              className="text-[var(--color-text-primary)] text-sm font-medium"
            >
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                id="invite-email"
                type="email"
                required
                placeholder="agent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-[var(--color-brand-primary)]"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-[var(--color-border)] text-[var(--color-text-secondary)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* Email status */}
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl p-4",
              result.emailSent
                ? "bg-[var(--color-status-active-bg)] border border-[var(--color-status-active)]/30"
                : "bg-[var(--color-status-at-risk-bg)] border border-[var(--color-status-at-risk)]/30"
            )}
          >
            {result.emailSent ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--color-status-active)] shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-[var(--color-status-at-risk)] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {result.emailSent
                  ? "Invite email sent!"
                  : "Email delivery failed"}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {result.emailSent
                  ? `Invite sent to ${email}. The link expires in 7 days.`
                  : result.emailError ??
                    "Copy the link below and share it manually."}
              </p>
            </div>
          </div>

          {/* Copy link */}
          <div className="space-y-1.5">
            <Label className="text-[var(--color-text-primary)] text-sm font-medium">
              Invite link
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={result.inviteLink}
                className="bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyLink}
                className="shrink-0 border-[var(--color-border)]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--color-status-active)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="w-full bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold"
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}

// ─── Create Agent Manually Modal ───────────────────────────────────────────────
function CreateAgentModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleClose = () => {
    setForm({ name: "", email: "", password: "" });
    setError("");
    onClose();
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }
        onSuccess({
          id: data.agent.id,
          name: data.agent.name,
          email: data.agent.email,
          assignedFields: [],
          updates: [],
          claimedInvite: null,
        });
        handleClose();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  };

  const fields = [
    {
      id: "manual-name",
      label: "Full name",
      key: "name" as const,
      type: "text",
      placeholder: "James Mwangi",
      Icon: User,
    },
    {
      id: "manual-email",
      label: "Email address",
      key: "email" as const,
      type: "email",
      placeholder: "james@example.com",
      Icon: Mail,
    },
    {
      id: "manual-password",
      label: "Temporary password",
      key: "password" as const,
      type: "password",
      placeholder: "Min. 8 characters",
      Icon: KeyRound,
    },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="Create Agent Manually">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] p-3.5">
          <div className="rounded-lg bg-[var(--color-brand-xlight)] p-1.5 shrink-0">
            <UserPlus className="h-4 w-4 text-[var(--color-brand-primary)]" />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Use this for agents without email access. They&apos;ll log in with
            the credentials you set here. Share the password securely.
          </p>
        </div>

        {fields.map(({ id, label, key, type, placeholder, Icon }) => (
          <div key={id} className="space-y-1.5">
            <Label
              htmlFor={id}
              className="text-[var(--color-text-primary)] text-sm font-medium"
            >
              {label}
            </Label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                id={id}
                type={type}
                required
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="pl-9 bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-[var(--color-brand-primary)]"
              />
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-[var(--color-border)] text-[var(--color-text-secondary)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Invite Status Badge ───────────────────────────────────────────────────────
function InviteStatusBadge({ status }: { status: Invite["status"] }) {
  const config = {
    pending: {
      icon: Clock,
      label: "Pending",
      className:
        "bg-[var(--color-status-at-risk-bg)] text-[var(--color-status-at-risk)] border-[var(--color-status-at-risk)]/30",
    },
    expired: {
      icon: XCircle,
      label: "Expired",
      className:
        "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]",
    },
    used: {
      icon: CheckCircle2,
      label: "Accepted",
      className:
        "bg-[var(--color-status-active-bg)] text-[var(--color-status-active)] border-[var(--color-status-active)]/30",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ─── Onboarding Method Badge ───────────────────────────────────────────────────
function OnboardingBadge({ wasInvited }: { wasInvited: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        wasInvited
          ? "bg-[var(--color-brand-xlight)] text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/30"
          : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
      )}
    >
      {wasInvited ? (
        <>
          <Mail className="h-3 w-3" /> Invite
        </>
      ) : (
        <>
          <UserPlus className="h-3 w-3" /> Manual
        </>
      )}
    </span>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────
export function AgentsClient({
  initialAgents,
  initialInvites,
  appUrl,
}: AgentsClientProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleInviteSuccess = useCallback((newInvite: Invite) => {
    setInvites((prev) => [newInvite, ...prev]);
  }, []);

  const handleAgentSuccess = useCallback((newAgent: Agent) => {
    setAgents((prev) => [newAgent, ...prev]);
    router.refresh();
  }, [router]);

  const handleRevoke = async (inviteId: string) => {
    setRevokingId(inviteId);
    try {
      const res = await fetch("/api/agents/invites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inviteId }),
      });
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      }
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyLink = async (invite: Invite) => {
    const link = `${appUrl}/accept-invite/${invite.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[var(--color-text-primary)]">
            Field Agents
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} ·{" "}
            {pendingInvites.length} pending invite
            {pendingInvites.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Primary: Invite */}
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-[var(--color-brand-primary)] text-[var(--color-background)] hover:bg-[var(--color-brand-primary)]/90 font-semibold gap-2"
            id="invite-agent-btn"
          >
            <Send className="h-4 w-4" />
            Invite Agent
          </Button>
          {/* Secondary: Manual */}
          <Button
            variant="outline"
            onClick={() => setCreateOpen(true)}
            className="border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] gap-2"
            id="create-agent-btn"
          >
            <UserPlus className="h-4 w-4" />
            Create Manually
          </Button>
        </div>
      </div>

      {/* ── Agents Table ── */}
      <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--color-surface-muted)] border-b-[var(--color-border)]">
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Assigned Fields</TableHead>
                  <TableHead className="text-center">
                    Updates Logged
                  </TableHead>
                  <TableHead className="text-center">Onboarding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow
                    key={agent.id}
                    className="border-b-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                  >
                    <TableCell className="font-medium text-[var(--color-text-primary)]">
                      {agent.name}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {agent.email}
                    </TableCell>
                    <TableCell className="text-center font-medium bg-[var(--color-brand-xlight)]/30">
                      {agent.assignedFields.length}
                    </TableCell>
                    <TableCell className="text-center text-[var(--color-text-secondary)]">
                      {agent.updates.length}
                    </TableCell>
                    <TableCell className="text-center">
                      <OnboardingBadge
                        wasInvited={agent.claimedInvite !== null}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-[var(--color-text-muted)]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-30" />
                        <span>No agents yet. Invite or create one above.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Pending Invites ── */}
      <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">
              Agent Invites
            </CardTitle>
            {pendingInvites.length > 0 && (
              <span className="rounded-full bg-[var(--color-status-at-risk-bg)] text-[var(--color-status-at-risk)] border border-[var(--color-status-at-risk)]/30 text-xs font-semibold px-2.5 py-0.5">
                {pendingInvites.length} pending
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-[var(--color-text-muted)]">
              <Mail className="h-8 w-8 opacity-30" />
              <span className="text-sm">No invites sent yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--color-surface-muted)] border-b-[var(--color-border)]">
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow
                      key={invite.id}
                      className="border-b-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                    >
                      <TableCell className="font-medium text-[var(--color-text-primary)]">
                        {invite.email}
                      </TableCell>
                      <TableCell>
                        <InviteStatusBadge status={invite.status} />
                      </TableCell>
                      <TableCell className="text-sm text-[var(--color-text-secondary)]">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--color-text-secondary)]">
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {invite.status === "pending" && invite.token && (
                            <button
                              onClick={() => handleCopyLink(invite)}
                              title="Copy invite link"
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                            >
                              {copiedId === invite.id ? (
                                <Check className="h-4 w-4 text-[var(--color-status-active)]" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {invite.status === "pending" && (
                            <button
                              onClick={() => handleRevoke(invite.id)}
                              disabled={revokingId === invite.id}
                              title="Revoke invite"
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-900/20 hover:text-red-400 disabled:opacity-50"
                            >
                              {revokingId === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      <InviteAgentModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={handleInviteSuccess}
      />
      <CreateAgentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleAgentSuccess}
      />
    </>
  );
}


