"use client";

import { useEffect, useMemo, useState } from "react";
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

const statusStyles: Record<string, string> = {
  confirmed:
    "border-emerald-900/60 bg-emerald-950/30 text-emerald-400",
  pending:
    "border-amber-900/60 bg-amber-950/30 text-amber-400",
  cancelled:
    "border-red-900/60 bg-red-950/30 text-red-400",
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

  const summary = useMemo(() => {
    return {
      totalBookings: bookings.length,
      totalTickets: bookings.reduce(
        (total, booking) => total + booking.quantity,
        0
      ),
      confirmed: bookings.filter(
        (booking) => booking.status === "confirmed"
      ).length,
      revenue: bookings
        .filter((booking) => booking.status === "confirmed")
        .reduce(
          (total, booking) => total + booking.totalAmount,
          0
        ),
    };
  }, [bookings]);

  function getAttendeeName(user?: User) {
    const name =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

    return name || "Unknown attendee";
  }

  function getStatusClasses(status: string) {
    return (
      statusStyles[status] ||
      "border-border bg-background-secondary text-foreground-secondary"
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(amount: number) {
    return `KES ${amount.toLocaleString("en-KE")}`;
  }

  return (
    <main className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
                      Organizer Workspace
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Event Bookings
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">
                    Monitor registrations, attendees, ticket quantities,
                    payments, and booking activity across your events.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <Link
                    href="/dashboard/organizer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border-hover px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:w-auto"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/events"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover sm:w-auto"
                  >
                    Manage Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/30 p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-400">
                  Unable to load bookings
                </p>

                <p className="mt-1 text-sm leading-6 text-red-300/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBookings}
                className="w-fit rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && !error && (
          <section className="mt-8 sm:mt-10">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                Booking Overview
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Your event activity
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    B
                  </div>

                  <span className="text-xs text-foreground-muted">
                    All
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-foreground-secondary">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {summary.totalBookings.toLocaleString()}
                </p>

                <p className="mt-2 text-xs text-foreground-muted">
                  Registrations across your events
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    T
                  </div>

                  <span className="text-xs text-foreground-muted">
                    Tickets
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-foreground-secondary">
                  Tickets Booked
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {summary.totalTickets.toLocaleString()}
                </p>

                <p className="mt-2 text-xs text-foreground-muted">
                  Total ticket quantity requested
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-400">
                    ✓
                  </div>

                  <span className="text-xs text-foreground-muted">
                    Confirmed
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-foreground-secondary">
                  Confirmed Bookings
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {summary.confirmed.toLocaleString()}
                </p>

                <p className="mt-2 text-xs text-foreground-muted">
                  Successfully confirmed registrations
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    K
                  </div>

                  <span className="text-xs text-foreground-muted">
                    Revenue
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-foreground-secondary">
                  Confirmed Revenue
                </p>

                <p className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-3xl">
                  {formatCurrency(summary.revenue)}
                </p>

                <p className="mt-2 text-xs text-foreground-muted">
                  Revenue from confirmed bookings
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-8 sm:mt-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-background-secondary" />

                  <div className="mt-6 h-4 w-28 animate-pulse rounded bg-background-secondary" />

                  <div className="mt-3 h-9 w-24 animate-pulse rounded bg-background-secondary" />

                  <div className="mt-3 h-3 w-40 animate-pulse rounded bg-background-secondary" />
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <div className="h-6 w-36 animate-pulse rounded bg-background-secondary" />

              <div className="mt-2 h-4 w-52 animate-pulse rounded bg-background-secondary" />

              <div className="mt-8 space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 border-b border-border pb-4 last:border-0"
                  >
                    <div className="h-10 w-10 animate-pulse rounded-full bg-background-secondary" />

                    <div className="flex-1">
                      <div className="h-4 w-40 animate-pulse rounded bg-background-secondary" />

                      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-background-secondary" />
                    </div>

                    <div className="hidden h-4 w-20 animate-pulse rounded bg-background-secondary sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <section className="mt-8">
            <div className="rounded-2xl border border-dashed border-border-hover bg-card px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-xl font-bold text-accent">
                #
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                No activity yet
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                No bookings yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
                Bookings for your events will appear here when attendees
                start registering.
              </p>

              <Link
                href="/dashboard/organizer/events"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
              >
                Manage My Events
              </Link>
            </div>
          </section>
        )}

        {/* Bookings */}
        {!loading && !error && bookings.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  Registration Activity
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  All bookings
                </h2>

                <p className="mt-1 text-sm text-foreground-secondary">
                  {bookings.length.toLocaleString()}{" "}
                  {bookings.length === 1 ? "booking" : "bookings"} found
                </p>
              </div>

              <Link
                href="/dashboard/organizer/events"
                className="text-sm font-medium text-accent transition hover:text-accent-hover"
              >
                Manage events →
              </Link>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="grid gap-4 lg:hidden">
              {bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition hover:border-border-hover"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {booking.user?.imageUrl ? (
                          <img
                            src={booking.user.imageUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                            {getAttendeeName(booking.user)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {getAttendeeName(booking.user)}
                          </p>

                          {booking.user?.email && (
                            <p className="mt-0.5 truncate text-xs text-foreground-muted">
                              {booking.user.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-border bg-background-secondary p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        Event
                      </p>

                      <p className="mt-2 truncate font-medium">
                        {booking.event?.title || "Unknown event"}
                      </p>

                      {booking.event?.location && (
                        <p className="mt-1 truncate text-xs text-foreground-muted">
                          {booking.event.location}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-foreground-muted">
                          Tickets
                        </p>

                        <p className="mt-1 font-semibold">
                          {booking.quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-foreground-muted">
                          Amount
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-foreground-muted">
                          Booked
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-foreground-muted">
                          Reference
                        </p>

                        <p className="mt-1 break-all font-mono text-[11px] text-foreground-secondary">
                          {booking.bookingReference}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
              <div className="table-wrapper">
                <table className="w-full min-w-[1050px]">
                  <thead className="border-b border-border bg-background-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Attendee
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Tickets
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Reference
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-border transition-colors last:border-0 hover:bg-background-secondary"
                      >
                        {/* Attendee */}
                        <td className="px-6 py-5">
                          <div className="flex min-w-[190px] items-center gap-3">
                            {booking.user?.imageUrl ? (
                              <img
                                src={booking.user.imageUrl}
                                alt=""
                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                                {getAttendeeName(booking.user)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {getAttendeeName(booking.user)}
                              </p>

                              {booking.user?.email && (
                                <p className="mt-1 max-w-[180px] truncate text-xs text-foreground-muted">
                                  {booking.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Event */}
                        <td className="px-6 py-5">
                          <div className="min-w-[200px]">
                            <p className="max-w-[230px] truncate font-medium">
                              {booking.event?.title || "Unknown event"}
                            </p>

                            {booking.event?.location && (
                              <p className="mt-1 max-w-[230px] truncate text-xs text-foreground-muted">
                                {booking.event.location}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Tickets */}
                        <td className="px-6 py-5">
                          <span className="font-semibold">
                            {booking.quantity}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5">
                          <span className="whitespace-nowrap font-semibold">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
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
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}