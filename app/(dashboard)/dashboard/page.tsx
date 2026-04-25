import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AgentDashboard } from "@/components/dashboard/AgentDashboard";
import { prisma } from "@/lib/prisma";

// Next.js 16 hint for instant client-side navigations
export const unstable_instant = false;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const userId = session.user.id!;

  // We should fetch exactly what each dashboard needs
  if (role === "ADMIN") {
    // Admin dashboard fetching:
    // Total fields, active, at risk, harvested.
    const fields = await prisma.field.findMany({
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        },
        agent: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return <AdminDashboard fields={fields} />;
  } else {
    // Agent KanBan: assigned fields
    const assignedFields = await prisma.field.findMany({
      where: { agentId: userId },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return <AgentDashboard fields={assignedFields} user={session.user} />;
  }
}
