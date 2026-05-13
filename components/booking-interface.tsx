"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Slot = {
  id: string;
  providerEmail: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isBooked: boolean;
};

type BookingState = "idle" | "booking" | "success" | "error";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function BookingInterface() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [bookingError, setBookingError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/canary-availability");
      const data = await res.json();
      if (data.ok) setSlots(data.slots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleBook = async () => {
    if (!selectedSlot || !email) return;
    setBookingState("booking");
    setBookingError("");
    try {
      const res = await fetch("/api/canary-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id: selectedSlot.id, customer_email: email, note }),
      });
      const data = await res.json();
      if (data.ok) {
        setBookingState("success");
        setSuccessMsg(`Booked! Confirmation for ${email} on ${formatDateTime(selectedSlot.startsAt)}`);
        setSelectedSlot(null);
        setEmail("");
        setNote("");
        fetchSlots();
      } else {
        setBookingState("error");
        setBookingError(data.error?.message ?? "Booking failed");
      }
    } catch {
      setBookingState("error");
      setBookingError("Network error. Please try again.");
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const date = formatDate(slot.startsAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#898989]" />
        <span className="ml-2 text-[14px] text-[#898989]">Loading availability...</span>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-8">
      {/* Slot picker */}
      <div>
        {bookingState === "success" && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-green-50 border border-green-100 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" strokeWidth={1.8} />
            <p className="text-[13px] text-green-800">{successMsg}</p>
          </div>
        )}

        {Object.keys(groupedSlots).length === 0 ? (
          <div className="rounded-xl border border-[rgba(34,42,53,0.08)] p-12 text-center">
            <Calendar className="h-8 w-8 text-[#898989] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[14px] text-[#898989]">No availability slots yet.</p>
            <p className="text-[12px] text-[#898989] mt-1">Check back later or contact your provider.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, daySlots]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3.5 w-3.5 text-[#898989]" strokeWidth={1.7} />
                  <span className="text-[12px] font-semibold text-[#898989] uppercase tracking-wider">{date}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                      disabled={slot.isBooked}
                      className={[
                        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                        slot.isBooked
                          ? "border-[rgba(34,42,53,0.06)] bg-[#f5f5f5] cursor-not-allowed"
                          : selectedSlot?.id === slot.id
                          ? "border-[#242424] bg-[#242424] text-white shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)]"
                          : "border-[rgba(34,42,53,0.08)] hover:border-[#242424] hover:shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)] cursor-pointer",
                      ].join(" ")}
                    >
                      <Clock
                        className={"h-4 w-4 shrink-0 " + (slot.isBooked ? "text-[#898989]" : selectedSlot?.id === slot.id ? "text-white" : "text-[#242424]")}
                        strokeWidth={1.7}
                      />
                      <div>
                        <div className={"text-[13px] font-medium " + (selectedSlot?.id === slot.id ? "text-white" : slot.isBooked ? "text-[#898989]" : "text-[#242424]")}>
                          {formatTime(slot.startsAt)} &ndash; {formatTime(slot.endsAt)}
                        </div>
                        <div className={"text-[11px] mt-0.5 " + (selectedSlot?.id === slot.id ? "text-white/70" : "text-[#898989]")}>
                          {slot.isBooked ? "Unavailable" : slot.timezone}
                        </div>
                      </div>
                      {slot.isBooked && (
                        <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1.5">Full</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking panel */}
      <div>
        <div className="rounded-xl border border-[rgba(34,42,53,0.08)] p-6 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)]">
          <h3 className="text-[15px] font-semibold text-[#242424] mb-4">Reserve your slot</h3>

          {selectedSlot ? (
            <div className="mb-4 rounded-lg bg-[#f5f5f5] px-3 py-2.5">
              <div className="text-[12px] text-[#898989] mb-0.5">Selected time</div>
              <div className="text-[13px] font-medium text-[#242424]">
                {formatDateTime(selectedSlot.startsAt)}
              </div>
              <div className="text-[11px] text-[#898989] mt-0.5">{selectedSlot.timezone}</div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg bg-[#f5f5f5] px-3 py-2.5">
              <p className="text-[13px] text-[#898989]">Select a slot on the left to continue.</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#242424] mb-1">Your email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#898989]" strokeWidth={1.7} />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 text-[13px] h-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#242424] mb-1">Note <span className="text-[#898989] font-normal">(optional)</span></label>
              <Input
                type="text"
                placeholder="Any context for the provider..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-[13px] h-9"
              />
            </div>
          </div>

          {bookingState === "error" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" strokeWidth={1.8} />
              <p className="text-[12px] text-red-700">{bookingError}</p>
            </div>
          )}

          <Button
            onClick={handleBook}
            disabled={!selectedSlot || !email || bookingState === "booking"}
            className="mt-4 w-full bg-[#242424] hover:bg-[#111111] text-white text-[13px] h-9"
          >
            {bookingState === "booking" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Reserving...</>
            ) : (
              "Book this slot"
            )}
          </Button>
          <p className="mt-2 text-[11px] text-[#898989] text-center">No login required &bull; Instant confirmation</p>
        </div>
      </div>
    </div>
  );
}
