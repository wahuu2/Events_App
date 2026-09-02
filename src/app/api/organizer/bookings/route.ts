import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";
import Booking from "@/database/booking.model";

export async function GET() {
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

    // 2. Only organizers can access organizer bookings.
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can view event bookings.",
        },
        { status: 403 }
      );
    }

    // 3. Connect to the database.
    await connectToDatabase();

    // 4. Retrieve bookings and only populate events
    //    belonging to the authenticated organizer.
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

    // 5. Remove bookings whose event did not belong
    //    to the authenticated organizer.
    const organizerBookings = bookings.filter(
      (booking) => booking.event !== null
    );

    return NextResponse.json({
      success: true,
      bookings: organizerBookings,
    });
  } catch (error) {
    // Detailed error remains server-side only.
    console.error("Organizer bookings error:", error);

    // Never expose database/internal error details.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer bookings.",
      },
      { status: 500 }
    );
  }
}