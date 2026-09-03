import Link from "next/link";

import User from "@/database/user.model";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Payment from "@/database/payment.model";
import Ticket from "@/database/ticket.model";
import Notification from "@/database/notification.model";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalOrganizers,
    totalEvents,
    totalBookings,
    totalPayments,
    totalTickets,
    unreadNotifications,
    confirmedBookings,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "organizer" }),
    Event.countDocuments({}),
    Booking.countDocuments({}),
    Payment.countDocuments({}),
    Ticket.countDocuments({}),
    Notification.countDocuments({ read: false }),
    Booking.countDocuments({ status: "confirmed" }),
  ]);

  const confirmedBookingRecords = await Booking.find({
    status: "confirmed",
  })
    .select("totalAmount")
    .lean();

  const revenue = confirmedBookingRecords.reduce(
    (total, booking) =>
      total + (Number(booking.totalAmount) || 0),
    0
  );

  const managementCards = [
    {
      title: "User Management",
      description:
        "View registered users, roles, and platform accounts.",
      href: "/admin/users",
      count: totalUsers,
      label: "Users",
    },
    {
      title: "Organizer Management",
      description:
        "Monitor organizers registered on the platform.",
      href: "/admin/organizers",
      count: totalOrganizers,
      label: "Organizers",
    },
    {
      title: "Event Management",
      description:
        "Monitor and review events across the platform.",
      href: "/admin/events",
      count: totalEvents,
      label: "Events",
    },
    {
      title: "Booking Management",
      description:
        "Review platform-wide booking activity and statuses.",
      href: "/admin/bookings",
      count: totalBookings,
      label: "Bookings",
    },
    {
      title: "Payment Management",
      description:
        "Monitor payment records and transaction activity.",
      href: "/admin/payments",
      count: totalPayments,
      label: "Payments",
    },
    {
      title: "Ticket Management",
      description:
        "Monitor issued tickets and ticket statuses.",
      href: "/admin/tickets",
      count: totalTickets,
      label: "Tickets",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8 md:py-10">
        {/* Page Header */}
        <section className="mb-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Eventora Administration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              System Overview
            </h1>

            <p className="mt-3 text-foreground-secondary">
              Monitor platform activity, manage system resources,
              and review key operational statistics from one central
              administration console.
            </p>
          </div>
        </section>

        {/* Primary Statistics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Users */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground-secondary">
                  Total Users
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {totalUsers}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Users
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              All registered platform accounts
            </p>
          </div>

          {/* Events */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground-secondary">
                  Total Events
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {totalEvents}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Events
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Events currently registered
            </p>
          </div>

          {/* Bookings */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground-secondary">
                  Total Bookings
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {totalBookings}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Bookings
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              {confirmedBookings} currently confirmed
            </p>
          </div>

          {/* Revenue */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground-secondary">
                  Confirmed Revenue
                </p>

                <p className="mt-3 text-2xl font-bold md:text-3xl">
                  KSh {revenue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Revenue
              </div>
            </div>

            <p className="mt-4 text-xs text-foreground-muted">
              Based on confirmed bookings
            </p>
          </div>
        </section>

        {/* Platform Activity */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Platform Control
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                System Management
              </h2>

              <p className="mt-2 text-sm text-foreground-secondary">
                Access and monitor the main operational areas of
                the Eventora platform.
              </p>
            </div>

            <Link
              href="/admin/analytics"
              className="inline-flex w-fit rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:border-border-hover hover:bg-background-secondary"
            >
              View Analytics
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {managementCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-border bg-background-secondary p-5 transition hover:border-border-hover hover:bg-background"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {card.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                      {card.description}
                    </p>
                  </div>

                  <span className="text-foreground-muted transition group-hover:text-foreground">
                    →
                  </span>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <span className="text-2xl font-bold">
                    {card.count}
                  </span>

                  <span className="ml-2 text-xs uppercase tracking-wider text-foreground-muted">
                    {card.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Status */}
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* Notifications */}
          <Link
            href="/admin/notifications"
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Notification System
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Notification Activity
                </h2>

                <p className="mt-2 text-sm text-foreground-secondary">
                  Monitor system-generated notifications and user
                  notification activity.
                </p>
              </div>

              <span className="text-foreground-muted">
                →
              </span>
            </div>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-3xl font-bold">
                {unreadNotifications}
              </span>

              <span className="pb-1 text-sm text-foreground-secondary">
                unread notifications
              </span>
            </div>
          </Link>

          {/* Analytics */}
          <Link
            href="/admin/analytics"
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  Platform Analytics
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  System Performance
                </h2>

                <p className="mt-2 text-sm text-foreground-secondary">
                  View detailed platform statistics for bookings,
                  tickets, users, events, and revenue.
                </p>
              </div>

              <span className="text-foreground-muted">
                →
              </span>
            </div>

            <div className="mt-6">
              <span className="text-sm font-medium">
                Open analytics dashboard →
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}