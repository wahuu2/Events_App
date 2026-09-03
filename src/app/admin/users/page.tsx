import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";

export default async function AdminUsersPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const users = await User.find({})
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

  const totalUsers = users.length;

  const admins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const organizers = users.filter(
    (user) => user.role === "organizer"
  ).length;

  const regularUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <section className="border-b border-border">
        <div className="container-responsive py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* Heading */}
            <div className="min-w-0">
             
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Platform Management
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Users
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Monitor platform accounts, roles, and user
                activity from one central control panel.
              </p>
            </div>

            {/* Total Accounts */}
            <div className="w-full rounded-2xl border border-border bg-card px-5 py-4 sm:w-fit">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Accounts
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* STAT CARDS */}
      {/* ===================================================== */}

      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={totalUsers}
            description="All platform accounts"
            accent
          />

          <StatCard
            label="Regular Users"
            value={regularUsers}
            description="Event attendees"
          />

          <StatCard
            label="Organizers"
            value={organizers}
            description="Event creators"
          />

          <StatCard
            label="Administrators"
            value={admins}
            description="System access"
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* USERS TABLE */}
      {/* ===================================================== */}

      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-border px-4 py-5 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-bold">
                All Platform Users
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Latest accounts appear first.
              </p>
            </div>

            <div className="w-fit rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalUsers} accounts
            </div>
          </div>

          {/* Empty State */}
          {users.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ◎
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No users found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                There are currently no registered platform
                users.
              </p>
            </div>
          ) : (
            /*
             * On small screens the table keeps a readable width
             * and scrolls horizontally inside this container.
             */
            <div className="table-wrapper">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-border bg-background-secondary text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      User
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Email
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Role
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const fullName =
                      `${user.firstName || ""} ${
                        user.lastName || ""
                      }`.trim() || "Unnamed User";

                    return (
                      <tr
                        key={user._id.toString()}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/60"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-sm font-black text-accent">
                              {getInitials(
                                user.firstName,
                                user.lastName
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-bold">
                                {fullName}
                              </p>

                              <p className="mt-0.5 text-[10px] text-foreground-muted">
                                ID:{" "}
                                {user._id
                                  .toString()
                                  .slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="px-5 py-4">
                          <span className="block max-w-[260px] truncate text-sm text-foreground-secondary">
                            {user.email || "No email"}
                          </span>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-xs text-foreground-secondary">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

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
      className={`rounded-2xl border p-5 transition ${
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
            accent
              ? "bg-accent"
              : "bg-foreground-muted"
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

/* ========================================================= */
/* ROLE BADGE */
/* ========================================================= */

function RoleBadge({ role }: { role: string }) {
  const roleLabel =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
        role === "admin"
          ? "border-accent/30 bg-accent/10 text-accent"
          : role === "organizer"
            ? "border-border bg-background-secondary text-foreground"
            : "border-border bg-background text-foreground-secondary"
      }`}
    >
      {roleLabel}
    </span>
  );
}

/* ========================================================= */
/* HELPERS */
/* ========================================================= */

function getInitials(
  firstName?: string,
  lastName?: string
) {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";

  return (
    `${first}${last}`.toUpperCase() || "U"
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}