import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = (session.user as any).role as string;
    const userId = session.user.id;

    // Admin sees all fields, agent sees assigned only
    const fields = await prisma.field.findMany({
      where: role === Role.ADMIN ? undefined : { agentId: userId },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        },
        agent: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error("[FIELDS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { name, cropType, plantingDate, sizeHectares, location, agentId } = json;

    if (!name || !cropType || !plantingDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        sizeHectares: parseFloat(sizeHectares) || null,
        location,
        agentId: agentId || null,
        stage: "PLANTED",
        updates: {
          create: {
            agentId: session.user.id!,
            stage: "PLANTED",
            notes: "Field created and marked as PLANTED."
          }
        }
      },
      include: {
        updates: true,
        agent: true
      }
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("[FIELDS_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
