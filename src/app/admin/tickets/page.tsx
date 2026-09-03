import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import Ticket from "@/database/ticket.model";

export default async function AdminTicketsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const tickets = await Ticket.find({})
    .populate("user", "firstName lastName email")
    .populate("event", "title date location")
    .populate("booking", "bookingReference status")
    .sort({ createdAt: -1 })
    .lean();

  const totalTickets = tickets.length;

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
    <div className="min-h-screen bg-background">
      {/* PAGE HEADER */}
      <section className="border-b border-border">
        <div className="container-responsive py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Platform Management
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Tickets
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor digital tickets, ticket status, attendees,
                and the events connected to each ticket.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Tickets
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalTickets}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tickets"
            value={totalTickets}
            description="All generated tickets"
            accent
          />

          <StatCard
            label="Valid"
            value={validTickets}
            description="Ready for event entry"
          />

          <StatCard
            label="Used"
            value={usedTickets}
            description="Tickets already scanned"
          />

          <StatCard
            label="Cancelled"
            value={cancelledTickets}
            description="No longer valid"
          />
        </div>
      </section>

      {/* TICKET ACTIVITY */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">
                Digital Ticket Activity
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Latest generated tickets appear first.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalTickets} tickets
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ▤
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No tickets found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                No digital tickets have been generated on the
                platform yet.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="w-full min-w-[1150px]">
                <thead>
                  <tr className="border-b border-border bg-background-secondary text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Ticket
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Attendee
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Event
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Generated
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => {
                    const user = ticket.user as
                      | {
                          firstName?: string;
                          lastName?: string;
                          email?: string;
                        }
                      | null;

                    const event = ticket.event as
                      | {
                          title?: string;
                          date?: Date | string;
                          location?: string;
                        }
                      | null;

                    const booking = ticket.booking as
                      | {
                          bookingReference?: string;
                          status?: string;
                        }
                      | null;

                    const attendeeName =
                      `${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`.trim() || "Unknown Attendee";

                    return (
                      <tr
                        key={ticket._id.toString()}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/60"
                      >
                        {/* TICKET */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-black text-accent">
                              ▤
                            </div>

                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold text-foreground">
                                {ticket.ticketNumber}
                              </p>

                              <p className="mt-1 text-[10px] text-foreground-muted">
                                Digital ticket
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ATTENDEE */}
                        <td className="px-5 py-5">
                          <div className="min-w-0 max-w-[200px]">
                            <p className="truncate text-sm font-bold">
                              {attendeeName}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-foreground-muted">
                              {user?.email ||
                                "No email available"}
                            </p>
                          </div>
                        </td>

                        {/* EVENT */}
                        <td className="px-5 py-5">
                          <div className="min-w-0 max-w-[230px]">
                            <p className="truncate text-sm font-semibold">
                              {event?.title || "Unknown Event"}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-foreground-muted">
                              {event?.location ||
                                "Location not specified"}
                            </p>

                            {event?.date && (
                              <p className="mt-1 text-[10px] text-foreground-muted">
                                {formatDate(event.date)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* BOOKING */}
                        <td className="px-5 py-5">
                          <div>
                            <span className="rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] font-semibold text-foreground-secondary">
                              {booking?.bookingReference ||
                                "N/A"}
                            </span>

                            {booking?.status && (
                              <p className="mt-2 text-[10px] text-foreground-muted">
                                Booking: {booking.status}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          <TicketStatusBadge
                            status={ticket.status}
                          />
                        </td>

                        {/* GENERATED */}
                        <td className="px-5 py-5 text-right">
                          <span className="text-xs text-foreground-secondary">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- */
/* STAT CARD */
/* -------------------------------- */

function StatCard({
  label,
  value,
  description,
  accent = false,
}: {
  label: string;
  value: number;
  description: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        accent
          ? "border-accent/30 bg-accent/10"
          : "border-border bg-card hover:border-border-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
          {label}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${
            accent ? "bg-accent" : "bg-foreground-muted"
          }`}
        />
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* TICKET STATUS */
/* -------------------------------- */

function TicketStatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "valid"
      ? "border-accent/30 bg-accent/10 text-accent"
      : status === "used"
        ? "border-border bg-background-secondary text-foreground"
        : "border-border bg-background text-foreground-muted";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "valid"
            ? "bg-accent"
            : "bg-foreground-muted"
        }`}
      />

      {status}
    </span>
  );
}

/* -------------------------------- */
/* HELPERS */
/* -------------------------------- */

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}