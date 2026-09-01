import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import User from "@/database/user.model"; // make sure you import User
import { getCurrentUser } from "@/lib/auth";
import { getIO } from "@/lib/socket";

export async function GET(request: NextRequest) {
  try {
    // 1. Get currently logged-in user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Load user preferences
    const userDoc = await User.findById(user._id);
    const preferences = userDoc?.notificationPreferences || [];

    // 4. Get user's notifications filtered by preferences
    const notifications = await Notification.find({
      user: user._id,
      type: { $in: preferences },
    })
      .sort({ createdAt: -1 })
      .lean();

    // 5. Count unread notifications
    const unreadCount = notifications.filter((n) => !n.read).length;

    // 6. Return notifications
    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { type, title, message } = body;

    // 1. Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. Validate type against allowed list
    const validTypes = [
      "booking_confirmed",
      "payment_successful",
      "ticket_generated",
      "event_updated",
      "event_cancelled",
      "event_reminder",
      "success",
      "warning",
      "info",
      "error",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification type." },
        { status: 400 }
      );
    }

    // 3. Create notification
    const notification = await Notification.create({
      user: user._id,
      type,
      title,
      message,
    });

    // 4. Emit real-time event via Socket.IO
    try {
      const io = getIO();
      io.to(user._id.toString()).emit("notification:new", {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      });
    } catch (emitError) {
      console.error("Socket emit error:", emitError);
    }

    // 5. Return response
    return NextResponse.json({
      success: true,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification." },
      { status: 500 }
    );
  }
}
