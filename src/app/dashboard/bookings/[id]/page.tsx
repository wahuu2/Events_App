"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: string;
};

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);

  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");

  const [ticketExists, setTicketExists] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/bookings/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch booking"
          );
        }

        setBooking(data.booking);
      } catch (error) {
        console.error("Failed to fetch booking:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booking"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBooking();
    }
  }, [id]);

  async function generateTicket() {
    if (!booking) return;

    try {
      setTicketLoading(true);
      setTicketError("");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate ticket"
        );
      }

      if (!data.tickets || data.tickets.length === 0) {
        throw new Error("No ticket was generated.");
      }

      setTicket(data.tickets[0]);
      setTicketExists(data.alreadyExists === true);
    } catch (error) {
      console.error("Generate ticket error:", error);

      setTicketError(
        error instanceof Error
          ? error.message
          : "Failed to generate ticket."
      );
    } finally {
      setTicketLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-32 rounded bg-card" />

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-72 bg-background-secondary md:h-96" />

              <div className="space-y-4 p-6 md:p-8">
                <div className="h-4 w-24 rounded bg-background-secondary" />
                <div className="h-9 w-2/3 rounded bg-background-secondary" />
                <div className="h-5 w-1/2 rounded bg-background-secondary" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 rounded-2xl border border-border bg-card" />
              <div className="h-64 rounded-2xl border border-border bg-card" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl font-bold text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Booking not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              {error ||
                "The booking you are looking for does not exist."}
            </p>

            <Link
              href="/dashboard/bookings"
              className="mt-6 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Back to My Bookings
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const eventDate = new Date(booking.event.date);

  const formattedDate = eventDate.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookedDate = new Date(
    booking.createdAt
  ).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-foreground-secondary transition hover:text-white"
          >
            ← Back to My Bookings
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Booking Details
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Your Event Booking
          </h1>

          <p className="mt-2 text-sm text-foreground-secondary">
            Review your booking, payment status, and digital ticket.
          </p>
        </div>

        {/* Event Header */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative">
            <img
              src={booking.event.image}
              alt={booking.event.title}
              className="h-72 w-full object-cover md:h-96"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                {booking.event.category}
              </span>

              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                {booking.event.title}
              </h2>

              <div className="mt-4 space-y-2 text-sm text-gray-200 md:text-base">
                <p>{booking.event.location}</p>
                <p>
                  {formattedDate} · {booking.event.time}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Booking Summary */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Order Summary
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Booking Information
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow
                label="Tickets"
                value={booking.quantity.toString()}
              />

              <InfoRow
                label="Ticket price"
                value={
                  booking.event.price === 0
                    ? "Free"
                    : `KES ${booking.event.price.toLocaleString()}`
                }
              />

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    {booking.totalAmount === 0
                      ? "Free"
                      : `KES ${booking.totalAmount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Booking Status */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Booking Status
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Booking Information
              </h2>
            </div>

            <div className="mt-6">
              <StatusBadge status={booking.status} />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground-muted">
                  Booking Reference
                </p>

                <p className="mt-2 break-all font-mono text-sm text-foreground-secondary">
                  {booking.bookingReference}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-foreground-muted">
                  Booked On
                </p>

                <p className="mt-2 text-sm text-foreground-secondary">
                  {bookedDate}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Digital Ticket */}
        {booking.status === "confirmed" && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Entry Pass
              </p>

              <h2 className="text-xl font-semibold">
                Digital Ticket
              </h2>

              <p className="text-sm leading-6 text-foreground-secondary">
                Your booking is confirmed. Generate your digital ticket
                to attend the event.
              </p>
            </div>

            {ticketError && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {ticketError}
              </div>
            )}

            {!ticket ? (
              <button
                type="button"
                onClick={generateTicket}
                disabled={ticketLoading}
                className="mt-6 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ticketLoading
                  ? "Generating Ticket..."
                  : "Generate Digital Ticket"}
              </button>
            ) : (
              <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-sm font-bold text-green-400">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-green-400">
                      {ticketExists
                        ? "You already have a ticket for this booking."
                        : "Ticket generated successfully."}
                    </p>

                    <p className="mt-4 text-xs uppercase tracking-wider text-foreground-muted">
                      Ticket Number
                    </p>

                    <p className="mt-1 font-mono text-lg font-bold">
                      {ticket.ticketNumber}
                    </p>

                    <p className="mt-4 text-sm text-foreground-secondary">
                      Status:{" "}
                      <span className="font-semibold capitalize text-green-400">
                        {ticket.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          {booking.status === "pending" &&
            booking.totalAmount > 0 && (
              <Link
                href={`/dashboard/bookings/${booking._id}/payment`}
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Pay Now
              </Link>
            )}

          {booking.status === "confirmed" && (
            <Link
              href={`/dashboard/bookings/${booking._id}/ticket`}
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              View Ticket
            </Link>
          )}

          <Link
            href={`/events/${booking.event._id}`}
            className="rounded-lg border border-border-hover px-6 py-3 text-sm font-semibold transition hover:bg-card"
          >
            View Event
          </Link>

          <Link
            href="/dashboard/bookings"
            className="rounded-lg border border-border-hover px-6 py-3 text-sm font-semibold transition hover:bg-card"
          >
            All My Bookings
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-foreground-muted">
          EventApp · Booking Details
        </footer>
      </section>
    </main>
  );
}

/* ---------------------------------
   Information Row
---------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm text-foreground-secondary">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------
   Status Badge
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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}