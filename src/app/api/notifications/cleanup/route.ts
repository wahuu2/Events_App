import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Delete notifications older than 30 days OR already read
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const result = await Notification.deleteMany({
      user: user._id,
      $or: [
        { read: true },
        { createdAt: { $lt: cutoff } },
      ],
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clean up notifications." },
      { status: 500 }
    );
  }
}
