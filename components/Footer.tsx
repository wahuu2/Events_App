import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="min-w-0 lg:col-span-2">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="Eventora home"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
                E
              </div>

              <div>
                <span className="block text-lg font-bold tracking-tight text-foreground">
                  Eventora
                </span>

                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-foreground-muted">
                  Events made simple
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-foreground-secondary">
              Discover events, book experiences, manage your tickets, and
              connect with opportunities worth experiencing.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Explore
            </h3>

            <div className="mt-4 space-y-3 text-sm text-foreground-muted">
              <Link
                href="/events"
                className="block transition-colors hover:text-foreground"
              >
                Events
              </Link>

              <Link
                href="/dashboard"
                className="block transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>

              <Link
                href="/sign-up"
                className="block transition-colors hover:text-foreground"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-sm text-foreground-muted">
              <p>Event discovery</p>
              <p>Online booking</p>
              <p>Digital tickets</p>
              <p>Organizer tools</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Eventora. All rights reserved.
          </p>

          <p>
            Discover. Connect. Experience.
          </p>
        </div>
      </div>
    </footer>
  );
}