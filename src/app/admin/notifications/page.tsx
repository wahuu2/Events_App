import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import Notification from "@/database/notification.model";

export default async function AdminNotificationsPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const notifications = await Notification.find({})
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();

  const totalNotifications = notifications.length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readNotifications = notifications.filter(
    (notification) => notification.read
  ).length;

  const uniqueUsers = new Set(
    notifications
      .map((notification) =>
        notification.user?._id
          ? notification.user._id.toString()
          : null
      )
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-background">
      {/* PAGE HEADER */}
      <section className="border-b border-border">
        <div className="container-responsive py-7 sm:py-9 lg:py-10">
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
                Platform Management
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor system notifications, user activity, and
                important communication generated across Eventora.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-border bg-card px-5 py-4 sm:w-fit">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Notifications
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalNotifications}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total"
            value={totalNotifications}
            description="All system notifications"
            accent
          />

          <StatCard
            label="Unread"
            value={unreadNotifications}
            description="Awaiting user attention"
          />

          <StatCard
            label="Read"
            value={readNotifications}
            description="Already viewed"
          />

          <StatCard
            label="Users Reached"
            value={uniqueUsers}
            description="Unique recipients"
          />
        </div>
      </section>

      {/* NOTIFICATION ACTIVITY */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-5 sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-bold">
                System Activity
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Latest notifications appear first.
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalNotifications} notifications
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6 sm:py-16">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ◉
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No notifications found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                No system notifications have been generated yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const user = notification.user as
                  | {
                      _id?: string;
                      firstName?: string;
                      lastName?: string;
                      email?: string;
                    }
                  | null;

                const userName =
                  `${user?.firstName || ""} ${
                    user?.lastName || ""
                  }`.trim() || "Unknown User";

                return (
                  <div
                    key={notification._id.toString()}
                    className="group px-4 py-5 transition hover:bg-background-secondary/60 sm:px-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* MAIN CONTENT */}
                      <div className="flex min-w-0 gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-black text-accent sm:h-11 sm:w-11">
                          ◉
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <h3 className="max-w-full break-words text-sm font-bold">
                              {notification.title}
                            </h3>

                            <span className="w-fit max-w-full rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                              {formatNotificationType(
                                notification.type
                              )}
                            </span>
                          </div>

                          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-foreground-secondary">
                            {notification.message}
                          </p>

                          <div className="mt-3 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                            <span className="max-w-full truncate text-xs font-semibold text-foreground">
                              {userName}
                            </span>

                            <span className="max-w-full truncate text-xs text-foreground-muted">
                              {user?.email || "No email"}
                            </span>

                            <span className="text-xs text-foreground-muted">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="shrink-0 lg:pt-1">
                        <ReadStatus
                          read={notification.read}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- */
/* STAT CARD */
/* -------------------------------- */

function StatCard({
  label,
  value,
  description,
  accent = false,
}: {
  label: string;
  value: number;
  description: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`card-responsive rounded-2xl border p-5 transition ${
        accent
          ? "border-accent/30 bg-accent/10"
          : "border-border bg-card hover:border-border-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
          {label}
        </p>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            accent ? "bg-accent" : "bg-foreground-muted"
          }`}
        />
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* READ STATUS */
/* -------------------------------- */

function ReadStatus({
  read,
}: {
  read: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
        read
          ? "border-border bg-background text-foreground-muted"
          : "border-accent/30 bg-accent/10 text-accent"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          read ? "bg-foreground-muted" : "bg-accent"
        }`}
      />

      {read ? "Read" : "Unread"}
    </span>
  );
}

/* -------------------------------- */
/* HELPERS */
/* -------------------------------- */

function formatNotificationType(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}