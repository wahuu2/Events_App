import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

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
    // 1. Authenticate the current user
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

    // 2. Get booking ID from route params
    const { id } = await context.params;

    // 3. Validate booking ID before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // 5. Find only a booking owned by the current user
    const booking = await Booking.findOne({
      _id: id,
      user: user._id,
    })
      .populate(
        "event",
        "title image location date time category price"
      )
      .lean();

    // 6. Handle missing booking
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // 7. Return booking
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking.",
      },
      { status: 500 }
    );
  }
}