"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../hooks/useNotifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function markAsRead(id: string) {
    try {
      setProcessingId(id);

      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          read: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to mark notification as read."
        );
      }

      await refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setProcessingId(null);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "booking_confirmed":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            ✓
          </div>
        );

      case "payment_successful":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            $
          </div>
        );

      case "ticket_generated":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            T
          </div>
        );

      case "new_booking":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
            +
          </div>
        );

      case "event_updated":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            ↻
          </div>
        );

      case "event_cancelled":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            !
          </div>
        );

      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-500/10 text-gray-400">
            i
          </div>
        );
    }
  }

  function formatDate(date: string) {
    const notificationDate = new Date(date);
    const now = new Date();

    const difference = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Dashboard Navbar */}
      <nav className="relative z-10 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white transition group-hover:bg-accent-hover">
              E
            </div>

            <div>
              <p className="font-bold tracking-tight">
                EventApp
              </p>

              <p className="text-xs text-foreground-muted">
                Event management platform
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="hidden rounded-lg px-4 py-2 text-sm text-foreground-secondary transition hover:bg-card hover:text-white sm:block"
            >
              Explore Events
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-white transition hover:bg-border"
            >
              Dashboard
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className="relative rounded-lg p-2.5 text-foreground-secondary transition hover:bg-card hover:text-white"
                aria-label="Notifications"
                aria-expanded={open}
              >
                <BellIcon className="h-6 w-6" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {open && (
                <div className="absolute right-0 mt-3 w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <p className="mt-0.5 text-xs text-foreground-muted">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>

                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setOpen(false)}
                      className="text-xs text-foreground-secondary transition hover:text-white"
                    >
                      View all
                    </Link>
                  </div>

                  {/* Notifications */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-sm text-foreground-muted">
                        Loading notifications...
                      </div>
                    ) : error ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-red-400">
                          Failed to load notifications.
                        </p>

                        <button
                          type="button"
                          onClick={refetch}
                          className="mt-2 text-xs text-foreground-secondary transition hover:text-white"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <BellIcon className="mx-auto h-8 w-8 text-gray-700" />

                        <p className="mt-3 text-sm text-foreground-secondary">
                          No notifications yet.
                        </p>
                      </div>
                    ) : (
                      notifications
                        .slice(0, 10)
                        .map((notification: Notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              !notification.read &&
                              markAsRead(notification.id)
                            }
                            disabled={
                              processingId === notification.id
                            }
                            className={`flex w-full gap-3 border-b border-border p-4 text-left transition hover:bg-background-secondary ${
                              notification.read
                                ? "bg-card"
                                : "bg-background-secondary"
                            } ${
                              processingId === notification.id
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            {getNotificationIcon(notification.type)}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p
                                  className={`text-sm ${
                                    notification.read
                                      ? "font-medium text-foreground-secondary"
                                      : "font-semibold text-white"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[11px] text-gray-600">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </button>
                        ))
                    )}
                  </div>

                  {/* View All */}
                  {notifications.length > 10 && (
                    <div className="border-t border-border p-3 text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setOpen(false)}
                        className="text-sm text-foreground-secondary transition hover:text-white"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}