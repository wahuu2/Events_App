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
          message: "Only organizers can view event analytics",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    if (event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only view analytics for your own events",
        },
        { status: 403 }
      );
    }

    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed",
    }).lean();

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

    const tickets = await Ticket.find({
      event: event._id,
    }).lean();

    const ticketsCheckedIn = tickets.filter(
      (ticket) => ticket.status === "used"
    ).length;

    const ticketsNotCheckedIn = tickets.filter(
      (ticket) => ticket.status === "valid"
    ).length;

    const cancelledTickets = tickets.filter(
      (ticket) => ticket.status === "cancelled"
    ).length;

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
    console.error("Event analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event analytics",
      },
      { status: 500 }
    );
  }
}