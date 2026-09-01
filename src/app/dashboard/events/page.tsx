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

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/organizer/events");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events);
    } catch (error) {
      console.error("Failed to fetch organizer events:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your events"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function deleteEvent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete event");
      }

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== id)
      );
    } catch (error) {
      console.error("Delete event error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete event"
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-gray-400">Loading your events...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl font-bold">My Events</h1>

          <p className="mt-4 text-red-400">{error}</p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
     
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Organizer
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold">
                My Events
              </h1>

              <p className="mt-3 text-gray-400">
                Create and manage the events you organize.
              </p>
            </div>

            <Link
              href="/dashboard/events/create"
              className="rounded-lg bg-white px-5 py-3 text-center font-semibold text-black hover:bg-gray-200"
            >
              + Create Event
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-12 text-center">
            <h2 className="text-2xl font-semibold">
              No events yet
            </h2>

            <p className="mt-3 text-gray-400">
              Create your first event and start getting people
              interested.
            </p>

            <Link
              href="/dashboard/events/create"
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-sm text-gray-400">
                    {event.category}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {event.title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    {event.location}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(event.date).toLocaleDateString(
                      "en-KE",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                    {" · "}
                    {event.time}
                  </p>

                  <div className="mt-4 flex justify-between border-t border-gray-800 pt-4">
                    <span className="font-semibold">
                      {event.price === 0
                        ? "Free"
                        : `KES ${event.price.toLocaleString()}`}
                    </span>

                    <span className="text-sm text-gray-400">
                      Capacity: {event.capacity}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Link
  href={`/dashboard/events/${event._id}`}
  className="rounded-lg border border-gray-700 px-3 py-2 text-center text-sm hover:bg-gray-800"
>
  Analytics
</Link>

                    <Link
                      href={`/dashboard/events/${event._id}/edit`}
                      className="rounded-lg border border-gray-700 px-3 py-2 text-center text-sm hover:bg-gray-800"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}