import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import Notification from "@/database/notification.model";

function generateBookingReference() {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { eventId, quantity } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required." },
        { status: 400 }
      );
    }

    if (
      !quantity ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a whole number greater than 0." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    const existingBookings = await Booking.find({
      event: eventId,
      status: { $in: ["pending", "confirmed"] },
    });

    const ticketsBooked = existingBookings.reduce(
      (total, booking) => total + booking.quantity,
      0
    );

    const ticketsRemaining = event.capacity - ticketsBooked;

    if (quantity > ticketsRemaining) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${ticketsRemaining} ticket${ticketsRemaining === 1 ? "" : "s"} remaining.`,
        },
        { status: 400 }
      );
    }

    const totalAmount = event.price * quantity;

    const booking = await Booking.create({
      user: user._id,
      event: event._id,
      quantity,
      totalAmount,
      status: event.price === 0 ? "confirmed" : "pending",
      bookingReference: generateBookingReference(),
    });

    // 🔔 Create notification for booking
    await Notification.create({
      user: user._id,
      type: event.price === 0 ? "booking_confirmed" : "booking_confirmed",
      title: event.price === 0 ? "Booking Confirmed" : "Booking Created",
      message:
        event.price === 0
          ? `Your booking for "${event.title}" (${quantity} ticket${quantity > 1 ? "s" : ""}) has been confirmed.`
          : `Your booking for "${event.title}" (${quantity} ticket${quantity > 1 ? "s" : ""}) has been created. Please complete payment.`,
    });

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
      { success: false, message: "Failed to create booking." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const bookings = await Booking.find({ user: user._id })
      .populate("event", "title image location date time category price")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
