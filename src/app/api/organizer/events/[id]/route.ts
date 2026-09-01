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
    const { id } = await context.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    // Get logged-in user
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

    // Only organizers can access event analytics
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can access event analytics",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the event
    const event = await Event.findById(id)
      .populate(
        "organizer",
        "firstName lastName email imageUrl"
      )
      .lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    // Make sure this organizer owns the event
    const eventOrganizerId =
      typeof event.organizer === "object" &&
      event.organizer !== null &&
      "_id" in event.organizer
        ? event.organizer._id.toString()
        : event.organizer.toString();

    if (eventOrganizerId !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only access your own events",
        },
        { status: 403 }
      );
    }

    // Find confirmed bookings for this event
    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed",
    }).lean();

    // Calculate ticket sales
    const ticketsSold = bookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    // Calculate revenue
    const totalRevenue = bookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

    // Calculate remaining tickets
    const ticketsRemaining = Math.max(
      event.capacity - ticketsSold,
      0
    );

    // Find all tickets for this event
    const tickets = await Ticket.find({
      event: event._id,
    })
      .populate(
        "booking",
        "bookingReference quantity totalAmount"
      )
      .populate(
        "user",
        "firstName lastName email imageUrl"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Count checked-in tickets
    const checkedInTickets = tickets.filter(
      (ticket) => ticket.status === "used"
    ).length;

    // Count valid tickets
    const validTickets = tickets.filter(
      (ticket) => ticket.status === "valid"
    ).length;

    // Count cancelled tickets
    const cancelledTickets = tickets.filter(
      (ticket) => ticket.status === "cancelled"
    ).length;

    return NextResponse.json({
      success: true,

      event: {
        ...event,
        _id: event._id.toString(),
      },

      statistics: {
        capacity: event.capacity,
        ticketsSold,
        ticketsRemaining,
        totalBookings: bookings.length,
        totalRevenue,
        checkedInTickets,
        validTickets,
        cancelledTickets,

        salesPercentage:
          event.capacity > 0
            ? Math.min(
                Math.round(
                  (ticketsSold / event.capacity) * 100
                ),
                100
              )
            : 0,

        checkInPercentage:
          ticketsSold > 0
            ? Math.round(
                (checkedInTickets / ticketsSold) * 100
              )
            : 0,
      },

      tickets,
    });
  } catch (error) {
    console.error(
      "Organizer event analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event analytics",
      },
      { status: 500 }
    );
  }
}