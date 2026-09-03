import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Event from "@/database/event.model";

export default async function AdminEventsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const events = await Event.find({})
    .populate("organizer", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-foreground-secondary transition hover:text-foreground"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Event Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor all events created across the Eventora platform and
              review their associated organizers.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Platform Status
            </p>

            <p className="mt-2 text-lg font-semibold">
              Monitoring Active
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              All Events
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Event
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Organizer
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Location
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Date
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr
                    key={event._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {event.title}
                      </div>

                      {event.category && (
                        <div className="mt-1 text-xs text-foreground-muted">
                          {event.category}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {event.organizer
                          ? `${event.organizer.firstName} ${event.organizer.lastName}`
                          : "Unknown organizer"}
                      </div>

                      {event.organizer?.email && (
                        <div className="mt-1 text-xs text-foreground-muted">
                          {event.organizer.email}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {event.location || "Not specified"}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "Not specified"}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {event.createdAt
                        ? new Date(
                            event.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No events found.
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