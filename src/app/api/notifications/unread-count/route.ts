import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch unread count." },
      { status: 500 }
    );
  }
}
