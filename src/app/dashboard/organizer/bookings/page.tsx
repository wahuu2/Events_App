"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

type Event = {
  _id: string;
  title: string;
  image?: string;
  location?: string;
  date?: string;
  time?: string;
};

type Booking = {
  _id: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | string;
  bookingReference: string;
  createdAt: string;
  user?: User;
  event?: Event;
};

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/organizer/bookings");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch bookings."
        );
      }

      setBookings(data.bookings);
    } catch (error) {
      console.error(
        "Failed to fetch organizer bookings:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  function getAttendeeName(user?: User) {
    const name =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

    return name || "Unknown attendee";
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "confirmed":
        return "border border-emerald-900/60 bg-emerald-950/30 text-emerald-400";

      case "cancelled":
        return "border border-red-900/60 bg-red-950/30 text-red-400";

      default:
        return "border border-border bg-background-secondary text-foreground-secondary";
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Organizer Workspace
          </p>

          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Event Bookings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                View attendees, ticket quantities, payments, and
                booking information for your events.
              </p>
            </div>

            <Link
              href="/dashboard/organizer"
              className="inline-flex w-fit rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-border-hover hover:bg-card"
            >
              Organizer Dashboard
            </Link>
          </div>
        </section>

        {/* Summary */}
        {!loading && !error && (
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">
                  Total bookings
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {bookings.length.toLocaleString()}
                </p>
              </div>

              <div className="h-px bg-border sm:h-10 sm:w-px" />

              <div>
                <p className="text-sm text-foreground-secondary">
                  Tickets booked
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {bookings
                    .reduce(
                      (total, booking) =>
                        total + booking.quantity,
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>

              <div className="h-px bg-border sm:h-10 sm:w-px" />

              <div>
                <p className="text-sm text-foreground-secondary">
                  Confirmed
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {bookings.filter(
                    (booking) =>
                      booking.status === "confirmed"
                  ).length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="h-6 w-40 animate-pulse rounded bg-background-secondary" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-background-secondary" />
            </div>

            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex gap-6 border-b border-border p-6 last:border-0"
                >
                  <div className="h-10 w-32 animate-pulse rounded bg-background-secondary" />
                  <div className="h-10 w-40 animate-pulse rounded bg-background-secondary" />
                  <div className="h-10 w-16 animate-pulse rounded bg-background-secondary" />
                  <div className="h-10 w-24 animate-pulse rounded bg-background-secondary" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 p-6">
            <h2 className="font-semibold text-red-400">
              Unable to load bookings
            </h2>

            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBookings}
              className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border-hover bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              #
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              Bookings made for your events will appear here once
              attendees start registering.
            </p>

            <Link
              href="/dashboard/events"
              className="mt-7 inline-flex rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Manage My Events
            </Link>
          </div>
        )}

        {/* Desktop bookings table */}
        {!loading && !error && bookings.length > 0 && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                All Bookings
              </h2>

              <p className="mt-1 text-sm text-foreground-secondary">
                {bookings.length.toLocaleString()}{" "}
                {bookings.length === 1
                  ? "booking"
                  : "bookings"}{" "}
                found
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="border-b border-border bg-background-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Attendee
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Tickets
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Reference
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => {
                      const bookingDate = new Date(
                        booking.createdAt
                      ).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });

                      return (
                        <tr
                          key={booking._id}
                          className="border-b border-border transition last:border-0 hover:bg-background-secondary"
                        >
                          {/* Attendee */}
                          <td className="px-6 py-5">
                            <p className="font-medium">
                              {getAttendeeName(booking.user)}
                            </p>

                            {booking.user?.email && (
                              <p className="mt-1 text-xs text-foreground-muted">
                                {booking.user.email}
                              </p>
                            )}
                          </td>

                          {/* Event */}
                          <td className="px-6 py-5">
                            <p className="max-w-[220px] truncate font-medium">
                              {booking.event?.title ||
                                "Unknown event"}
                            </p>

                            {booking.event?.location && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-foreground-muted">
                                {booking.event.location}
                              </p>
                            )}
                          </td>

                          {/* Tickets */}
                          <td className="px-6 py-5 font-medium">
                            {booking.quantity}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-5 font-medium">
                            KES{" "}
                            {booking.totalAmount.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>

                          {/* Reference */}
                          <td className="px-6 py-5">
                            <span className="font-mono text-xs text-foreground-secondary">
                              {booking.bookingReference}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-5 text-sm text-foreground-secondary">
                            {bookingDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-14 border-t border-border pt-6">
          <p className="text-center text-xs text-foreground-muted">
            EventApp Organizer Workspace
          </p>
        </footer>
      </div>
    </main>
  );
}