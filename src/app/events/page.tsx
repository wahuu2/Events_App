"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          params.set("category", category);
        }

        if (location !== "All") {
          params.set("location", location);
        }

        if (dateFilter !== "All") {
          params.set("date", dateFilter.toLowerCase());
        }

        if (priceFilter !== "All") {
          params.set("price", priceFilter.toLowerCase());
        }

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
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-accent">
              Explore events
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find something worth experiencing.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-secondary sm:text-lg">
              Discover events by category, location, date, and price.
              Find your next experience and book your place.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title, description or location..."
              className="w-full rounded-xl border border-border bg-card px-5 py-4 pr-12 text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted transition hover:text-white"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-8 space-y-7">
            {/* Category */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Category
              </h3>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      category === item
                        ? "border-accent bg-accent text-white"
                        : "border-border text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Location
              </h3>

              <div className="flex flex-wrap gap-2">
                {locations.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLocation(item)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      location === item
                        ? "border-accent bg-accent text-white"
                        : "border-border text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Price + Sort */}
            <div className="grid gap-7 lg:grid-cols-3">
              {/* Date */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Date
                </h3>

                <div className="flex flex-wrap gap-2">
                  {dateFilters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDateFilter(item.value)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        dateFilter === item.value
                          ? "border-accent bg-accent text-white"
                          : "border-border text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Price
                </h3>

                <div className="flex flex-wrap gap-2">
                  {priceFilters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriceFilter(item.value)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        priceFilter === item.value
                          ? "border-accent bg-accent text-white"
                          : "border-border text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Sort by
                </h3>

                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSort(item.value)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        sort === item.value
                          ? "border-accent bg-accent text-white"
                          : "border-border text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {hasActiveFilters ? (
                <p className="text-sm text-foreground-secondary">
                  Active filters are applied to your search.
                </p>
              ) : (
                <p className="text-sm text-foreground-muted">
                  Showing all available events.
                </p>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start rounded-lg border border-border-hover px-4 py-2 text-sm font-medium text-foreground-secondary transition hover:bg-card hover:text-white sm:self-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Discover
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Upcoming Events
              </h2>
            </div>

            {!loading && (
              <p className="text-sm text-foreground-muted">
                {events.length}{" "}
                {events.length === 1 ? "event" : "events"} found
              </p>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-52 animate-pulse bg-background-secondary" />

                  <div className="space-y-4 p-6">
                    <div className="h-3 w-20 animate-pulse rounded bg-border" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-border" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-border" />
                    <div className="h-5 w-24 animate-pulse rounded bg-border" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border-hover bg-background-secondary text-accent">
                —
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No events found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-secondary">
                We couldn't find any events matching your current search
                and filters. Try adjusting your criteria.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
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
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-border-hover hover:shadow-2xl"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {event.category}
                    </div>
                  </div>

                  {/* Information */}
                  <div className="p-6">
                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight transition group-hover:text-accent">
                      {event.title}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground-secondary">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-border pt-5">
                      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <span className="text-accent">●</span>
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <span className="text-accent">●</span>
                        <span>
                          {new Date(event.date).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="font-semibold text-white">
                          {event.price === 0
                            ? "Free"
                            : `KES ${event.price.toLocaleString()}`}
                        </span>

                        <span className="text-sm font-medium text-accent transition group-hover:text-white">
                          View Event →
                        </span>
                      </div>
                    </div>
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