"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

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

  function getAttendeeName() {
    const name =
      `${ticket?.user?.firstName || ""} ${
        ticket?.user?.lastName || ""
      }`.trim();

    return name || "Unknown attendee";
  }

  function getTicketStatusClasses(status: string) {
    switch (status) {
      case "valid":
        return "border-emerald-900/60 bg-emerald-950/30 text-emerald-400";

      case "used":
        return "border-amber-900/60 bg-amber-950/30 text-amber-400";

      case "cancelled":
        return "border-red-900/60 bg-red-950/30 text-red-400";

      default:
        return "border-border bg-background-secondary text-foreground-secondary";
    }
  }

  return (
    <main className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
                      Organizer Workspace
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Ticket Check-In
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">
                    Verify attendee tickets quickly and securely before
                    allowing entry to your event.
                  </p>
                </div>

                <Link
                  href="/dashboard/organizer"
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl border border-border-hover px-5 py-3 text-sm font-semibold transition-all duration-200 hover:border-accent/50 hover:bg-background-secondary sm:w-auto"
                >
                  ← Organizer Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Area */}
        <section className="mt-8 sm:mt-10">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg font-bold text-accent">
                ✓
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">
                  Verify a ticket
                </h2>

                <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                  Enter the ticket number from the attendee&apos;s digital
                  ticket to check its validity.
                </p>
              </div>
            </div>

            <form
              onSubmit={verifyTicket}
              className="mt-7"
            >
              <label
                htmlFor="ticketNumber"
                className="block text-sm font-medium text-foreground"
              >
                Ticket Number
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="ticketNumber"
                  type="text"
                  value={ticketNumber}
                  onChange={(event) =>
                    setTicketNumber(event.target.value)
                  }
                  placeholder="TKT-MTCDI9C8-SW4DI6"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3.5 font-mono text-sm text-foreground placeholder:text-foreground-muted transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Ticket
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-foreground-muted">
                Ticket numbers are case-sensitive identifiers generated by
                Eventora.
              </p>
            </form>
          </div>
        </section>

        {/* Result */}
        {message && (
          <section className="mt-6 sm:mt-8">
            <div
              role={success ? "status" : "alert"}
              className={`overflow-hidden rounded-2xl border ${
                success
                  ? "border-emerald-900/60 bg-emerald-950/20"
                  : "border-red-900/60 bg-red-950/20"
              }`}
            >
              {/* Result Header */}
              <div
                className={`border-b p-5 sm:p-6 ${
                  success
                    ? "border-emerald-900/60"
                    : "border-red-900/60"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${
                      success
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {success ? "✓" : "×"}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        success
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {success ? "Verification Successful" : "Verification Failed"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                      {success
                        ? "Valid Ticket"
                        : "Ticket Verification Failed"}
                    </h2>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        success
                          ? "text-emerald-300/90"
                          : "text-red-300/90"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              {ticket && (
                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Ticket Information
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        Attendee Entry Pass
                      </h3>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getTicketStatusClasses(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Ticket Number */}
                  <div className="mt-6 rounded-2xl border border-border bg-background-secondary p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                      Ticket Number
                    </p>

                    <p className="mt-3 break-all font-mono text-lg font-bold tracking-tight sm:text-xl">
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {/* Attendee */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Attendee
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                          {getAttendeeName()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {getAttendeeName()}
                          </p>

                          {ticket.user?.email && (
                            <p className="mt-1 truncate text-xs text-foreground-muted">
                              {ticket.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Ticket Status
                      </p>

                      <p className="mt-4 text-lg font-semibold capitalize">
                        {ticket.status}
                      </p>

                      <p className="mt-1 text-sm text-foreground-muted">
                        Current ticket verification status
                      </p>
                    </div>
                  </div>

                  {/* Event */}
                  {ticket.event && (
                    <div className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Event Details
                      </p>

                      <h3 className="mt-3 text-xl font-bold tracking-tight">
                        {ticket.event.title || "Unknown event"}
                      </h3>

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-foreground-muted">
                            Location
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {ticket.event.location || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-foreground-muted">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatDate(ticket.event.date)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-foreground-muted">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {ticket.event.time || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Entry Result */}
                  {success && (
                    <div className="mt-6 rounded-2xl border border-emerald-700/60 bg-emerald-500/10 p-6 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl font-bold text-emerald-400">
                        ✓
                      </div>

                      <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-400 sm:text-3xl">
                        ENTRY ALLOWED
                      </p>

                      <p className="mt-2 text-sm leading-6 text-emerald-300/80">
                        This ticket has been successfully verified and
                        checked in.
                      </p>
                    </div>
                  )}

                  {/* Used / Cancelled */}
                  {!success && ticket.status !== "valid" && (
                    <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/20 p-5">
                      <p className="font-semibold text-red-400">
                        Entry not allowed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-300/80">
                        This ticket cannot be used for entry in its current
                        status.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Instructions */}
        {!message && (
          <section className="mt-6 sm:mt-8">
            <div className="rounded-2xl border border-border bg-background-secondary p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Check-In Process
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <span className="text-2xl font-bold text-foreground-muted">
                    01
                  </span>

                  <h3 className="mt-2 font-semibold">
                    Get the ticket number
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                    Ask the attendee to display their Eventora digital
                    ticket.
                  </p>
                </div>

                <div>
                  <span className="text-2xl font-bold text-foreground-muted">
                    02
                  </span>

                  <h3 className="mt-2 font-semibold">
                    Verify the ticket
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                    Enter the ticket number and submit the verification
                    request.
                  </p>
                </div>

                <div>
                  <span className="text-2xl font-bold text-foreground-muted">
                    03
                  </span>

                  <h3 className="mt-2 font-semibold">
                    Allow entry
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                    Only valid tickets should be accepted at the event
                    entrance.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}