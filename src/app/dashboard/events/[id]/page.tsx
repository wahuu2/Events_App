"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Organizer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

type Event = {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price: number;
  capacity: number;
  organizer: Organizer;
};

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

type Booking = {
  _id: string;
  bookingReference: string;
  quantity: number;
  totalAmount: number;
};

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: "valid" | "used" | "cancelled";
  createdAt: string;
  user?: User;
  booking?: Booking;
};

type Statistics = {
  capacity: number;
  ticketsSold: number;
  ticketsRemaining: number;
  totalBookings: number;
  totalRevenue: number;
  checkedInTickets: number;
  validTickets: number;
  cancelledTickets: number;
  salesPercentage: number;
  checkInPercentage: number;
};

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "valid" | "used" | "cancelled"
  >("all");

  useEffect(() => {
    async function fetchEventAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/organizer/events/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch event analytics"
          );
        }

        setEvent(data.event);
        setStatistics(data.statistics);
        setTickets(data.tickets);
      } catch (error) {
        console.error("Failed to fetch event analytics:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load event analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEventAnalytics();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-5 w-32 rounded bg-card" />

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-72 bg-background-secondary" />
              <div className="space-y-4 p-6">
                <div className="h-8 w-1/2 rounded bg-background-secondary" />
                <div className="h-4 w-1/3 rounded bg-background-secondary" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-36 rounded-xl border border-border bg-card"
                />
              ))}
            </div>

            <div className="h-64 rounded-2xl border border-border bg-card" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !event || !statistics) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Event analytics unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              {error || "Unable to load this event."}
            </p>

            <Link
              href="/dashboard/events"
              className="mt-6 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Back to My Events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredTickets = tickets.filter((ticket) => {
    const searchTerm = search.toLowerCase().trim();

    const attendeeName =
      `${ticket.user?.firstName || ""} ${
        ticket.user?.lastName || ""
      }`.trim();

    const matchesSearch =
      !searchTerm ||
      attendeeName.toLowerCase().includes(searchTerm) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm) ||
      ticket.booking?.bookingReference
        ?.toLowerCase()
        .includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
           
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Event Analytics
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {event.title}
            </h1>

            <p className="mt-2 text-sm text-foreground-secondary">
              Monitor ticket sales, revenue, attendance, and event activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/events/${event._id}/edit`}
              className="rounded-lg border border-border-hover px-4 py-2.5 text-sm font-semibold transition hover:bg-card"
            >
              Edit Event
            </Link>

            <Link
              href={`/events/${event._id}`}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              View Public Event
            </Link>
          </div>
        </div>

        {/* Event Overview */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="h-72 w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                {event.category}
              </span>

              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                {event.title}
              </h2>

              <p className="mt-3 text-sm text-gray-200 md:text-base">
                {event.location} · {eventDate} · {event.time}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border p-5">
            <Link
              href={`/dashboard/events/${event._id}/edit`}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Edit Event
            </Link>

            <Link
              href={`/events/${event._id}`}
              className="rounded-lg border border-border-hover px-5 py-2.5 text-sm font-semibold transition hover:bg-background-secondary"
            >
              View Public Event
            </Link>

            <Link
              href="/dashboard/organizer/tickets"
              className="rounded-lg border border-border-hover px-5 py-2.5 text-sm font-semibold transition hover:bg-background-secondary"
            >
              Verify Tickets
            </Link>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tickets Sold"
            value={statistics.ticketsSold.toLocaleString()}
            description={`of ${statistics.capacity.toLocaleString()} capacity`}
          />

          <StatCard
            label="Tickets Remaining"
            value={statistics.ticketsRemaining.toLocaleString()}
            description="Available tickets"
          />

          <StatCard
            label="Total Revenue"
            value={`KES ${statistics.totalRevenue.toLocaleString()}`}
            description="From confirmed bookings"
          />

          <StatCard
            label="Checked In"
            value={statistics.checkedInTickets.toLocaleString()}
            description={`${statistics.checkInPercentage}% of tickets sold`}
          />
        </div>

        {/* Ticket Sales */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Performance
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Ticket Sales
              </h2>

              <p className="mt-1 text-sm text-foreground-secondary">
                {statistics.ticketsSold.toLocaleString()} of{" "}
                {statistics.capacity.toLocaleString()} tickets sold
              </p>
            </div>

            <p className="text-3xl font-bold">
              {statistics.salesPercentage}%
            </p>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-background-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{
                width: `${Math.min(statistics.salesPercentage, 100)}%`,
              }}
            />
          </div>
        </section>

        {/* Attendance Statistics */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-foreground-secondary">
              Current ticket and check-in status for this event.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <StatCard
              label="Valid Tickets"
              value={statistics.validTickets.toLocaleString()}
              description="Ready for entry"
            />

            <StatCard
              label="Checked In"
              value={statistics.checkedInTickets.toLocaleString()}
              description={`${statistics.checkInPercentage}% attendance rate`}
            />

            <StatCard
              label="Cancelled Tickets"
              value={statistics.cancelledTickets.toLocaleString()}
              description="Cancelled or invalidated"
            />
          </div>
        </section>

        {/* Attendees */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Attendee Management
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Attendees
                </h2>

                <p className="mt-1 text-sm text-foreground-secondary">
                  Showing {filteredTickets.length} of {tickets.length}{" "}
                  ticket{tickets.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="border-b border-border bg-background-secondary/40 p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="attendee-search"
                  className="mb-2 block text-sm font-medium text-foreground-secondary"
                >
                  Search attendees
                </label>

                <input
                  id="attendee-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, ticket number or booking reference..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-muted transition focus:border-accent"
                />
              </div>

              <div className="lg:w-56">
                <label
                  htmlFor="status-filter"
                  className="mb-2 block text-sm font-medium text-foreground-secondary"
                >
                  Ticket status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "all"
                        | "valid"
                        | "used"
                        | "cancelled"
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                >
                  <option value="all">All Tickets</option>
                  <option value="valid">Valid</option>
                  <option value="used">Checked In</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {(search || statusFilter !== "all") && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-foreground-muted">
                  Active filters:
                </span>

                {search && (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground-secondary">
                    Search: "{search}"
                  </span>
                )}

                {statusFilter !== "all" && (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs capitalize text-foreground-secondary">
                    Status:{" "}
                    {statusFilter === "used"
                      ? "Checked In"
                      : statusFilter}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-xs font-medium text-foreground-secondary transition hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {tickets.length === 0 ? (
            <div className="bg-background px-6 py-14 text-center">
              <h3 className="text-lg font-semibold">
                No tickets issued yet
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Attendee tickets will appear here after bookings are completed.
              </p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-background px-6 py-14 text-center">
              <h3 className="text-lg font-semibold">
                No attendees found
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Try changing your search or ticket status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-border bg-background-secondary/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Attendee
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Ticket Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Booking Reference
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Issued
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => {
                    const attendeeName =
                      `${ticket.user?.firstName || ""} ${
                        ticket.user?.lastName || ""
                      }`.trim() || "Unknown attendee";

                    const issuedDate = new Date(
                      ticket.createdAt
                    ).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={ticket._id}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-medium">
                            {attendeeName}
                          </p>

                          {ticket.user?.email && (
                            <p className="mt-1 text-sm text-foreground-muted">
                              {ticket.user.email}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm">
                          {ticket.ticketNumber}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm text-foreground-secondary">
                          {ticket.booking?.bookingReference || "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="px-6 py-5 text-sm text-foreground-secondary">
                          {issuedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-foreground-muted">
          EventApp Organizer Workspace · Event Analytics
        </footer>
      </section>
    </main>
  );
}

/* ---------------------------------
   Reusable Statistics Card
---------------------------------- */

function StatCard({
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
   Ticket Status Badge
---------------------------------- */

function StatusBadge({
  status,
}: {
  status: "valid" | "used" | "cancelled";
}) {
  const styles = {
    valid: "border-green-500/20 bg-green-500/10 text-green-400",
    used: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    cancelled: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  const label = status === "used" ? "Checked In" : status;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {label}
    </span>
  );
}