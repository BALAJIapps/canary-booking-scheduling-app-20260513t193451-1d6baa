import { NextRequest } from "next/server";
import { db } from "@/db";
import { canaryAvailabilitySlots } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider_email, starts_at, ends_at, timezone } = body;

    if (!provider_email || !starts_at || !ends_at) {
      return Response.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "provider_email, starts_at, ends_at are required" } },
        { status: 400 }
      );
    }

    const [slot] = await db
      .insert(canaryAvailabilitySlots)
      .values({
        providerEmail: provider_email,
        startsAt: new Date(starts_at),
        endsAt: new Date(ends_at),
        timezone: timezone ?? "UTC",
      })
      .returning();

    return Response.json({ ok: true, slot }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(JSON.stringify({ level: "error", route: "POST /api/canary-availability", message }));
    return Response.json(
      { ok: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const slots = await db
      .select()
      .from(canaryAvailabilitySlots)
      .orderBy(canaryAvailabilitySlots.startsAt);
    return Response.json({ ok: true, slots });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { ok: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
