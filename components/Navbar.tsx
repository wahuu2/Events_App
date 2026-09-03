import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  CalendarDaysIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5"
          aria-label="Eventora home"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 group-hover:scale-105 group-hover:bg-accent-hover">
            E
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
              Eventora
            </p>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-foreground-muted sm:block">
              Events made simple
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Home */}
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-all hover:bg-card hover:text-foreground lg:inline-flex"
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>

          {/* Explore Events */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground-secondary transition-all hover:bg-card hover:text-foreground sm:px-3"
          >
            <CalendarDaysIcon className="h-4 w-4" />

            <span className="hidden sm:inline">
              Explore Events
            </span>

            <span className="sm:hidden">
              Explore
            </span>
          </Link>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="hidden rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-all hover:border-border-hover hover:bg-card-hover md:inline-flex"
          >
            Dashboard
          </Link>

          {/* Sign In */}
          <Link
            href="/sign-in"
            className="hidden rounded-lg border border-border-hover px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-accent/50 hover:bg-card sm:inline-flex"
          >
            Sign In
          </Link>

          {/* Get Started */}
          <Link
            href="/sign-up"
            className="hidden rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover hover:shadow-blue-500/20 md:inline-flex"
          >
            Get Started
          </Link>

          {/* User */}
          <div className="ml-1 border-l border-border pl-2 sm:ml-2 sm:pl-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 sm:h-10 sm:w-10",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}