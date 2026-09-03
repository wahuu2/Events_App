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
          error instanceof Error ? error.message : "Failed to load event"
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
        error instanceof Error ? error.message : "Failed to create booking"
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="h-5 w-32 animate-pulse rounded bg-border" />

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card sm:mt-8">
            <div className="aspect-[16/10] animate-pulse bg-background-secondary sm:aspect-[16/8] lg:aspect-[16/7]" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <div className="space-y-5">
              <div className="h-3 w-24 animate-pulse rounded bg-border" />
              <div className="h-10 w-full max-w-3xl animate-pulse rounded bg-border sm:h-12" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-border" />

              <div className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-3">
                <div className="h-16 animate-pulse rounded bg-card" />
                <div className="h-16 animate-pulse rounded bg-card" />
                <div className="h-16 animate-pulse rounded bg-card" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="h-3 w-28 animate-pulse rounded bg-border" />
                <div className="h-7 w-52 animate-pulse rounded bg-border" />
                <div className="h-4 w-full animate-pulse rounded bg-border" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-border" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-border" />
              </div>
            </div>

            <div className="h-[520px] animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-900/60 bg-red-950/30 text-red-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5M12 16h.01" />
              </svg>
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Event unavailable
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Event not found
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-foreground-secondary sm:text-base">
              {error ||
                "The event you are looking for does not exist or is no longer available."}
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
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

  const shortDate = eventDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const organizerName =
    event.organizer?.firstName || event.organizer?.lastName
      ? `${event.organizer?.firstName || ""} ${
          event.organizer?.lastName || ""
        }`.trim()
      : "Event Organizer";

  const totalPrice = event.price * quantity;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Top Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="hidden rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground-secondary transition-all hover:border-border-hover hover:bg-card hover:text-foreground sm:inline-flex"
          >
            All Events
          </Link>

          <Link
            href="/dashboard"
            className="hidden rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground-secondary transition-all hover:border-border-hover hover:bg-card hover:text-foreground sm:inline-flex"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7]">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
              <span className="inline-flex max-w-[calc(100vw-3rem)] truncate rounded-lg border border-white/10 bg-black/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-xs">
                {event.category}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                    Eventora experience
                  </p>

                  <p className="mt-1 text-sm font-medium text-white sm:text-base">
                    {shortDate}
                    {event.time ? ` • ${event.time}` : ""}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-white/10 bg-black/65 px-4 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Admission
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-white sm:text-base">
                    {event.price === 0
                      ? "Free"
                      : `KES ${event.price.toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14">
            {/* Main Event Information */}
            <div className="min-w-0">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="text-accent">{event.category}</span>
                  <span className="text-foreground-muted">/</span>
                  <span className="text-foreground-muted">
                    Event details
                  </span>
                </div>

                <h1 className="mt-4 break-words text-4xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-5xl md:text-6xl lg:text-7xl">
                  {event.title}
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-foreground-secondary sm:text-base sm:leading-8 md:text-lg">
                  Join this experience and reserve your place through
                  Eventora.
                </p>
              </div>

              {/* Event Metadata */}
              <div className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3">
                <div className="min-w-0 border-b border-border p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.2" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        Location
                      </p>
                      <p className="mt-1.5 break-words text-sm font-semibold text-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 border-b border-border p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="17"
                          rx="2"
                        />
                        <path d="M16 2v4M8 2v4M3 9h18" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        Date
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        Time
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {event.time || "Time to be announced"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="mt-12 max-w-4xl sm:mt-14">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  About the event
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  What to expect
                </h2>

                <div className="mt-5 rounded-2xl border border-border bg-background-secondary/40 p-5 sm:p-7">
                  <p className="whitespace-pre-line text-sm leading-7 text-foreground-secondary sm:text-base sm:leading-8">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Organizer */}
              <div className="mt-12 max-w-4xl sm:mt-14">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Hosted by
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Your event organizer
                </h2>

                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
                  {event.organizer?.imageUrl ? (
                    <img
                      src={event.organizer.imageUrl}
                      alt={organizerName}
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-lg shadow-blue-500/10 sm:h-16 sm:w-16">
                      {organizerName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="break-words text-base font-bold sm:text-lg">
                      {organizerName}
                    </p>

                    {event.organizer?.email && (
                      <p className="mt-1 break-all text-sm text-foreground-muted">
                        {event.organizer.email}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-foreground-secondary">
                      Event organizer
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Booking Summary */}
              <div className="mt-12 rounded-2xl border border-border bg-background-secondary p-5 lg:hidden">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground-muted">
                      Ticket price
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {event.price === 0
                        ? "Free"
                        : `KES ${event.price.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground-muted">
                      Capacity
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {event.capacity} people
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <aside className="min-w-0 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                {/* Card Header */}
                <div className="border-b border-border bg-background-secondary/50 p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Reserve your place
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                    Book this event
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    Select the number of tickets you need and confirm your
                    booking.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  {/* Price */}
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                        Ticket price
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        {event.price === 0
                          ? "Free"
                          : `KES ${event.price.toLocaleString()}`}
                      </p>
                    </div>

                    <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground-secondary">
                      {event.category}
                    </span>
                  </div>

                  {/* Capacity */}
                  <div className="mt-6 rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-foreground-muted">
                        Event capacity
                      </span>

                      <span className="text-sm font-bold">
                        {event.capacity} people
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Number of tickets
                        </p>
                        <p className="mt-1 text-xs text-foreground-muted">
                          Select your quantity
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center rounded-xl border border-border bg-background p-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) =>
                              Math.max(1, current - 1)
                            )
                          }
                          disabled={quantity <= 1 || bookingLoading}
                          aria-label="Decrease ticket quantity"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg font-medium transition-all hover:bg-card hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="flex h-9 min-w-10 items-center justify-center px-2 text-sm font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((current) => current + 1)
                          }
                          disabled={bookingLoading}
                          aria-label="Increase ticket quantity"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg font-medium transition-all hover:bg-card hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground-muted">
                          Total
                        </p>

                        <p className="mt-1 text-sm text-foreground-secondary">
                          {quantity}{" "}
                          {quantity === 1 ? "ticket" : "tickets"}
                        </p>
                      </div>

                      <span className="text-2xl font-bold tracking-tight">
                        {event.price === 0
                          ? "Free"
                          : `KES ${totalPrice.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Booking Error */}
                  {bookingError && (
                    <div
                      className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 p-4"
                      role="alert"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                          !
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-red-300">
                            Booking could not be completed
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-300/80">
                            {bookingError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Success */}
                  {booking && (
                    <div className="mt-6 rounded-xl border border-green-900/60 bg-green-950/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                          ✓
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold text-green-300">
                            Booking created
                          </p>

                          <p className="mt-1 text-xs leading-5 text-green-300/70">
                            Your reservation has been successfully created.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-green-900/50 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
                          Booking reference
                        </p>

                        <p className="mt-1 break-all font-mono text-sm font-semibold text-white">
                          {booking.bookingReference}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs text-foreground-muted">
                            Status
                          </span>

                          <span className="rounded-full border border-green-900/60 bg-green-500/10 px-2.5 py-1 text-xs font-semibold capitalize text-green-300">
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-border-hover bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-card"
                      >
                        View Booking
                        <span className="ml-2">→</span>
                      </Link>
                    </div>
                  )}

                  {/* Book Button */}
                  {!booking && (
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {isSignedIn
                            ? "Confirm Booking"
                            : "Sign In to Book"}
                          <span className="ml-2">→</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="mt-5 border-t border-border pt-5">
                    <div className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      >
                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                        />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>

                      <p className="text-xs leading-5 text-foreground-muted">
                        Your booking is processed securely through the
                        Eventora booking system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Quick Info */}
              <div className="mt-4 hidden rounded-2xl border border-border bg-background-secondary p-5 lg:block">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground-muted">
                  Event summary
                </p>

                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-foreground-muted">
                      Date
                    </span>
                    <span className="text-right text-sm font-semibold">
                      {shortDate}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-foreground-muted">
                      Time
                    </span>
                    <span className="text-right text-sm font-semibold">
                      {event.time || "TBA"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-foreground-muted">
                      Location
                    </span>
                    <span className="max-w-[200px] text-right text-sm font-semibold">
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}