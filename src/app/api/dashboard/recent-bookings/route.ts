import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Booking from "@/database/booking.model";
import "@/database/event.model";

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

    const bookings = await Booking.find({
      user: user._id,
    })
      .populate(
        "event",
        "title image location date time category price"
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Recent bookings API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load recent bookings.",
      },
      { status: 500 }
    );
  }
}