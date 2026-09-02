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
    valid: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    used: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    cancelled:
      "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[status]
      }`}
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
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium text-foreground ${
          mono ? "break-all font-mono" : ""
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
      <main className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
            <div className="h-5 w-28 animate-pulse rounded bg-card" />
          </div>
        </div>

        <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-card" />
            <div className="mt-4 h-10 w-72 rounded bg-card" />
            <div className="mt-3 h-5 w-96 max-w-full rounded bg-card" />

            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-64 bg-background-secondary" />

              <div className="space-y-5 p-6 md:p-8">
                <div className="h-6 w-40 rounded bg-background-secondary" />
                <div className="h-4 w-full rounded bg-background-secondary" />
                <div className="h-4 w-4/5 rounded bg-background-secondary" />
                <div className="h-4 w-3/5 rounded bg-background-secondary" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || tickets.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                E
              </div>

              <span className="text-xl font-bold tracking-tight">
                EventApp
              </span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="text-sm font-medium text-foreground-secondary transition hover:text-white"
            >
              My Bookings
            </Link>
          </div>
        </nav>

        <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-16 lg:px-8">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Tickets not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              {error ||
                "No tickets were found for this booking."}
            </p>

            <Link
              href={`/dashboard/bookings/${id}`}
              className="mt-7 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Back to Booking
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const event = tickets[0].event;
  const booking = tickets[0].booking;

  const eventDate = new Date(event.date);

  const formattedDate = eventDate.toLocaleDateString(
    "en-KE",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
     
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Page Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between print:hidden">
          <div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Digital Ticket
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Your Digital Tickets
            </h1>

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              {tickets.length} ticket
              {tickets.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium text-foreground">
                {event.title}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Print All Tickets
          </button>
        </div>

        {/* Ticket List */}
        <div className="space-y-8">
          {tickets.map((ticket, index) => (
            <article
              key={ticket._id}
              className="ticket-card overflow-hidden rounded-2xl border border-border bg-card shadow-2xl print:break-after-page"
            >
              {/* Event Image */}
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-64 w-full object-cover md:h-72"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-5">
                  <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {event.category}
                  </span>

                  <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    Ticket {index + 1} of {tickets.length}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                    EventApp Digital Ticket
                  </p>

                  <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white md:text-4xl">
                    {event.title}
                  </h2>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Event Details */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">
                        Event Details
                      </h3>

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
                  </div>

                  {/* Ticket Details */}
                  <div className="rounded-xl border border-border bg-background-secondary p-5">
                    <h3 className="text-lg font-bold">
                      Ticket Details
                    </h3>

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
                  </div>
                </div>

                {/* Ticket Divider */}
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 border-t border-dashed border-border-hover" />

                  <div className="h-3 w-3 rounded-full border border-border-hover bg-background" />

                  <div className="h-px flex-1 border-t border-dashed border-border-hover" />
                </div>

                {/* Ticket Verification */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Present at the event
                  </p>

                  <p className="mt-3 break-all font-mono text-xl font-bold tracking-wider text-foreground md:text-2xl">
                    {ticket.ticketNumber}
                  </p>

                  <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-foreground-secondary">
                    Keep this ticket accessible when checking in
                    at the event.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Booking Summary */}
        <div className="mt-8 grid gap-4 border-t border-border pt-8 sm:grid-cols-3 print:hidden">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Tickets
            </p>
            <p className="mt-2 text-2xl font-bold">
              {tickets.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Booking Reference
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold">
              {booking.bookingReference}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Total Paid
            </p>
            <p className="mt-2 text-2xl font-bold">
              KES {booking.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Print All Tickets
          </button>

          <Link
            href={`/dashboard/bookings/${id}`}
            className="rounded-lg border border-border-hover px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
          >
            Back to Booking
          </Link>

          <Link
            href="/events"
            className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground-secondary transition hover:bg-card hover:text-white"
          >
            Explore Events
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background print:hidden">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} EventApp. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}