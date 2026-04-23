import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const unstable_instant = false;

export default async function AgentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const agents = await prisma.user.findMany({
    where: { role: Role.FIELD_AGENT },
    include: {
      assignedFields: true,
      updates: true
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-medium text-[var(--color-text-primary)]">Field Agents</h1>
      
      <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--color-surface-muted)] border-b-[var(--color-border)]">
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Assigned Fields</TableHead>
                  <TableHead className="text-center">Total Updates Logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="border-b-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/50">
                    <TableCell className="font-medium text-[var(--color-text-primary)]">{agent.name}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{agent.email}</TableCell>
                    <TableCell className="text-center font-medium bg-[var(--color-brand-xlight)]/30">{agent.assignedFields.length}</TableCell>
                    <TableCell className="text-center text-[var(--color-text-secondary)]">{agent.updates.length}</TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-[var(--color-text-muted)]">
                      No agents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
