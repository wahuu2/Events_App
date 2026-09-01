import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET: Fetch notifications for the logged-in user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (err) {
    console.error("GET notifications error:", err);

    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

// POST: Create a new notification
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { type, title, message } = await req.json();

    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const preferenceMap: Record<string, string> = {
      booking_confirmed: "bookingConfirmed",
      payment_successful: "paymentSuccessful",
      ticket_generated: "ticketGenerated",
      event_updated: "eventUpdated",
      event_cancelled: "eventCancelled",
      event_reminder: "eventReminder",
    };

    const preferenceKey = preferenceMap[type];

    const notification = await createNotification({
      userId: user._id.toString(),
      type,
      title,
      message,
      ...(preferenceKey
        ? {
            preferenceKey: preferenceKey as
              | "bookingConfirmed"
              | "paymentSuccessful"
              | "ticketGenerated"
              | "eventUpdated"
              | "eventCancelled"
              | "eventReminder",
          }
        : {}),
    });

    if (!notification) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped because the user disabled this notification type.",
        notification: null,
      });
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });
  } catch (err) {
    console.error("POST notification error:", err);

    return NextResponse.json(
      { success: false, message: "Failed to create notification." },
      { status: 500 }
    );
  }
}