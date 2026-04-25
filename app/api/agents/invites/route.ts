import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";

// GET /api/agents/invites — Admin lists all invites (pending + used)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invites = await prisma.agentInvite.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
        claimedBy: {
          select: { id: true, name: true },
        },
      },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    const enriched = invites.map((inv) => {
      const now = new Date();
      let status: "pending" | "expired" | "used";
      if (inv.usedAt) {
        status = "used";
      } else if (inv.expiresAt < now) {
        status = "expired";
      } else {
        status = "pending";
      }

      return {
        ...inv,
        status,
        inviteLink:
          status === "pending"
            ? `${appUrl}/accept-invite/${inv.id}` // token not exposed; we actually need it
            : null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[INVITES_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// DELETE /api/agents/invites — Admin revokes (deletes) a pending invite by id
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Invite ID required." }, { status: 400 });
    }

    const invite = await prisma.agentInvite.findUnique({ where: { id } });
    if (!invite) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }
    if (invite.usedAt) {
      return NextResponse.json(
        { error: "Cannot revoke an already-used invite." },
        { status: 400 }
      );
    }

    await prisma.agentInvite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INVITES_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
