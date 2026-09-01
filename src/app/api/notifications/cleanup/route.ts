import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      user: user._id,
      read: true,
      createdAt: {
        $lt: thirtyDaysAgo,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Old notifications cleaned up successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clean up notifications.",
      },
      { status: 500 }
    );
  }
}