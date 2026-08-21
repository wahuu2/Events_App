import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/database";
import Booking from "@/database/booking.model";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
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

    const { id } = await context.params;

    await connectToDatabase();

    const booking = await Booking.findOne({
      _id: id,
      user: user._id,
    })
      .populate(
        "event",
        "title image location date time category price"
      )
      .lean();

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
      },
      { status: 500 }
    );
  }
}