"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  firstName?: string;
  lastName?: string;
  role?: "user" | "organizer" | "admin";
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
  const router = useRouter();

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

        /*
         * ROLE-BASED DASHBOARD ROUTING
         *
         * Admins should use the dedicated admin dashboard.
         */
        if (
          userResponse.ok &&
          userData.success &&
          userData.user?.role === "admin"
        ) {
          router.replace("/admin");
          return;
        }

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
  }, [router]);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>

          <p className="mt-4 text-sm font-medium text-foreground">
            Loading your dashboard
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            Preparing your latest activity...
          </p>
        </div>
      </div>
    );
  }

  const isOrganizer = user?.role === "organizer";
  const firstName = user?.firstName || "there";

  return (
    <div className="w-full">

      {/* =========================================================
          HERO / HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Dashboard
                </span>

                <span className="text-xs text-foreground-muted">
                  /
                </span>

                <span className="text-xs font-medium text-foreground-muted">
                  {isOrganizer ? "Organizer" : "Attendee"}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Welcome, {firstName}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Manage your bookings, tickets, payments, and event
                experiences from one place.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                href="/events"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 sm:w-auto"
              >
                Explore Events
              </Link>

              <Link
                href="/dashboard/bookings"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border-hover bg-background px-5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-background-secondary sm:w-auto"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="mt-7">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
            Overview
          </p>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
            Booking activity
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-border-hover hover:bg-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted">
                  Total bookings
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {statsLoading ? "—" : stats.total}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                B
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              All your event bookings
            </p>
          </div>

          {/* Confirmed */}
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-green-500/20 hover:bg-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted">
                  Confirmed
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {statsLoading ? "—" : stats.confirmed}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-sm font-bold text-green-400">
                ✓
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Ready to attend
            </p>
          </div>

          {/* Pending */}
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-yellow-500/20 hover:bg-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted">
                  Pending
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {statsLoading ? "—" : stats.pending}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-sm font-bold text-yellow-400">
                !
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Awaiting confirmation
            </p>
          </div>

          {/* Cancelled */}
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-red-500/20 hover:bg-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-foreground-muted">
                  Cancelled
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {statsLoading ? "—" : stats.cancelled}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-400">
                ×
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Cancelled bookings
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          RECENT BOOKINGS
      ========================================================= */}
      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
              Activity
            </p>

            <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
              Recent bookings
            </h2>

            <p className="mt-1 text-sm text-foreground-muted">
              Your latest event activity.
            </p>
          </div>

          {bookings.length > 0 && (
            <Link
              href="/dashboard/bookings"
              className="inline-flex w-fit items-center rounded-lg px-2 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 hover:text-accent-hover"
            >
              View all
              <span className="ml-1.5">
                →
              </span>
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {bookingsLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 p-4 sm:p-5"
                >
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-background" />

                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-background" />

                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-background" />

                    <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-background" />
                  </div>

                  <div className="hidden h-6 w-20 animate-pulse rounded-full bg-background sm:block" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-sm font-bold text-foreground-muted">
                B
              </div>

              <h3 className="mt-5 text-base font-bold">
                No bookings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                You haven't booked an event yet. Explore available
                events and find something worth experiencing.
              </p>

              <Link
                href="/events"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Explore Events
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bookings.map((booking) => (
                <Link
                  key={booking._id}
                  href={`/dashboard/bookings/${booking._id}`}
                  className="group block transition-colors hover:bg-background-secondary"
                >
                  <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center">

                    {/* Event image */}
                    <div className="flex shrink-0 items-center gap-3">
                      {booking.event?.image ? (
                        <img
                          src={booking.event.image}
                          alt={booking.event.title || "Event"}
                          className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background text-sm font-bold text-foreground-muted ring-1 ring-border">
                          E
                        </div>
                      )}
                    </div>

                    {/* Booking details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="min-w-0 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                        {booking.event?.title || "Event unavailable"}
                      </h3>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                        <span>
                          {formatDate(booking.event?.date)}
                        </span>

                        {booking.event?.location && (
                          <>
                            <span className="text-border-hover">
                              •
                            </span>

                            <span className="max-w-[220px] truncate">
                              {booking.event.location}
                            </span>
                          </>
                        )}

                        <span className="text-border-hover">
                          •
                        </span>

                        <span>
                          {booking.quantity}{" "}
                          {booking.quantity === 1
                            ? "ticket"
                            : "tickets"}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-[10px] font-medium text-foreground-muted">
                        Ref: {booking.bookingReference}
                      </p>
                    </div>

                    {/* Status + amount */}
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                      <p className="text-sm font-bold text-foreground">
                        KSh{" "}
                        {booking.totalAmount.toLocaleString("en-KE")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================= */}
      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
            Shortcuts
          </p>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
            Get things done
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* Explore */}
          <Link
            href="/events"
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-card-hover sm:p-7"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                E
              </div>

              <h3 className="mt-5 text-lg font-bold tracking-tight">
                Explore Events
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                Search conferences, concerts, Christian events,
                sports and other experiences.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent">
                Browse events
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>

          {/* Bookings */}
          <Link
            href="/dashboard/bookings"
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover sm:p-7"
          >
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-sm font-bold text-foreground-secondary ring-1 ring-border">
                B
              </div>

              <h3 className="mt-5 text-lg font-bold tracking-tight">
                Manage Bookings
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-foreground-muted">
                Review your bookings, payment status, ticket
                references and event details.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground-secondary">
                View bookings
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================
          ORGANIZER WORKSPACE
      ========================================================= */}
      {isOrganizer && (
        <section className="mt-10 overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.035]">
          <div className="relative p-6 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Organizer workspace
                </span>

                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Build and manage your events
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                  Create events, monitor bookings, manage attendees
                  and track performance from your organizer dashboard.
                </p>
              </div>

              <Link
                href="/dashboard/organizer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20"
              >
                Open Organizer Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}