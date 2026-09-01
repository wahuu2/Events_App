"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  firstName?: string;
  lastName?: string;
  role?: "user" | "organizer";
};

type Stats = {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
};

type Event = {
  _id: string;
  title: string;
  image?: string;
  location?: string;
  date?: string;
  time?: string;
  category?: string;
  price?: number;
};

type Booking = {
  _id: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  bookingReference: string;
  createdAt: string;
  event?: Event;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [userResponse, statsResponse, bookingsResponse] =
          await Promise.all([
            fetch("/api/test-user"),
            fetch("/api/dashboard/stats"),
            fetch("/api/dashboard/recent-bookings"),
          ]);

        const userData = await userResponse.json();
        const statsData = await statsResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (userResponse.ok && userData.success) {
          setUser(userData.user);
        }

        if (statsResponse.ok && statsData.success) {
          setStats(statsData.stats);
        }

        if (bookingsResponse.ok && bookingsData.success) {
          setBookings(bookingsData.bookings);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
        setStatsLoading(false);
        setBookingsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  function formatDate(date?: string) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClasses(status: Booking["status"]) {
    switch (status) {
      case "confirmed":
        return "border-green-500/20 bg-green-500/10 text-green-400";

      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "cancelled":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      default:
        return "border-border bg-background text-foreground-muted";
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />

          <p className="mt-4 text-sm text-foreground-muted">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  const isOrganizer = user?.role === "organizer";
  const firstName = user?.firstName || "there";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12 lg:px-8">

        {/* Header */}
        <section className="border-b border-border pb-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Dashboard
                </span>

                <span className="h-1 w-1 rounded-full bg-border-hover" />

                <span className="text-xs text-foreground-muted">
                  {isOrganizer ? "Organizer" : "Attendee"}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Welcome, {firstName}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary md:text-base">
                Manage your bookings, tickets and event experiences from
                one place.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex w-fit items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Explore Events
            </Link>
          </div>
        </section>

        {/* Booking Statistics */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
              Booking Overview
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Bookings */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-foreground-muted">
                Total Bookings
              </p>

              <p className="mt-3 text-3xl font-bold">
                {statsLoading ? "—" : stats.total}
              </p>

              <p className="mt-2 text-xs text-foreground-muted">
                All your event bookings
              </p>
            </div>

            {/* Confirmed */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-muted">
                  Confirmed
                </p>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">
                  ✓
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {statsLoading ? "—" : stats.confirmed}
              </p>

              <p className="mt-2 text-xs text-foreground-muted">
                Confirmed bookings
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-muted">
                  Pending
                </p>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/10 text-xs font-bold text-yellow-400">
                  !
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {statsLoading ? "—" : stats.pending}
              </p>

              <p className="mt-2 text-xs text-foreground-muted">
                Awaiting confirmation
              </p>
            </div>

            {/* Cancelled */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground-muted">
                  Cancelled
                </p>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold text-red-400">
                  ×
                </span>
              </div>

              <p className="mt-3 text-3xl font-bold">
                {statsLoading ? "—" : stats.cancelled}
              </p>

              <p className="mt-2 text-xs text-foreground-muted">
                Cancelled bookings
              </p>
            </div>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="mt-12">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                Activity
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-foreground-muted">
                Your latest event bookings.
              </p>
            </div>

            {bookings.length > 0 && (
              <Link
                href="/dashboard/bookings"
                className="text-sm font-medium text-accent transition hover:text-accent-hover"
              >
                View all bookings →
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {bookingsLoading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4 p-5"
                  >
                    <div className="h-12 w-12 rounded-lg bg-background" />

                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-background" />

                      <div className="mt-2 h-3 w-32 rounded bg-background" />
                    </div>

                    <div className="h-6 w-20 rounded-full bg-background" />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold text-foreground-muted">
                  B
                </div>

                <h3 className="mt-4 font-semibold">
                  No bookings yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-foreground-muted">
                  You haven't booked an event yet. Explore available
                  events and find something worth experiencing.
                </p>

                <Link
                  href="/events"
                  className="mt-5 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
                >
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-background-secondary sm:flex-row sm:items-center"
                  >
                    {/* Event Image */}
                    {booking.event?.image ? (
                      <img
                        src={booking.event.image}
                        alt={booking.event.title || "Event"}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground-muted">
                        E
                      </div>
                    )}

                    {/* Booking Information */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">
                        {booking.event?.title || "Event unavailable"}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
                        <span>
                          {formatDate(booking.event?.date)}
                        </span>

                        {booking.event?.location && (
                          <span>{booking.event.location}</span>
                        )}

                        <span>
                          {booking.quantity}{" "}
                          {booking.quantity === 1
                            ? "ticket"
                            : "tickets"}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-foreground-muted">
                        Ref: {booking.bookingReference}
                      </p>
                    </div>

                    {/* Status & Amount */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                      <p className="text-sm font-semibold">
                        KSh {booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
              Quick Actions
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Get things done
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Explore Events */}
            <Link
              href="/events"
              className="group rounded-xl border border-border bg-card p-7 transition hover:-translate-y-0.5 hover:border-border-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-lg font-bold text-accent">
                E
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Explore Events
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                Search and filter conferences, concerts, Christian
                events, sports and other experiences.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">
                Browse events

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Manage Bookings */}
            <Link
              href="/dashboard/bookings"
              className="group rounded-xl border border-border bg-card p-7 transition hover:-translate-y-0.5 hover:border-border-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-background text-lg font-bold text-foreground-secondary">
                B
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                Manage Bookings
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                Review your bookings, payment status, ticket references
                and event details.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-foreground-secondary">
                View bookings

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Organizer CTA */}
        {isOrganizer && (
          <section className="mt-8 rounded-xl border border-accent/20 bg-accent/[0.04] p-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Organizer Workspace
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  Build and manage your events
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                  Create events, monitor bookings, manage attendees and
                  track event performance from your organizer dashboard.
                </p>
              </div>

              <Link
                href="/dashboard/organizer"
                className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Open Organizer Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6">
          <p className="text-center text-xs text-foreground-muted">
            EventApp · Discover. Book. Experience.
          </p>
        </footer>
      </div>
    </main>
  );
}