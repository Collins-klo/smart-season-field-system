import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const fieldId = resolvedParams.id;
    const userId = session.user.id;
    const role = session.user.role;

    const field = await prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Role check: Agents can only update their assigned fields
    if (role !== Role.ADMIN && field.agentId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const json = await req.json();
    const { stage, notes } = json;

    if (!stage) {
      return new NextResponse("Missing required field: stage", { status: 400 });
    }

    // Transaction to create update and modify field stage
    const [update] = await prisma.$transaction([
      prisma.fieldUpdate.create({
        data: {
          fieldId,
          agentId: userId!,
          stage,
          notes: notes || null,
        }
      }),
      prisma.field.update({
        where: { id: fieldId },
        data: { stage }
      })
    ]);

    return NextResponse.json(update);
  } catch (error) {
    console.error("[FIELD_UPDATES_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
