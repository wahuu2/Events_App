import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="border-b border-border bg-background-secondary">
        <div className="container-responsive">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <Link href="/admin" className="shrink-0">
              <div className="text-lg font-bold">Eventora</div>
              <div className="text-xs font-medium uppercase tracking-wider text-accent">
                Administration
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-border-hover hover:bg-card"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="container-responsive">
          <div className="flex gap-1 overflow-x-auto py-3">
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Overview
            </Link>

            <Link
              href="/admin/users"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Users
            </Link>

            <Link
  href="/admin/organizers"
  className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
>
  Organizers
</Link>

            <Link
              href="/admin/events"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Events
            </Link>

            <Link
              href="/admin/bookings"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Bookings
            </Link>

            <Link
              href="/admin/payments"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Payments
            </Link>

            <Link
              href="/admin/tickets"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Tickets
            </Link>

            <Link
              href="/admin/notifications"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Notifications
            </Link>

            <Link
              href="/admin/analytics"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-card"
            >
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin Page Content */}
      <main>{children}</main>
    </div>
  );
}