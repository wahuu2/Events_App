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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <CheckIcon className="h-5 w-5" />
          </div>
        );

      case "payment_successful":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            $
          </div>
        );

      case "ticket_generated":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            T
          </div>
        );

      case "new_booking":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
            +
          </div>
        );

      case "event_updated":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            ↻
          </div>
        );

      case "event_cancelled":
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            !
          </div>
        );

      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-500/10 text-gray-400">
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <BellIcon className="h-7 w-7 text-gray-300" />

            <h1 className="text-2xl font-bold text-white">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Stay updated with your bookings, payments, tickets,
            and events.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">
            Total notifications
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">
            Unread
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {unreadCount}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>

          <button
            type="button"
            onClick={fetchNotifications}
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
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-700" />

            <h2 className="mt-4 text-lg font-semibold text-gray-300">
              No notifications yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Notifications about your EventApp activity will
              appear here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 border-b border-gray-800 p-5 transition last:border-b-0 ${
                  notification.read
                    ? "bg-gray-900"
                    : "bg-gray-800/40"
                }`}
              >
                {getNotificationIcon(notification.type)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-sm ${
                            notification.read
                              ? "font-medium text-gray-400"
                              : "font-semibold text-white"
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-600">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
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
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:opacity-50"
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
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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
    </div>
  );
}