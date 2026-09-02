"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalEvents: number;
  totalBookings: number;
  ticketsSold: number;
  totalRevenue: number;
};

const statCards = [
  {
    label: "My Events",
    description: "Events created by you",
    key: "totalEvents",
  },
  {
    label: "Total Bookings",
    description: "Confirmed bookings",
    key: "totalBookings",
  },
  {
    label: "Tickets Sold",
    description: "Tickets across your events",
    key: "ticketsSold",
  },
  {
    label: "Total Revenue",
    description: "From confirmed bookings",
    key: "totalRevenue",
  },
] as const;

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalBookings: 0,
    ticketsSold: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setError("");

        const response = await fetch("/api/organizer/stats");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch organizer statistics."
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch organizer stats:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load organizer statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatStatValue = (
    key: (typeof statCards)[number]["key"]
  ) => {
    if (loading) {
      return "...";
    }

    if (key === "totalRevenue") {
      return `KES ${stats.totalRevenue.toLocaleString()}`;
    }

    return stats[key].toLocaleString();
  };

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
                Organizer Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Manage your events, monitor bookings, and track your
                ticket sales from one place.
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Manage Events
            </Link>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Statistics */}
        <section className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="rounded-xl border border-border bg-card p-6 transition hover:border-border-hover"
              >
                <p className="text-sm font-medium text-foreground-secondary">
                  {card.label}
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {formatStatValue(card.key)}
                </p>

                <p className="mt-2 text-sm text-foreground-muted">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Organizer Actions */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Organizer Tools
            </h2>

            <p className="mt-1 text-sm text-foreground-secondary">
              Manage your events and monitor attendee activity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/dashboard/events"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-border-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  +
                </div>

                <span className="text-foreground-muted transition group-hover:translate-x-1 group-hover:text-foreground">
                  →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Manage Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                Create, edit, manage, and delete your events.
              </p>
            </Link>

            <Link
              href="/dashboard/organizer/bookings"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-border-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  #
                </div>

                <span className="text-foreground-muted transition group-hover:translate-x-1 group-hover:text-foreground">
                  →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                View Bookings
              </h3>

              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                Review attendees, bookings, and ticket information.
              </p>
            </Link>

            <Link
              href="/events"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-border-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  ↗
                </div>

                <span className="text-foreground-muted transition group-hover:translate-x-1 group-hover:text-foreground">
                  →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Browse Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                View the public EventApp event marketplace.
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 rounded-2xl border border-border bg-background-secondary p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">
                Build your next experience
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Ready to create another event?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-foreground-secondary">
                Create an event and start managing registrations,
                attendees, and ticket sales.
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="inline-flex w-fit shrink-0 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Go to Events
            </Link>
          </div>
        </section>

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