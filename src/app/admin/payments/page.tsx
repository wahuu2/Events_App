import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import Payment from "@/database/payment.model";

export default async function AdminPaymentsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const payments = await Payment.find({})
    .populate("user", "firstName lastName email")
    .populate("booking", "bookingReference totalAmount status")
    .sort({ createdAt: -1 })
    .lean();

  const totalPayments = payments.length;

  const successfulPayments = payments.filter(
    (payment) => payment.status === "successful"
  ).length;

  const pendingPayments = payments.filter(
    (payment) =>
      payment.status === "pending" ||
      payment.status === "processing"
  ).length;

  const failedPayments = payments.filter(
    (payment) => payment.status === "failed"
  ).length;

  const successfulRevenue = payments
    .filter((payment) => payment.status === "successful")
    .reduce(
      (total, payment) =>
        total + (Number(payment.amount) || 0),
      0
    );

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
                Payments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor payment activity, transaction methods,
                processing status, and successful platform revenue.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Payments
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalPayments}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Payments"
            value={totalPayments}
            description="All payment records"
            accent
          />

          <StatCard
            label="Successful"
            value={successfulPayments}
            description="Completed payments"
          />

          <StatCard
            label="Pending"
            value={pendingPayments}
            description="Pending or processing"
          />

          <StatCard
            label="Failed"
            value={failedPayments}
            description="Unsuccessful payments"
          />
        </div>
      </section>

      {/* REVENUE */}
      <section className="container-responsive pb-6">
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/10 p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-accent/10 bg-accent/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Successful Revenue
              </p>

              <p className="mt-2 text-3xl font-black tracking-tight">
                {formatAmount(successfulRevenue)}
              </p>

              <p className="mt-1 text-xs text-foreground-secondary">
                Total value of successfully completed payments.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-background text-lg font-black text-accent">
              K
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENTS TABLE */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">
                Payment Activity
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Latest transactions appear first.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalPayments} payments
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ◫
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No payments found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                No payment transactions have been recorded on the
                platform yet.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-border bg-background-secondary text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Method
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Transaction
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => {
                    const user = payment.user as
                      | {
                          firstName?: string;
                          lastName?: string;
                          email?: string;
                        }
                      | null;

                    const booking = payment.booking as
                      | {
                          bookingReference?: string;
                          totalAmount?: number;
                          status?: string;
                        }
                      | null;

                    const customerName =
                      `${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`.trim() || "Unknown Customer";

                    return (
                      <tr
                        key={payment._id.toString()}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/60"
                      >
                        {/* CUSTOMER */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-black text-accent">
                              {getInitials(
                                user?.firstName,
                                user?.lastName
                              )}
                            </div>

                            <div className="min-w-0 max-w-[190px]">
                              <p className="truncate text-sm font-bold">
                                {customerName}
                              </p>

                              <p className="mt-1 truncate text-[10px] text-foreground-muted">
                                {user?.email ||
                                  "No email available"}
                              </p>
                            </div>
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

                        {/* AMOUNT */}
                        <td className="px-5 py-5">
                          <span className="text-sm font-black">
                            {formatAmount(
                              Number(payment.amount) || 0
                            )}
                          </span>
                        </td>

                        {/* METHOD */}
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                            {payment.method}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          <PaymentStatusBadge
                            status={payment.status}
                          />
                        </td>

                        {/* TRANSACTION */}
                        <td className="px-5 py-5">
                          <span className="font-mono text-[10px] text-foreground-muted">
                            {payment.transactionReference ||
                              "Not assigned"}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-5 text-right">
                          <span className="text-xs text-foreground-secondary">
                            {formatDate(payment.createdAt)}
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
/* PAYMENT STATUS */
/* -------------------------------- */

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "successful"
      ? "border-accent/30 bg-accent/10 text-accent"
      : status === "processing"
        ? "border-border bg-background-secondary text-foreground"
        : status === "pending"
          ? "border-border bg-background-secondary text-foreground-secondary"
          : "border-border bg-background text-foreground-muted";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "successful"
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

function getInitials(
  firstName?: string,
  lastName?: string
) {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";

  return (
    `${first}${last}`.toUpperCase() || "U"
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}