"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalEvents: number;
  totalBookings: number;
  ticketsSold: number;
  totalRevenue: number;
};

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
        const response = await fetch("/api/organizer/stats");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch statistics"
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch organizer stats:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-5">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          EventApp
        </Link>

        <Link
          href="/events"
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          Browse Events
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Organizer
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Organizer Dashboard
          </h1>

          <p className="mt-3 text-gray-400">
            Manage your events and track your ticket sales.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-5">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Events */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              My Events
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "..." : stats.totalEvents}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Events created by you
            </p>
          </div>

          {/* Bookings */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Total Bookings
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "..." : stats.totalBookings}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Confirmed bookings
            </p>
          </div>

          {/* Tickets */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Tickets Sold
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "..." : stats.ticketsSold}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tickets across your events
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Total Revenue
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading
                ? "..."
                : `KES ${stats.totalRevenue.toLocaleString()}`}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              From confirmed bookings
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Link
            href="/dashboard/events"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-600"
          >
            <h2 className="text-xl font-semibold">
              Manage Events
            </h2>

            <p className="mt-2 text-gray-400">
              Create, edit and delete your events.
            </p>
          </Link>

          <Link
            href="/dashboard/organizer/bookings"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-600"
          >
            <h2 className="text-xl font-semibold">
              View Bookings
            </h2>

            <p className="mt-2 text-gray-400">
              See attendees and ticket bookings.
            </p>
          </Link>

          <Link
            href="/events"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-600"
          >
            <h2 className="text-xl font-semibold">
              Browse Events
            </h2>

            <p className="mt-2 text-gray-400">
              View the public event marketplace.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}