"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useNotifications } from "../../hooks/useNotifications";
import { BellIcon } from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  async function markAsRead(id: string) {
  await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
  });
  // After marking, you can either:
  // - Re-fetch notifications using your hook
  // - Or optimistically update state
}

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <nav className="relative z-10 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo + Title */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black transition group-hover:scale-105">
              E
            </div>
            <div>
              <p className="font-bold tracking-tight">EventApp</p>
              <p className="text-xs text-gray-500">Your events. Your world.</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {/* Dashboard */}
            <Link
                     href="/dashboard"
                     className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
                   >
                     Dashboard
                   </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-full hover:bg-gray-800 transition"
              >
                <BellIcon className="h-6 w-6 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 shadow-lg rounded-lg border border-gray-800 p-2">
                  <h3 className="font-semibold mb-2 text-white">Notifications</h3>
                  <ul className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="text-gray-500 text-sm">No notifications</li>
                    ) : (
                      notifications.map((n) => (
                        <li
  key={n.id}
  onClick={() => markAsRead(n.id)}
  className={`cursor-pointer p-2 border-b border-gray-800 text-sm hover:bg-gray-800 transition ${
    n.read ? "text-gray-500" : "font-medium text-gray-100"
  }`}
>
  <div className="flex items-center gap-2">
    {n.type === "success" && <span className="text-green-400 font-bold text-lg">✔</span>}
    {n.type === "warning" && <span className="text-yellow-400 font-bold text-lg">⚠</span>}
    {n.type === "error" && <span className="text-red-400 font-bold text-lg">✖</span>}
    {n.type === "info" && <span className="text-blue-400 font-bold text-lg">ℹ</span>}
  <div>
      <p>{n.title}</p>
      <p className="text-xs text-gray-400">{n.message}</p>
    </div>
  </div>
</li>


                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
