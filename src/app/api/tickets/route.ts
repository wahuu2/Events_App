import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";
import { getCurrentUser } from "@/lib/auth";

function generateTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

/**
 * Get tickets belonging to the currently logged-in user
 */
export async function GET() {
  try {
    // 1. Get current user
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

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find user's tickets
    const tickets = await Ticket.find({
      user: user._id,
    })
      .populate("event")
      .populate("booking")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tickets.",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate tickets for a confirmed booking
 *
 * Development version:
 * Tickets can only be generated for a confirmed booking.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get current user
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

    // 2. Read request body
    const body = await request.json();
    const { bookingId } = body;

    // 3. Validate booking ID
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // 6. Make sure booking belongs to current user
    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only generate tickets for your own bookings.",
        },
        { status: 403 }
      );
    }

    // 7. Only confirmed bookings can have tickets
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tickets can only be generated for confirmed bookings.",
        },
        { status: 400 }
      );
    }

    // 8. Find existing tickets
    const existingTickets = await Ticket.find({
      booking: booking._id,
    });

    // 9. Check how many tickets are still needed
    const ticketsNeeded =
      booking.quantity - existingTickets.length;

    // 10. If all tickets already exist, return them
    if (ticketsNeeded <= 0) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "All tickets already exist for this booking.",
        tickets: existingTickets,
      });
    }

    // 11. Create only the missing tickets
    const newTickets = [];

    for (let i = 0; i < ticketsNeeded; i++) {
      const ticket = await Ticket.create({
        booking: booking._id,
        user: booking.user,
        event: booking.event,
        ticketNumber: generateTicketNumber(),
        status: "valid",
      });

      newTickets.push(ticket);
    }

    // 12. Get all tickets for this booking
    const allTickets = await Ticket.find({
      booking: booking._id,
    }).sort({ createdAt: 1 });

    // 13. Return result
    return NextResponse.json(
  {
    success: true,
    alreadyExists: false,
    generatedCount: newTickets.length,
    message: `${newTickets.length} ticket(s) generated successfully.`,
    tickets: allTickets,
  },
  { status: 201 }
);
  } catch (error) {
    console.error("Generate tickets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate tickets.",
      },
      { status: 500 }
    );
  }
}