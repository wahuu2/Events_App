"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  _id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price: number;
};

type Booking = {
  _id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  bookingReference: string;
  createdAt: string;
  event: Event;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch bookings"
          );
        }

        setBookings(data.bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  function formatEventDate(date: string) {
    return new Date(date).toLocaleDateString("en-KE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-7">
          {/* Header skeleton */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="h-3 w-24 rounded bg-background" />

            <div className="mt-4 h-9 w-52 rounded bg-background" />

            <div className="mt-3 h-4 w-full max-w-md rounded bg-background" />
          </div>

          {/* Card skeletons */}
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="h-52 bg-background-secondary sm:h-56" />

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="h-5 w-2/3 rounded bg-background-secondary" />

                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-background-secondary" />
                    <div className="h-3 w-5/6 rounded bg-background-secondary" />
                    <div className="h-3 w-2/3 rounded bg-background-secondary" />
                  </div>

                  <div className="h-20 rounded-xl bg-background-secondary" />

                  <div className="h-11 rounded-xl bg-background-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold sm:text-2xl">
            Unable to load bookings
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground-secondary">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-all hover:bg-accent-hover"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalTickets = bookings.reduce(
    (total, booking) => total + booking.quantity,
    0
  );

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status.toLowerCase() === "confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status.toLowerCase() === "pending"
  ).length;

  return (
    <div className="w-full">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Dashboard
                </span>

                <span className="text-xs text-foreground-muted">
                  /
                </span>

                <span className="text-xs font-medium text-foreground-muted">
                  Bookings
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                My Bookings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                View and manage the events you have booked.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
            >
              Discover Events
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUMMARY
      ========================================================= */}
      {bookings.length > 0 && (
        <section className="mt-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total Bookings"
              value={bookings.length.toString()}
              description="Events you've booked"
              icon="B"
            />

            <SummaryCard
              label="Tickets"
              value={totalTickets.toString()}
              description="Tickets across bookings"
              icon="T"
            />

            <SummaryCard
              label="Confirmed"
              value={confirmedBookings.toString()}
              description="Confirmed bookings"
              icon="✓"
              iconClass="bg-green-500/10 text-green-400"
            />

            <SummaryCard
              label="Pending"
              value={pendingBookings.toString()}
              description="Awaiting confirmation"
              icon="!"
              iconClass="bg-yellow-500/10 text-yellow-400"
            />
          </div>
        </section>
      )}

      {/* =========================================================
          BOOKINGS
      ========================================================= */}
      <section className="mt-9">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-14 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-sm font-bold text-accent">
              E
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              You haven't booked any events yet. Explore upcoming
              events and find something worth experiencing.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Discover Events
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
                  Your activity
                </p>

                <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                  Booked events
                </h2>
              </div>

              <span className="shrink-0 text-xs text-foreground-muted">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {bookings.map((booking) => {
                const eventDate = formatEventDate(
                  booking.event.date
                );

                return (
                  <article
                    key={booking._id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
                  >
                    {/* =================================================
                        EVENT IMAGE
                    ================================================= */}
                    <div className="relative h-52 overflow-hidden sm:h-56">
                      {booking.event.image ? (
                        <img
                          src={booking.event.image}
                          alt={booking.event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-background-secondary text-2xl font-bold text-foreground-muted">
                          E
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Category */}
                      <span className="absolute left-4 top-4 max-w-[70%] truncate rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {booking.event.category}
                      </span>

                      {/* Status */}
                      <div className="absolute bottom-4 right-4">
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Event title */}
                      <div className="absolute bottom-4 left-4 min-w-0 max-w-[70%]">
                        <p className="truncate text-lg font-bold text-white sm:text-xl">
                          {booking.event.title}
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================= */}
                    <div className="p-5 sm:p-6">
                      {/* Event details */}
                      <div className="space-y-3">
                        <InfoRow
                          label="Location"
                          value={booking.event.location}
                        />

                        <InfoRow
                          label="Date"
                          value={eventDate}
                        />

                        <InfoRow
                          label="Time"
                          value={booking.event.time}
                        />
                      </div>

                      {/* Booking summary */}
                      <div className="mt-5 rounded-xl border border-border bg-background-secondary/50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                              Tickets
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {booking.quantity}{" "}
                              {booking.quantity === 1
                                ? "ticket"
                                : "tickets"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                              Total
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                              {booking.totalAmount === 0
                                ? "Free"
                                : `KES ${booking.totalAmount.toLocaleString(
                                    "en-KE"
                                  )}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="mt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                          Booking Reference
                        </p>

                        <p className="mt-1 truncate font-mono text-xs font-medium text-foreground-secondary">
                          {booking.bookingReference}
                        </p>
                      </div>

                      {/* Action */}
                      <Link
                        href={`/dashboard/bookings/${booking._id}`}
                        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover"
                      >
                        View Booking
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClass = "bg-accent/10 text-accent",
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  iconClass?: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-border-hover hover:bg-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground-muted">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   EVENT INFORMATION ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 text-sm">
      <span className="shrink-0 text-foreground-muted">
        {label}
      </span>

      <span className="min-w-0 truncate text-right text-foreground-secondary">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   BOOKING STATUS
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles =
    normalizedStatus === "confirmed"
      ? "border-green-400/20 bg-green-500/15 text-green-300"
      : normalizedStatus === "pending"
        ? "border-yellow-400/20 bg-yellow-500/15 text-yellow-300"
        : "border-red-400/20 bg-red-500/15 text-red-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize backdrop-blur-md ${styles}`}
    >
      {status}
    </span>
  );
}