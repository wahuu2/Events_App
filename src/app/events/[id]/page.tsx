"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type Organizer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

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
  organizer?: Organizer;
};

type Booking = {
  id: string;
  bookingReference: string;
  quantity: number;
  totalAmount: number;
  status: string;
};

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { isSignedIn } = useUser();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/events/${id}`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch event");
        }

        setEvent(data.event);
      } catch (error) {
        console.error("Failed to fetch event:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  async function handleBooking() {
    if (!event) return;

    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=/events/${event._id}`;
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");
      setBooking(null);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create booking");
      }

      setBooking(data.booking);
    } catch (error) {
      console.error("Booking error:", error);

      setBookingError(
        error instanceof Error
          ? error.message
          : "Failed to create booking"
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-gray-400">Loading event...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="text-3xl font-bold">Event not found</h1>

          <p className="mt-3 text-gray-400">
            {error || "The event you are looking for does not exist."}
          </p>

          <Link
            href="/events"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const eventDate = new Date(event.date);

  const formattedDate = eventDate.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const organizerName =
    event.organizer?.firstName || event.organizer?.lastName
      ? `${event.organizer?.firstName || ""} ${
          event.organizer?.lastName || ""
        }`.trim()
      : "Event Organizer";

  const totalPrice = event.price * quantity;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-5">
        <Link href="/" className="text-xl font-bold">
          EventApp
        </Link>

        <Link
          href="/events"
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          Browse Events
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/events"
          className="mb-8 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Back to Events
        </Link>

        {/* Event image */}
        <div className="overflow-hidden rounded-2xl border border-gray-800">
          <img
            src={event.image}
            alt={event.title}
            className="h-[300px] w-full object-cover md:h-[500px]"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Event information */}
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-400">
              {event.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-6 space-y-3 text-gray-300">
              <p>📍 {event.location}</p>

              <p>📅 {formattedDate}</p>

              <p>⏰ {event.time}</p>
            </div>

            {/* Description */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold">
                About this event
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-400">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold">
                Organizer
              </h2>

              <div className="mt-4 flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
                {event.organizer?.imageUrl ? (
                  <img
                    src={event.organizer.imageUrl}
                    alt={organizerName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
                    {organizerName.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="font-semibold">
                    {organizerName}
                  </p>

                  {event.organizer?.email && (
                    <p className="text-sm text-gray-400">
                      {event.organizer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking section */}
          <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">
              Ticket price
            </p>

            <p className="mt-2 text-3xl font-bold">
              {event.price === 0
                ? "Free"
                : `KES ${event.price.toLocaleString()}`}
            </p>

            <div className="mt-6 border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-400">
                Capacity
              </p>

              <p className="mt-1 font-medium">
                {event.capacity} people
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-6 border-t border-gray-800 pt-6">
              <p className="mb-3 text-sm text-gray-400">
                Number of tickets
              </p>

              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-950 p-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={quantity <= 1 || bookingLoading}
                  className="h-10 w-10 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span className="font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                  disabled={bookingLoading}
                  className="h-10 w-10 rounded-lg border border-gray-700 hover:bg-gray-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Total
                </span>

                <span className="text-xl font-bold">
                  {event.price === 0
                    ? "Free"
                    : `KES ${totalPrice.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Booking error */}
            {bookingError && (
              <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
                <p className="text-sm text-red-300">
                  {bookingError}
                </p>
              </div>
            )}

            {/* Booking success */}
            {booking && (
              <div className="mt-6 rounded-lg border border-green-800 bg-green-950/40 p-4">
                <p className="font-semibold text-green-300">
                  Booking created successfully.
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Reference:
                </p>

                <p className="font-mono text-sm text-white">
                  {booking.bookingReference}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Status: {booking.status}
                </p>
              </div>
            )}

            {/* Book button */}
            {!booking && (
              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingLoading}
                className="mt-6 w-full rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingLoading
                  ? "Processing..."
                  : isSignedIn
                  ? "Confirm Booking"
                  : "Sign In to Book"}
              </button>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}