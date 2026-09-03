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
          message:
            "Only organizers can access event analytics",
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
          message:
            "You can only access your own events",
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
          message: "You must be signed in",
        },
        { status: 401 }
      );
    }

    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can update events",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    // Organizer can only update their own events
    if (
      event.organizer.toString() !==
      user._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only update your own events",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const allowedFields = [
      "title",
      "description",
      "image",
      "location",
      "date",
      "time",
      "category",
      "price",
      "capacity",
    ];

    // Update only allowed fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        event[field] = body[field];
      }
    }

    // Validate required text fields
    if (
      !event.title ||
      !event.description ||
      !event.image ||
      !event.location ||
      !event.date ||
      !event.time ||
      !event.category
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide all required event fields.",
        },
        { status: 400 }
      );
    }

    // Validate price
    const eventPrice = Number(event.price);

    if (
      Number.isNaN(eventPrice) ||
      eventPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Price must be a valid number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    // Validate capacity
    const eventCapacity = Number(event.capacity);

    if (
      Number.isNaN(eventCapacity) ||
      !Number.isInteger(eventCapacity) ||
      eventCapacity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Capacity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    event.price = eventPrice;
    event.capacity = eventCapacity;

    await event.save();

    await createNotification({
      userId: user._id.toString(),
      type: "event_updated",
      title: "Event Updated",
      message: `Organizer updated event "${event.title}".`,
      preferenceKey: "eventUpdated",
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
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