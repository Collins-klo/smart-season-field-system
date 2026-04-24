import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";
import { Role } from "@/types";
import { randomUUID } from "crypto";

// POST /api/agents/invite — Admin creates an invite + sends email
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Check if a pending (unused, non-expired) invite already exists
    const existingInvite = await prisma.agentInvite.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingInvite) {
      const isStillValid =
        !existingInvite.usedAt && existingInvite.expiresAt > new Date();
      if (isStillValid) {
        return NextResponse.json(
          { error: "A pending invite for this email already exists." },
          { status: 409 }
        );
      }
      // Expired or used — delete it so we can create a fresh one
      await prisma.agentInvite.delete({ where: { email: normalizedEmail } });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.agentInvite.create({
      data: {
        email: normalizedEmail,
        token,
        role: Role.FIELD_AGENT,
        expiresAt,
      },
    });

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const inviteLink = `${appUrl}/accept-invite/${token}`;

    const emailResult = await sendInviteEmail({
      to: normalizedEmail,
      inviteLink,
      inviterName: session.user.name ?? "SmartSeason Admin",
    });

    return NextResponse.json(
      {
        invite: {
          id: invite.id,
          email: invite.email,
          expiresAt: invite.expiresAt,
          inviteLink,
        },
        emailSent: emailResult.success,
        emailError: emailResult.error ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[INVITE_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
