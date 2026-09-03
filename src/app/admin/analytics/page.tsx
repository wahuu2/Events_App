import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";

export default async function AdminAnalyticsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalOrganizers,
    totalAdmins,
    totalEvents,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalTickets,
    validTickets,
    usedTickets,
    cancelledTickets,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "organizer" }),
    User.countDocuments({ role: "admin" }),

    Event.countDocuments({}),

    Booking.countDocuments({}),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "cancelled" }),

    Ticket.countDocuments({}),
    Ticket.countDocuments({ status: "valid" }),
    Ticket.countDocuments({ status: "used" }),
    Ticket.countDocuments({ status: "cancelled" }),
  ]);

  const confirmedBookingRecords = await Booking.find({
    status: "confirmed",
  })
    .select("totalAmount")
    .lean();

  const revenue = confirmedBookingRecords.reduce(
    (total, booking) =>
      total + (Number(booking.totalAmount) || 0),
    0
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Platform Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              System-wide statistics covering users, events, bookings,
              revenue, and digital tickets.
            </p>
          </div>
        </div>

        {/* Main Statistics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Users */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalUsers}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Registered platform users
            </p>
          </div>

          {/* Organizers */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Organizers
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalOrganizers}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Registered organizers
            </p>
          </div>

          {/* Events */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalEvents}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Platform-wide events
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Confirmed Revenue
            </p>

            <p className="mt-2 text-3xl font-bold">
              KSh {revenue.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              From confirmed bookings
            </p>
          </div>
        </section>

        {/* Booking Analytics */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Booking Activity
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Booking Overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalBookings}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Confirmed
              </p>

              <p className="mt-2 text-3xl font-bold">
                {confirmedBookings}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold">
                {pendingBookings}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold">
                {cancelledBookings}
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Analytics */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Ticket Activity
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Digital Ticket Overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Total Tickets
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalTickets}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Valid
              </p>

              <p className="mt-2 text-3xl font-bold">
                {validTickets}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Used
              </p>

              <p className="mt-2 text-3xl font-bold">
                {usedTickets}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-secondary">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold">
                {cancelledTickets}
              </p>
            </div>
          </div>
        </section>

        {/* System Breakdown */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              System Overview
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Platform Composition
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-foreground-secondary">
                Users
              </p>

              <p className="mt-2 text-2xl font-bold">
                {totalUsers}
              </p>

              <p className="mt-1 text-xs text-foreground-muted">
                Including {totalOrganizers} organizers and{" "}
                {totalAdmins} admins
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground-secondary">
                Booking Conversion
              </p>

              <p className="mt-2 text-2xl font-bold">
                {totalBookings > 0
                  ? `${Math.round(
                      (confirmedBookings / totalBookings) * 100
                    )}%`
                  : "0%"}
              </p>

              <p className="mt-1 text-xs text-foreground-muted">
                Confirmed bookings
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground-secondary">
                Ticket Usage
              </p>

              <p className="mt-2 text-2xl font-bold">
                {totalTickets > 0
                  ? `${Math.round(
                      (usedTickets / totalTickets) * 100
                    )}%`
                  : "0%"}
              </p>

              <p className="mt-1 text-xs text-foreground-muted">
                Tickets marked as used
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}