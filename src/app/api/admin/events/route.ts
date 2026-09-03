import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Event from "@/database/event.model";

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

    const events = await Event.find({})
      .populate("organizer", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error("Admin events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}