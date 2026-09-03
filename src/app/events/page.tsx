"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const locations = ["All", "Juja", "Nairobi", "Thika", "Kiambu"];

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [sort, setSort] = useState("soonest");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setLoading(true);
        setFetchError("");

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
          `/api/events${queryString ? `?${queryString}` : ""}`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load events."
          );
        }

        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch events:", error);

        setEvents([]);

        setFetchError(
          error instanceof Error
            ? error.message
            : "Unable to load events. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, [
    search,
    category,
    location,
    dateFilter,
    priceFilter,
    sort,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    location !== "All" ||
    dateFilter !== "All" ||
    priceFilter !== "All" ||
    sort !== "soonest";

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setDateFilter("All");
    setPriceFilter("All");
    setSort("soonest");
  }

  function retryEvents() {
    setFetchError("");
    setLoading(true);

    /*
     * Changing the search value triggers the existing effect.
     * When there is no search term, briefly changing it ensures
     * the request can be retriggered without adding another API.
     */
    setSearch((current) => `${current} `);
    setTimeout(() => {
      setSearch((current) => current.trim());
    }, 0);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* =========================================================
          PAGE HERO
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl sm:h-96 sm:w-96" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
           
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
              Find something
              <br />
              <span className="text-foreground-muted">
                worth experiencing.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-foreground-secondary sm:mt-7 sm:text-base sm:leading-8 md:text-lg">
              Discover events by category, location, date, and price.
              Find your next experience and book your place through
              Eventora.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-medium text-foreground-muted sm:mt-10 sm:text-sm">
              {["Discover", "Book", "Experience"].map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-border bg-background-secondary px-3 py-2"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH + FILTERS
      ========================================================== */}

      <section className="border-b border-border bg-background-secondary/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Search */}
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Search
                </p>

                <h2 className="mt-1 text-sm font-semibold sm:text-base">
                  Find your next event
                </h2>
              </div>

              {hasActiveFilters && (
                <span className="hidden rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:inline-flex">
                  Filters active
                </span>
              )}
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-foreground-muted">
                <SearchIcon className="h-5 w-5" />
              </div>

              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>

              <input
                id="event-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, locations, or descriptions..."
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-12 text-sm text-foreground transition-all placeholder:text-foreground-muted hover:border-border-hover focus:border-accent focus:ring-2 focus:ring-accent/10 sm:h-14 sm:text-base"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground"
                  aria-label="Clear search"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 rounded-2xl border border-border bg-background p-4 sm:p-5 lg:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Refine results
                </p>

                <h2 className="mt-1 text-base font-semibold sm:text-lg">
                  Filter events
                </h2>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-lg border border-border-hover px-3.5 py-2 text-xs font-semibold text-foreground-secondary transition-all hover:bg-card hover:text-foreground sm:self-auto"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <FilterGroup title="Category">
              <FilterButtons
                items={categories}
                activeValue={category}
                onSelect={setCategory}
              />
            </FilterGroup>

            <div className="mt-7 border-t border-border pt-7">
              <FilterGroup title="Location">
                <FilterButtons
                  items={locations}
                  activeValue={location}
                  onSelect={setLocation}
                />
              </FilterGroup>
            </div>

            <div className="mt-7 grid gap-7 border-t border-border pt-7 md:grid-cols-2 lg:grid-cols-3">
              <FilterGroup title="Date">
                <FilterButtons
                  items={dateFilters.map((item) => item.label)}
                  activeValue={
                    dateFilters.find(
                      (item) => item.value === dateFilter
                    )?.label ?? "All Dates"
                  }
                  onSelect={(label) => {
                    const selected = dateFilters.find(
                      (item) => item.label === label
                    );

                    if (selected) {
                      setDateFilter(selected.value);
                    }
                  }}
                />
              </FilterGroup>

              <FilterGroup title="Price">
                <FilterButtons
                  items={priceFilters.map((item) => item.label)}
                  activeValue={
                    priceFilters.find(
                      (item) => item.value === priceFilter
                    )?.label ?? "All Prices"
                  }
                  onSelect={(label) => {
                    const selected = priceFilters.find(
                      (item) => item.label === label
                    );

                    if (selected) {
                      setPriceFilter(selected.value);
                    }
                  }}
                />
              </FilterGroup>

              <FilterGroup title="Sort by">
                <FilterButtons
                  items={sortOptions.map((item) => item.label)}
                  activeValue={
                    sortOptions.find(
                      (item) => item.value === sort
                    )?.label ?? "Soonest"
                  }
                  onSelect={(label) => {
                    const selected = sortOptions.find(
                      (item) => item.label === label
                    );

                    if (selected) {
                      setSort(selected.value);
                    }
                  }}
                />
              </FilterGroup>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-foreground-muted sm:text-sm">
                {hasActiveFilters
                  ? "Your results have been refined using the selected filters."
                  : "Showing all available events."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-border-hover px-4 py-2.5 text-xs font-semibold text-foreground-secondary transition-all hover:bg-card hover:text-foreground sm:w-auto"
                >
                  Reset search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENTS
      ========================================================== */}

      <section className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Discover
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Upcoming Events
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-foreground-muted">
                Explore experiences happening soon and find something
                that matches your interests.
              </p>
            </div>

            {!loading && !fetchError && (
              <div className="inline-flex w-fit items-center rounded-xl border border-border bg-background-secondary px-4 py-2.5 text-sm font-medium text-foreground-secondary">
                <span className="mr-2 font-bold text-foreground">
                  {events.length}
                </span>

                {events.length === 1 ? "event" : "events"} found
              </div>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="h-52 animate-pulse bg-background-secondary sm:h-56" />

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="h-3 w-20 animate-pulse rounded bg-border" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-border" />
                    <div className="h-3 w-full animate-pulse rounded bg-border" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-border" />

                    <div className="border-t border-border pt-4">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
                      <div className="mt-3 h-3 w-2/5 animate-pulse rounded bg-border" />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="h-5 w-20 animate-pulse rounded bg-border" />
                      <div className="h-4 w-24 animate-pulse rounded bg-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            /* Error */
            <div className="rounded-2xl border border-danger/30 bg-card px-5 py-16 text-center sm:px-8 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
                <span className="text-xl font-bold">!</span>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-danger">
                Something went wrong
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                We couldn't load the events
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-foreground-secondary">
                {fetchError}
              </p>

              <button
                type="button"
                onClick={retryEvents}
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            /* Empty */
            <div className="rounded-2xl border border-border bg-card px-5 py-16 text-center sm:px-8 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border-hover bg-background-secondary text-accent">
                <SearchIcon className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                No results
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                No events found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-foreground-secondary">
                We couldn't find any events matching your current
                search and filters. Try changing your criteria or
                reset the filters.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-accent-hover sm:w-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* Event Grid */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* =============================================================
   EVENT CARD
============================================================= */

function EventCard({ event }: { event: Event }) {
  const [imageError, setImageError] = useState(false);

  const formattedDate = (() => {
    const date = new Date(event.date);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <Link
      href={`/events/${event._id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:shadow-2xl focus-visible:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-background-secondary">
        {!imageError && event.image ? (
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background-secondary">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg font-bold text-accent">
                E
              </div>

              <p className="mt-3 text-xs font-medium text-foreground-muted">
                Eventora
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Category */}
        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)]">
          <span className="inline-flex max-w-full truncate rounded-lg border border-white/10 bg-black/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {event.category}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span className="rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            {event.price === 0
              ? "FREE"
              : `KES ${event.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Information */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-xl">
          {event.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground-secondary">
          {event.description}
        </p>

        {/* Metadata */}
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <EventMeta
            icon={<LocationIcon />}
            label="Location"
            value={event.location}
            truncate
          />

          <EventMeta
            icon={<CalendarIcon />}
            label="Date"
            value={formattedDate}
          />

          {event.time && (
            <EventMeta
              icon={<ClockIcon />}
              label="Time"
              value={event.time}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
              Admission
            </p>

            <p className="mt-1 truncate text-sm font-bold text-foreground">
              {event.price === 0
                ? "Free entry"
                : `KES ${event.price.toLocaleString()}`}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-accent transition-all group-hover:gap-2 group-hover:text-foreground sm:text-sm">
            View Event
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =============================================================
   EVENT META
============================================================= */

function EventMeta({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
          {label}
        </p>

        <p
          className={`mt-0.5 text-sm font-medium text-foreground-secondary ${
            truncate ? "truncate" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   FILTER GROUP
============================================================= */

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* =============================================================
   FILTER BUTTONS
============================================================= */

function FilterButtons({
  items,
  activeValue,
  onSelect,
}: {
  items: string[];
  activeValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex w-max min-w-full gap-2">
        {items.map((item) => {
          const active = activeValue === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              aria-pressed={active}
              className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2.5 sm:text-sm ${
                active
                  ? "border-accent bg-accent text-white shadow-lg shadow-blue-500/10"
                  : "border-border bg-background text-foreground-secondary hover:border-border-hover hover:bg-card hover:text-foreground"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =============================================================
   ICONS
============================================================= */

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 9h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}