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
      "Payment successful! Your booking has been confirmed."
    );

    // Give the user a moment to see the success message
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
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-gray-400">
            Loading payment...
          </p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Unable to load payment
          </h1>

          <p className="mt-3 text-gray-400">
            {error}
          </p>

          <Link
            href="/dashboard/bookings"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            Back to bookings
          </Link>
        </div>
      </main>
    );
  }

  if (!booking) {
    return null;
  }

  if (booking.status === "confirmed") {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold">
            Booking Already Confirmed
          </h1>

          <p className="mt-3 text-gray-400">
            This booking has already been paid for.
          </p>

          <Link
            href={`/dashboard/bookings/${booking._id}`}
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black"
          >
            View Booking
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            EventApp
          </Link>

          <Link
            href="/dashboard/bookings"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            My Bookings
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Checkout
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Complete Payment
        </h1>

        <p className="mt-3 text-gray-400">
          Complete your payment to confirm your booking.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          <img
            src={booking.event.image}
            alt={booking.event.title}
            className="h-64 w-full object-cover"
          />

          <div className="p-8">
            <p className="text-sm text-gray-500">
              {booking.event.category}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {booking.event.title}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Location
                </p>

                <p className="mt-1">
                  {booking.event.location}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Date
                </p>

                <p className="mt-1">
                  {new Date(
                    booking.event.date
                  ).toLocaleDateString("en-KE")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Tickets
                </p>

                <p className="mt-1">
                  {booking.quantity}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Booking Reference
                </p>

                <p className="mt-1">
                  {booking.bookingReference}
                </p>
              </div>
            </div>

            <div className="my-8 border-t border-gray-800" />

            <h3 className="text-xl font-semibold">
              Payment Method
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod("mpesa")}
                className={`rounded-xl border p-5 text-left transition ${
                  method === "mpesa"
                    ? "border-white bg-gray-800"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <p className="font-semibold">
                  M-Pesa
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Pay using M-Pesa
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`rounded-xl border p-5 text-left transition ${
                  method === "card"
                    ? "border-white bg-gray-800"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <p className="font-semibold">
                  Card
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Pay using a card
                </p>
              </button>
            </div>

            <div className="mt-8 rounded-xl bg-gray-950 p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  KES{" "}
                  {booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-lg border border-green-900 bg-green-950/40 p-4 text-sm text-green-300">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="mt-6 w-full rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying
                ? "Creating Payment..."
                : `Pay KES ${booking.totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}