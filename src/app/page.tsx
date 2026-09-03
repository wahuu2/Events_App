import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    number: "01",
    title: "Event Discovery",
    description:
      "Search and filter events by category, location, date, and price to find experiences that match what you are looking for.",
  },
  {
    number: "02",
    title: "Simple Booking",
    description:
      "Reserve your place through a clear and straightforward booking experience designed to keep everything simple.",
  },
  {
    number: "03",
    title: "Digital Tickets",
    description:
      "Access unique digital tickets from your dashboard and keep your event information available whenever you need it.",
  },
  {
    number: "04",
    title: "Organizer Tools",
    description:
      "Create events, manage bookings, monitor attendees, and understand event performance from one centralized dashboard.",
  },
];

const journey = [
  {
    number: "01",
    title: "Discover",
    description: "Find events that match your interests.",
  },
  {
    number: "02",
    title: "Book",
    description: "Reserve your place quickly and securely.",
  },
  {
    number: "03",
    title: "Experience",
    description: "Access your digital ticket and enjoy the event.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  /*
   * =========================================
   * ROLE-BASED ROUTING
   * =========================================
   *
   * Admin      → Admin system
   * Organizer  → Organizer workspace
   * User       → User dashboard
   * Guest      → Public Eventora homepage
   */

  if (user) {
    switch (user.role) {
      case "admin":
        redirect("/admin");

      case "organizer":
        redirect("/dashboard/organizer");

      case "user":
        redirect("/dashboard");

      default:
        break;
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* ========================================= */}
      {/* HERO                                      */}
      {/* ========================================= */}

      <section className="relative overflow-hidden border-b border-border">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Accent glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
          <div className="max-w-5xl">
            {/* Eyebrow */}
            <div className="mb-7 inline-flex max-w-full items-center gap-2.5 rounded-full border border-border bg-background-secondary/80 px-3.5 py-2 text-xs font-medium text-foreground-secondary backdrop-blur-sm sm:mb-8 sm:px-4 sm:text-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>

              <span>One platform. Every event experience.</span>
            </div>

            {/* Heading */}
            <h1 className="max-w-5xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-7xl lg:text-8xl">
              Discover.
              <br />
              <span className="text-foreground-muted">Connect.</span>
              <br />
              Experience.
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-foreground-secondary sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
              Eventora brings event discovery, booking, digital tickets,
              and event management together in one modern platform.
            </p>

            {/* CTA */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row">
              <Link
                href="/events"
                className="group inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 sm:w-auto sm:px-7"
              >
                Explore Events
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border-hover bg-background-secondary/40 px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-card sm:w-auto sm:px-7"
              >
                Create an Account
              </Link>
            </div>
          </div>

          {/* Journey */}
          <div className="mt-16 max-w-5xl border-t border-border pt-8 sm:mt-20 sm:pt-10">
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {journey.map((item) => (
                <div
                  key={item.number}
                  className="py-5 first:pt-0 last:pb-0 sm:px-6 sm:py-2 first:sm:pl-0 last:sm:pr-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-widest text-accent">
                      {item.number}
                    </span>

                    <h2 className="text-lg font-semibold sm:text-xl">
                      {item.title}
                    </h2>
                  </div>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* FEATURES                                  */}
      {/* ========================================= */}

      <section className="border-b border-border bg-background-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
                The platform
              </p>

              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-3xl md:text-4xl">
                Everything you need for the event experience.
              </h2>

              <p className="mt-4 text-sm leading-7 text-foreground-secondary sm:text-base">
                From the first search to the final ticket, Eventora keeps
                every part of the journey organized and easy to manage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["01", "Discovery"],
                ["02", "Booking"],
                ["03", "Payments"],
                ["04", "Tickets"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <p className="text-xl font-bold sm:text-2xl">{number}</p>

                  <p className="mt-1 text-xs text-foreground-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group min-w-0 rounded-2xl border border-border bg-background p-6 transition-all duration-200 hover:border-border-hover hover:bg-card sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-hover bg-background-secondary text-xs font-semibold text-accent transition-colors group-hover:border-accent/40">
                    {feature.number}
                  </div>

                  <span className="text-xl text-foreground-muted transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold sm:text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-foreground-secondary sm:text-base">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* ORGANIZER SECTION                         */}
      {/* ========================================= */}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-background-secondary">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-6 sm:p-8 md:p-12 lg:p-14">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
                  For organizers
                </p>

                <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                  Build, manage, and understand your events.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">
                  Eventora gives organizers the tools to create events,
                  manage bookings, monitor attendees, and track performance
                  from one centralized dashboard.
                </p>

                <Link
                  href="/sign-up"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-border-hover px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-card sm:w-auto"
                >
                  Become an Organizer
                  <span className="ml-2">→</span>
                </Link>
              </div>

              <div className="border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="grid gap-3">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs text-foreground-muted">
                      EVENT MANAGEMENT
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      Create & manage
                    </p>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-card">
                      <div className="h-full w-3/4 rounded-full bg-accent" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs text-foreground-muted">BOOKINGS</p>

                    <p className="mt-2 text-lg font-semibold">
                      Monitor attendees
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent" />

                      <span className="text-xs text-foreground-muted">
                        Real-time visibility
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs text-foreground-muted">
                      ANALYTICS
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      Track performance
                    </p>

                    <div className="mt-4 flex items-end gap-1">
                      <span className="h-4 w-1.5 rounded-sm bg-accent/40" />
                      <span className="h-7 w-1.5 rounded-sm bg-accent/60" />
                      <span className="h-5 w-1.5 rounded-sm bg-accent/50" />
                      <span className="h-10 w-1.5 rounded-sm bg-accent" />
                      <span className="h-8 w-1.5 rounded-sm bg-accent/70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* FINAL CTA                                 */}
      {/* ========================================= */}

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background-secondary p-6 sm:p-10 md:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="min-w-0 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
                  Start exploring
                </p>

                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-5xl">
                  Your next experience is waiting.
                </h2>

                <p className="mt-4 text-sm leading-7 text-foreground-secondary sm:text-base">
                  Discover upcoming events, reserve your place, and keep your
                  digital tickets in one convenient place.
                </p>
              </div>

              <Link
                href="/events"
                className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-accent-hover hover:shadow-blue-500/20 sm:w-auto sm:px-7"
              >
                Browse Events
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}