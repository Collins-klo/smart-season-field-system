import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/agents/accept-invite — Public: claim an invite and create a user account
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: "Token, name, and password are all required." },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const invite = await prisma.agentInvite.findUnique({ where: { token } });

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

    // Check email isn't already taken (race-condition guard)
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and mark invite as used — atomically
    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: name.trim(),
          email: invite.email,
          password: hashedPassword,
          role: invite.role,
        },
      }),
      // Invite will be updated with claimedById after user creation — done below
    ]);

    await prisma.agentInvite.update({
      where: { token },
      data: {
        usedAt: new Date(),
        claimedById: user.id,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully. You can now log in." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ACCEPT_INVITE_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
