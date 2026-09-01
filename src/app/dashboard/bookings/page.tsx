"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  _id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price: number;
};

type Booking = {
  _id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  bookingReference: string;
  createdAt: string;
  event: Event;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/bookings");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch bookings"
          );
        }

        setBookings(data.bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-gray-400">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Unable to load bookings
          </h1>

          <p className="mt-3 text-gray-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

 return (
  <main className="min-h-screen bg-gray-950 text-gray-100">
       {/* Page Content */}
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">My Bookings</h1>
        <p className="mt-3 text-gray-400">View and manage the events you have booked.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">No bookings yet</h2>
          <p className="mt-3 text-gray-400">You haven't booked any events yet.</p>
          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-600 transition"
            >
              <img
                src={booking.event.image}
                alt={booking.event.title}
                className="h-56 w-full object-cover"
              />

              <div className="p-6">
                <p className="text-sm text-gray-400">{booking.event.category}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{booking.event.title}</h2>

                <div className="mt-5 space-y-2 text-sm text-gray-300">
                  <p>📍 {booking.event.location}</p>
                  <p>
                    📅{" "}
                    {new Date(booking.event.date).toLocaleDateString("en-KE")}
                  </p>
                  <p>⏰ {booking.event.time}</p>
                </div>

                <div className="mt-6 border-t border-gray-800 pt-5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tickets</span>
                    <span>{booking.quantity}</span>
                  </div>

                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="font-semibold text-white">
                      {booking.totalAmount === 0
                        ? "Free"
                        : `KES ${booking.totalAmount.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="capitalize text-white">{booking.status}</span>
                  </div>
                </div>

                <p className="mt-5 text-xs text-gray-500">
                  Booking reference: {booking.bookingReference}
                </p>

                <Link
                  href={`/dashboard/bookings/${booking._id}`}
                  className="mt-5 block w-full rounded-lg border border-gray-700 px-5 py-3 text-center font-medium hover:bg-gray-800 transition text-white"
                >
                  View Booking
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </main>
);


}