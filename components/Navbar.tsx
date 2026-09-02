import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            E
          </div>

          <span className="text-lg font-bold tracking-tight sm:text-xl">
            EventApp
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/events"
            className="hidden rounded-lg px-3 py-2 text-sm text-foreground-secondary transition hover:bg-card hover:text-white sm:block"
          >
            Explore Events
          </Link>

          <Link
            href="/sign-in"
            className="hidden rounded-lg border border-border-hover px-3 py-2 text-sm font-medium transition hover:bg-card sm:block"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="hidden rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover md:block"
          >
            Get Started
          </Link>

          <UserButton />
        </div>
      </div>
    </nav>
  );
}