"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    location: "",
    date: "",
    time: "",
    category: "Music",
    price: "",
    capacity: "",
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);

        const response = await fetch(`/api/events/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch event"
          );
        }

        const fetchedEvent: Event = data.event;

        setEvent(fetchedEvent);

        setForm({
          title: fetchedEvent.title,
          description: fetchedEvent.description,
          image: fetchedEvent.image,
          location: fetchedEvent.location,
          date: new Date(fetchedEvent.date)
            .toISOString()
            .split("T")[0],
          time: fetchedEvent.time,
          category: fetchedEvent.category,
          price: String(fetchedEvent.price),
          capacity: String(fetchedEvent.capacity),
        });
      } catch (error) {
        console.error("Failed to fetch event:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          image: form.image,
          location: form.location,
          date: form.date,
          time: form.time,
          category: form.category,
          price: Number(form.price),
          capacity: Number(form.capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update event"
        );
      }

      setSuccess("Event updated successfully.");

      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Update event error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update event"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-gray-400">
            Loading event...
          </p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-3xl font-bold">
            Unable to load event
          </h1>

          <p className="mt-4 text-red-400">
            {error}
          </p>

          <Link
            href="/dashboard/events"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            Back to My Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
     
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Organizer
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Edit Event
          </h1>

          <p className="mt-3 text-gray-400">
            Update the details of your event.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Event title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Image URL
            </label>

            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Date
              </label>

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Time
              </label>

              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (KES)
              </label>

              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Capacity
              </label>

              <input
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-900 bg-green-950/30 p-4 text-sm text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </section>
    </main>
  );
}