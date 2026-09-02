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
          data.message || "Failed to fetch events."
        );
      }

      setEvents(data.events);
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
      "Are you sure you want to delete this event?"
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

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete event."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-card" />
            <div className="mt-4 h-10 w-56 rounded bg-card" />
            <div className="mt-3 h-5 w-80 max-w-full rounded bg-card" />

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="h-52 bg-background-secondary" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-24 rounded bg-background-secondary" />
                    <div className="h-6 w-3/4 rounded bg-background-secondary" />
                    <div className="h-4 w-1/2 rounded bg-background-secondary" />
                    <div className="h-4 w-2/3 rounded bg-background-secondary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Organizer Workspace
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            My Events
          </h1>

          <div className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 p-6">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-border-hover hover:bg-card"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <section>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Organizer Workspace
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                My Events
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Create, manage, and monitor the events you organize.
              </p>
            </div>

            <Link
              href="/dashboard/events/create"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              + Create Event
            </Link>
          </div>
        </section>

        {/* Event count */}
        <div className="mt-8 flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="text-sm text-foreground-secondary">
              Your events
            </p>

            <p className="mt-1 text-2xl font-bold">
              {events.length}
            </p>
          </div>

          <Link
            href="/events"
            className="text-sm font-medium text-foreground-secondary transition hover:text-white"
          >
            View public events →
          </Link>
        </div>

        {/* Empty state */}
        {events.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border-hover bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-xl font-bold text-accent">
              +
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              No events yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              Create your first event and start managing registrations,
              attendees, and ticket sales.
            </p>

            <Link
              href="/dashboard/events/create"
              className="mt-7 inline-flex rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          /* Event grid */
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event._id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-border-hover"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-background-secondary">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />

                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {event.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="line-clamp-2 text-xl font-semibold tracking-tight">
                    {event.title}
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-foreground-secondary">
                    <p className="flex items-start gap-2">
                      <span className="text-foreground-muted">
                        Location
                      </span>
                      <span className="truncate">
                        {event.location}
                      </span>
                    </p>

                    <p className="flex items-start gap-2">
                      <span className="text-foreground-muted">
                        Date
                      </span>
                      <span>
                        {new Date(event.date).toLocaleDateString(
                          "en-KE",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </p>

                    <p className="flex items-start gap-2">
                      <span className="text-foreground-muted">
                        Time
                      </span>
                      <span>{event.time}</span>
                    </p>
                  </div>

                  {/* Event summary */}
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-foreground-muted">
                        Ticket price
                      </p>

                      <p className="mt-1 font-semibold">
                        {event.price === 0
                          ? "Free"
                          : `KES ${event.price.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-foreground-muted">
                        Capacity
                      </p>

                      <p className="mt-1 font-semibold">
                        {event.capacity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Link
                      href={`/dashboard/events/${event._id}`}
                      className="rounded-lg border border-border px-3 py-2 text-center text-xs font-medium transition hover:border-border-hover hover:bg-background-secondary sm:text-sm"
                    >
                      Analytics
                    </Link>

                    <Link
                      href={`/dashboard/events/${event._id}/edit`}
                      className="rounded-lg border border-border px-3 py-2 text-center text-xs font-medium transition hover:border-border-hover hover:bg-background-secondary sm:text-sm"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteEvent(event._id)}
                      className="rounded-lg border border-red-900/70 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-950/40 sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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