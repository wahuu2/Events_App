"use client";

import { FormEvent, useState } from "react";

type TicketResult = {
  id: string;
  ticketNumber: string;
  status: string;
  event?: {
    title?: string;
    location?: string;
    date?: string;
    time?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export default function OrganizerTicketsPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState<TicketResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function verifyTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticketNumber.trim()) {
      setMessage("Please enter a ticket number.");
      setSuccess(false);
      setTicket(null);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setTicket(null);

      const response = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketNumber: ticketNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSuccess(false);
        setMessage(data.message || "Ticket verification failed.");
        setTicket(data.ticket || null);
        return;
      }

      setSuccess(true);
      setMessage(data.message);
      setTicket(data.ticket);
      setTicketNumber("");
    } catch (error) {
      console.error("Ticket verification error:", error);

      setSuccess(false);
      setMessage("Something went wrong while verifying the ticket.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              EventApp
            </h1>

            <p className="text-sm text-gray-400">
              Organizer Dashboard
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* Main */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Event Check-In
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Verify Ticket
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Enter the attendee's ticket number to verify their
            ticket and allow entry to the event.
          </p>
        </div>

        {/* Verification Form */}
        <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">
          <form onSubmit={verifyTicket}>
            <label
              htmlFor="ticketNumber"
              className="block text-sm font-medium text-gray-300"
            >
              Ticket Number
            </label>

            <input
              id="ticketNumber"
              type="text"
              value={ticketNumber}
              onChange={(event) =>
                setTicketNumber(event.target.value)
              }
              placeholder="TKT-MTCDI9C8-SW4DI6"
              className="mt-3 w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 font-mono text-white outline-none placeholder:text-gray-600 focus:border-white"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Ticket"}
            </button>
          </form>
        </div>

        {/* Result */}
        {message && (
          <div
            className={`mt-8 overflow-hidden rounded-2xl border ${
              success
                ? "border-green-800 bg-green-950/40"
                : "border-red-800 bg-red-950/40"
            }`}
          >
            {/* Result Header */}
            <div
              className={`border-b p-6 ${
                success
                  ? "border-green-800"
                  : "border-red-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                    success
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {success ? "✓" : "✕"}
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    {success
                      ? "Valid Ticket"
                      : "Ticket Verification Failed"}
                  </h3>

                  <p
                    className={`mt-1 text-sm ${
                      success
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            {ticket && (
              <div className="p-6">
                <h4 className="text-lg font-semibold">
                  Ticket Information
                </h4>

                <div className="mt-5 space-y-5">
                  {/* Ticket Number */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Ticket Number
                    </p>

                    <p className="mt-1 break-all font-mono text-lg font-bold">
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                        ticket.status === "used"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : ticket.status === "valid"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Attendee */}
                  {ticket.user && (
                    <div>
                      <p className="text-sm text-gray-400">
                        Attendee
                      </p>

                      <p className="mt-1 font-medium">
                        {ticket.user.firstName}{" "}
                        {ticket.user.lastName}
                      </p>

                      {ticket.user.email && (
                        <p className="mt-1 text-sm text-gray-400">
                          {ticket.user.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Event */}
                  {ticket.event && (
                    <div className="border-t border-gray-800 pt-5">
                      <p className="text-sm text-gray-400">
                        Event
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {ticket.event.title}
                      </p>

                      {ticket.event.location && (
                        <p className="mt-2 text-sm text-gray-400">
                          {ticket.event.location}
                        </p>
                      )}

                      {ticket.event.date && (
                        <p className="mt-2 text-sm text-gray-400">
                          {formatDate(ticket.event.date)}
                        </p>
                      )}

                      {ticket.event.time && (
                        <p className="mt-1 text-sm text-gray-400">
                          {ticket.event.time}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Entry Result */}
                {success && (
                  <div className="mt-6 rounded-xl border border-green-700 bg-green-500/10 p-5 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      ENTRY ALLOWED
                    </p>

                    <p className="mt-2 text-sm text-green-300">
                      This ticket has been successfully checked
                      in.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}