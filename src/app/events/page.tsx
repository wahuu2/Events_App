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

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // Sorting
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        // Search filter
        if (search.trim()) {
          params.set("search", search.trim());
        }

        // Category filter
        if (category !== "All") {
          params.set("category", category);
        }

        // Location filter
        if (location !== "All") {
          params.set("location", location);
        }

        // Date filter
        if (dateFilter !== "All") {
          params.set("date", dateFilter.toLowerCase());
        }

        // Price filter
        if (priceFilter !== "All") {
          params.set("price", priceFilter.toLowerCase());
        }

        // Sorting
        if (sort !== "soonest") {
          params.set("sort", sort);
        }

        const queryString = params.toString();

        const response = await fetch(
          `/api/events${queryString ? `?${queryString}` : ""}`
        );

        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [
    search,
    category,
    location,
    dateFilter,
    priceFilter,
    sort,
  ]);

  const categories = [
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
  ];

  const locations = [
    "All",
    "Juja",
    "Nairobi",
    "Thika",
    "Kiambu",
  ];

  const dateFilters = [
    { label: "All Dates", value: "All" },
    { label: "Today", value: "Today" },
    { label: "This Week", value: "Week" },
    { label: "This Month", value: "Month" },
  ];

  const priceFilters = [
    { label: "All Prices", value: "All" },
    { label: "Free", value: "Free" },
    { label: "Paid", value: "Paid" },
  ];

  const sortOptions = [
    { label: "Soonest", value: "soonest" },
    { label: "Latest", value: "latest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
  ];

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    location !== "All" ||
    dateFilter !== "All" ||
    priceFilter !== "All" ||
    sort !== "soonest";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setDateFilter("All");
    setPriceFilter("All");
    setSort("soonest");
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex flex-col gap-4 border-b border-gray-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          EventApp
        </Link>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Dashboard
          </Link>

          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm transition hover:bg-gray-800"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-4 py-2.5 text-sm text-black transition hover:bg-gray-200"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
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
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title, description or location..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Category
          </h3>

          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  category === item
                    ? "border-white bg-white text-black"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Location
          </h3>

          <div className="flex flex-wrap gap-3">
            {locations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocation(item)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  location === item
                    ? "border-white bg-white text-black"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filters */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Date
          </h3>

          <div className="flex flex-wrap gap-3">
            {dateFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setDateFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  dateFilter === item.value
                    ? "border-white bg-white text-black"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filters */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Price
          </h3>

          <div className="flex flex-wrap gap-3">
            {priceFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPriceFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  priceFilter === item.value
                    ? "border-white bg-white text-black"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Sort By
          </h3>

          <div className="flex flex-wrap gap-3">
            {sortOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSort(item.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  sort === item.value
                    ? "border-white bg-white text-black"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-8">
          <div>
            {hasActiveFilters && (
              <p className="text-sm text-gray-500">
                Filters are currently active
              </p>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:bg-gray-800 hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Events */}
        <div>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">
              Upcoming Events
            </h2>

            {!loading && (
              <p className="text-sm text-gray-500">
                {events.length}{" "}
                {events.length === 1 ? "event" : "events"} found
              </p>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-10 text-center">
              <p className="text-gray-400">
                Loading events...
              </p>
            </div>
          ) : events.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-12 text-center">
              <h3 className="text-xl font-semibold">
                No events found
              </h3>

              <p className="mt-2 text-gray-400">
                Try changing your search or filters to find available
                events.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* Event Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-600"
                >
                  {/* Event Image */}
                  <div className="overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Event Information */}
                  <div className="p-5">
                    <p className="mb-2 text-sm text-gray-400">
                      {event.category}
                    </p>

                    <h3 className="text-xl font-semibold transition group-hover:text-gray-300">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      {event.location}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString(
                        "en-KE",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
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