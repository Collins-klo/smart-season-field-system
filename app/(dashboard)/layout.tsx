import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

// Server Component that does the fetching
async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* We pass a mocked onMenuClick to Topbar here because this is a RSC. A proper MobileNav would use a Client Component wrapper. */}
        <Topbar user={session.user} onMenuClick={async () => {
          "use server";
          // Empty, just for the prop signature. A real Mobile Nav implementation is next step.
        }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <Suspense fallback={<div className="p-8">Loading page data...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
