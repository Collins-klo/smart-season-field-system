import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agents = await prisma.user.findMany({
      where: { role: Role.FIELD_AGENT },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("[AGENTS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// POST /api/agents — Admin manually creates an agent (no invite flow)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are all required." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const agent = await prisma.user.create({
      data: {
        name: (name as string).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.FIELD_AGENT,
      },
    });

    return NextResponse.json(
      {
        agent: {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          createdAt: agent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AGENTS_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

