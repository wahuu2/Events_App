import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";

import Event from "@/database/event.model";
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
          message: "Only organizers can access these statistics",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find events owned by this organizer
    const events = await Event.find({
      organizer: user._id,
    }).select("_id title capacity");

    const eventIds = events.map((event) => event._id);

    // Find bookings for the organizer's events
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: "confirmed",
    });

    const totalBookings = bookings.length;

    const ticketsSold = bookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    const totalRevenue = bookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

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
    console.error("Organizer stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer statistics",
      },
      { status: 500 }
    );
  }
}