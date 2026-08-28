"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: string;
};

export default function BookingDetailsPage() {
  const params = useParams();

  const id = params.id as string;

 const [booking, setBooking] = useState<Booking | null>(null);
const [ticket, setTicket] = useState<Ticket | null>(null);
const [loading, setLoading] = useState(true);
const [ticketLoading, setTicketLoading] = useState(false);
const [error, setError] = useState("");
const [ticketError, setTicketError] = useState("");
const [ticketExists, setTicketExists] = useState(false);
  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/bookings/${id}`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch booking"
          );
        }

        setBooking(data.booking);
      } catch (error) {
        console.error("Failed to fetch booking:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booking"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBooking();
    }
  }, [id]);

  async function generateTicket() {
    if (!booking) return;

    try {
      setTicketLoading(true);
      setTicketError("");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate ticket"
        );
      }

      if (!data.tickets || data.tickets.length === 0) {
        throw new Error("No ticket was generated.");
      }

      setTicket(data.tickets[0]);
setTicketExists(data.alreadyExists === true);
    } catch (error) {
      console.error("Generate ticket error:", error);

      setTicketError(
        error instanceof Error
          ? error.message
          : "Failed to generate ticket."
      );
    } finally {
      setTicketLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-gray-400">
            Loading booking...
          </p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Booking not found
          </h1>

          <p className="mt-3 text-gray-400">
            {error ||
              "The booking you are looking for does not exist."}
          </p>

          <Link
            href="/dashboard/bookings"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  const eventDate = new Date(booking.event.date);

  const formattedDate = eventDate.toLocaleDateString(
    "en-KE",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
          href="/dashboard/bookings"
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          My Bookings
        </Link>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Back */}
        <Link
          href="/dashboard/bookings"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to My Bookings
        </Link>

        {/* Booking header */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          <img
            src={booking.event.image}
            alt={booking.event.title}
            className="h-72 w-full object-cover md:h-96"
          />

          <div className="p-6 md:p-8">
            <p className="text-sm uppercase tracking-widest text-gray-400">
              {booking.event.category}
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              {booking.event.title}
            </h1>

            <div className="mt-6 space-y-3 text-gray-300">
              <p>📍 {booking.event.location}</p>

              <p>📅 {formattedDate}</p>

              <p>⏰ {booking.event.time}</p>
            </div>
          </div>
        </div>

        {/* Booking information */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Ticket information */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">
              Booking Information
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Tickets
                </span>

                <span className="font-medium">
                  {booking.quantity}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Ticket price
                </span>

                <span>
                  {booking.event.price === 0
                    ? "Free"
                    : `KES ${booking.event.price.toLocaleString()}`}
                </span>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    {booking.totalAmount === 0
                      ? "Free"
                      : `KES ${booking.totalAmount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">
              Booking Status
            </h2>

            <div className="mt-6">
              <p className="text-sm text-gray-400">
                Status
              </p>

              <p className="mt-2 text-lg font-semibold capitalize">
                {booking.status}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">
                Booking Reference
              </p>

              <p className="mt-2 break-all font-mono text-sm">
                {booking.bookingReference}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">
                Booked on
              </p>

              <p className="mt-2">
                {new Date(
                  booking.createdAt
                ).toLocaleDateString("en-KE")}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket generation */}
        {booking.status === "confirmed" && (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">
              Digital Ticket
            </h2>

            <p className="mt-2 text-gray-400">
              Your booking is confirmed. Generate your digital
              ticket to attend the event.
            </p>

            {ticketError && (
              <div className="mt-4 rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300">
                {ticketError}
              </div>
            )}

            {!ticket ? (
              <button
                onClick={generateTicket}
                disabled={ticketLoading}
                className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ticketLoading
                  ? "Generating Ticket..."
                  : "Generate Ticket"}
              </button>
            ) : (
              <div className="mt-6 rounded-xl border border-green-800 bg-green-950 p-5">
                <p className="text-sm text-green-400">
  ✓{" "}
  {ticketExists
    ? "You already have a ticket for this booking."
    : "Ticket generated successfully."}
</p>

                <p className="mt-3 text-sm text-gray-400">
                  Ticket Number
                </p>

                <p className="mt-1 font-mono text-lg font-bold">
                  {ticket.ticketNumber}
                </p>

                <p className="mt-3 text-sm">
                  Status:{" "}
                  <span className="font-semibold capitalize text-green-400">
                    {ticket.status}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

       {/* Actions */}
<div className="mt-8 flex flex-wrap gap-4">
  {booking.status === "pending" && booking.totalAmount > 0 && (
    <Link
      href={`/dashboard/bookings/${booking._id}/payment`}
      className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
    >
      Pay Now
    </Link>
  )}

  {booking.status === "confirmed" && (
    <Link
      href={`/dashboard/bookings/${booking._id}/ticket`}
      className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
    >
      View Ticket
    </Link>
  )}

  <Link
    href={`/events/${booking.event._id}`}
    className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
  >
    View Event
  </Link>

  <Link
    href="/dashboard/bookings"
    className="rounded-lg border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-800"
  >
    All My Bookings
  </Link>
</div>
      </section>
    </main>
  );
}