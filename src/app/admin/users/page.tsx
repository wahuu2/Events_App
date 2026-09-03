import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";

export default async function AdminUsersPage() {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  const users = await User.find({})
    .select("-__v")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-8">
        <div className="mb-8">
          
          <p className="mt-6 text-sm font-medium uppercase tracking-wider text-accent">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            User Management
          </h1>

          <p className="mt-2 text-foreground-secondary">
            View all registered Eventora users and their platform roles.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <p className="font-semibold">
              {users.length} registered user
              {users.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="w-full min-w-[700px] text-left">
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
                {users.map((user) => (
                  <tr
                    key={user._id.toString()}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-foreground-secondary"
                    >
                      No users found.
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