import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Payment from "@/database/payment.model";

export default async function AdminPaymentsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const payments = await Payment.find({})
    .populate("user", "firstName lastName email")
    .populate("booking", "bookingReference totalAmount status")
    .sort({ createdAt: -1 })
    .lean();

  const successfulPayments = payments.filter(
    (payment) =>
      payment.status === "successful" ||
      payment.status === "completed" ||
      payment.status === "paid"
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const failedPayments = payments.filter(
    (payment) =>
      payment.status === "failed" ||
      payment.status === "cancelled"
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
              Payment Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor payment records and transaction statuses across the
              Eventora platform.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Payments
            </p>

            <p className="mt-2 text-3xl font-bold">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Successful
            </p>

            <p className="mt-2 text-3xl font-bold">
              {successfulPayments}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingPayments}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Failed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {failedPayments}
            </p>
          </div>
        </section>

        {/* Payments Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              All Platform Payments
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    User
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Booking
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Method
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
                {payments.map((payment) => (
                  <tr
                    key={payment._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {payment.transactionId ||
                          payment._id.toString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {payment.user ? (
                        <>
                          <div className="text-sm font-medium">
                            {payment.user.firstName}{" "}
                            {payment.user.lastName}
                          </div>

                          <div className="mt-1 text-xs text-foreground-muted">
                            {payment.user.email}
                          </div>
                        </>
                      ) : (
                        "Unknown user"
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {payment.booking?.bookingReference || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {payment.amount ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {payment.paymentMethod ||
                        payment.method ||
                        "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                        {payment.status || "unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {payment.createdAt
                        ? new Date(
                            payment.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No payment records found.
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