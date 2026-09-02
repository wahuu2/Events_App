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
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-border" />

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-[300px] animate-pulse bg-background-secondary md:h-[500px]" />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="h-4 w-24 animate-pulse rounded bg-border" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-border" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-border" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-border" />
            </div>

            <div className="h-96 animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-red-400">
              Event unavailable
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Event not found
            </h1>

            <p className="mt-4 leading-7 text-foreground-secondary">
              {error ||
                "The event you are looking for does not exist or is no longer available."}
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex items-center rounded-lg bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover"
            >
              ← Back to Events
            </Link>
          </div>
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
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
         <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Event Image */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <img
            src={event.image}
            alt={event.title}
            className="h-[280px] w-full object-cover md:h-[480px] lg:h-[540px]"
          />

          <div className="absolute left-5 top-5 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {event.category}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Main Event Information */}
          <div>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                {event.category}
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>
            </div>

            {/* Event Metadata */}
            <div className="mt-8 grid gap-4 border-y border-border py-7 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Location
                </p>

                <p className="mt-2 font-medium text-foreground">
                  {event.location}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Date
                </p>

                <p className="mt-2 font-medium text-foreground">
                  {eventDate.toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Time
                </p>

                <p className="mt-2 font-medium text-foreground">
                  {event.time}
                </p>
              </div>
            </div>

            {/* About */}
            <div className="mt-12 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                About the event
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                What to expect
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-foreground-secondary">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="mt-12 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Hosted by
              </p>

              <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                {event.organizer?.imageUrl ? (
                  <img
                    src={event.organizer.imageUrl}
                    alt={organizerName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                    {organizerName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-semibold">
                    {organizerName}
                  </p>

                  {event.organizer?.email && (
                    <p className="mt-1 truncate text-sm text-foreground-muted">
                      {event.organizer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Ticket price
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {event.price === 0
                    ? "Free"
                    : `KES ${event.price.toLocaleString()}`}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">
                    Capacity
                  </span>

                  <span className="text-sm font-medium">
                    {event.capacity} people
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6 border-t border-border pt-6">
                <p className="mb-3 text-sm font-medium">
                  Number of tickets
                </p>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    disabled={quantity <= 1 || bookingLoading}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    {event.price === 0
                      ? "Free"
                      : `KES ${totalPrice.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Booking Error */}
              {bookingError && (
                <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
                  <p className="text-sm leading-6 text-red-300">
                    {bookingError}
                  </p>
                </div>
              )}

              {/* Booking Success */}
              {booking && (
                <div className="mt-6 rounded-xl border border-green-900/60 bg-green-950/30 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                      ✓
                    </span>

                    <p className="font-semibold text-green-300">
                      Booking created
                    </p>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-wider text-foreground-muted">
                    Booking reference
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-white">
                    {booking.bookingReference}
                  </p>

                  <p className="mt-3 text-sm text-foreground-secondary">
                    Status:{" "}
                    <span className="font-medium text-white">
                      {booking.status}
                    </span>
                  </p>
                </div>
              )}

              {/* Book Button */}
              {!booking && (
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="mt-6 w-full rounded-lg bg-accent px-5 py-3.5 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingLoading
                    ? "Processing..."
                    : isSignedIn
                    ? "Confirm Booking"
                    : "Sign In to Book"}
                </button>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-foreground-muted">
                Secure your place through the EventApp booking system.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}