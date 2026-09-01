"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

  type Event = {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price: number;
  capacity: number;
};

export default function EventsPage() {

const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");

useEffect(() => {
  async function fetchEvents() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) {
        params.set("search", search);
      }

      if (category !== "All") {
        params.set("category", category);
      }

      const response = await fetch(
        `/api/events?${params.toString()}`
      );

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchEvents();
}, [search, category]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 px-8 py-5">
        <Link href="/" className="text-xl font-bold">
          EventApp
        </Link>

        <div className="flex gap-4">
          <Link
                      href="/dashboard"
                      className="rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
                    >
                      Dashboard
                    </Link>
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
          
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gray-400">
            Discover
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Find your next event
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Discover concerts, conferences, sports, networking events and
            more.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search events..."
  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-5 py-3 text-white outline-none placeholder:text-gray-500 focus:border-gray-500"
/>
        </div>

        {/* Categories */}
        <div className="mb-10 flex flex-wrap gap-3">
  {[
    "All",
    "Music",
    "Sports",
    "Technology",
    "Business",
    "Education",
    "Entertainment",
    "Food & Drink",
    "Arts & Culture",
    "Networking",
    "Christian Events",
  ].map((item) => (
    <button
      key={item}
      onClick={() => setCategory(item)}
      className={`rounded-full border px-4 py-2 text-sm ${
        category === item
          ? "border-white bg-white text-black"
          : "border-gray-700 hover:bg-gray-800"
      }`}
    >
      {item}
    </button>
  ))}
</div>

        {/* Events */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">
            Upcoming Events
          </h2>

          {loading ? (
  <p className="text-gray-400">Loading events...</p>
) : events.length === 0 ? (
  <p className="text-gray-400">
    No events found.
  </p>
) : (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {events.map((event) => (
      <Link
        key={event._id}
        href={`/events/${event._id}`}
        className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-600"
      >
        <img
          src={event.image}
          alt={event.title}
          className="h-52 w-full object-cover"
        />

        <div className="p-5">
          <p className="mb-2 text-sm text-gray-400">
            {event.category}
          </p>

          <h3 className="text-xl font-semibold">
            {event.title}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            {event.location}
          </p>

          <p className="mt-4 font-medium">
            {event.price === 0
              ? "Free"
              : `KES ${event.price.toLocaleString()}`}
          </p>
        </div>
      </Link>
    ))}
  </div>
)}
        </div>
      </section>
    </main>
  );
}