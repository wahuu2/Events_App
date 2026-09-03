"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  TicketIcon,
  InformationCircleIcon,
  XMarkIcon,
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
  icon: React.ReactNode;
}[] = [
  {
    key: "bookingConfirmed",
    title: "Booking confirmations",
    description:
      "Get notified when your event booking is confirmed.",
    icon: <CheckIcon className="h-5 w-5" />,
  },
  {
    key: "paymentSuccessful",
    title: "Successful payments",
    description:
      "Get notified when a payment has been successfully completed.",
    icon: <CreditCardIcon className="h-5 w-5" />,
  },
  {
    key: "ticketGenerated",
    title: "Ticket delivery",
    description:
      "Get notified when your event tickets are ready.",
    icon: <TicketIcon className="h-5 w-5" />,
  },
  {
    key: "eventUpdated",
    title: "Event updates",
    description:
      "Get notified when an event you booked is updated.",
    icon: <CalendarDaysIcon className="h-5 w-5" />,
  },
  {
    key: "eventCancelled",
    title: "Event cancellations",
    description:
      "Get notified when an event you booked is cancelled.",
    icon: <XMarkIcon className="h-5 w-5" />,
  },
  {
    key: "eventReminder",
    title: "Event reminders",
    description:
      "Receive reminders about upcoming events.",
    icon: <BellIcon className="h-5 w-5" />,
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
      setMessage("");

      const response = await fetch(
        "/api/notifications/preferences"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch notification preferences."
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

  const enabledCount = Object.values(preferences).filter(
    Boolean
  ).length;

  return (
    <div className="w-full">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                  <BellIcon className="h-5 w-5 text-accent" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    Account Settings
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    Notification Preferences
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Choose which notifications you want to receive
                from Eventora.
              </p>
            </div>

            {!loading && (
              <div className="shrink-0 rounded-xl border border-border bg-background-secondary px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground-muted">
                  Active preferences
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {enabledCount} of {preferenceItems.length} enabled
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success */}
      {message && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 sm:p-5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
            <CheckIcon className="h-4 w-4 text-green-400" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-400">
              Preferences saved
            </p>

            <p className="mt-1 text-xs leading-5 text-green-400/80">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-400">
                Something went wrong
              </p>

              <p className="mt-1 text-sm leading-6 text-red-400/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPreferences}
              className="shrink-0 text-left text-sm font-semibold text-foreground-secondary underline transition hover:text-foreground sm:text-right"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Preferences */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-secondary">
              <BellIcon className="h-4 w-4 text-accent" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Notifications
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight">
                Choose what reaches you
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
                You can change these preferences at any time.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {preferenceItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 p-5 sm:p-6"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-background-secondary" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-48 max-w-full animate-pulse rounded bg-background-secondary" />

                  <div className="mt-3 h-3 w-full max-w-lg animate-pulse rounded bg-background-secondary" />
                </div>

                <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-background-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {preferenceItems.map((item) => {
              const enabled = preferences[item.key];
              const saving = savingKey === item.key;

              return (
                <div
                  key={item.key}
                  className={`relative flex gap-4 p-4 transition-colors sm:p-6 ${
                    enabled
                      ? "bg-card hover:bg-card-hover"
                      : "bg-background-secondary/30 hover:bg-background-secondary/50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      enabled
                        ? "border-accent/20 bg-accent/10 text-accent"
                        : "border-border bg-background-secondary text-foreground-muted"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1">
                      <h3
                        className={`break-words text-sm font-semibold ${
                          enabled
                            ? "text-foreground"
                            : "text-foreground-secondary"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
                        {item.description}
                      </p>
                    </div>

                    <p
                      className={`mt-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        enabled
                          ? "text-accent"
                          : "text-foreground-muted"
                      }`}
                    >
                      {enabled ? "Enabled" : "Disabled"}
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
                    aria-pressed={enabled}
                    className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-card ${
                      enabled
                        ? "bg-accent shadow-lg shadow-blue-500/10"
                        : "bg-border-hover"
                    } ${
                      saving
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                        enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Information */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <InformationCircleIcon className="h-5 w-5 text-accent" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">
              About notification settings
            </h2>

            <p className="mt-2 text-sm leading-6 text-foreground-muted">
              These preferences control the notification types
              generated for your Eventora account. Turning a
              preference off does not delete notifications that
              already exist.
            </p>
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}