import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";
import { getCurrentUser } from "@/lib/auth";
import { sensitiveRateLimiter } from "@/lib/rate-limit";

function generateTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

/**
 * Get tickets belonging to the currently logged-in user.
 */
export async function GET() {
  try {
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

    await connectToDatabase();

    // Only return tickets owned by the current user.
    const tickets = await Ticket.find({
      user: user._id,
    })
      .populate(
        "event",
        "title image location date time category price"
      )
      .populate(
        "booking",
        "bookingReference quantity totalAmount status"
      )
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
 * Generate tickets for a confirmed booking.
 *
 * Development version:
 * Tickets can only be generated for a confirmed booking.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user.
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

    // 2. Rate-limit ticket generation per authenticated user.
    const rateLimit = await sensitiveRateLimiter.limit(
      `ticket:generate:${user._id.toString()}`
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many ticket generation attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimit.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 3. Safely parse the request body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // 4. Validate the request body.
    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const { bookingId } = body as {
      bookingId?: unknown;
    };

    // 5. Validate booking ID.
    if (typeof bookingId !== "string" || !bookingId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    const trimmedBookingId = bookingId.trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedBookingId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 6. Find the booking.
    const booking = await Booking.findById(trimmedBookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // 7. Ownership check.
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

    // 8. Tickets may only be generated for confirmed bookings.
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

    // 9. Check for existing tickets.
    const existingTickets = await Ticket.find({
      booking: booking._id,
      user: user._id,
    });

    const ticketsNeeded =
      booking.quantity - existingTickets.length;

    // 10. Prevent unnecessary duplicate generation.
    if (ticketsNeeded <= 0) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message:
          "All tickets already exist for this booking.",
        tickets: existingTickets,
      });
    }

    // 11. Generate only the tickets that are missing.
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

    // 12. Retrieve all tickets belonging to this booking and user.
    const allTickets = await Ticket.find({
      booking: booking._id,
      user: user._id,
    }).sort({ createdAt: 1 });

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