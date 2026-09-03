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
    icon: "E",
  },
  {
    label: "Total Bookings",
    description: "Registrations across your events",
    key: "totalBookings",
    icon: "B",
  },
  {
    label: "Tickets Sold",
    description: "Tickets across your events",
    key: "ticketsSold",
    icon: "T",
  },
  {
    label: "Total Revenue",
    description: "Revenue from confirmed bookings",
    key: "totalRevenue",
    icon: "K",
  },
] as const;

const organizerTools = [
  {
    href: "/dashboard/events",
    icon: "E",
    eyebrow: "EVENT MANAGEMENT",
    title: "Manage Events",
    description:
      "Create, edit, view, and manage the events you organize from one place.",
  },
  {
    href: "/dashboard/organizer/bookings",
    icon: "B",
    eyebrow: "ATTENDEES",
    title: "View Bookings",
    description:
      "Review attendee registrations, booking quantities, payments, and activity.",
  },
  {
    href: "/dashboard/organizer/tickets",
    icon: "✓",
    eyebrow: "EVENT CHECK-IN",
    title: "Ticket Check-In",
    description:
      "Verify attendee ticket numbers and confirm whether they can enter your event.",
  },
];

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalBookings: 0,
    ticketsSold: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStats() {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchStats();
  }, []);

  function formatStatValue(
    key: (typeof statCards)[number]["key"]
  ) {
    if (loading) {
      return "...";
    }

    if (key === "totalRevenue") {
      return `KES ${stats.totalRevenue.toLocaleString("en-KE")}`;
    }

    return stats[key].toLocaleString("en-KE");
  }

  return (
    <main className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <section>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
                      Organizer Workspace
                    </span>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Run your events with confidence.
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">
                    Manage your events, monitor bookings, track ticket
                    sales, and verify attendees from one centralized
                    workspace.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <Link
                    href="/dashboard/events"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-border-hover px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:w-auto"
                  >
                    Manage Events
                  </Link>

                  <Link
                    href="/dashboard/events/create"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 sm:w-auto"
                  >
                    <span className="mr-2 text-lg leading-none">+</span>
                    Create Event
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {error && (
          <section className="mt-6">
            <div
              role="alert"
              className="rounded-2xl border border-red-900/60 bg-red-950/30 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-400">
                    Unable to load organizer statistics
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-300/80">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchStats}
                  className="w-fit shrink-0 rounded-xl border border-red-800/60 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950/50"
                >
                  Try Again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            STATISTICS
        ========================================================= */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
              Performance Overview
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              Your numbers at a glance
            </h2>

            <p className="mt-1 text-sm leading-6 text-foreground-secondary">
              A quick overview of your event activity and performance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="group min-w-0 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-bold text-accent">
                    {card.icon}
                  </div>

                  <span className="text-xs font-medium text-foreground-muted">
                    {loading ? "Loading" : "Current"}
                  </span>
                </div>

                <div className="mt-6 min-w-0">
                  <p className="text-sm font-medium text-foreground-secondary">
                    {card.label}
                  </p>

                  <p className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatStatValue(card.key)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-foreground-muted sm:text-sm">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            ORGANIZER TOOLS
        ========================================================= */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
              Workspace
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              Organizer tools
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-secondary">
              Everything currently available for managing your events,
              attendees, and ticket entry.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {organizerTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group min-w-0 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-border-hover hover:bg-card-hover sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent transition-transform duration-200 group-hover:scale-105">
                    {tool.icon}
                  </div>

                  <span className="text-xl text-foreground-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground">
                    →
                  </span>
                </div>

                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  {tool.eyebrow}
                </p>

                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {tool.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  {tool.description}
                </p>

                <div className="mt-5 flex items-center text-sm font-medium text-foreground-secondary transition-colors group-hover:text-foreground">
                  Open workspace

                  <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            EVENT MANAGEMENT CTA
        ========================================================= */}
        <section className="mt-10 sm:mt-12">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-secondary p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    E
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Event Management
                  </p>
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
                  Build and manage your next event.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                  Use the main event management workspace to create new
                  events, update existing events, and review your event
                  details.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <Link
                  href="/dashboard/events"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border-hover px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-card sm:w-auto"
                >
                  View Events
                  <span className="ml-2">→</span>
                </Link>

                <Link
                  href="/dashboard/events/create"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover sm:w-auto"
                >
                  Create Event
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PUBLIC MARKETPLACE
        ========================================================= */}
        <section className="mt-6 sm:mt-8">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                    ↗
                  </span>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Public Marketplace
                  </p>
                </div>

                <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                  Preview Eventora as an attendee.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                  Explore the public events marketplace and see how
                  attendees discover and view available events.
                </p>
              </div>

              <Link
                href="/events"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-xl border border-border-hover px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:w-auto"
              >
                Browse Events
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            BOTTOM CTA
        ========================================================= */}
        <section className="mt-6 sm:mt-8">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  Ready when you are
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Create your next event.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-foreground-secondary sm:text-base">
                  Start with the event details, then manage bookings and
                  verify attendees from your organizer workspace.
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
      </div>
    </main>
  );
}