"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "booking_confirmed":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 text-green-400">
          <CheckIcon className="h-5 w-5" />
        </div>
      );

    case "payment_successful":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm font-bold text-blue-400">
          KES
        </div>
      );

    case "ticket_generated":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-sm font-bold text-purple-400">
          T
        </div>
      );

    case "new_booking":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-lg font-bold text-yellow-400">
          +
        </div>
      );

    case "event_updated":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-lg font-bold text-cyan-400">
          ↻
        </div>
      );

    case "event_cancelled":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-lg font-bold text-red-400">
          !
        </div>
      );

    case "registration_confirmed":
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
          <CheckIcon className="h-5 w-5" />
        </div>
      );

    default:
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background-secondary text-foreground-muted">
          <BellIcon className="h-5 w-5" />
        </div>
      );
  }
}

function formatDate(date: string) {
  const notificationDate = new Date(date);
  const now = new Date();

  const difference =
    now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return notificationDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch notifications."
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function updateNotification(
    id: string,
    read: boolean
  ) {
    try {
      setProcessingId(id);

      const response = await fetch(
        `/api/notifications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            read,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update notification."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read,
              }
            : notification
        )
      );

      setUnreadCount((current) => {
        if (read) {
          return Math.max(0, current - 1);
        }

        return current + 1;
      });
    } catch (error) {
      console.error(
        "Failed to update notification:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update notification."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteNotification(id: string) {
    try {
      setProcessingId(id);

      const response = await fetch(
        `/api/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete notification."
        );
      }

      const deletedNotification = notifications.find(
        (notification) => notification.id === id
      );

      setNotifications((current) =>
        current.filter(
          (notification) => notification.id !== id
        )
      );

      if (
        deletedNotification &&
        !deletedNotification.read
      ) {
        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete notification."
      );
    } finally {
      setProcessingId(null);
    }
  }

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
                    Activity Center
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    Notifications
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-secondary sm:text-base">
                Stay updated with your bookings, payments,
                tickets, and event activity.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-border-hover px-4 text-sm font-semibold text-foreground-secondary transition-all hover:bg-card-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Notifications"
          value={notifications.length}
          description="All activity updates"
          icon={<BellIcon className="h-5 w-5" />}
        />

        <StatCard
          label="Unread"
          value={unreadCount}
          description={
            unreadCount === 0
              ? "You're all caught up"
              : "Updates waiting for you"
          }
          icon={
            <span className="text-sm font-bold">
              {unreadCount}
            </span>
          }
          accent={unreadCount > 0}
        />
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="shrink-0 text-left text-sm font-semibold text-foreground-secondary underline transition hover:text-foreground sm:text-right"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              Recent Activity
            </p>

            <h2 className="mt-1.5 text-lg font-bold tracking-tight">
              Your Notifications
            </h2>
          </div>

          {!loading && notifications.length > 0 && (
            <p className="text-xs text-foreground-muted">
              {notifications.length}{" "}
              {notifications.length === 1
                ? "notification"
                : "notifications"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex gap-4 p-5 sm:p-6"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-background-secondary" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-background-secondary" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-background-secondary" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-background-secondary" />
                  <div className="mt-3 h-3 w-16 animate-pulse rounded bg-background-secondary" />
                </div>

                <div className="hidden h-9 w-16 animate-pulse rounded-lg bg-background-secondary sm:block" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background-secondary">
              <BellIcon className="h-6 w-6 text-foreground-muted" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-foreground">
              You're all caught up
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
              Notifications about your Eventora activity will
              appear here when there is something new to show.
            </p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-border-hover px-5 text-sm font-semibold text-foreground transition hover:bg-card-hover"
            >
              Refresh Notifications
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                processing={
                  processingId === notification.id
                }
                onToggleRead={() =>
                  updateNotification(
                    notification.id,
                    !notification.read
                  )
                }
                onDelete={() =>
                  deleteNotification(notification.id)
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NotificationRow({
  notification,
  processing,
  onToggleRead,
  onDelete,
}: {
  notification: Notification;
  processing: boolean;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`relative p-4 transition-colors sm:p-6 ${
        notification.read
          ? "bg-card hover:bg-card-hover"
          : "bg-background-secondary/70 hover:bg-background-secondary"
      }`}
    >
      {!notification.read && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      )}

      <div className="flex gap-3 sm:gap-4">
        <NotificationIcon type={notification.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h3
                  className={`min-w-0 break-words text-sm leading-6 ${
                    notification.read
                      ? "font-medium text-foreground-secondary"
                      : "font-bold text-foreground"
                  }`}
                >
                  {notification.title}
                </h3>

                {!notification.read && (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"
                    aria-label="Unread"
                  />
                )}
              </div>

              <p className="mt-1.5 break-words text-sm leading-6 text-foreground-muted">
                {notification.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-foreground-muted">
                  {formatDate(notification.createdAt)}
                </span>

                <span className="h-1 w-1 rounded-full bg-border-hover" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                  {notification.type.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-border/70 pt-3 lg:border-0 lg:pt-0">
              <button
                type="button"
                disabled={processing}
                onClick={onToggleRead}
                aria-label={
                  notification.read
                    ? "Mark as unread"
                    : "Mark as read"
                }
                title={
                  notification.read
                    ? "Mark as unread"
                    : "Mark as read"
                }
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-hover px-3 text-xs font-semibold text-foreground-secondary transition hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <CheckIcon className="h-4 w-4" />

                <span className="sm:hidden">
                  {notification.read
                    ? "Unread"
                    : "Read"}
                </span>

                <span className="hidden sm:inline">
                  {notification.read
                    ? "Mark unread"
                    : "Mark read"}
                </span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={onDelete}
                aria-label="Delete notification"
                title="Delete notification"
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border-hover text-foreground-muted transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-5 transition-all hover:border-border-hover sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-foreground-muted">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            accent
              ? "bg-accent/10 text-accent"
              : "bg-background-secondary text-foreground-muted"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}