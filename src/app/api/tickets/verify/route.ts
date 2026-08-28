import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Ticket from "@/database/ticket.model";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Get currently logged-in user
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

    // 2. Only organizers can verify tickets
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can verify tickets.",
        },
        { status: 403 }
      );
    }

    // 3. Read request body
    const body = await request.json();

    const { ticketNumber } = body;

    // 4. Validate ticket number
    if (!ticketNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket number is required.",
        },
        { status: 400 }
      );
    }

    // 5. Connect to database
    await connectToDatabase();

    // 6. Find ticket
    const ticket = await Ticket.findOne({
      ticketNumber: ticketNumber.trim(),
    })
      .populate("event")
      .populate("booking")
      .populate("user");

    // 7. Ticket does not exist
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

    // 8. Ticket has already been used
    if (ticket.status === "used") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "This ticket has already been used.",
          ticket: {
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
          },
        },
        { status: 400 }
      );
    }

    // 9. Ticket has been cancelled
    if (ticket.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "This ticket has been cancelled.",
          ticket: {
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
          },
        },
        { status: 400 }
      );
    }

    // 10. Ticket is valid
    if (ticket.status === "valid") {
      ticket.status = "used";

      await ticket.save();

      return NextResponse.json({
        success: true,
        valid: true,
        message: "Ticket verified successfully. Entry allowed.",
        ticket: {
          id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
          event: ticket.event,
          booking: ticket.booking,
          user: ticket.user,
        },
      });
    }

    // 11. Unexpected ticket status
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