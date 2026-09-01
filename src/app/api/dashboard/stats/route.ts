import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Booking from "@/database/booking.model";

export async function GET() {
  try {
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

    const [total, confirmed, pending, cancelled] = await Promise.all([
      Booking.countDocuments({ user: user._id }),
      Booking.countDocuments({
        user: user._id,
        status: "confirmed",
      }),
      Booking.countDocuments({
        user: user._id,
        status: "pending",
      }),
      Booking.countDocuments({
        user: user._id,
        status: "cancelled",
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        confirmed,
        pending,
        cancelled,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard statistics.",
      },
      { status: 500 }
    );
  }
}