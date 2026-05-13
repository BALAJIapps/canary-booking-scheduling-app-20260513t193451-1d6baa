import { NextRequest } from "next/server";
import { db } from "@/db";
import { canaryBookings, canaryAvailabilitySlots } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slot_id, customer_email, note } = body;

    if (!slot_id || !customer_email) {
      return Response.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "slot_id and customer_email are required" } },
        { status: 400 }
      );
    }

    // Transactional double-book prevention
    const result = await db.transaction(async (tx) => {
      // Lock and fetch the slot
      const [slot] = await tx
        .select()
        .from(canaryAvailabilitySlots)
        .where(eq(canaryAvailabilitySlots.id, slot_id))
        .for("update");

      if (!slot) {
        return { error: { code: "SLOT_NOT_FOUND", message: "Slot not found" }, status: 404 };
      }

      if (slot.isBooked) {
        return { error: { code: "SLOT_ALREADY_BOOKED", message: "This slot is already booked" }, status: 409 };
      }

      // Mark slot as booked
      await tx
        .update(canaryAvailabilitySlots)
        .set({ isBooked: true })
        .where(eq(canaryAvailabilitySlots.id, slot_id));

      // Create booking
      const [booking] = await tx
        .insert(canaryBookings)
        .values({
          slotId: slot_id,
          customerEmail: customer_email,
          note: note ?? null,
          status: "confirmed",
        })
        .returning();

      return { booking, status: 201 };
    });

    if ("error" in result) {
      return Response.json({ ok: false, error: result.error }, { status: result.status });
    }

    return Response.json({ ok: true, booking: result.booking }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(JSON.stringify({ level: "error", route: "POST /api/canary-bookings", message }));
    return Response.json(
      { ok: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await db
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
      .leftJoin(
        canaryAvailabilitySlots,
        eq(canaryBookings.slotId, canaryAvailabilitySlots.id)
      )
      .orderBy(canaryBookings.createdAt);

    return Response.json({ ok: true, bookings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { ok: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
