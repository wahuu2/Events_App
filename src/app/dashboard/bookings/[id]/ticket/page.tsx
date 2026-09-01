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
};

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: "valid" | "used" | "cancelled";
  createdAt: string;
  event: Event;
  booking: Booking;
};

export default function TicketPage() {
  const params = useParams();
  const id = params.id as string;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tickets");

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch tickets"
          );
        }

        const bookingTickets = data.tickets.filter(
          (ticket: Ticket) =>
            ticket.booking?._id?.toString() === id
        );

        if (bookingTickets.length === 0) {
          throw new Error(
            "No tickets were found for this booking."
          );
        }

        setTickets(bookingTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tickets."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTickets();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-gray-400">
            Loading your tickets...
          </p>
        </div>
      </main>
    );
  }

  if (error || tickets.length === 0) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Tickets not found
          </h1>

          <p className="mt-3 text-gray-400">
            {error ||
              "No tickets were found for this booking."}
          </p>

          <Link
            href={`/dashboard/bookings/${id}`}
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Back to Booking
          </Link>
        </div>
      </main>
    );
  }

  const event = tickets[0].event;
  const booking = tickets[0].booking;

  const eventDate = new Date(event.date);

  const formattedDate = eventDate.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
          
            <h1 className="mt-4 text-3xl font-bold">
              Your Digital Tickets
            </h1>

            <p className="mt-2 text-gray-400">
              {tickets.length} ticket
              {tickets.length !== 1 ? "s" : ""} for{" "}
              {event.title}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Print All Tickets
          </button>
        </div>

        <div className="space-y-8">
          {tickets.map((ticket, index) => (
            <div
              key={ticket._id}
              className="ticket-card overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl print:break-after-page"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-64 w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-sm uppercase tracking-widest opacity-80">
                    EventApp Digital Ticket
                  </p>

                  <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                    {event.title}
                  </h2>
                </div>

                <div className="absolute right-4 top-4 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
                  Ticket {index + 1} of {tickets.length}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-bold">
                      Event Details
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">
                          Location
                        </p>

                        <p className="mt-1 font-medium">
                          {event.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Date
                        </p>

                        <p className="mt-1 font-medium">
                          {formattedDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Time
                        </p>

                        <p className="mt-1 font-medium">
                          {event.time}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Category
                        </p>

                        <p className="mt-1 font-medium capitalize">
                          {event.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">
                      Ticket Details
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">
                          Ticket Number
                        </p>

                        <p className="mt-1 break-all font-mono text-lg font-bold">
                          {ticket.ticketNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Booking Reference
                        </p>

                        <p className="mt-1 break-all font-mono text-sm">
                          {booking.bookingReference}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Status
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                            ticket.status === "valid"
                              ? "bg-green-100 text-green-700"
                              : ticket.status === "used"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">
                          Ticket
                        </p>

                        <p className="mt-1 font-medium">
                          {index + 1} of {tickets.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-8 border-t-2 border-dashed border-gray-700" />

                <div className="text-center">
                  <p className="text-sm uppercase tracking-widest text-gray-400">
                    Present this ticket at the event
                  </p>

                  <p className="mt-3 break-all font-mono text-2xl font-bold tracking-wider">
                    {ticket.ticketNumber}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Print All Tickets
          </button>

          <Link
            href={`/dashboard/bookings/${id}`}
            className="rounded-lg border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-800"
          >
            Back to Booking
          </Link>
        </div>
      </section>
    </main>
  );
}