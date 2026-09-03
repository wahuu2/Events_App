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
};

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: "valid" | "used" | "cancelled";
  createdAt: string;
  event: Event;
  booking: Booking;
};

function StatusBadge({
  status,
}: {
  status: Ticket["status"];
}) {
  const styles = {
    valid: "border-green-400/20 bg-green-500/10 text-green-400",
    used: "border-yellow-400/20 bg-yellow-500/10 text-yellow-400",
    cancelled: "border-red-400/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-semibold text-foreground ${
          mono ? "break-all font-mono" : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function TicketPage() {
  const params = useParams();
  const id = params.id as string;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tickets");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch tickets"
          );
        }

        const bookingTickets = data.tickets.filter(
          (ticket: Ticket) =>
            ticket.booking?._id?.toString() === id
        );

        if (bookingTickets.length === 0) {
          throw new Error(
            "No tickets were found for this booking."
          );
        }

        setTickets(bookingTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tickets."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTickets();
    }
  }, [id]);

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
            <div className="h-64 bg-background-secondary sm:h-80" />

            <div className="space-y-5 p-5 sm:p-7">
              <div className="h-6 w-40 rounded bg-background-secondary" />
              <div className="h-4 w-full rounded bg-background-secondary" />
              <div className="h-4 w-4/5 rounded bg-background-secondary" />
              <div className="h-4 w-3/5 rounded bg-background-secondary" />
              <div className="h-28 rounded-2xl bg-background-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || tickets.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-lg font-bold text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold sm:text-2xl">
            Tickets not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
            {error ||
              "No tickets were found for this booking."}
          </p>

          <Link
            href={`/dashboard/bookings/${id}`}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
          >
            Back to Booking
          </Link>
        </div>
      </div>
    );
  }

  const event = tickets[0].event;
  const booking = tickets[0].booking;

  const formattedDate = new Date(
    event.date
  ).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalAmount =
    booking.totalAmount === 0
      ? "Free"
      : `KES ${booking.totalAmount.toLocaleString("en-KE")}`;

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card print:hidden">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
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
              Ticket
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Digital Ticket
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Your Digital Tickets
              </h1>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base">
                {tickets.length}{" "}
                {tickets.length === 1 ? "ticket" : "tickets"} for{" "}
                <span className="font-semibold text-foreground">
                  {event.title}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
            >
              Print All Tickets
            </button>
          </div>
        </div>
      </section>

      {/* Ticket List */}
      <section className="mt-6 space-y-6">
        {tickets.map((ticket, index) => (
          <article
            key={ticket._id}
            className="ticket-card overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 print:break-after-page print:border print:shadow-none"
          >
            {/* Ticket Hero */}
            <div className="relative h-64 sm:h-80 lg:h-96">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-background-secondary text-4xl font-bold text-foreground-muted">
                  E
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
                <span className="max-w-[60%] truncate rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                  {event.category}
                </span>

                <span className="shrink-0 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                  {index + 1} / {tickets.length}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Eventora Digital Ticket
                </p>

                <h2 className="mt-2 max-w-4xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {event.title}
                </h2>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Event Information */}
                <section>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Event
                      </p>

                      <h3 className="mt-1.5 text-lg font-bold tracking-tight">
                        Event Details
                      </h3>
                    </div>

                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Location"
                      value={event.location}
                    />

                    <InfoItem
                      label="Date"
                      value={formattedDate}
                    />

                    <InfoItem
                      label="Time"
                      value={event.time}
                    />

                    <InfoItem
                      label="Category"
                      value={event.category}
                    />
                  </div>
                </section>

                {/* Ticket Information */}
                <section className="rounded-2xl border border-border bg-background-secondary/50 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                      T
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Identification
                      </p>

                      <h3 className="mt-1 text-lg font-bold tracking-tight">
                        Ticket Details
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <InfoItem
                      label="Ticket Number"
                      value={ticket.ticketNumber}
                      mono
                    />

                    <InfoItem
                      label="Booking Reference"
                      value={booking.bookingReference}
                      mono
                    />

                    <InfoItem
                      label="Ticket"
                      value={`${index + 1} of ${tickets.length}`}
                    />
                  </div>
                </section>
              </div>

              {/* Ticket Divider */}
              <div className="my-7 flex items-center gap-4 sm:my-8">
                <div className="h-px flex-1 border-t border-dashed border-border-hover" />

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-foreground-muted">
                  E
                </div>

                <div className="h-px flex-1 border-t border-dashed border-border-hover" />
              </div>

              {/* Entry Pass */}
              <section className="rounded-2xl border border-accent/20 bg-accent/5 p-5 text-center sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Present at the event
                </p>

                <p className="mt-3 break-all font-mono text-xl font-bold tracking-wider text-foreground sm:text-2xl">
                  {ticket.ticketNumber}
                </p>

                <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-foreground-secondary">
                  Keep this ticket accessible when checking in
                  at the event.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-foreground-muted">
                    Ticket status:
                  </span>

                  <StatusBadge status={ticket.status} />
                </div>
              </section>

              {/* Print-only information */}
              <div className="mt-6 hidden border-t border-border pt-5 print:block">
                <div className="grid grid-cols-2 gap-5">
                  <InfoItem
                    label="Event"
                    value={event.title}
                  />

                  <InfoItem
                    label="Ticket Number"
                    value={ticket.ticketNumber}
                    mono
                  />

                  <InfoItem
                    label="Date"
                    value={formattedDate}
                  />

                  <InfoItem
                    label="Booking Reference"
                    value={booking.bookingReference}
                    mono
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Booking Summary */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3 print:hidden">
        <SummaryCard
          label="Tickets"
          value={tickets.length.toString()}
          description="Digital tickets issued"
        />

        <SummaryCard
          label="Booking Reference"
          value={booking.bookingReference}
          description="Your reservation reference"
          mono
        />

        <SummaryCard
          label="Total Paid"
          value={totalAmount}
          description="Total booking amount"
        />
      </section>

      {/* Actions */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6 print:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            Ticket Actions
          </p>

          <h2 className="mt-1.5 text-lg font-bold tracking-tight">
            Manage your tickets
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
          >
            Print All Tickets
          </button>

          <Link
            href={`/dashboard/bookings/${id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border-hover px-5 text-sm font-semibold text-foreground transition hover:bg-card-hover sm:w-auto"
          >
            Back to Booking
          </Link>

          <Link
            href="/events"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-foreground-secondary transition hover:bg-card-hover hover:text-foreground sm:w-auto"
          >
            Explore Events
          </Link>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  mono = false,
}: {
  label: string;
  value: string;
  description: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-5 transition-all hover:border-border-hover">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
        {label}
      </p>

      <p
        className={`mt-3 ${
          mono
            ? "break-all font-mono text-sm"
            : "text-2xl font-bold tracking-tight"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}