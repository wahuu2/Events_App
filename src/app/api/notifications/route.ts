import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Get currently logged-in user
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

    // 2. Connect to database
    await connectToDatabase();

    // 3. Get user's notifications
    const notifications = await Notification.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Count unread notifications
    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;

    // 5. Return notifications
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
    console.error("Get notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications.",
      },
      { status: 500 }
    );
  }
}