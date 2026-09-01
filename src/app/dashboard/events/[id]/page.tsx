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
  const [statistics, setStatistics] =
    useState<Statistics | null>(null);
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

        const response = await fetch(
          `/api/organizer/events/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to fetch event analytics"
          );
        }

        setEvent(data.event);
        setStatistics(data.statistics);
        setTickets(data.tickets);
      } catch (error) {
        console.error(
          "Failed to fetch event analytics:",
          error
        );

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
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-gray-400">
            Loading event analytics...
          </p>
        </div>
      </main>
    );
  }

  if (error || !event || !statistics) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl font-bold">
            Event not found
          </h1>

          <p className="mt-3 text-gray-400">
            {error ||
              "Unable to load this event."}
          </p>

          <Link
            href="/dashboard/events"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Back to My Events
          </Link>
        </div>
      </main>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString(
    "en-KE",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const filteredTickets = tickets.filter((ticket) => {
  const searchTerm = search.toLowerCase().trim();

  const attendeeName =
    `${ticket.user?.firstName || ""} ${
      ticket.user?.lastName || ""
    }`.trim();

  const matchesSearch =
    !searchTerm ||
    attendeeName.toLowerCase().includes(searchTerm) ||
    ticket.user?.email
      ?.toLowerCase()
      .includes(searchTerm) ||
    ticket.ticketNumber
      .toLowerCase()
      .includes(searchTerm) ||
    ticket.booking?.bookingReference
      ?.toLowerCase()
      .includes(searchTerm);

  const matchesStatus =
    statusFilter === "all" ||
    ticket.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  return (
    <main className="min-h-screen bg-gray-950 text-white">
         <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Event Header */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="h-72 w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="absolute bottom-0 left-0 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-300">
                {event.category}
              </p>

              <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                {event.title}
              </h1>

              <p className="mt-3 text-gray-300">
                {event.location} · {eventDate} ·{" "}
                {event.time}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-800 p-6">
            <Link
              href={`/dashboard/events/${event._id}/edit`}
              className="rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200"
            >
              Edit Event
            </Link>

            <Link
              href={`/events/${event._id}`}
              className="rounded-lg border border-gray-700 px-5 py-3 font-semibold hover:bg-gray-800"
            >
              View Public Event
            </Link>

            <Link
              href="/dashboard/organizer/tickets"
              className="rounded-lg border border-gray-700 px-5 py-3 font-semibold hover:bg-gray-800"
            >
              Verify Tickets
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tickets Sold */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Tickets Sold
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.ticketsSold}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              of {statistics.capacity} capacity
            </p>
          </div>

          {/* Tickets Remaining */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Tickets Remaining
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.ticketsRemaining}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Available tickets
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Total Revenue
            </p>

            <p className="mt-3 text-3xl font-bold">
              KES{" "}
              {statistics.totalRevenue.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              From confirmed bookings
            </p>
          </div>

          {/* Check-ins */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Checked In
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.checkedInTickets}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {statistics.checkInPercentage}% of tickets sold
            </p>
          </div>
        </div>

        {/* Ticket Sales Progress */}
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Ticket Sales
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {statistics.ticketsSold} of{" "}
                {statistics.capacity} tickets sold
              </p>
            </div>

            <p className="text-2xl font-bold">
              {statistics.salesPercentage}%
            </p>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${statistics.salesPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Check-in Statistics */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Valid Tickets
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.validTickets}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Checked In
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.checkedInTickets}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Cancelled Tickets
            </p>

            <p className="mt-3 text-3xl font-bold">
              {statistics.cancelledTickets}
            </p>
          </div>
        </div>

       {/* Attendees */}
<div className="mt-8 overflow-hidden rounded-2xl border border-gray-800">
  <div className="border-b border-gray-800 bg-gray-900 px-6 py-5">
    <h2 className="text-xl font-semibold">
      Attendees
    </h2>

    <p className="mt-1 text-sm text-gray-400">
      Showing {filteredTickets.length} of{" "}
      {tickets.length} ticket
      {tickets.length !== 1 ? "s" : ""}
    </p>
  </div>

  {/* Search & Filters */}
  <div className="border-b border-gray-800 bg-gray-900/50 p-6">
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Search */}
      <div className="flex-1">
        <label
          htmlFor="attendee-search"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Search attendees
        </label>

        <input
          id="attendee-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, ticket number or booking reference..."
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-gray-400"
        />
      </div>

      {/* Status Filter */}
      <div className="lg:w-56">
        <label
          htmlFor="status-filter"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Status
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
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-gray-400"
        >
          <option value="all">
            All Tickets
          </option>

          <option value="valid">
            Valid
          </option>

          <option value="used">
            Checked In
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>
      </div>
    </div>

    {/* Active Filters */}
    {(search || statusFilter !== "all") && (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-500">
          Active filters:
        </p>

        {search && (
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
            Search: "{search}"
          </span>
        )}

        {statusFilter !== "all" && (
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs capitalize text-gray-300">
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
          className="text-xs font-medium text-gray-400 hover:text-white"
        >
          Clear filters
        </button>
      </div>
    )}
  </div>

  {/* No tickets */}
  {tickets.length === 0 ? (
    <div className="bg-gray-950 p-10 text-center">
      <p className="text-gray-400">
        No tickets have been issued for this event yet.
      </p>
    </div>
  ) : filteredTickets.length === 0 ? (
    <div className="bg-gray-950 p-10 text-center">
      <h3 className="text-lg font-semibold">
        No attendees found
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        Try changing your search or filter.
      </p>

      <button
        type="button"
        onClick={() => {
          setSearch("");
          setStatusFilter("all");
        }}
        className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200"
      >
        Clear Filters
      </button>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="border-b border-gray-800 bg-gray-900/60">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              Attendee
            </th>

            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              Ticket Number
            </th>

            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              Booking Reference
            </th>

            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              Status
            </th>

            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
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
                className="border-b border-gray-800 last:border-0 hover:bg-gray-900/60"
              >
                <td className="px-6 py-5">
                  <p className="font-medium">
                    {attendeeName}
                  </p>

                  {ticket.user?.email && (
                    <p className="mt-1 text-sm text-gray-500">
                      {ticket.user.email}
                    </p>
                  )}
                </td>

                <td className="px-6 py-5 font-mono text-sm">
                  {ticket.ticketNumber}
                </td>

                <td className="px-6 py-5 font-mono text-sm text-gray-400">
                  {ticket.booking?.bookingReference ||
                    "N/A"}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      ticket.status === "valid"
                        ? "bg-green-900/40 text-green-400"
                        : ticket.status === "used"
                          ? "bg-yellow-900/40 text-yellow-400"
                          : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {ticket.status === "used"
                      ? "Checked In"
                      : ticket.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-sm text-gray-400">
                  {issuedDate}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>
      </section>
    </main>
  );
}