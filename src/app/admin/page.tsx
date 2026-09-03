export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
            Eventora Administration
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-foreground-secondary">
            Manage users, events, bookings, payments, tickets, notifications,
            and platform activity from one central location.
          </p>
        </div>

        {/* Overview Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <p className="text-sm font-medium text-foreground-secondary">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Platform users
            </p>
          </div>

          {/* Organizers */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <p className="text-sm font-medium text-foreground-secondary">
              Organizers
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Registered organizers
            </p>
          </div>

          {/* Events */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <p className="text-sm font-medium text-foreground-secondary">
              Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Platform events
            </p>
          </div>

          {/* Bookings */}
          <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-border-hover">
            <p className="text-sm font-medium text-foreground-secondary">
              Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Total bookings
            </p>
          </div>
        </section>

        {/* System Management */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Platform Control
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              System Management
            </h2>

            <p className="mt-2 text-sm text-foreground-secondary">
              Use the administration navigation above to manage different
              areas of the Eventora platform.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                User Management
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                View and monitor registered users and their roles.
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                Event Management
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Monitor events across the entire platform.
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                Booking Management
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Monitor bookings and booking activity.
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                Payment Management
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Monitor payment records and transaction statuses.
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                Ticket Management
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                Monitor issued tickets and their statuses.
              </p>
            </div>

            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold">
                Platform Analytics
              </h3>

              <p className="mt-2 text-sm text-foreground-secondary">
                View system-wide platform statistics and activity.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}