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
        throw new Error(data.message || "Failed to mark notification as read.");
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
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
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <nav className="relative z-10 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black transition group-hover:scale-105">
              E
            </div>

            <div>
              <p className="font-bold tracking-tight">EventApp</p>
              <p className="text-xs text-gray-500">
                Your events. Your world.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-700 px-4 py-2 transition hover:bg-gray-800"
            >
              Dashboard
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className="relative rounded-full p-2 transition hover:bg-gray-800"
                aria-label="Notifications"
                aria-expanded={open}
              >
                <BellIcon className="h-6 w-6 text-gray-300" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-[360px] overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>

                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setOpen(false)}
                      className="text-xs text-gray-400 transition hover:text-white"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
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
                          className="mt-2 text-xs text-gray-400 hover:text-white"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <BellIcon className="mx-auto h-8 w-8 text-gray-700" />

                        <p className="mt-3 text-sm text-gray-400">
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
                            disabled={processingId === notification.id}
                            className={`flex w-full gap-3 border-b border-gray-800 p-4 text-left transition hover:bg-gray-800/70 ${
                              notification.read
                                ? "bg-gray-900"
                                : "bg-gray-800/40"
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
                                      ? "font-medium text-gray-400"
                                      : "font-semibold text-white"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
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

                  {notifications.length > 10 && (
                    <div className="border-t border-gray-800 p-3 text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setOpen(false)}
                        className="text-sm text-gray-400 transition hover:text-white"
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

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}