import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
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

        <div className="relative mx-auto flex min-h-[auto] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 md:min-h-[70vh] md:py-24 lg:px-8 lg:py-28">
          <div className="w-full max-w-4xl">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-2 text-xs text-foreground-secondary sm:mb-8 sm:px-4 sm:text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              <span>The modern event platform</span>
            </div>

            {/* Heading */}
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-8xl">
              Discover.
              <br />
              <span className="text-foreground-muted">Connect.</span>
              <br />
              Experience.
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground-secondary sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
              EventApp brings event discovery, ticket booking, digital
              tickets, and event management together in one powerful
              platform.
            </p>

            {/* CTA */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row">
              <Link
                href="/events"
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto sm:px-7"
              >
                Explore Events
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border-hover px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-card sm:w-auto sm:px-7"
              >
                Create an Account
              </Link>
            </div>
          </div>

          {/* Hero bottom information */}
          <div className="mt-14 w-full max-w-4xl border-t border-border pt-7 sm:mt-20 sm:pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {/* Discover */}
              <div className="border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pr-6 md:pr-8">
                <p className="text-xl font-bold sm:text-2xl">
                  Discover
                </p>

                <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
                  Find events that match your interests.
                </p>
              </div>

              {/* Book */}
              <div className="border-b border-border py-6 sm:border-b-0 sm:border-r sm:px-6 md:px-8">
                <p className="text-xl font-bold sm:text-2xl">
                  Book
                </p>

                <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
                  Reserve your place quickly and easily.
                </p>
              </div>

              {/* Experience */}
              <div className="pt-6 sm:pl-6 sm:pt-0 md:pl-8">
                <p className="text-xl font-bold sm:text-2xl">
                  Experience
                </p>

                <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
                  Access your digital tickets in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent sm:text-sm sm:tracking-[0.25em]">
              Built for events
            </p>

            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-3xl md:text-4xl">
              Everything you need to manage the event experience.
            </h2>

            <p className="mt-4 text-sm leading-6 text-foreground-secondary sm:text-base">
              From discovering an event to receiving a digital ticket,
              EventApp keeps the entire journey simple and organized.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-14 md:grid-cols-2">
            {/* Feature 1 */}
            <div className="min-w-0 bg-background-secondary p-6 transition hover:bg-card sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-sm font-medium text-accent">
                01
              </div>

              <h3 className="text-lg font-semibold sm:text-xl">
                Event Discovery
              </h3>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base sm:leading-7">
                Search and filter events by category, location, date,
                and price to find exactly what you are looking for.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="min-w-0 bg-background-secondary p-6 transition hover:bg-card sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-sm font-medium text-accent">
                02
              </div>

              <h3 className="text-lg font-semibold sm:text-xl">
                Simple Booking
              </h3>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base sm:leading-7">
                Reserve event tickets through a straightforward booking
                experience designed for speed and clarity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="min-w-0 bg-background-secondary p-6 transition hover:bg-card sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-sm font-medium text-accent">
                03
              </div>

              <h3 className="text-lg font-semibold sm:text-xl">
                Digital Tickets
              </h3>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base sm:leading-7">
                Generate digital tickets with unique references and QR
                codes for a modern event experience.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="min-w-0 bg-background-secondary p-6 transition hover:bg-card sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-border-hover text-sm font-medium text-accent">
                04
              </div>

              <h3 className="text-lg font-semibold sm:text-xl">
                Organizer Tools
              </h3>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base sm:leading-7">
                Create events, monitor bookings, manage attendees, and
                understand event performance from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
          <div className="rounded-2xl border border-border bg-background-secondary p-6 sm:p-10 md:p-12 lg:p-16">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div className="min-w-0 max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent sm:text-sm sm:tracking-[0.25em]">
                  Start exploring
                </p>

                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-3xl md:text-5xl">
                  Your next experience is waiting.
                </h2>

                <p className="mt-4 text-sm leading-6 text-foreground-secondary sm:mt-5 sm:text-base">
                  Discover upcoming events and find something worth
                  experiencing.
                </p>
              </div>

              <Link
                href="/events"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto sm:px-7"
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} EventApp. All rights reserved.
          </p>

          <div className="flex justify-center gap-6 sm:justify-end">
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