import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import Ticket from "@/database/ticket.model";

export async function GET() {
  try {
    const result = await requireAdmin();

    if (!result.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status }
      );
    }

    const tickets = await Ticket.find({})
      .populate("user", "firstName lastName email")
      .populate("event", "title date location")
      .populate("booking", "bookingReference status")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Admin tickets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}