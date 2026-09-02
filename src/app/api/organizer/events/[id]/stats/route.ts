import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";

import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Get the event ID.
    const { id } = await context.params;

    // 2. Validate the MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID.",
        },
        { status: 400 }
      );
    }

    // 3. Authenticate the user.
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

    // 4. Only organizers can access analytics.
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can view event analytics.",
        },
        { status: 403 }
      );
    }

    // 5. Connect to the database.
    await connectToDatabase();

    // 6. Find the requested event.
    const event = await Event.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
        },
        { status: 404 }
      );
    }

    // 7. Verify that this organizer owns the event.
    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only view analytics for your own events.",
        },
        { status: 403 }
      );
    }

    // 8. Get confirmed bookings for this event.
    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed",
    })
      .select("quantity totalAmount")
      .lean();

    const totalBookings = bookings.length;

    const ticketsSold = bookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    const totalRevenue = bookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

    const ticketsRemaining = Math.max(
      event.capacity - ticketsSold,
      0
    );

    // 9. Get tickets for this event.
    const tickets = await Ticket.find({
      event: event._id,
    })
      .select("status")
      .lean();

    const ticketsCheckedIn = tickets.filter(
      (ticket) => ticket.status === "used"
    ).length;

    const ticketsNotCheckedIn = tickets.filter(
      (ticket) => ticket.status === "valid"
    ).length;

    const cancelledTickets = tickets.filter(
      (ticket) => ticket.status === "cancelled"
    ).length;

    // 10. Return analytics.
    return NextResponse.json({
      success: true,
      analytics: {
        event: {
          id: event._id,
          title: event.title,
          image: event.image,
          location: event.location,
          date: event.date,
          time: event.time,
          category: event.category,
          price: event.price,
          capacity: event.capacity,
        },

        totalBookings,
        ticketsSold,
        ticketsRemaining,
        totalRevenue,

        ticketsCheckedIn,
        ticketsNotCheckedIn,
        cancelledTickets,
      },
    });
  } catch (error) {
    // Detailed error stays on the server.
    console.error("Event analytics error:", error);

    // Generic error returned to the client.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event analytics.",
      },
      { status: 500 }
    );
  }
}