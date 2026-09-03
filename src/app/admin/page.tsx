import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Payment from "@/database/payment.model";
import Ticket from "@/database/ticket.model";
import Notification from "@/database/notification.model";

export default async function AdminDashboardPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const [
    totalUsers,
    totalOrganizers,
    totalAdmins,
    totalEvents,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalPayments,
    successfulPayments,
    failedPayments,
    totalTickets,
    validTickets,
    usedTickets,
    cancelledTickets,
    totalNotifications,
    unreadNotifications,
    recentUsers,
    recentEvents,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "organizer" }),
    User.countDocuments({ role: "admin" }),

    Event.countDocuments({}),

    Booking.countDocuments({}),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "cancelled" }),

    Payment.countDocuments({}),
    Payment.countDocuments({ status: "successful" }),
    Payment.countDocuments({ status: "failed" }),

    Ticket.countDocuments({}),
    Ticket.countDocuments({ status: "valid" }),
    Ticket.countDocuments({ status: "used" }),
    Ticket.countDocuments({ status: "cancelled" }),

    Notification.countDocuments({}),
    Notification.countDocuments({ read: false }),

    User.find({})
      .select("firstName lastName email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    Event.find({})
      .select("title date location createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    Booking.find({})
      .populate("user", "firstName lastName email")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
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

  const regularUsers =
    totalUsers - totalOrganizers - totalAdmins;

  const confirmationRate =
    totalBookings > 0
      ? Math.round(
          (confirmedBookings / totalBookings) * 100
        )
      : 0;

  const ticketUsageRate =
    totalTickets > 0
      ? Math.round(
          (usedTickets / totalTickets) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <section className="border-b border-border">
        <div className="container-responsive py-8 sm:py-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Platform Overview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Monitor Eventora's users, events, bookings,
                payments, tickets, and system activity from one
                central control center.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <QuickLink
                href="/admin/users"
                label="Users"
                value={totalUsers}
              />

              <QuickLink
                href="/admin/events"
                label="Events"
                value={totalEvents}
              />

              <QuickLink
                href="/admin/bookings"
                label="Bookings"
                value={totalBookings}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* PRIMARY METRICS */}
      {/* ===================================================== */}

      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Users"
            value={totalUsers}
            detail={`${totalOrganizers} organizers`}
            icon="◎"
          />

          <MetricCard
            label="Total Events"
            value={totalEvents}
            detail="Platform events"
            icon="▣"
          />

          <MetricCard
            label="Total Bookings"
            value={totalBookings}
            detail={`${confirmationRate}% confirmed`}
            icon="□"
          />

          <MetricCard
            label="Confirmed Revenue"
            value={formatAmount(revenue)}
            detail={`${successfulPayments} successful payments`}
            icon="◫"
            accent
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* SECONDARY METRICS */}
      {/* ===================================================== */}

      <section className="container-responsive pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SmallMetric
            label="Organizers"
            value={totalOrganizers}
            description="Event creators"
          />

          <SmallMetric
            label="Payments"
            value={totalPayments}
            description={`${failedPayments} failed`}
          />

          <SmallMetric
            label="Tickets"
            value={totalTickets}
            description={`${usedTickets} used`}
          />

          <SmallMetric
            label="Notifications"
            value={totalNotifications}
            description={`${unreadNotifications} unread`}
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* ACTIVITY + STATUS */}
      {/* ===================================================== */}

      <section className="container-responsive pb-6">
        <div className="grid gap-6 xl:grid-cols-3">
          {/* BOOKING STATUS */}

          <DashboardCard
            title="Booking Status"
            description="Current booking distribution"
          >
            <div className="space-y-5">
              <StatusBar
                label="Confirmed"
                value={confirmedBookings}
                total={totalBookings}
                accent
              />

              <StatusBar
                label="Pending"
                value={pendingBookings}
                total={totalBookings}
              />

              <StatusBar
                label="Cancelled"
                value={cancelledBookings}
                total={totalBookings}
              />
            </div>
          </DashboardCard>

          {/* TICKET STATUS */}

          <DashboardCard
            title="Ticket Status"
            description="Digital ticket lifecycle"
          >
            <div className="space-y-5">
              <StatusBar
                label="Valid"
                value={validTickets}
                total={totalTickets}
                accent
              />

              <StatusBar
                label="Used"
                value={usedTickets}
                total={totalTickets}
              />

              <StatusBar
                label="Cancelled"
                value={cancelledTickets}
                total={totalTickets}
              />
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">
                  Usage rate
                </span>

                <span className="text-sm font-bold">
                  {ticketUsageRate}%
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* SYSTEM SUMMARY */}

          <DashboardCard
            title="System Summary"
            description="Current platform composition"
          >
            <div className="space-y-4">
              <SummaryRow
                label="Regular Users"
                value={regularUsers}
              />

              <SummaryRow
                label="Organizers"
                value={totalOrganizers}
              />

              <SummaryRow
                label="Administrators"
                value={totalAdmins}
              />

              <SummaryRow
                label="Successful Payments"
                value={successfulPayments}
              />

              <SummaryRow
                label="Unread Notifications"
                value={unreadNotifications}
                accent
              />
            </div>
          </DashboardCard>
        </div>
      </section>

      {/* ===================================================== */}
      {/* RECENT ACTIVITY */}
      {/* ===================================================== */}

      <section className="container-responsive pb-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* RECENT USERS */}

          <ActivityCard
            title="Recent Users"
            description="Latest accounts created on Eventora"
            href="/admin/users"
            linkLabel="View Users"
          >
            {recentUsers.length === 0 ? (
              <EmptyState message="No users found." />
            ) : (
              <div className="divide-y divide-border">
                {recentUsers.map((user) => {
                  const name =
                    `${user.firstName || ""} ${
                      user.lastName || ""
                    }`.trim() || "Unnamed User";

                  return (
                    <div
                      key={user._id.toString()}
                      className="flex min-w-0 items-center gap-3 py-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-bold text-accent">
                        {getInitials(name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {name}
                        </p>

                        <p className="truncate text-xs text-foreground-muted">
                          {user.email || "No email"}
                        </p>
                      </div>

                      <RoleBadge role={user.role} />
                    </div>
                  );
                })}
              </div>
            )}
          </ActivityCard>

          {/* RECENT EVENTS */}

          <ActivityCard
            title="Recent Events"
            description="Latest events added to the platform"
            href="/admin/events"
            linkLabel="View Events"
          >
            {recentEvents.length === 0 ? (
              <EmptyState message="No events found." />
            ) : (
              <div className="divide-y divide-border">
                {recentEvents.map((event) => (
                  <div
                    key={event._id.toString()}
                    className="flex min-w-0 items-center gap-3 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm text-accent">
                      ▣
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {event.title}
                      </p>

                      <p className="truncate text-xs text-foreground-muted">
                        {event.location || "Location not specified"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] font-semibold text-foreground-muted">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ActivityCard>
        </div>
      </section>

      {/* ===================================================== */}
      {/* RECENT BOOKINGS */}
      {/* ===================================================== */}

      <section className="container-responsive pb-10">
        <ActivityCard
          title="Recent Bookings"
          description="Latest booking activity across the platform"
          href="/admin/bookings"
          linkLabel="View Bookings"
        >
          {recentBookings.length === 0 ? (
            <EmptyState message="No bookings found." />
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((booking) => {
                const user = booking.user as
                  | {
                      firstName?: string;
                      lastName?: string;
                      email?: string;
                    }
                  | null;

                const event = booking.event as
                  | {
                      title?: string;
                    }
                  | null;

                const userName =
                  `${user?.firstName || ""} ${
                    user?.lastName || ""
                  }`.trim() || "Unknown User";

                return (
                  <div
                    key={booking._id.toString()}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm text-accent">
                        □
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {userName}
                        </p>

                        <p className="truncate text-xs text-foreground-muted">
                          {event?.title || "Unknown Event"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs font-bold">
                        {formatAmount(
                          Number(booking.totalAmount) || 0
                        )}
                      </span>

                      <BookingBadge
                        status={booking.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ActivityCard>
      </section>
    </div>
  );
}

/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

function MetricCard({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: string;
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
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
            {label}
          </p>

          <p className="mt-4 truncate text-2xl font-black tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-foreground-muted">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
            accent
              ? "border-accent/20 bg-background text-accent"
              : "border-border bg-background text-accent"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card px-4 py-3 transition hover:border-accent/30 hover:bg-background-secondary"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
        {label}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </Link>
  );
}

function DashboardCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-6">
        <h2 className="text-sm font-bold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-foreground-muted">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function ActivityCard({
  title,
  description,
  href,
  linkLabel,
  children,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-bold">
            {title}
          </h2>

          <p className="mt-1 truncate text-xs text-foreground-muted">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="w-fit shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:border-border-hover hover:bg-background-secondary"
        >
          {linkLabel} →
        </Link>
      </div>

      <div className="px-5">
        {children}
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  accent = false,
}: {
  label: string;
  value: number;
  total: number;
  accent?: boolean;
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold">
          {label}
        </span>

        <span className="text-xs font-bold text-foreground-secondary">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full ${
            accent
              ? "bg-accent"
              : "bg-foreground-muted"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-foreground-muted">
        {percentage}%
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-foreground-secondary">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  return (
    <span className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
      {role}
    </span>
  );
}

function BookingBadge({
  status,
}: {
  status: string;
}) {
  const isConfirmed = status === "confirmed";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
        isConfirmed
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-border bg-background text-foreground-muted"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="py-10 text-center">
      <p className="text-xs text-foreground-muted">
        {message}
      </p>
    </div>
  );
}

/* ========================================================= */
/* HELPERS */
/* ========================================================= */

function formatAmount(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString(
    "en-KE"
  )}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}