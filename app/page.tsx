import { Calendar, Clock, CheckCircle, Users, ShieldCheck, Plus } from "lucide-react";
import BookingInterface from "@/components/booking-interface";
import QuickAddSlot from "@/components/quick-add-slot";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(34,42,53,0.08)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#242424]" strokeWidth={1.7} />
            <span className="text-[15px] font-semibold text-[#242424] tracking-tight">SlotBook</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#898989]">Schedule with confidence</span>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#242424] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#111111] transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
              Admin
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,42,53,0.1)] px-3 py-1 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[12px] text-[#898989] font-medium">Live availability</span>
          </div>
          <h1
            className="text-[52px] font-semibold leading-[1.10] text-[#242424] mb-4"
            style={{ letterSpacing: "-0.5px", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Book a slot.<br />Skip the back-and-forth.
          </h1>
          <p className="text-[17px] text-[#898989] leading-relaxed mb-8">
            Pick an open time, enter your email, and you&apos;re confirmed &mdash; no login required.
            Providers set their availability once; customers book in seconds.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#book"
              className="inline-flex items-center gap-2 rounded-lg bg-[#242424] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#111111] transition-colors"
            >
              <Clock className="h-4 w-4" strokeWidth={1.7} />
              Browse availability
            </a>
            <a
              href="/admin"
              className="text-[14px] text-[#898989] hover:text-[#242424] transition-colors"
            >
              Manage bookings &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="flex items-center gap-8 border-t border-[rgba(34,42,53,0.06)] pt-8">
          {[
            { icon: CheckCircle, label: "Instant confirmation" },
            { icon: Users, label: "Customer + admin views" },
            { icon: ShieldCheck, label: "Duplicate-booking blocked" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#898989]" strokeWidth={1.7} />
              <span className="text-[13px] text-[#898989]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick add slot for providers */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-[#898989]" strokeWidth={1.7} />
          <h2
            className="text-[18px] font-semibold text-[#242424]"
            style={{ letterSpacing: "-0.1px" }}
          >
            Add availability
          </h2>
          <span className="text-[12px] text-[#898989] ml-1">(providers)</span>
        </div>
        <QuickAddSlot />
      </section>

      {/* Booking section */}
      <section id="book" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <h2
            className="text-[28px] font-semibold text-[#242424] mb-2"
            style={{ letterSpacing: "-0.2px", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Available slots
          </h2>
          <p className="text-[14px] text-[#898989]">Select a slot below to reserve your time.</p>
        </div>
        <BookingInterface />
      </section>
    </div>
  );
}
