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

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div>
              <div className="h-4 w-24 rounded bg-card" />
              <div className="mt-4 h-10 w-56 rounded bg-card" />
              <div className="mt-3 h-4 w-80 rounded bg-card" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-56 bg-background-secondary" />

                  <div className="space-y-4 p-6">
                    <div className="h-4 w-24 rounded bg-background-secondary" />
                    <div className="h-7 w-2/3 rounded bg-background-secondary" />
                    <div className="h-16 rounded bg-background-secondary" />
                    <div className="h-20 rounded bg-background-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl font-bold text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Unable to load bookings
            </h1>

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              My Bookings
            </h1>

            <p className="mt-2 max-w-xl text-sm text-foreground-secondary md:text-base">
              View and manage the events you have booked.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex w-fit rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Discover Events
          </Link>
        </div>

        {/* Summary */}
        {bookings.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <SummaryCard
              label="Total Bookings"
              value={bookings.length.toString()}
              description="Events you've booked"
            />

            <SummaryCard
              label="Tickets"
              value={bookings
                .reduce((total, booking) => total + booking.quantity, 0)
                .toString()}
              description="Tickets across bookings"
            />

            <SummaryCard
              label="Confirmed"
              value={bookings
                .filter(
                  (booking) =>
                    booking.status.toLowerCase() === "confirmed"
                )
                .length.toString()}
              description="Confirmed bookings"
            />
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <span className="text-xl font-bold">E</span>
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              You haven't booked any events yet. Explore upcoming events
              and find something worth experiencing.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Discover Events
            </Link>
          </div>
        ) : (
          /* Booking Cards */
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {bookings.map((booking) => {
              const eventDate = new Date(
                booking.event.date
              ).toLocaleDateString("en-KE", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <article
                  key={booking._id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:border-border-hover"
                >
                  {/* Event Image */}
                  <div className="relative">
                    <img
                      src={booking.event.image}
                      alt={booking.event.title}
                      className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                      {booking.event.category}
                    </span>

                    <div className="absolute bottom-5 right-5">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {booking.event.title}
                    </h2>

                    {/* Event Details */}
                    <div className="mt-5 space-y-3">
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

                    {/* Booking Summary */}
                    <div className="mt-6 rounded-xl border border-border bg-background-secondary/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground-secondary">
                          Tickets
                        </span>

                        <span className="text-sm font-semibold">
                          {booking.quantity}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-foreground-secondary">
                          Total
                        </span>

                        <span className="font-semibold">
                          {booking.totalAmount === 0
                            ? "Free"
                            : `KES ${booking.totalAmount.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Booking Reference */}
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-wider text-foreground-muted">
                        Booking Reference
                      </p>

                      <p className="mt-1 font-mono text-sm text-foreground-secondary">
                        {booking.bookingReference}
                      </p>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/dashboard/bookings/${booking._id}`}
                      className="mt-6 flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
                    >
                      View Booking
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-foreground-muted">
          EventApp · Your bookings and event experiences
        </footer>
      </section>
    </main>
  );
}

/* ---------------------------------
   Summary Card
---------------------------------- */

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition hover:border-border-hover">
      <p className="text-sm font-medium text-foreground-secondary">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* ---------------------------------
   Event Information Row
---------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 text-sm">
      <span className="text-foreground-muted">
        {label}
      </span>

      <span className="text-right text-foreground-secondary">
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------
   Booking Status Badge
---------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles =
    normalizedStatus === "confirmed"
      ? "border-green-500/20 bg-green-500/10 text-green-400"
      : normalizedStatus === "pending"
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
        : "border-red-500/20 bg-red-500/10 text-red-400";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize backdrop-blur ${styles}`}
    >
      {status}
    </span>
  );
}