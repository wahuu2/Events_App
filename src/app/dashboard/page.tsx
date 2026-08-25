"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  firstName?: string;
  lastName?: string;
  role?: "user" | "organizer";
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/test-user");
        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-white" />
          <p className="mt-4 text-sm text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  const isOrganizer = user?.role === "organizer";

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black transition group-hover:scale-105">
              E
            </div>

            <div>
              <p className="font-bold tracking-tight">EventApp</p>
              <p className="text-xs text-gray-500">Your events. Your world.</p>
            </div>
          </Link>

          <Link
            href="/events"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/10"
          >
            Browse Events →
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl md:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                Dashboard
              </span>

              {isOrganizer ? (
                <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                  Organizer Account
                </span>
              ) : (
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  Attendee Account
                </span>
              )}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Welcome
              {user?.firstName && (
                <>
                  ,{" "}
                  <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                    {user.firstName}
                  </span>
                </>
              )}
              .
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              Everything you need to manage your EventApp experience,
              from discovering events to keeping track of your tickets.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/events"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-gray-200"
              >
                Explore Events
              </Link>

              <Link
                href="/dashboard/bookings"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </section>

        {/* Quick stats */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Account Type</span>
              <span className="text-xl">◈</span>
            </div>

            <p className="mt-4 text-2xl font-bold">
              {isOrganizer ? "Organizer" : "Attendee"}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {isOrganizer
                ? "You can create and manage events."
                : "Discover and book amazing events."}
            </p>
          </div>

          <Link
            href="/dashboard/bookings"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Tickets</span>
              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold">My Bookings</p>

            <p className="mt-2 text-sm text-gray-500">
              View your booked events and ticket details.
            </p>
          </Link>

          {isOrganizer ? (
            <Link
              href="/dashboard/organizer"
              className="group rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-6 transition hover:-translate-y-1 hover:bg-purple-500/[0.08]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">
                  Organizer
                </span>
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold">
                Organizer Dashboard
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Manage events, bookings and performance.
              </p>
            </Link>
          ) : (
            <Link
              href="/events"
              className="group rounded-2xl border border-blue-400/10 bg-blue-500/[0.05] p-6 transition hover:-translate-y-1 hover:bg-blue-500/[0.08]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-300">
                  Discover
                </span>
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-4 text-2xl font-bold">
                Find Events
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Explore upcoming events around you.
              </p>
            </Link>
          )}
        </section>

        {/* Quick actions */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">
              Quick Actions
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              What would you like to do?
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/events"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-7 transition hover:-translate-y-1 hover:border-blue-400/20"
            >
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                  ✦
                </div>

                <h3 className="text-xl font-semibold">
                  Discover Events
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Find concerts, conferences, Christian events,
                  sports and more.
                </p>

                <p className="mt-5 text-sm font-semibold text-gray-300">
                  Browse events →
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent p-7 transition hover:-translate-y-1 hover:border-purple-400/20"
            >
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                  ✓
                </div>

                <h3 className="text-xl font-semibold">
                  Manage My Bookings
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  View your tickets, booking references and event
                  information.
                </p>

                <p className="mt-5 text-sm font-semibold text-gray-300">
                  View bookings →
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Organizer section */}
        {isOrganizer && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-purple-400/10 bg-gradient-to-r from-purple-500/[0.08] to-transparent p-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-purple-300">
                  Organizer tools
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Build your next event
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Create events, monitor bookings, manage attendees
                  and track your event performance.
                </p>
              </div>

              <Link
                href="/dashboard/organizer"
                className="shrink-0 rounded-xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-gray-200"
              >
                Open Organizer Dashboard
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-600">
            EventApp · Discover. Book. Experience.
          </p>
        </div>
      </div>
    </main>
  );
}