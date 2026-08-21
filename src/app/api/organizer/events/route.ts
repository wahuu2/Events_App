import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can access this resource",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const events = await Event.find({
      organizer: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Organizer events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer events",
      },
      { status: 500 }
    );
  }
}
