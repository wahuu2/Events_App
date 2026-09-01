import Link from "next/link";
import Navbar from "@/components/Navbar";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Subtle background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col justify-center px-6 py-24 lg:px-8">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-4 py-2 text-sm text-foreground-secondary">
              <span className="h-2 w-2 rounded-full bg-accent" />
              The modern event platform
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              Discover.
              <br />
              <span className="text-foreground-muted">Connect.</span>
              <br />
              Experience.
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-lg leading-8 text-foreground-secondary sm:text-xl">
              EventApp brings event discovery, ticket booking, digital
              tickets, and event management together in one powerful
              platform.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3.5 font-semibold text-white transition hover:bg-accent-hover"
              >
                Explore Events
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg border border-border-hover px-7 py-3.5 font-semibold text-white transition hover:bg-card"
              >
                Create an Account
              </Link>
            </div>
          </div>

          {/* Hero bottom information */}
          <div className="mt-20 grid max-w-4xl grid-cols-1 border-t border-border pt-8 sm:grid-cols-3">
            <div className="border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pr-8">
              <p className="text-2xl font-bold">Discover</p>

              <p className="mt-2 text-sm text-foreground-muted">
                Find events that match your interests.
              </p>
            </div>

            <div className="border-b border-border py-6 sm:border-b-0 sm:border-r sm:px-8 sm:py-0">
              <p className="text-2xl font-bold">Book</p>

              <p className="mt-2 text-sm text-foreground-muted">
                Reserve your place quickly and easily.
              </p>
            </div>

            <div className="pt-6 sm:pl-8 sm:pt-0">
              <p className="text-2xl font-bold">Experience</p>

              <p className="mt-2 text-sm text-foreground-muted">
                Access your digital tickets in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
              Built for events
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage the event experience.
            </h2>

            <p className="mt-4 text-foreground-secondary">
              From discovering an event to receiving a digital ticket,
              EventApp keeps the entire journey simple and organized.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {/* Feature 1 */}
            <div className="bg-background-secondary p-8 transition hover:bg-card">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-accent">
                01
              </div>

              <h3 className="text-xl font-semibold">
                Event Discovery
              </h3>

              <p className="mt-3 leading-7 text-foreground-secondary">
                Search and filter events by category, location, date, and
                price to find exactly what you are looking for.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background-secondary p-8 transition hover:bg-card">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-accent">
                02
              </div>

              <h3 className="text-xl font-semibold">
                Simple Booking
              </h3>

              <p className="mt-3 leading-7 text-foreground-secondary">
                Reserve event tickets through a straightforward booking
                experience designed for speed and clarity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background-secondary p-8 transition hover:bg-card">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-accent">
                03
              </div>

              <h3 className="text-xl font-semibold">
                Digital Tickets
              </h3>

              <p className="mt-3 leading-7 text-foreground-secondary">
                Generate digital tickets with unique references and QR
                codes for a modern event experience.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background-secondary p-8 transition hover:bg-card">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-accent">
                04
              </div>

              <h3 className="text-xl font-semibold">
                Organizer Tools
              </h3>

              <p className="mt-3 leading-7 text-foreground-secondary">
                Create events, monitor bookings, manage attendees, and
                understand event performance from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-2xl border border-border bg-background-secondary p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                  Start exploring
                </p>

                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                  Your next experience is waiting.
                </h2>

                <p className="mt-5 text-foreground-secondary">
                  Discover upcoming events and find something worth
                  experiencing.
                </p>
              </div>

              <Link
                href="/events"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent px-7 py-3.5 font-semibold text-white transition hover:bg-accent-hover"
              >
                Browse Events
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} EventApp. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/events"
              className="transition hover:text-white"
            >
              Events
            </Link>

            <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}