import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import Ticket from "@/database/ticket.model";

export default async function AdminTicketsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const tickets = await Ticket.find({})
    .populate("user", "firstName lastName email")
    .populate("event", "title date location")
    .populate("booking", "bookingReference status")
    .sort({ createdAt: -1 })
    .lean();

  const validTickets = tickets.filter(
    (ticket) => ticket.status === "valid"
  ).length;

  const usedTickets = tickets.filter(
    (ticket) => ticket.status === "used"
  ).length;

  const cancelledTickets = tickets.filter(
    (ticket) => ticket.status === "cancelled"
  ).length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Ticket Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor issued tickets and ticket status across the
              entire Eventora platform.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Tickets
            </p>

            <p className="mt-2 text-3xl font-bold">
              {tickets.length}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              All issued tickets
            </p>
          </div>

          {/* Valid */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Valid
            </p>

            <p className="mt-2 text-3xl font-bold">
              {validTickets}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Active tickets
            </p>
          </div>

          {/* Used */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Used
            </p>

            <p className="mt-2 text-3xl font-bold">
              {usedTickets}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Tickets already used
            </p>
          </div>

          {/* Cancelled */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold">
              {cancelledTickets}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Cancelled tickets
            </p>
          </div>
        </section>

        {/* Tickets Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              All Platform Tickets
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Ticket
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Attendee
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Event
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Booking
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Issued
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    {/* Ticket Number */}
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {ticket.ticketNumber}
                      </div>

                      <div className="mt-1 text-xs text-foreground-muted">
                        ID: {ticket._id.toString()}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      {ticket.user ? (
                        <>
                          <div className="text-sm font-medium">
                            {ticket.user.firstName}{" "}
                            {ticket.user.lastName}
                          </div>

                          <div className="mt-1 text-xs text-foreground-muted">
                            {ticket.user.email}
                          </div>
                        </>
                      ) : (
                        "Unknown user"
                      )}
                    </td>

                    {/* Event */}
                    <td className="px-6 py-4">
                      {ticket.event ? (
                        <>
                          <div className="text-sm font-medium">
                            {ticket.event.title}
                          </div>

                          <div className="mt-1 text-xs text-foreground-muted">
                            {ticket.event.location || "Location unavailable"}
                          </div>
                        </>
                      ) : (
                        "Unknown event"
                      )}
                    </td>

                    {/* Booking */}
                    <td className="px-6 py-4 text-sm">
                      {ticket.booking?.bookingReference || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                        {ticket.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {ticket.createdAt
                        ? new Date(
                            ticket.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}