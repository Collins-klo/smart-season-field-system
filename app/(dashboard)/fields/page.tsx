import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role, FieldStage } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeFieldStatus } from "@/lib/field-status";
import { StatusBadge } from "@/components/fields/StatusBadge";
import { StageBadge } from "@/components/fields/StageBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const unstable_instant = false;

export default async function FieldsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;
  const userId = session.user.id;

  const fields = await prisma.field.findMany({
    where: role === Role.ADMIN ? undefined : { agentId: userId },
    include: {
      agent: true,
      updates: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-medium text-[var(--color-text-primary)]">
          {role === Role.ADMIN ? "All Fields" : "My Fields"}
        </h1>
        {role === Role.ADMIN && (
          <Link href="/fields/new">
            <Button className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-white">
              Register New Field
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--color-surface-muted)] border-b-[var(--color-border)]">
                  <TableHead className="py-4">Field Name</TableHead>
                  <TableHead>Crop Type</TableHead>
                  {role === Role.ADMIN && <TableHead>Agent</TableHead>}
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id} className="border-b-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/50">
                    <TableCell className="font-medium text-[var(--color-text-primary)]">
                       <Link href={`/fields/${field.id}`} className="hover:underline text-[var(--color-brand-primary)]">
                         {field.name}
                       </Link>
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{field.cropType}</TableCell>
                    {role === Role.ADMIN && (
                      <TableCell className="text-[var(--color-text-secondary)]">{field.agent?.name || "Unassigned"}</TableCell>
                    )}
                    <TableCell><StageBadge stage={field.stage as FieldStage} /></TableCell>
                    <TableCell><StatusBadge status={computeFieldStatus(field)} /></TableCell>
                    <TableCell className="text-right">
                       <Link href={`/fields/${field.id}`}>
                         <Button variant="ghost" size="sm" className="text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-xlight)]">
                           View Details
                         </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                     <TableCell colSpan={role === Role.ADMIN ? 6 : 5} className="text-center py-8 text-[var(--color-text-muted)]">
                       No fields available.
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
