"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateFieldPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch agents for the dropdown
    fetch("/api/agents")
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      cropType: formData.get("cropType"),
      plantingDate: formData.get("plantingDate"),
      sizeHectares: formData.get("sizeHectares"),
      location: formData.get("location"),
      agentId: formData.get("agentId") === "unassigned" ? null : formData.get("agentId"),
    };

    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to create field.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
        <CardHeader className="border-b border-[var(--color-border)] pb-4">
          <CardTitle className="text-2xl font-heading text-[var(--color-text-primary)]">Register New Field</CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">
            Create a new field record and assign it to an agent. It will be marked as PLANTED.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Field Name</Label>
                <Input id="name" name="name" required placeholder="e.g. North Plot A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Input id="cropType" name="cropType" required placeholder="e.g. Maize, Tea, Coffee" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input id="plantingDate" name="plantingDate" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizeHectares">Size (Hectares)</Label>
                <Input id="sizeHectares" name="sizeHectares" type="number" step="0.1" placeholder="e.g. 2.5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Kiambu County or GPS Coordinates" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentId">Assign to Field Agent</Label>
              <Select name="agentId" defaultValue="unassigned">
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/dashboard">
                <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] text-white">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Field
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
