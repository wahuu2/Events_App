import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import Notification from "@/database/notification.model";

export async function GET() {
  try {
    const result = await requireAdmin();

    if (!result.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status }
      );
    }

    const notifications = await Notification.find({})
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Admin notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}