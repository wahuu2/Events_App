import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import Event from "@/database/event.model";

export default async function AdminEventsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const events = await Event.find({})
    .populate("organizer", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  const totalEvents = events.length;

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= new Date()
  ).length;

  const pastEvents = totalEvents - upcomingEvents;

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
                Events
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor every event published across the Eventora
                platform and review its organizer, schedule, and
                location.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Events
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalEvents}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Events"
            value={totalEvents}
            description="All platform events"
            accent
          />

          <StatCard
            label="Upcoming"
            value={upcomingEvents}
            description="Events still ahead"
          />

          <StatCard
            label="Past Events"
            value={pastEvents}
            description="Events already held"
          />
        </div>
      </section>

      {/* EVENTS TABLE */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">
                Platform Events
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Latest events appear first.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalEvents} events
            </span>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ▣
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No events found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                No events have been created on the platform yet.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-border bg-background-secondary text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Event
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Organizer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Date
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Location
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Event ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => {
                    const eventDate = new Date(event.date);
                    const isUpcoming = eventDate >= new Date();

                    const organizer = event.organizer as
                      | {
                          firstName?: string;
                          lastName?: string;
                          email?: string;
                        }
                      | null;

                    const organizerName =
                      `${organizer?.firstName || ""} ${
                        organizer?.lastName || ""
                      }`.trim() || "Unknown Organizer";

                    return (
                      <tr
                        key={event._id.toString()}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/60"
                      >
                        {/* EVENT */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-black text-accent">
                              ▣
                            </div>

                            <div className="min-w-0 max-w-[260px]">
                              <p className="truncate text-sm font-bold">
                                {event.title}
                              </p>

                              <p className="mt-1 truncate text-[10px] text-foreground-muted">
                                Event listing
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ORGANIZER */}
                        <td className="px-5 py-5">
                          <div className="min-w-0 max-w-[220px]">
                            <p className="truncate text-sm font-semibold">
                              {organizerName}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-foreground-muted">
                              {organizer?.email ||
                                "No email available"}
                            </p>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-5">
                          <div>
                            <p className="text-sm font-semibold">
                              {formatDate(event.date)}
                            </p>

                            <p className="mt-1 text-[10px] text-foreground-muted">
                              {formatTime(event.date)}
                            </p>
                          </div>
                        </td>

                        {/* LOCATION */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-accent">
                              +
                            </span>

                            <span className="max-w-[180px] truncate text-sm text-foreground-secondary">
                              {event.location ||
                                "Location not specified"}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                              isUpcoming
                                ? "border-accent/30 bg-accent/10 text-accent"
                                : "border-border bg-background-secondary text-foreground-muted"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isUpcoming
                                  ? "bg-accent"
                                  : "bg-foreground-muted"
                              }`}
                            />

                            {isUpcoming ? "Upcoming" : "Past"}
                          </span>
                        </td>

                        {/* ID */}
                        <td className="px-5 py-5 text-right">
                          <span className="font-mono text-[10px] text-foreground-muted">
                            {event._id
                              .toString()
                              .slice(-8)}
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
/* HELPERS */
/* -------------------------------- */

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}