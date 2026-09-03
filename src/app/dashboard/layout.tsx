"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  BellIcon,
  CalendarDaysIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../hooks/useNotifications";
import Footer from "@/components/Footer";

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
    const base =
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl";

    switch (type) {
      case "booking_confirmed":
        return (
          <div className={`${base} bg-green-500/10 text-green-400`}>
            <span className="text-sm font-bold">✓</span>
          </div>
        );

      case "payment_successful":
        return (
          <div className={`${base} bg-accent/10 text-accent`}>
            <span className="text-sm font-bold">K</span>
          </div>
        );

      case "ticket_generated":
        return (
          <div className={`${base} bg-purple-500/10 text-purple-400`}>
            <span className="text-xs font-bold">T</span>
          </div>
        );

      case "new_booking":
        return (
          <div className={`${base} bg-yellow-500/10 text-yellow-400`}>
            <span className="text-lg font-bold">+</span>
          </div>
        );

      case "event_updated":
        return (
          <div className={`${base} bg-cyan-500/10 text-cyan-400`}>
            <span className="text-lg font-bold">↻</span>
          </div>
        );

      case "event_cancelled":
        return (
          <div className={`${base} bg-red-500/10 text-red-400`}>
            <span className="text-sm font-bold">!</span>
          </div>
        );

      default:
        return (
          <div className={`${base} bg-gray-500/10 text-gray-400`}>
            <span className="text-sm font-bold">i</span>
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

    return notificationDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      {/* Dashboard Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2.5"
            aria-label="Eventora home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 group-hover:scale-105 group-hover:bg-accent-hover">
              E
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight sm:text-lg">
                Eventora
              </p>

              <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-foreground-muted sm:block">
                Events made simple
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Home */}
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-all hover:bg-card hover:text-foreground lg:inline-flex"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            {/* Explore */}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground-secondary transition-all hover:bg-card hover:text-foreground sm:px-3"
            >
              <CalendarDaysIcon className="h-4 w-4" />

              <span className="hidden sm:inline">
                Explore Events
              </span>

              <span className="sm:hidden">
                Explore
              </span>
            </Link>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="hidden rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-all hover:border-border-hover hover:bg-card-hover md:inline-flex"
            >
              Dashboard
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpen((previous) => !previous)
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  open
                    ? "bg-accent/10 text-accent"
                    : "text-foreground-secondary hover:bg-card hover:text-foreground"
                }`}
                aria-label="Notifications"
                aria-expanded={open}
                aria-haspopup="true"
              >
                <BellIcon className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {open && (
                <>
                  {/* Mobile Backdrop */}
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 top-16 z-40 bg-black/20 sm:hidden"
                  />

                  <div className="fixed left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[390px]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-background-secondary/70 px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <BellIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold">
                            Notifications
                          </h3>

                          <p className="mt-0.5 text-xs text-foreground-muted">
                            {unreadCount > 0
                              ? `${unreadCount} unread notification${
                                  unreadCount === 1
                                    ? ""
                                    : "s"
                                }`
                              : "You're all caught up"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setOpen(false)}
                        className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
                      >
                        View all
                      </Link>
                    </div>

                    {/* Notifications */}
                    <div className="max-h-[min(60vh,460px)] overflow-y-auto">
                      {loading ? (
                        <div className="space-y-3 p-4">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="flex gap-3 rounded-xl border border-border bg-background p-3"
                            >
                              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-border" />

                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-border" />

                                <div className="h-3 w-full animate-pulse rounded bg-border" />

                                <div className="h-2.5 w-1/4 animate-pulse rounded bg-border" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="px-5 py-10 text-center">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            !
                          </div>

                          <p className="mt-4 text-sm font-semibold text-red-300">
                            Unable to load notifications
                          </p>

                          <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Something went wrong while retrieving
                            your notifications.
                          </p>

                          <button
                            type="button"
                            onClick={refetch}
                            className="mt-4 rounded-lg border border-border-hover px-3.5 py-2 text-xs font-semibold text-foreground-secondary transition-all hover:bg-background hover:text-foreground"
                          >
                            Try again
                          </button>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background-secondary text-foreground-muted">
                            <BellIcon className="h-6 w-6" />
                          </div>

                          <p className="mt-4 text-sm font-semibold">
                            No notifications yet
                          </p>

                          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-foreground-muted">
                            Important booking, payment, ticket,
                            and event updates will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications
                          .slice(0, 10)
                          .map(
                            (
                              notification: Notification
                            ) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() =>
                                  !notification.read &&
                                  markAsRead(
                                    notification.id
                                  )
                                }
                                disabled={
                                  processingId ===
                                  notification.id
                                }
                                className={`flex w-full gap-3 border-b border-border p-4 text-left transition-all ${
                                  notification.read
                                    ? "bg-card hover:bg-background-secondary"
                                    : "bg-background-secondary/70 hover:bg-background-secondary"
                                } ${
                                  processingId ===
                                  notification.id
                                    ? "cursor-wait opacity-50"
                                    : ""
                                }`}
                              >
                                {getNotificationIcon(
                                  notification.type
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p
                                      className={`min-w-0 break-words text-sm ${
                                        notification.read
                                          ? "font-medium text-foreground-secondary"
                                          : "font-bold text-foreground"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>

                                    {!notification.read && (
                                      <span
                                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent shadow-sm shadow-blue-500/40"
                                        aria-label="Unread"
                                      />
                                    )}
                                  </div>

                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground-muted">
                                    {notification.message}
                                  </p>

                                  <p className="mt-2 text-[10px] font-medium text-foreground-muted/70">
                                    {formatDate(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </button>
                            )
                          )
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 10 && (
                      <div className="border-t border-border bg-background-secondary/50 p-3">
                        <Link
                          href="/dashboard/notifications"
                          onClick={() => setOpen(false)}
                          className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground-secondary transition-all hover:bg-card hover:text-foreground"
                        >
                          View all notifications

                          <span className="ml-2">
                            →
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="ml-1 border-l border-border pl-2 sm:ml-2 sm:pl-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 sm:h-10 sm:w-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Dashboard Navigation */}
      <div className="border-b border-border bg-background-secondary/40 md:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-card px-3.5 py-2 text-xs font-semibold text-foreground"
          >
            <HomeIcon className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/bookings"
            className="inline-flex shrink-0 items-center rounded-lg px-3.5 py-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-card hover:text-foreground"
          >
            Bookings
          </Link>

          <Link
            href="/dashboard/tickets"
            className="inline-flex shrink-0 items-center rounded-lg px-3.5 py-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-card hover:text-foreground"
          >
            Tickets
          </Link>

          <Link
            href="/dashboard/notifications"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-card hover:text-foreground"
          >
            Notifications

            {unreadCount > 0 && (
              <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>

      {/* Dashboard Footer */}
      <Footer />
    </div>
  );
}