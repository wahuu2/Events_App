import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";

export default async function AdminOrganizersPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    return null;
  }

  const organizers = await User.find({
    role: "organizer",
  })
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

  const totalOrganizers = organizers.length;

  return (
    <div className="min-h-screen bg-background">
      {/* PAGE HEADER */}
      <section className="border-b border-border">
        <div className="container-responsive py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Platform Management
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Organizers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
                Manage the people and organizations responsible for
                creating events on Eventora.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                Total Organizers
              </p>

              <p className="mt-1 text-2xl font-black">
                {totalOrganizers}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="container-responsive py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Organizers"
            value={totalOrganizers}
            description="Registered event creators"
            accent
          />

          <SummaryCard
            label="Platform Role"
            value="Organizer"
            description="Authorized to create events"
          />

          <SummaryCard
            label="Management"
            value="Active"
            description="Organizer monitoring enabled"
          />
        </div>
      </section>

      {/* ORGANIZERS */}
      <section className="container-responsive pb-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* TABLE HEADER */}
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">
                Event Organizers
              </h2>

              <p className="mt-1 text-xs text-foreground-muted">
                Accounts with organizer privileges.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary">
              {totalOrganizers} organizers
            </span>
          </div>

          {organizers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground-muted">
                ◇
              </div>

              <h3 className="mt-4 text-sm font-bold">
                No organizers found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-muted">
                There are currently no accounts with organizer
                privileges.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="border-b border-border bg-background-secondary text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      Organizer
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
                      Access
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {organizers.map((organizer) => {
                    const fullName =
                      `${organizer.firstName || ""} ${
                        organizer.lastName || ""
                      }`.trim() || "Unnamed Organizer";

                    return (
                      <tr
                        key={organizer._id.toString()}
                        className="border-b border-border last:border-0 transition hover:bg-background-secondary/60"
                      >
                        {/* ORGANIZER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-sm font-black text-accent">
                              {getInitials(
                                organizer.firstName,
                                organizer.lastName
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {fullName}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-foreground-muted">
                                ID:{" "}
                                {organizer._id
                                  .toString()
                                  .slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-foreground-secondary">
                            {organizer.email || "No email"}
                          </span>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                            Organizer
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-foreground-secondary">
                            {formatDate(organizer.createdAt)}
                          </span>
                        </td>

                        {/* ACCESS */}
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Event Access
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

/* -------------------------------- */
/* SUMMARY CARD */
/* -------------------------------- */

function SummaryCard({
  label,
  value,
  description,
  accent = false,
}: {
  label: string;
  value: number | string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-accent/30 bg-accent/10"
          : "border-border bg-card"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground-muted">
        {label}
      </p>

      <p className="mt-4 text-2xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-foreground-muted">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* HELPERS */
/* -------------------------------- */

function getInitials(
  firstName?: string,
  lastName?: string
) {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";

  return (
    `${first}${last}`.toUpperCase() || "O"
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}