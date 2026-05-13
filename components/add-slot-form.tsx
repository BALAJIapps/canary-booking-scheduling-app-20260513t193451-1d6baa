"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddSlotForm() {
  const [providerEmail, setProviderEmail] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/canary-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_email: providerEmail,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          timezone,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        setProviderEmail("");
        setStartsAt("");
        setEndsAt("");
        setTimeout(() => {
          setSuccess(false);
          window.location.reload();
        }, 1200);
      } else {
        setError(data.error?.message ?? "Failed to add slot");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[rgba(34,42,53,0.08)] p-5 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)]"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium text-[#242424] mb-1">Provider email</label>
          <Input
            type="email"
            placeholder="coach@example.com"
            value={providerEmail}
            onChange={(e) => setProviderEmail(e.target.value)}
            required
            className="text-[13px] h-9"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#242424] mb-1">Start time</label>
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="text-[13px] h-9"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#242424] mb-1">End time</label>
          <Input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            className="text-[13px] h-9"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#242424] mb-1">Timezone</label>
          <Input
            type="text"
            placeholder="UTC"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="text-[13px] h-9"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-red-600">{error}</p>
      )}

      {success && (
        <div className="mt-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span className="text-[12px]">Slot added successfully!</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-[#242424] hover:bg-[#111111] text-white text-[13px] h-9"
      >
        {loading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Adding...</>
        ) : (
          <><Plus className="h-3.5 w-3.5 mr-2" />Add slot</>
        )}
      </Button>
    </form>
  );
}
