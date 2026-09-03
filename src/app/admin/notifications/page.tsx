import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import Notification from "@/database/notification.model";

export default async function AdminNotificationsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const notifications = await Notification.find({})
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  const readNotifications = notifications.filter(
    (notification) => notification.read
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  const notificationTypes = new Set(
    notifications.map((notification) => notification.type)
  ).size;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
         
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Notification Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor notification activity and system-generated messages
              across the Eventora platform.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Total Notifications
            </p>

            <p className="mt-2 text-3xl font-bold">
              {notifications.length}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              All platform notifications
            </p>
          </div>

          {/* Unread */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Unread
            </p>

            <p className="mt-2 text-3xl font-bold">
              {unreadNotifications}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Awaiting user attention
            </p>
          </div>

          {/* Read */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Read
            </p>

            <p className="mt-2 text-3xl font-bold">
              {readNotifications}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Already viewed
            </p>
          </div>

          {/* Types */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground-secondary">
              Notification Types
            </p>

            <p className="mt-2 text-3xl font-bold">
              {notificationTypes}
            </p>

            <p className="mt-2 text-xs text-foreground-muted">
              Active notification categories
            </p>
          </div>
        </section>

        {/* Notification Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              Platform Notification Activity
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Notification
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    User
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Type
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Message
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    {/* Notification */}
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {notification.title}
                      </div>

                      <div className="mt-1 text-xs text-foreground-muted">
                        ID: {notification._id.toString()}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      {notification.user ? (
                        <>
                          <div className="text-sm font-medium">
                            {notification.user.firstName}{" "}
                            {notification.user.lastName}
                          </div>

                          <div className="mt-1 text-xs text-foreground-muted">
                            {notification.user.email}
                          </div>
                        </>
                      ) : (
                        "Unknown user"
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                        {notification.type.replaceAll("_", " ")}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="max-w-md px-6 py-4 text-sm text-foreground-secondary">
                      <p className="line-clamp-2">
                        {notification.message}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                        {notification.read ? "Read" : "Unread"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {notification.createdAt
                        ? new Date(
                            notification.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {notifications.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}