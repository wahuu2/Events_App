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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
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
      console.error("Failed to fetch notifications:", error);

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

      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          read,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update notification."
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
      console.error("Failed to update notification:", error);
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteNotification(id: string) {
    try {
      setProcessingId(id);

      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete notification."
        );
      }

      const deletedNotification = notifications.find(
        (notification) => notification.id === id
      );

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setProcessingId(null);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "booking_confirmed":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400 sm:h-11 sm:w-11">
            <CheckIcon className="h-5 w-5" />
          </div>
        );

      case "payment_successful":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 sm:h-11 sm:w-11">
            $
          </div>
        );

      case "ticket_generated":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 sm:h-11 sm:w-11">
            T
          </div>
        );

      case "new_booking":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 sm:h-11 sm:w-11">
            +
          </div>
        );

      case "event_updated":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 sm:h-11 sm:w-11">
            ↻
          </div>
        );

      case "event_cancelled":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 sm:h-11 sm:w-11">
            !
          </div>
        );

      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-500/10 text-gray-400 sm:h-11 sm:w-11">
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

    return notificationDate.toLocaleDateString();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-0">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              <BellIcon className="h-5 w-5 text-accent" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Notifications
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Stay updated with your bookings, payments, tickets,
            and events.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchNotifications}
          disabled={loading}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border-hover px-4 py-2.5 text-sm font-medium text-foreground-secondary transition hover:bg-card hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
            Total notifications
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
            Unread
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm leading-6 text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchNotifications}
            className="mt-2 text-sm font-medium text-foreground-secondary underline transition hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <ArrowPathIcon className="mx-auto h-7 w-7 animate-spin text-foreground-muted" />

            <p className="mt-4 text-sm text-foreground-muted">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <BellIcon className="mx-auto h-12 w-12 text-foreground-muted" />

            <h2 className="mt-4 text-lg font-semibold text-foreground-secondary">
              No notifications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
              Notifications about your EventApp activity will
              appear here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 border-b border-border p-4 transition last:border-b-0 sm:gap-4 sm:p-5 ${
                  notification.read
                    ? "bg-card"
                    : "bg-background-secondary"
                }`}
              >
                {/* Icon */}
                {getNotificationIcon(notification.type)}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h2
                          className={`min-w-0 break-words text-sm leading-5 ${
                            notification.read
                              ? "font-medium text-foreground-secondary"
                              : "font-semibold text-white"
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </div>

                      <p className="mt-1.5 break-words text-sm leading-6 text-foreground-muted">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-foreground-muted">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 self-start">
                      <button
                        type="button"
                        disabled={
                          processingId === notification.id
                        }
                        onClick={() =>
                          updateNotification(
                            notification.id,
                            !notification.read
                          )
                        }
                        className="rounded-lg border border-transparent p-2 text-foreground-muted transition hover:border-border hover:bg-background-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          notification.read
                            ? "Mark as unread"
                            : "Mark as read"
                        }
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        disabled={
                          processingId === notification.id
                        }
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        className="rounded-lg border border-transparent p-2 text-foreground-muted transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}