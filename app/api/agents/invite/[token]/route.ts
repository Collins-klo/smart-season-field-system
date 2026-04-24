import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/invite/[token] — Public: validate a token, return invite metadata
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const invite = await prisma.agentInvite.findUnique({
      where: { token },
      select: { id: true, email: true, expiresAt: true, usedAt: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "This invite link is invalid." },
        { status: 404 }
      );
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { error: "This invite has already been used." },
        { status: 410 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite link has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      email: invite.email,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("[INVITE_TOKEN_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
