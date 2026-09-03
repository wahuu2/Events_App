import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";

export default async function AdminOrganizersPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const organizers = await User.find({
    role: "organizer",
  })
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

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
              Organizer Management
            </h1>

            <p className="mt-2 max-w-2xl text-foreground-secondary">
              Monitor organizers registered on the Eventora platform and
              review their platform accounts.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-foreground-secondary">
            Registered Organizers
          </p>

          <p className="mt-2 text-3xl font-bold">
            {organizers.length}
          </p>
        </div>

        {/* Organizers Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">
              All Organizers
            </h2>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[750px] text-left">
              <thead className="border-b border-border bg-background-secondary">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium">
                    Name
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Email
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Role
                  </th>

                  <th className="px-6 py-4 text-sm font-medium">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {organizers.map((organizer) => (
                  <tr
                    key={organizer._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {organizer.firstName} {organizer.lastName}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {organizer.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                        {organizer.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {new Date(
                        organizer.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {organizers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No organizers found.
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