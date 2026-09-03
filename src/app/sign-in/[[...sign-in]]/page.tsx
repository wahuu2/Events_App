import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
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
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      {/* Main */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5"
            aria-label="Eventora home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              E
            </div>

            <div className="hidden sm:block">
              <span className="block text-base font-bold tracking-tight">
                Eventora
              </span>

              <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-foreground-muted">
                Events made simple
              </span>
            </div>
          </Link>

          <Link
            href="/events"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-card hover:text-foreground"
          >
            Explore Events
          </Link>
        </div>

        {/* Auth content */}
        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-7 text-center sm:mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-lg font-bold text-accent">
                E
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Sign in to Eventora
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-foreground-secondary">
                Continue discovering events, managing your bookings, and
                accessing your digital tickets.
              </p>
            </div>

            {/* Clerk card */}
            <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl sm:p-5">
              <div className="flex justify-center">
                <SignIn />
              </div>
            </div>

            {/* Supporting links */}
            <div className="mt-6 flex flex-col items-center gap-3 text-xs text-foreground-muted sm:flex-row sm:justify-center sm:gap-5">
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                ← Back to home
              </Link>

              <span className="hidden h-1 w-1 rounded-full bg-border-hover sm:block" />

              <Link
                href="/events"
                className="transition-colors hover:text-foreground"
              >
                Browse events
              </Link>
            </div>

            <p className="mt-6 text-center text-[11px] leading-5 text-foreground-muted">
              Your account gives you access to bookings, payments, digital
              tickets, notifications, and personalized event experiences.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-5 text-center">
          <p className="text-[11px] text-foreground-muted">
            © {new Date().getFullYear()} Eventora. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}