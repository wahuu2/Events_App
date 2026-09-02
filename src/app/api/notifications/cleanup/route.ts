import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
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

    // 3. Calculate the cleanup cutoff date.
    // Only read notifications older than 30 days will be removed.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 4. Delete ONLY notifications that:
    //    - belong to the current user
    //    - have already been read
    //    - are older than 30 days
    //
    // This prevents the user from deleting:
    //    - another user's notifications
    //    - unread notifications
    //    - recent notifications
    const result = await Notification.deleteMany({
      user: user._id,
      read: true,
      createdAt: {
        $lt: thirtyDaysAgo,
      },
    });

    // 5. Return cleanup result.
    return NextResponse.json({
      success: true,
      message:
        result.deletedCount > 0
          ? "Old notifications cleaned up successfully."
          : "No old read notifications needed to be cleaned up.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup notifications error:", error);

    // Do not expose internal database errors to the client.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clean up notifications.",
      },
      { status: 500 }
    );
  }
}