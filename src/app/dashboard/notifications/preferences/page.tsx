"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type Preferences = {
  bookingConfirmed: boolean;
  paymentSuccessful: boolean;
  ticketGenerated: boolean;
  eventUpdated: boolean;
  eventCancelled: boolean;
  eventReminder: boolean;
};

const defaultPreferences: Preferences = {
  bookingConfirmed: true,
  paymentSuccessful: true,
  ticketGenerated: true,
  eventUpdated: true,
  eventCancelled: true,
  eventReminder: true,
};

const preferenceItems: {
  key: keyof Preferences;
  title: string;
  description: string;
}[] = [
  {
    key: "bookingConfirmed",
    title: "Booking confirmations",
    description:
      "Get notified when your event booking is confirmed.",
  },
  {
    key: "paymentSuccessful",
    title: "Successful payments",
    description:
      "Get notified when a payment has been successfully completed.",
  },
  {
    key: "ticketGenerated",
    title: "Ticket delivery",
    description:
      "Get notified when your event tickets are ready.",
  },
  {
    key: "eventUpdated",
    title: "Event updates",
    description:
      "Get notified when an event you booked is updated.",
  },
  {
    key: "eventCancelled",
    title: "Event cancellations",
    description:
      "Get notified when an event you booked is cancelled.",
  },
  {
    key: "eventReminder",
    title: "Event reminders",
    description:
      "Receive reminders about upcoming events.",
  },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] =
    useState<keyof Preferences | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchPreferences() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/notifications/preferences"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch notification preferences."
        );
      }

      setPreferences({
        bookingConfirmed:
          data.preferences.bookingConfirmed,
        paymentSuccessful:
          data.preferences.paymentSuccessful,
        ticketGenerated:
          data.preferences.ticketGenerated,
        eventUpdated:
          data.preferences.eventUpdated,
        eventCancelled:
          data.preferences.eventCancelled,
        eventReminder:
          data.preferences.eventReminder,
      });
    } catch (error) {
      console.error(
        "Failed to fetch notification preferences:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notification preferences."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function togglePreference(
    key: keyof Preferences
  ) {
    const newValue = !preferences[key];

    setSavingKey(key);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/notifications/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [key]: newValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update notification preference."
        );
      }

      setPreferences((current) => ({
        ...current,
        [key]: newValue,
      }));

      setMessage("Notification preferences updated.");
    } catch (error) {
      console.error(
        "Failed to update notification preference:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update notification preference."
      );
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <BellIcon className="h-7 w-7 text-gray-300" />

          <h1 className="text-2xl font-bold text-white">
            Notification Preferences
          </h1>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Choose which notifications you want to receive.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <CheckIcon className="h-5 w-5 text-green-400" />

          <p className="text-sm text-green-400">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchPreferences}
            className="mt-2 text-sm text-gray-300 underline hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <ArrowPathIcon className="mx-auto h-7 w-7 animate-spin text-gray-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading preferences...
            </p>
          </div>
        ) : (
          <div>
            {preferenceItems.map((item) => {
              const enabled = preferences[item.key];
              const saving = savingKey === item.key;

              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-6 border-b border-gray-800 p-5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      togglePreference(item.key)
                    }
                    disabled={saving}
                    aria-label={`${
                      enabled ? "Disable" : "Enable"
                    } ${item.title}`}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      enabled
                        ? "bg-white"
                        : "bg-gray-700"
                    } ${
                      saving
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full transition ${
                        enabled
                          ? "left-6 bg-black"
                          : "left-1 bg-gray-400"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-white">
          Notification settings
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          These preferences control the notification types
          available for your EventApp account. Turning a setting
          off does not delete existing notifications.
        </p>
      </div>
    </div>
  );
}