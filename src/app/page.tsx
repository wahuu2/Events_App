import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-5">
        <Link href="/" className="text-xl font-bold">
          EventApp
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-4 py-2 text-black hover:bg-gray-200"
          >
            Sign Up
          </Link>

          <UserButton />
        </div>
      </nav>

      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gray-400">
          Discover • Book • Experience
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Discover events worth experiencing.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Find exciting events, book your tickets, and manage everything from
          one place.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/events"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Explore Events
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
          >
            Dashboard
          </Link>

          <Link
            href="/sign-up"
            className="rounded-lg border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}