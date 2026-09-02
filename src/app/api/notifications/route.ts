import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

// GET: Fetch notifications for the logged-in user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Only retrieve notifications belonging to the current user.
    const notifications = await Notification.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;

    return NextResponse.json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications.",
      },
      { status: 500 }
    );
  }
}