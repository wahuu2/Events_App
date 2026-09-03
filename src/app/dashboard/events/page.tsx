"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
};

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/organizer/events");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch your events."
        );
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch organizer events:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function deleteEvent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete event."
        );
      }

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== id)
      );
    } catch (error) {
      console.error("Delete event error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete event."
      );
    }
  }

  function formatDate(date: string) {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatPrice(price: number) {
    if (price === 0) {
      return "Free";
    }

    return `KES ${price.toLocaleString("en-KE")}`;
  }

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {
    return (
      <main className="w-full bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="h-4 w-36 rounded bg-card" />

                <div className="mt-4 h-10 w-56 rounded bg-card sm:h-12" />

                <div className="mt-3 h-5 w-full max-w-xl rounded bg-card" />
              </div>

              <div className="h-11 w-full rounded-xl bg-card sm:w-36" />
            </div>

            {/* Summary skeleton */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="h-4 w-24 rounded bg-background-secondary" />
                  <div className="mt-3 h-8 w-16 rounded bg-background-secondary" />
                </div>
              ))}
            </div>

            {/* Event skeletons */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-52 bg-background-secondary" />

                  <div className="space-y-4 p-5">
                    <div className="h-3 w-24 rounded bg-background-secondary" />
                    <div className="h-6 w-3/4 rounded bg-background-secondary" />
                    <div className="h-4 w-full rounded bg-background-secondary" />
                    <div className="h-4 w-2/3 rounded bg-background-secondary" />

                    <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                      <div className="h-12 rounded bg-background-secondary" />
                      <div className="h-12 rounded bg-background-secondary" />
                    </div>

                    <div className="h-10 rounded bg-background-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error) {
    return (
      <main className="w-full bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <section>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent sm:text-sm">
                  Organizer Workspace
                </p>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  My Events
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                  Manage the events you organize from one centralized
                  workspace.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div
              role="alert"
              className="rounded-2xl border border-red-900/60 bg-red-950/30 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-lg font-bold text-red-400">
                      !
                    </div>

                    <p className="font-semibold text-red-400">
                      Unable to load your events
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-red-300/80">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchEvents}
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
                >
                  Try Again
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ============================================================
     MAIN PAGE
  ============================================================ */

  return (
    <main className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <section>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
                      Organizer Workspace
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    My Events
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">
                    Create, manage, edit, and review the events you
                    organize from one place.
                  </p>
                </div>

                <Link
                  href="/dashboard/events/create"
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 sm:w-auto"
                >
                  <span className="mr-2 text-lg leading-none">+</span>
                  Create Event
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SUMMARY
        ======================================================== */}

        <section className="mt-8 sm:mt-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Events */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                    Total Events
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {events.length.toLocaleString("en-KE")}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                  E
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-foreground-secondary">
                Events currently managed through your organizer workspace.
              </p>
            </div>

            {/* Published / Active */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                    Event Management
                  </p>

                  <p className="mt-3 text-xl font-bold tracking-tight">
                    Centralized
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-400">
                  ✓
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-foreground-secondary">
                Create, edit, view, and delete your events from one
                workspace.
              </p>
            </div>

            {/* Public Events */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                    Public Marketplace
                  </p>

                  <p className="mt-3 text-xl font-bold tracking-tight">
                    Live View
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                  ↗
                </div>
              </div>

              <Link
                href="/events"
                className="mt-3 inline-flex text-xs font-semibold text-accent transition hover:text-accent-hover"
              >
                View public events →
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            EVENT LIST HEADER
        ======================================================== */}

        <section className="mt-10 sm:mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                Your Events
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Event Management
              </h2>

              <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                Select an event to view its details, make changes, or
                remove it.
              </p>
            </div>

            {events.length > 0 && (
              <span className="w-fit rounded-full border border-border bg-background-secondary px-3 py-1.5 text-xs font-medium text-foreground-secondary">
                {events.length}{" "}
                {events.length === 1 ? "event" : "events"}
              </span>
            )}
          </div>
        </section>

        {/* ========================================================
            EMPTY STATE
        ======================================================== */}

        {events.length === 0 ? (
          <section className="mt-6">
            <div className="rounded-2xl border border-dashed border-border-hover bg-card px-6 py-16 text-center sm:px-10 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-bold text-accent">
                +
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Get Started
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                No events yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
                Create your first event and start managing registrations,
                attendees, tickets, and event details.
              </p>

              <Link
                href="/dashboard/events/create"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-accent-hover sm:w-auto"
              >
                Create Your First Event
                <span className="ml-2">→</span>
              </Link>
            </div>
          </section>
        ) : (
          /* ======================================================
             EVENT GRID
          ====================================================== */

          <section className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event._id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-border-hover"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-background-secondary sm:h-56">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        onError={(imageEvent) => {
                          imageEvent.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-background-secondary">
                        <span className="text-4xl font-bold text-foreground-muted">
                          E
                        </span>
                      </div>
                    )}

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Category */}
                    <div className="absolute left-4 top-4 max-w-[70%]">
                      <span className="inline-flex max-w-full truncate rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                        {event.category || "Event"}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4">
                      <span className="rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-xl font-bold tracking-tight">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground-secondary">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="mt-5 space-y-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-xs font-bold text-foreground-muted">
                          L
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                            Location
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-foreground-secondary">
                            {event.location || "Location unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-xs font-bold text-foreground-muted">
                          D
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-foreground-secondary">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-xs font-bold text-foreground-muted">
                          T
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-medium text-foreground-secondary">
                            {event.time || "Time unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5">
                      <div className="min-w-0 rounded-xl bg-background-secondary p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                          Ticket
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold">
                          {formatPrice(event.price)}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl bg-background-secondary p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                          Capacity
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold">
                          {event.capacity.toLocaleString("en-KE")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Link
                        href={`/dashboard/events/${event._id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:text-sm"
                      >
                        View
                      </Link>

                      <Link
                        href={`/dashboard/events/${event._id}/edit`}
                        className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:text-sm"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteEvent(event._id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-900/60 px-3 py-2.5 text-xs font-semibold text-red-400 transition-all duration-200 hover:border-red-700/70 hover:bg-red-950/30 sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================
            MANAGEMENT CTA
        ======================================================== */}

        {events.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Grow Your Events
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    Ready to create another event?
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                    Create another event and continue building your
                    experience on Eventora.
                  </p>
                </div>

                <Link
                  href="/dashboard/events/create"
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover sm:w-auto"
                >
                  Create New Event
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}