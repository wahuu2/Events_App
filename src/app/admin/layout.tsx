import { redirect } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";

const adminNavigation = [
  {
    label: "Overview",
    href: "/admin",
    description: "System overview",
    icon: "◈",
  },
  {
    label: "Users",
    href: "/admin/users",
    description: "Platform accounts",
    icon: "◎",
  },
  {
    label: "Organizers",
    href: "/admin/organizers",
    description: "Event creators",
    icon: "◇",
  },
  {
    label: "Events",
    href: "/admin/events",
    description: "Platform events",
    icon: "▣",
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    description: "Booking activity",
    icon: "□",
  },
  {
    label: "Payments",
    href: "/admin/payments",
    description: "Transactions",
    icon: "◫",
  },
  {
    label: "Tickets",
    href: "/admin/tickets",
    description: "Digital tickets",
    icon: "▤",
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    description: "System activity",
    icon: "◉",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    description: "Platform insights",
    icon: "△",
  },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await requireAdmin();

  if (!result.authorized) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-border bg-background-secondary lg:flex lg:flex-col">
        {/* Brand */}
        <div className="border-b border-border px-6 py-6">
          <Link href="/admin" className="group block">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-accent text-lg font-black text-white shadow-lg shadow-accent/20">
                E

                <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full border border-white/20 bg-white/10" />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-black tracking-tight">
                  Eventora
                </p>

                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Control Center
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Administrator Identity */}
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-bold text-accent">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Administrator
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />

                  <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                    System Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted">
            Platform
          </p>

          <nav className="space-y-1">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-border hover:bg-background hover:text-foreground"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background-secondary text-sm font-bold text-foreground-muted transition group-hover:border-accent/30 group-hover:bg-accent/10 group-hover:text-accent">
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.label}
                  </span>

                  <span className="mt-0.5 block truncate text-[10px] text-foreground-muted">
                    {item.description}
                  </span>
                </span>

                <span className="shrink-0 text-sm text-foreground-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4">
          <Link
            href="/dashboard"
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 transition hover:border-border-hover hover:bg-background-secondary"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                Return to Eventora
              </p>

              <p className="mt-1 truncate text-[10px] text-foreground-muted">
                User dashboard
              </p>
            </div>

            <span className="shrink-0 text-foreground-muted transition group-hover:translate-x-1 group-hover:text-foreground">
              →
            </span>
          </Link>
        </div>
      </aside>

      {/* ===================================================== */}
      {/* MAIN ADMIN AREA */}
      {/* ===================================================== */}

      <div className="lg:pl-72">
        {/* ================================================= */}
        {/* TOP BAR */}
        {/* ================================================= */}

        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="container-responsive">
            <div className="flex min-h-16 items-center gap-3">
              {/* Mobile Brand */}
              <Link
                href="/admin"
                className="flex min-w-0 items-center gap-2.5 lg:hidden"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-black text-white">
                  E
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black">
                    Eventora
                  </p>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-accent">
                    Admin
                  </p>
                </div>
              </Link>

              {/* Desktop Context */}
              <div className="hidden items-center gap-3 lg:flex">
                <span className="text-xs font-medium text-foreground-muted">
                  Eventora
                </span>

                <span className="text-foreground-muted">
                  /
                </span>

                <span className="text-xs font-semibold">
                  Administration
                </span>
              </div>

              {/* Right Side */}
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Admin Status */}
                <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                    Admin Mode
                  </span>
                </div>

                {/* User Dashboard */}
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:border-border-hover hover:bg-background-secondary sm:px-4 sm:text-sm"
                >
                  <span className="sm:hidden">
                    Dashboard
                  </span>

                  <span className="hidden sm:inline">
                    User Dashboard
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* MOBILE NAVIGATION */}
        {/* ================================================= */}

        <div className="border-b border-border bg-background-secondary lg:hidden">
          <div className="container-responsive">
            <nav
              className="flex gap-2 overflow-x-auto py-3"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {adminNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold transition hover:border-accent/30 hover:bg-card"
                >
                  <span className="text-accent">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* ================================================= */}
        {/* ADMIN CONTENT */}
        {/* ================================================= */}

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}