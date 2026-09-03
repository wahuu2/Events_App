import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Booking from "@/database/booking.model";

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

    const bookings = await Booking.find({})
      .populate("user", "firstName lastName email")
      .populate("event", "title date location")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Admin bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}