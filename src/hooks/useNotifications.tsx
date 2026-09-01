"use client";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/notifications/unread-count");
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }

    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return { notifications, unreadCount };
}
