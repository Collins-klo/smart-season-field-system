import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminActivityDashboard } from "@/components/activity/AdminActivityDashboard";
import { AgentActivityDashboard } from "@/components/activity/AgentActivityDashboard";
import { prisma } from "@/lib/prisma";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const userId = session.user.id!;

  // Fetch all necessary data
  if (role === "ADMIN") {
    const fields = await prisma.field.findMany({
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        },
        agent: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">Activities Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Analytics and insights for field monitoring system.</p>
        </div>
        <AdminActivityDashboard fields={fields} />
      </div>
    );
  } else {
    // Agent View
    const assignedFields = await prisma.field.findMany({
      where: { agentId: userId },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        },
        agent: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">My Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor your performance and fields needing attention.</p>
        </div>
        <AgentActivityDashboard fields={assignedFields} userId={userId} />
      </div>
    );
  }
}
