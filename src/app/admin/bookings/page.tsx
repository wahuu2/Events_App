import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Booking from "@/database/booking.model";

export default async function AdminBookingsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const bookings = await Booking.find({})
    .populate("user", "firstName lastName email")
    .populate("event", "title date location")
    .sort({ createdAt: -1 })
    .lean();

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
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
              Booking Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor all bookings made across the Eventora platform.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {confirmedBookings}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingBookings}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold">
              {cancelledBookings}
            </p>
          </div>
        </section>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              All Platform Bookings
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Booking
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Attendee
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Event
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {booking.bookingReference || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {booking.user ? (
                        <>
                          <div className="text-sm font-medium">
                            {booking.user.firstName}{" "}
                            {booking.user.lastName}
                          </div>

                          <div className="mt-1 text-xs text-foreground-muted">
                            {booking.user.email}
                          </div>
                        </>
                      ) : (
                        "Unknown attendee"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {booking.event?.title || "Unknown event"}
                      </div>

                      {booking.event?.location && (
                        <div className="mt-1 text-xs text-foreground-muted">
                          {booking.event.location}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {booking.quantity}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {booking.totalAmount}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {booking.createdAt
                        ? new Date(
                            booking.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No bookings found.
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