import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";
import Booking from "@/database/booking.model";

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
          message: "Only organizers can view event bookings",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const bookings = await Booking.find()
      .populate({
        path: "event",
        match: {
          organizer: user._id,
        },
        select:
          "title image location date time category price",
      })
      .populate(
        "user",
        "firstName lastName email imageUrl"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Because populate(match) can leave event as null,
    // remove bookings that don't belong to this organizer.
    const organizerBookings = bookings.filter(
      (booking) => booking.event !== null
    );

    return NextResponse.json({
      success: true,
      bookings: organizerBookings,
    });
  } catch (error) {
    console.error(
      "Organizer bookings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer bookings",
      },
      { status: 500 }
    );
  }
}