import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/database";

import Event from "@/database/event.model";
import Booking from "@/database/booking.model";

import { createNotification } from "@/lib/notifications";
import { sensitiveRateLimiter } from "@/lib/rate-limit";

function generateBookingReference() {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to book a ticket.",
        },
        { status: 401 }
      );
    }

    // 2. Rate-limit booking creation per authenticated user.
    const rateLimit = await sensitiveRateLimiter.limit(
      `booking:${user._id.toString()}`
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many booking attempts. Please try again later.",
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

    // 4. Ensure the body is an object.
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

    const { eventId, quantity } = body as {
      eventId?: unknown;
      quantity?: unknown;
    };

    // 5. Validate event ID.
    if (typeof eventId !== "string" || !eventId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Event ID is required.",
        },
        { status: 400 }
      );
    }

    const trimmedEventId = eventId.trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedEventId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID.",
        },
        { status: 400 }
      );
    }

    // 6. Validate quantity.
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quantity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    // 7. Connect to the database.
    await connectToDatabase();

    // 8. Find the event.
    const event = await Event.findById(trimmedEventId);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
        },
        { status: 404 }
      );
    }

    // 9. Check available capacity.
    const existingBookings = await Booking.find({
      event: event._id,
      status: { $in: ["pending", "confirmed"] },
    }).select("quantity");

    const ticketsBooked = existingBookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    const ticketsRemaining = Math.max(
      event.capacity - ticketsBooked,
      0
    );

    if (quantity > ticketsRemaining) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${ticketsRemaining} ticket${
            ticketsRemaining === 1 ? "" : "s"
          } remaining.`,
        },
        { status: 400 }
      );
    }

    // 10. Calculate the booking amount.
    const totalAmount = event.price * quantity;

    // 11. Create the booking.
    const booking = await Booking.create({
      user: user._id,
      event: event._id,
      quantity,
      totalAmount,
      status: event.price === 0 ? "confirmed" : "pending",
      bookingReference: generateBookingReference(),
    });

    // 12. Create confirmation notification for free events.
    if (event.price === 0) {
      await createNotification({
        userId: user._id.toString(),
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking for ${event.title} has been confirmed successfully.`,
        preferenceKey: "bookingConfirmed",
      });
    }

    // 13. Return the booking.
    return NextResponse.json(
      {
        success: true,
        message:
          event.price === 0
            ? "Booking confirmed successfully."
            : "Booking created. Payment is required.",
        booking: {
          id: booking._id,
          bookingReference: booking.bookingReference,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount,
          status: booking.status,
          event: {
            id: event._id,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    // 2. Connect to the database.
    await connectToDatabase();

    // 3. Retrieve only the current user's bookings.
    const bookings = await Booking.find({
      user: user._id,
    })
      .populate(
        "event",
        "title image location date time category price"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings.",
      },
      { status: 500 }
    );
  }
}