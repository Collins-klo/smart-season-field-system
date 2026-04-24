import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AcceptInviteContent } from "./AcceptInviteContent";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-primary)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Verifying your invite…
            </p>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
