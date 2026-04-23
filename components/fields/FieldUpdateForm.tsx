"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldStage } from "@/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

export function FieldUpdateForm({ fieldId, currentStage, disabled }: { fieldId: string, currentStage: string, disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<string>(currentStage);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/fields/${fieldId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, notes }),
      });

      if (res.ok) {
        setOpen(false);
        setNotes("");
        router.refresh();
      } else {
        alert("Failed to log update");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button disabled={disabled} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Log Update
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)]">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-xl text-[var(--color-text-primary)]">Log Field Update</SheetTitle>
          <SheetDescription className="text-[var(--color-text-secondary)]">
            Record the current stage and any relevant observation notes.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[var(--color-text-primary)]">Stage Progression</Label>
            <Select value={stage} onValueChange={setStage} disabled={loading}>
              <SelectTrigger className="border-[var(--color-border)] focus:ring-[var(--color-ring)]">
                <SelectValue placeholder="Select new stage" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                {Object.values(FieldStage).map((s) => (
                  <SelectItem key={s} value={s} className="hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)] cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[var(--color-text-primary)]">Field Notes (Optional)</Label>
            <textarea
              id="notes"
              className="flex min-h-[120px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="e.g., Weeding completed, applied fertilizer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Update
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
