import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Ticket from "@/database/ticket.model";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";
import { strictRateLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Get currently logged-in user.
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

    // 2. Only organizers can verify tickets.
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can verify tickets.",
        },
        { status: 403 }
      );
    }

    // 3. Strict rate limiting.
    // Maximum: 5 ticket verification attempts per minute
    // per organizer.
    const rateLimit = await strictRateLimiter.limit(
      `ticket:verify:${user._id.toString()}`
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many ticket verification attempts. Please try again later.",
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

    // 4. Read request body safely.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be a valid object.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as Record<string, unknown>;

    const { ticketNumber } = requestBody;

    // 5. Validate ticket number.
    if (
      typeof ticketNumber !== "string" ||
      !ticketNumber.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket number is required.",
        },
        { status: 400 }
      );
    }

    const cleanTicketNumber = ticketNumber.trim();

    // Prevent excessively large ticket-number input.
    if (cleanTicketNumber.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket number is too long.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 6. Find ticket by ticket number.
    const ticket = await Ticket.findOne({
      ticketNumber: cleanTicketNumber,
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Ticket not found.",
        },
        { status: 404 }
      );
    }

    // 7. Find the event associated with this ticket.
    const event = await Event.findById(ticket.event).select(
      "title image location date time category organizer"
    );

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message:
            "Event associated with this ticket was not found.",
        },
        { status: 404 }
      );
    }

    // 8. CRITICAL SECURITY CHECK:
    // Only the organizer who owns the event can verify its tickets.
    if (
      event.organizer.toString() !==
      user._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message:
            "You can only verify tickets for your own events.",
        },
        { status: 403 }
      );
    }

    // 9. Ticket has already been used.
    if (ticket.status === "used") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "This ticket has already been used.",
          ticket: {
            id: ticket._id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            event: {
              id: event._id,
              title: event.title,
            },
          },
        },
        { status: 400 }
      );
    }

    // 10. Ticket has been cancelled.
    if (ticket.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "This ticket has been cancelled.",
          ticket: {
            id: ticket._id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            event: {
              id: event._id,
              title: event.title,
            },
          },
        },
        { status: 400 }
      );
    }

    // 11. Ticket is valid.
    if (ticket.status === "valid") {
      ticket.status = "used";

      await ticket.save();

      return NextResponse.json({
        success: true,
        valid: true,
        message:
          "Ticket verified successfully. Entry allowed.",
        ticket: {
          id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          event: {
            id: event._id,
            title: event.title,
            location: event.location,
            date: event.date,
            time: event.time,
          },
        },
      });
    }

    // 12. Unexpected ticket status.
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: "Invalid ticket status.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify ticket error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify ticket.",
      },
      { status: 500 }
    );
  }
}