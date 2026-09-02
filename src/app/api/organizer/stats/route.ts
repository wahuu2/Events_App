import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";

import Event from "@/database/event.model";
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

    // 2. Only organizers can access organizer statistics.
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can access these statistics.",
        },
        { status: 403 }
      );
    }

    // 3. Connect to the database.
    await connectToDatabase();

    // 4. Get only events belonging to the current organizer.
    const events = await Event.find({
      organizer: user._id,
    }).select("_id title capacity");

    const eventIds = events.map((event) => event._id);

    // 5. Get only confirmed bookings for this organizer's events.
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: "confirmed",
    }).select("quantity totalAmount");

    // 6. Calculate statistics.
    const totalBookings = bookings.length;

    const ticketsSold = bookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    const totalRevenue = bookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

    // 7. Return statistics.
    return NextResponse.json({
      success: true,
      stats: {
        totalEvents: events.length,
        totalBookings,
        ticketsSold,
        totalRevenue,
      },
    });
  } catch (error) {
    // Log the detailed error only on the server.
    console.error("Organizer stats error:", error);

    // Never expose internal error details to the client.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer statistics.",
      },
      { status: 500 }
    );
  }
}