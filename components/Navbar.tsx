import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            E
          </div>

          <span className="text-xl font-bold tracking-tight">
            EventApp
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="hidden rounded-lg px-4 py-2 text-sm text-foreground-secondary transition hover:bg-card hover:text-white sm:block"
          >
            Explore Events
          </Link>

          <Link
            href="/sign-in"
            className="rounded-lg border border-border-hover px-4 py-2 text-sm font-medium transition hover:bg-card"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover sm:block"
          >
            Get Started
          </Link>

          <UserButton />
        </div>
      </div>
    </nav>
  );
}