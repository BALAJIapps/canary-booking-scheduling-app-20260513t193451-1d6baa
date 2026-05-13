import { db } from "@/db";
import { canaryBookings, canaryAvailabilitySlots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Calendar, Clock, User, ShieldCheck, CheckCircle, XCircle, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddSlotForm from "@/components/add-slot-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

// NOTE: This admin page is intentionally open for the canary demo (no user accounts).
// In production, protect with middleware: check session and redirect non-admins.

function formatDateTime(iso: Date | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function AdminPage() {
  const [slots, bookings] = await Promise.all([
    db.select().from(canaryAvailabilitySlots).orderBy(canaryAvailabilitySlots.startsAt),
    db
      .select({
        id: canaryBookings.id,
        slotId: canaryBookings.slotId,
        customerEmail: canaryBookings.customerEmail,
        note: canaryBookings.note,
        status: canaryBookings.status,
        createdAt: canaryBookings.createdAt,
        slotStartsAt: canaryAvailabilitySlots.startsAt,
        slotEndsAt: canaryAvailabilitySlots.endsAt,
        providerEmail: canaryAvailabilitySlots.providerEmail,
        timezone: canaryAvailabilitySlots.timezone,
      })
      .from(canaryBookings)
      .leftJoin(canaryAvailabilitySlots, eq(canaryBookings.slotId, canaryAvailabilitySlots.id))
      .orderBy(canaryBookings.createdAt),
  ]);

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.isBooked).length;
  const availableSlots = totalSlots - bookedSlots;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(34,42,53,0.08)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#242424]" strokeWidth={1.7} />
            <span className="text-[15px] font-semibold text-[#242424] tracking-tight">SlotBook Admin</span>
          </div>
          <Link
            href="/"
            className="text-[13px] text-[#898989] hover:text-[#242424] transition-colors"
          >
            &larr; Customer view
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total slots", value: totalSlots, icon: Calendar },
            { label: "Available", value: availableSlots, icon: CheckCircle },
            { label: "Booked", value: bookedSlots, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[rgba(34,42,53,0.08)] p-5 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-[#898989]" strokeWidth={1.7} />
                <span className="text-[12px] text-[#898989]">{label}</span>
              </div>
              <div className="text-[28px] font-semibold text-[#242424]">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_1.6fr] gap-8">
          {/* Add Slot */}
          <div>
            <h2 className="text-[18px] font-semibold text-[#242424] mb-4" style={{ letterSpacing: "-0.1px" }}>
              Add availability
            </h2>
            <AddSlotForm />

            {/* Slots list */}
            <div className="mt-8">
              <h3 className="text-[14px] font-semibold text-[#242424] mb-3">All slots</h3>
              {slots.length === 0 ? (
                <p className="text-[13px] text-[#898989]">No slots created yet.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border border-[rgba(34,42,53,0.08)] px-3 py-2.5"
                    >
                      <div>
                        <div className="text-[12px] font-medium text-[#242424]">
                          {formatDateTime(slot.startsAt)}
                        </div>
                        <div className="text-[11px] text-[#898989] mt-0.5">
                          {slot.providerEmail} &bull; {slot.timezone}
                        </div>
                      </div>
                      <Badge
                        variant={slot.isBooked ? "destructive" : "secondary"}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {slot.isBooked ? "Booked" : "Open"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bookings queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-[#242424]" style={{ letterSpacing: "-0.1px" }}>
                Booking queue
              </h2>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#242424] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#111111] transition-colors"
              >
                <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
                Reserve slot
              </Link>
            </div>
            {bookings.length === 0 ? (
              <div className="rounded-xl border border-[rgba(34,42,53,0.08)] p-10 text-center">
                <User className="h-6 w-6 text-[#898989] mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-[#898989]">
                  No bookings yet. Share the customer link to start receiving reservations.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[rgba(34,42,53,0.12)] px-4 py-2 text-[13px] font-medium text-[#242424] hover:bg-[#f5f5f5] transition-colors"
                >
                  <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
                  Schedule a booking
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-[rgba(34,42,53,0.08)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(34,42,53,0.08)] bg-[#f9f9f9]">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#898989] uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#898989] uppercase tracking-wider">
                        Slot time
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#898989] uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#898989] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(34,42,53,0.06)]">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                              <User className="h-3 w-3 text-[#898989]" strokeWidth={1.7} />
                            </div>
                            <span className="text-[12px] text-[#242424]">{booking.customerEmail}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px] text-[#242424]">
                            {formatDateTime(booking.slotStartsAt ?? null)}
                          </div>
                          <div className="text-[11px] text-[#898989]">{booking.providerEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#898989]">{booking.note ?? "\u2014"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {booking.status === "confirmed" ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" strokeWidth={1.8} />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500" strokeWidth={1.8} />
                            )}
                            <Badge
                              variant={booking.status === "confirmed" ? "secondary" : "destructive"}
                              className="text-[10px] py-0 px-1.5 capitalize"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
