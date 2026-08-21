"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function CreateEventPage() {
  const router = useRouter();

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      const response = await fetch("/api/events", {
        method: "POST",
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
          data.message || "Failed to create event"
        );
      }

      setSuccess("Event created successfully.");

      setTimeout(() => {
        router.push("/dashboard/events");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Create event error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create event"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            EventApp
          </Link>

          <Link
            href="/dashboard/events"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            Back to My Events
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Organizer
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Create Event
          </h1>

          <p className="mt-3 text-gray-400">
            Add the details of your event and publish it to
            EventApp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Event title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Nairobi Tech Summit 2026"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          {/* Description */}
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
              placeholder="Tell people what your event is about..."
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          {/* Image */}
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
              placeholder="https://example.com/event-image.jpg"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />

            <p className="mt-2 text-xs text-gray-500">
              Use a publicly accessible image URL.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Nairobi, Kenya"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>

          {/* Date + Time */}
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

          {/* Category */}
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

          {/* Price + Capacity */}
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
                placeholder="0"
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter 0 for a free event.
              </p>
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
                placeholder="100"
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-900 bg-green-950/30 p-4 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </section>
    </main>
  );
}