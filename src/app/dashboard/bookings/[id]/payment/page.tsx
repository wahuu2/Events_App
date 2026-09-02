"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Booking = {
  _id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  bookingReference: string;
  event: {
    _id: string;
    title: string;
    image: string;
    location: string;
    date: string;
    time: string;
    category: string;
    price: number;
  };
};

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function PaymentMethod({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border p-5 text-left transition ${
        selected
          ? "border-accent bg-accent/10"
          : "border-border bg-background-secondary hover:border-border-hover"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          ✓
        </span>
      )}

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
          selected
            ? "bg-accent text-white"
            : "bg-card text-foreground-secondary"
        }`}
      >
        {title === "M-Pesa" ? "M" : "C"}
      </div>

      <p className="mt-4 font-semibold text-foreground">
        {title}
      </p>

      <p className="mt-1 text-sm text-foreground-secondary">
        {description}
      </p>
    </button>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<"mpesa" | "card">("mpesa");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(
          `/api/bookings/${bookingId}`
        );

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

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  async function handlePayment() {
    if (!booking) return;

    setPaying(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Create the payment
      const createResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
          method,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok || !createData.success) {
        throw new Error(
          createData.message || "Failed to create payment"
        );
      }

      const createdPaymentId = createData.payment.id;

      setPaymentId(createdPaymentId);

      // Simulate a short payment-processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      // Step 2: Simulate successful payment
      const processResponse = await fetch("/api/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: createdPaymentId,
          action: "success",
        }),
      });

      const processData = await processResponse.json();

      if (!processResponse.ok || !processData.success) {
        throw new Error(
          processData.message || "Payment failed"
        );
      }

      setSuccess(
        "Payment successful. Your booking has been confirmed."
      );

      setTimeout(() => {
        router.push(`/dashboard/bookings/${booking._id}`);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Payment failed"
      );
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 rounded bg-card" />
            <div className="h-10 w-72 rounded bg-card" />
            <div className="h-5 w-96 max-w-full rounded bg-card" />

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-64 bg-background-secondary" />

              <div className="space-y-6 p-8">
                <div className="h-4 w-24 rounded bg-background-secondary" />
                <div className="h-8 w-80 rounded bg-background-secondary" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="h-12 rounded bg-background-secondary" />
                  <div className="h-12 rounded bg-background-secondary" />
                  <div className="h-12 rounded bg-background-secondary" />
                  <div className="h-12 rounded bg-background-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-20">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Unable to load payment
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              {error}
            </p>

            <Link
              href="/dashboard/bookings"
              className="mt-7 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return null;
  }

  if (booking.status === "confirmed") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-20">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
              ✓
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Payment Complete
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Booking Already Confirmed
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              This booking has already been paid for and
              confirmed.
            </p>

            <Link
              href={`/dashboard/bookings/${booking._id}`}
              className="mt-7 inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              View Booking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              E
            </div>

            <span className="text-xl font-bold tracking-tight">
              EventApp
            </span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="rounded-lg border border-border-hover px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card"
          >
            My Bookings
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Checkout
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Payment
          </h1>

          <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base">
            Choose your preferred payment method to confirm
            your event booking.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
          <div className="relative h-64 overflow-hidden sm:h-80">
            <img
              src={booking.event.image}
              alt={booking.event.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-flex rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {booking.event.category}
              </span>

              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                {booking.event.title}
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <InfoItem
                label="Location"
                value={booking.event.location}
              />

              <InfoItem
                label="Date"
                value={new Date(
                  booking.event.date
                ).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />

              <InfoItem
                label="Time"
                value={booking.event.time}
              />

              <InfoItem
                label="Tickets"
                value={`${booking.quantity} ${
                  booking.quantity === 1
                    ? "ticket"
                    : "tickets"
                }`}
              />

              <InfoItem
                label="Booking Reference"
                value={booking.bookingReference}
              />
            </div>

            <div className="my-8 border-t border-border" />

            <div>
              <div>
                <h3 className="text-lg font-semibold">
                  Payment Method
                </h3>

                <p className="mt-1 text-sm text-foreground-secondary">
                  Select how you would like to complete this
                  payment.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <PaymentMethod
                  title="M-Pesa"
                  description="Pay using M-Pesa"
                  selected={method === "mpesa"}
                  onClick={() => setMethod("mpesa")}
                />

                <PaymentMethod
                  title="Card"
                  description="Pay using a debit or credit card"
                  selected={method === "card"}
                  onClick={() => setMethod("card")}
                />
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-background-secondary p-5 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground-secondary">
                    Amount to pay
                  </p>

                  <p className="mt-1 text-xs text-foreground-muted">
                    {booking.quantity}{" "}
                    {booking.quantity === 1
                      ? "ticket"
                      : "tickets"}
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                  KES{" "}
                  {booking.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm font-medium text-red-400">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-400">
                  {success}
                </p>

                {paymentId && (
                  <p className="mt-1 text-xs text-emerald-400/70">
                    Payment processed successfully.
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-accent px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying ? (
                <span className="flex items-center gap-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing Payment...
                </span>
              ) : (
                `Pay KES ${booking.totalAmount.toLocaleString()}`
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-foreground-muted">
              This is a development payment flow. No real
              payment will be charged.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={`/dashboard/bookings/${booking._id}`}
            className="text-sm text-foreground-secondary transition hover:text-foreground"
          >
            ← Return to booking
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-foreground-muted">
          EventApp — Discover. Connect. Experience.
        </div>
      </footer>
    </main>
  );
}