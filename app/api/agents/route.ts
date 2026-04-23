import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== Role.ADMIN) {
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
