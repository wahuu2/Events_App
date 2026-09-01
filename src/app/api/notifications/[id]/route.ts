import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get logged-in user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, user: user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found." },
        { status: 404 }
      );
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
  } catch (error) {
    console.error("Mark as read error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification." },
      { status: 500 }
    );
  }
}
