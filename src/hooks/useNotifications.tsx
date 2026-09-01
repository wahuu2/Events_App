"use client";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(
        err instanceof Error ? err.message : "Unexpected error fetching notifications"
      );
      setNotifications([]); // clear to avoid stale data
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, loading, error, refetch: fetchData };
}
