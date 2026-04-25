import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const field = await prisma.field.findUnique({
      where: { id: resolvedParams.id },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            agent: true
          }
        },
        agent: true
      }
    });

    if (!field) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Role check: Agents can only access their assigned fields
    const role = session.user.role;
    if (role !== Role.ADMIN && field.agentId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error("[FIELD_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const json = await req.json();

    const field = await prisma.field.update({
      where: { id: resolvedParams.id },
      data: {
        ...json
      }
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("[FIELD_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const field = await prisma.field.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("[FIELD_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
