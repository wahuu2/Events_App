"use client";

import { ReactNode, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { BellIcon } from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-xl font-bold">EventApp Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="relative">
              <BellIcon className="h-6 w-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border p-2">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="text-gray-500 text-sm">No notifications</li>
                  ) : (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`p-2 border-b text-sm ${
                          n.read ? "text-gray-500" : "font-medium"
                        }`}
                      >
                        <p>{n.title}</p>
                        <p className="text-xs text-gray-600">{n.message}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
