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

    // 3. Count unread notifications belonging to this user
    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    // 4. Return unread count
    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread notification count error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch unread notification count.",
      },
      { status: 500 }
    );
  }
}