"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    }
    fetchData();

    const socket = io();

    // When a new notification arrives
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1); // increment badge instantly
    });

    // When a notification is marked as read
    socket.on("notification:read", (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0)); // decrement badge instantly
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { notifications, unreadCount };
}
