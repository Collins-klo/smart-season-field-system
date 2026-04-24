import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@/types";
import { AgentsClient } from "@/components/agents/AgentsClient";

export const unstable_instant = false;


export default async function AgentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const [agents, rawInvites] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.FIELD_AGENT },
      include: {
        assignedFields: { select: { id: true } },
        updates: { select: { id: true } },
        claimedInvite: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentInvite.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
        claimedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  // Compute status and strip token from used/expired invites for safety
  const now = new Date();
  const invites = rawInvites.map((inv) => {
    let status: "pending" | "expired" | "used";
    if (inv.usedAt) {
      status = "used";
    } else if (inv.expiresAt < now) {
      status = "expired";
    } else {
      status = "pending";
    }

    return {
      id: inv.id,
      email: inv.email,
      token: status === "pending" ? inv.token : "", // only expose token for pending
      expiresAt: inv.expiresAt.toISOString(),
      usedAt: inv.usedAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
      status,
      claimedBy: inv.claimedBy,
    };
  });

  const serializedAgents = agents.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    assignedFields: a.assignedFields,
    updates: a.updates,
    claimedInvite: a.claimedInvite,
  }));

  return (
    <div className="space-y-6">
      <AgentsClient
        initialAgents={serializedAgents}
        initialInvites={invites}
        appUrl={appUrl}
      />
    </div>
  );
}
