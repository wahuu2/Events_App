"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Analytics = {
  users: {
    total: number;
    organizers: number;
    admins: number;
  };
  events: {
    total: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    confirmedBookingRevenue: number;
  };
  tickets: {
    total: number;
    valid: number;
    used: number;
    cancelled: number;
  };
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/admin/analytics",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load analytics"
          );
        }

        setAnalytics(data.analytics);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive py-16">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-foreground-muted">
              !
            </div>

            <h1 className="mt-4 text-lg font-bold">
              Analytics unavailable
            </h1>

            <p className="mt-2 text-sm text-foreground-muted">
              {error || "Unable to load platform analytics."}
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Return to Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bookingConfirmationRate =
    analytics.bookings.total > 0
      ? Math.round(
          (analytics.bookings.confirmed /
            analytics.bookings.total) *
            100
        )
      : 0;

  const ticketUsageRate =
    analytics.tickets.total > 0
      ? Math.round(
          (analytics.tickets.used /
            analytics.tickets.total) *
            100
        )
      : 0;

  const regularUsers =
    analytics.users.total -
    analytics.users.organizers -
    analytics.users.admins;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="border-b border-border">
        <div className="container-responsive py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Platform Intelligence
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor Eventora's users, events, bookings,
                revenue, and ticket activity from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-accent/20 bg-accent/10 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
                Confirmed Revenue
              </p>

              <p className="mt-1 text-2xl font-black">
                {formatAmount(
                  analytics.revenue.confirmedBookingRevenue
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY METRICS */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Users"
            value={analytics.users.total}
            detail={`${analytics.users.organizers} organizers`}
            icon="◎"
          />

          <MetricCard
            label="Events"
            value={analytics.events.total}
            detail="Platform events"
            icon="▣"
          />

          <MetricCard
            label="Bookings"
            value={analytics.bookings.total}
            detail={`${bookingConfirmationRate}% confirmed`}
            icon="□"
          />

          <MetricCard
            label="Tickets"
            value={analytics.tickets.total}
            detail={`${ticketUsageRate}% used`}
            icon="▤"
          />
        </div>
      </section>

      {/* MAIN ANALYTICS */}
      <section className="container-responsive pb-6">
        <div className="grid gap-6 xl:grid-cols-3">
          {/* USERS */}
          <AnalyticsCard
            title="User Composition"
            description="Breakdown of platform accounts"
          >
            <div className="space-y-5">
              <ProgressRow
                label="Regular Users"
                value={regularUsers}
                total={analytics.users.total}
              />

              <ProgressRow
                label="Organizers"
                value={analytics.users.organizers}
                total={analytics.users.total}
              />

              <ProgressRow
                label="Administrators"
                value={analytics.users.admins}
                total={analytics.users.total}
              />
            </div>
          </AnalyticsCard>

          {/* BOOKINGS */}
          <AnalyticsCard
            title="Booking Status"
            description="Current booking distribution"
          >
            <div className="space-y-5">
              <ProgressRow
                label="Confirmed"
                value={analytics.bookings.confirmed}
                total={analytics.bookings.total}
                accent
              />

              <ProgressRow
                label="Pending"
                value={analytics.bookings.pending}
                total={analytics.bookings.total}
              />

              <ProgressRow
                label="Cancelled"
                value={analytics.bookings.cancelled}
                total={analytics.bookings.total}
              />
            </div>
          </AnalyticsCard>

          {/* TICKETS */}
          <AnalyticsCard
            title="Ticket Status"
            description="Digital ticket lifecycle"
          >
            <div className="space-y-5">
              <ProgressRow
                label="Valid"
                value={analytics.tickets.valid}
                total={analytics.tickets.total}
                accent
              />

              <ProgressRow
                label="Used"
                value={analytics.tickets.used}
                total={analytics.tickets.total}
              />

              <ProgressRow
                label="Cancelled"
                value={analytics.tickets.cancelled}
                total={analytics.tickets.total}
              />
            </div>
          </AnalyticsCard>
        </div>
      </section>

      {/* PERFORMANCE SUMMARY */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-5">
            <h2 className="text-base font-bold">
              Platform Performance
            </h2>

            <p className="mt-1 text-xs text-foreground-muted">
              Key operational indicators across Eventora.
            </p>
          </div>

          <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <PerformanceItem
              label="Booking Conversion"
              value={`${bookingConfirmationRate}%`}
              description="Bookings confirmed"
            />

            <PerformanceItem
              label="Ticket Utilization"
              value={`${ticketUsageRate}%`}
              description="Tickets already used"
            />

            <PerformanceItem
              label="Organizer Share"
              value={`${getPercentage(
                analytics.users.organizers,
                analytics.users.total
              )}%`}
              description="Of total accounts"
            />

            <PerformanceItem
              label="Revenue"
              value={formatAmount(
                analytics.revenue.confirmedBookingRevenue
              )}
              description="From confirmed bookings"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- */
/* METRIC CARD */
/* -------------------------------- */

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-border-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
            {label}
          </p>

          <p className="mt-4 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            {detail}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* ANALYTICS CARD */
/* -------------------------------- */

function AnalyticsCard({
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

/* -------------------------------- */
/* PROGRESS ROW */
/* -------------------------------- */

function ProgressRow({
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
          className={`h-full rounded-full transition-all ${
            accent ? "bg-accent" : "bg-foreground-muted"
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

/* -------------------------------- */
/* PERFORMANCE ITEM */
/* -------------------------------- */

function PerformanceItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
        {label}
      </p>

      <p className="mt-3 truncate text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* SKELETON */
/* -------------------------------- */

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border">
        <div className="container-responsive py-10">
          <div className="h-3 w-32 animate-pulse rounded bg-card" />
          <div className="mt-4 h-10 w-56 animate-pulse rounded bg-card" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-card" />
        </div>
      </section>

      <div className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* HELPERS */
/* -------------------------------- */

function formatAmount(amount: number) {
  return `KES ${Number(amount || 0).toLocaleString(
    "en-KE"
  )}`;
}

function getPercentage(
  value: number,
  total: number
) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}