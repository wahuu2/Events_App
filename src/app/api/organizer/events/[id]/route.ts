import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import { getCurrentUser } from "@/lib/auth";

import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";
import { createNotification } from "@/lib/notifications";

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

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
          message: "Only organizers can access event analytics",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

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

    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed",
    }).lean();

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

    const checkedInTickets = tickets.filter(
      (ticket) => ticket.status === "used"
    ).length;

    const validTickets = tickets.filter(
      (ticket) => ticket.status === "valid"
    ).length;

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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user || user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await req.json();

    const event = await Event.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    await createNotification({
      userId: user._id.toString(),
      type: "event_updated",
      title: "Event Updated",
      message: `Organizer updated event "${event.title}".`,
      preferenceKey: "eventUpdated",
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Event update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event",
      },
      { status: 500 }
    );
  }
}