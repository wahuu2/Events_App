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
  status: string;
  bookingReference: string;
  createdAt: string;
  user?: User;
  event?: Event;
};

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/organizer/bookings");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch bookings"
          );
        }

        setBookings(data.bookings);
      } catch (error) {
        console.error("Failed to fetch organizer bookings:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
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

        <div className="flex gap-3">
          <Link
            href="/events"
            className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
          >
            Browse Events
          </Link>

          <Link
            href="/dashboard/organizer"
            className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Organizer
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-bold">
                Event Bookings
              </h1>

              <p className="mt-3 text-gray-400">
                View bookings made for your events.
              </p>
            </div>

            <Link
              href="/dashboard/organizer"
              className="rounded-lg border border-gray-700 px-5 py-3 text-center hover:bg-gray-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-gray-400">
              Loading bookings...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-6">
            <h2 className="font-semibold text-red-400">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-400">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-white px-4 py-2 font-semibold text-black hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
              <h2 className="text-2xl font-semibold">
                No bookings yet
              </h2>

              <p className="mt-3 text-gray-400">
                Bookings for your events will appear here.
              </p>

              <Link
                href="/events"
                className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200"
              >
                Browse Events
              </Link>
            </div>
          )}

        {/* Bookings table */}
        {!loading &&
          !error &&
          bookings.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-800">
              <div className="border-b border-gray-800 bg-gray-900 px-6 py-5">
                <h2 className="text-xl font-semibold">
                  All Bookings
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {bookings.length}{" "}
                  {bookings.length === 1
                    ? "booking"
                    : "bookings"}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-gray-800 bg-gray-900/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Attendee
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Event
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Tickets
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Booking Reference
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => {
                      const attendeeName =
                        `${booking.user?.firstName || ""} ${
                          booking.user?.lastName || ""
                        }`.trim() || "Unknown attendee";

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
                          className="border-b border-gray-800 last:border-0 hover:bg-gray-900/60"
                        >
                          {/* Attendee */}
                          <td className="px-6 py-5">
                            <p className="font-medium">
                              {attendeeName}
                            </p>

                            {booking.user?.email && (
                              <p className="mt-1 text-sm text-gray-500">
                                {booking.user.email}
                              </p>
                            )}
                          </td>

                          {/* Event */}
                          <td className="px-6 py-5">
                            <p className="font-medium">
                              {booking.event?.title ||
                                "Unknown event"}
                            </p>

                            {booking.event?.location && (
                              <p className="mt-1 text-sm text-gray-500">
                                {booking.event.location}
                              </p>
                            )}
                          </td>

                          {/* Tickets */}
                          <td className="px-6 py-5">
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
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-900/40 text-green-400"
                                  : booking.status === "cancelled"
                                  ? "bg-red-900/40 text-red-400"
                                  : "bg-gray-800 text-gray-300"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>

                          {/* Booking reference */}
                          <td className="px-6 py-5 text-sm text-gray-400">
                            {booking.bookingReference}
                          </td>

                          {/* Booking date */}
                          <td className="px-6 py-5 text-sm text-gray-400">
                            {bookingDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}