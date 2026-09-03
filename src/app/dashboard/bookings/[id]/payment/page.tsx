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
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-foreground">
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
      aria-pressed={selected}
      className={`relative w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
        selected
          ? "border-accent bg-accent/10 shadow-lg shadow-blue-500/5"
          : "border-border bg-background-secondary hover:border-border-hover hover:bg-card-hover"
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          ✓
        </span>
      )}

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${
          selected
            ? "bg-accent text-white"
            : "bg-card text-foreground-secondary"
        }`}
      >
        {title === "M-Pesa" ? "M" : "C"}
      </div>

      <p className="mt-4 font-bold text-foreground">{title}</p>

      <p className="mt-1 text-sm leading-5 text-foreground-secondary">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
        <span
          className={
            selected
              ? "text-accent"
              : "text-foreground-muted"
          }
        >
          {selected ? "Selected" : "Select method"}
        </span>
      </div>
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
        setLoading(true);
        setError("");

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

      // Development-only payment simulation
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
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="h-3 w-24 rounded bg-background" />
            <div className="mt-4 h-8 w-64 rounded bg-background" />
            <div className="mt-3 h-4 w-full max-w-lg rounded bg-background" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-56 bg-background-secondary sm:h-72 lg:h-80" />

            <div className="space-y-6 p-5 sm:p-7">
              <div className="h-5 w-32 rounded bg-background-secondary" />
              <div className="h-8 w-2/3 rounded bg-background-secondary" />

              <div className="grid gap-5 sm:grid-cols-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-12 rounded-xl bg-background-secondary"
                  />
                ))}
              </div>

              <div className="h-40 rounded-2xl bg-background-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-400">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold sm:text-2xl">
            Unable to load payment
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
            {error}
          </p>

          <Link
            href="/dashboard/bookings"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  if (booking.status === "confirmed") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-xl font-bold text-green-400">
            ✓
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Payment Complete
          </p>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Booking Already Confirmed
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
            This booking has already been paid for and
            confirmed. No additional payment is required.
          </p>

          <Link
            href={`/dashboard/bookings/${booking._id}`}
            className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
          >
            View Booking
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(
    booking.event.date
  ).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const amount = booking.totalAmount.toLocaleString("en-KE");

  return (
    <div className="w-full">
      {/* Checkout Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              Dashboard
            </span>

            <span className="text-xs text-foreground-muted">
              /
            </span>

            <Link
              href="/dashboard/bookings"
              className="text-xs font-medium text-foreground-muted transition hover:text-foreground"
            >
              Bookings
            </Link>

            <span className="text-xs text-foreground-muted">
              /
            </span>

            <span className="text-xs font-medium text-foreground-muted">
              Payment
            </span>
          </div>

          <div className="mt-5 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Checkout
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Complete Payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base">
              Choose your preferred payment method to confirm
              your event booking.
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Card */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Event Preview */}
        <div className="relative h-60 sm:h-72 lg:h-80">
          {booking.event.image ? (
            <img
              src={booking.event.image}
              alt={booking.event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background-secondary text-4xl font-bold text-foreground-muted">
              E
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <span className="inline-flex max-w-full rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md">
              {booking.event.category}
            </span>

            <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {booking.event.title}
            </h2>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          {/* Booking Details */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Booking Summary
                </p>

                <h3 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">
                  Event Details
                </h3>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent sm:flex">
                B
              </div>
            </div>

            <div className="mt-6 grid gap-5 rounded-2xl border border-border bg-background-secondary/40 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              <InfoItem
                label="Location"
                value={booking.event.location}
              />

              <InfoItem
                label="Date"
                value={formattedDate}
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
          </div>

          <div className="my-8 border-t border-border" />

          {/* Payment Method */}
          <div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Payment
              </p>

              <h3 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">
                Choose Payment Method
              </h3>

              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
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

          {/* Amount */}
          <div className="mt-7 rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                  Amount to Pay
                </p>

                <p className="mt-2 text-sm text-foreground-secondary">
                  {booking.quantity}{" "}
                  {booking.quantity === 1
                    ? "ticket"
                    : "tickets"}
                </p>
              </div>

              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                KES {amount}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <p className="text-sm font-medium leading-6 text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-xs font-bold text-green-400">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-400">
                    {success}
                  </p>

                  {paymentId && (
                    <p className="mt-1 text-xs text-green-400/70">
                      Payment processed successfully. Redirecting
                      you to your booking...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePayment}
            disabled={paying}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying ? (
              <span className="flex items-center gap-3">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing Payment...
              </span>
            ) : (
              `Pay KES ${amount}`
            )}
          </button>

          <div className="mt-4 flex items-start justify-center gap-2 text-center">
            <span className="mt-0.5 text-xs text-foreground-muted">
              Development mode
            </span>

            <p className="max-w-md text-xs leading-5 text-foreground-muted">
              This is a development payment flow. No real
              payment will be charged.
            </p>
          </div>
        </div>
      </section>

    
    </div>
  );
}