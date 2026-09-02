import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET — Get the number of unread notifications
 * belonging to the currently authenticated user.
 */
export async function GET() {
  try {
    // 1. Authenticate the current user.
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

    // 2. Connect to the database.
    await connectToDatabase();

    // 3. Count only unread notifications belonging
    //    to the currently authenticated user.
    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    // 4. Return the unread count.
    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error
    );

    // Do not expose internal database errors.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch unread notification count.",
      },
      { status: 500 }
    );
  }
}