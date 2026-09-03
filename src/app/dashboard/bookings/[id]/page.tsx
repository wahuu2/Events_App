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
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="h-3 w-28 rounded bg-background" />
            <div className="mt-4 h-8 w-64 rounded bg-background" />
            <div className="mt-3 h-4 w-full max-w-lg rounded bg-background" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-64 bg-background-secondary sm:h-80 lg:h-96" />

            <div className="space-y-4 p-5 sm:p-7">
              <div className="h-5 w-24 rounded bg-background-secondary" />
              <div className="h-8 w-2/3 rounded bg-background-secondary" />
              <div className="h-4 w-1/2 rounded bg-background-secondary" />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-72 rounded-2xl border border-border bg-card" />
            <div className="h-72 rounded-2xl border border-border bg-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold sm:text-2xl">
            Booking not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground-secondary">
            {error ||
              "The booking you are looking for does not exist."}
          </p>

          <Link
            href="/dashboard/bookings"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-all hover:bg-accent-hover sm:w-auto"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
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

  const normalizedStatus = booking.status.toLowerCase();

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Dashboard
              </span>

              <span className="text-xs text-foreground-muted">
                /
              </span>

              <Link
                href="/dashboard/bookings"
                className="text-xs font-medium text-foreground-muted transition hover:text-foreground"
              >
                Bookings
              </Link>

              <span className="text-xs text-foreground-muted">
                /
              </span>

              <span className="text-xs font-medium text-foreground-muted">
                Details
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Your Event Booking
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                  Review your booking, payment status, and digital
                  ticket.
                </p>
              </div>

              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>
      </section>

      {/* Event Hero */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative h-64 sm:h-80 lg:h-[420px]">
          {booking.event.image ? (
            <img
              src={booking.event.image}
              alt={booking.event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background-secondary text-4xl font-bold text-foreground-muted">
              E
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
            <span className="inline-flex max-w-full rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              {booking.event.category}
            </span>

            <h2 className="mt-3 max-w-4xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {booking.event.title}
            </h2>

            <div className="mt-4 grid gap-2 text-sm text-gray-200 sm:grid-cols-2 sm:gap-x-8 sm:text-base">
              <p className="min-w-0 truncate">
                <span className="text-gray-400">Location:</span>{" "}
                {booking.event.location}
              </p>

              <p>
                <span className="text-gray-400">Date:</span>{" "}
                {formattedDate}
              </p>

              <p>
                <span className="text-gray-400">Time:</span>{" "}
                {booking.event.time}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Information */}
      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Booking Summary */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Order Summary
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Booking Information
              </h2>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
              B
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <InfoRow
              label="Tickets"
              value={`${booking.quantity} ${
                booking.quantity === 1 ? "ticket" : "tickets"
              }`}
            />

            <InfoRow
              label="Ticket price"
              value={
                booking.event.price === 0
                  ? "Free"
                  : `KES ${booking.event.price.toLocaleString(
                      "en-KE"
                    )}`
              }
            />

            <div className="border-t border-border pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-foreground-muted">
                    Total paid
                  </p>

                  <p className="mt-1 text-sm text-foreground-secondary">
                    {booking.quantity}{" "}
                    {booking.quantity === 1
                      ? "ticket"
                      : "tickets"}
                  </p>
                </div>

                <span className="text-xl font-bold sm:text-2xl">
                  {booking.totalAmount === 0
                    ? "Free"
                    : `KES ${booking.totalAmount.toLocaleString(
                        "en-KE"
                      )}`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Status */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Booking Status
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Reservation Details
              </h2>
            </div>

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                normalizedStatus === "confirmed"
                  ? "bg-green-500/10 text-green-400"
                  : normalizedStatus === "pending"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
              }`}
            >
              {normalizedStatus === "confirmed"
                ? "✓"
                : normalizedStatus === "pending"
                  ? "!"
                  : "×"}
            </div>
          </div>

          <div className="mt-6">
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                Booking Reference
              </p>

              <p className="mt-2 break-all font-mono text-sm font-medium text-foreground-secondary">
                {booking.bookingReference}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                Booked On
              </p>

              <p className="mt-2 text-sm text-foreground-secondary">
                {bookedDate}
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* Digital Ticket */}
      {booking.status === "confirmed" && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    T
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                      Entry Pass
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight">
                      Digital Ticket
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-secondary">
                  Your booking is confirmed. Generate your digital
                  ticket to attend the event.
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-400">
                Confirmed
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {ticketError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-400"
              >
                {ticketError}
              </div>
            )}

            {!ticket ? (
              <div className="rounded-2xl border border-dashed border-border bg-background-secondary/40 p-6 text-center sm:p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-sm font-bold text-accent">
                  E
                </div>

                <h3 className="mt-4 text-base font-bold">
                  Your digital ticket is ready
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-secondary">
                  Generate your ticket to receive a unique ticket
                  number for event entry.
                </p>

                <button
                  type="button"
                  onClick={generateTicket}
                  disabled={ticketLoading}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {ticketLoading
                    ? "Generating Ticket..."
                    : "Generate Digital Ticket"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-base font-bold text-green-400">
                    ✓
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-green-400">
                      {ticketExists
                        ? "You already have a ticket for this booking."
                        : "Ticket generated successfully."}
                    </p>

                    <div className="mt-5 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        Ticket Number
                      </p>

                      <p className="mt-2 break-all font-mono text-lg font-bold tracking-wide sm:text-xl">
                        {ticket.ticketNumber}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-foreground-muted">
                          Status:
                        </span>

                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold capitalize text-green-400">
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/bookings/${booking._id}/ticket`}
                      className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-all hover:bg-accent-hover sm:w-auto"
                    >
                      View Digital Ticket
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            Actions
          </p>

          <h2 className="mt-1.5 text-lg font-bold tracking-tight">
            Manage this booking
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
          {booking.status === "pending" &&
            booking.totalAmount > 0 && (
              <Link
                href={`/dashboard/bookings/${booking._id}/payment`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
              >
                Pay Now
              </Link>
            )}

          {booking.status === "confirmed" && (
            <Link
              href={`/dashboard/bookings/${booking._id}/ticket`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition-all hover:bg-accent-hover sm:w-auto"
            >
              View Ticket
            </Link>
          )}

          <Link
            href={`/events/${booking.event._id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border-hover px-6 text-sm font-semibold text-foreground transition-all hover:bg-card-hover sm:w-auto"
          >
            View Event
          </Link>

          <Link
            href="/dashboard/bookings"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border-hover px-6 text-sm font-semibold text-foreground-secondary transition-all hover:bg-card-hover hover:text-foreground sm:w-auto"
          >
            All My Bookings
          </Link>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-border/70 pb-4 last:border-0 last:pb-0">
      <span className="shrink-0 text-sm text-foreground-muted">
        {label}
      </span>

      <span className="min-w-0 text-right text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles =
    normalizedStatus === "confirmed"
      ? "border-green-400/20 bg-green-500/10 text-green-400"
      : normalizedStatus === "pending"
        ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-400"
        : "border-red-400/20 bg-red-500/10 text-red-400";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize tracking-wide ${styles}`}
    >
      {status}
    </span>
  );
}