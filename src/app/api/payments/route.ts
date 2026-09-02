import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Booking from "@/database/booking.model";
import Payment from "@/database/payment.model";
import { getCurrentUser } from "@/lib/auth";
import Ticket from "@/database/ticket.model";
import Event from "@/database/event.model";
import { createNotification } from "@/lib/notifications";

function generateTransactionReference() {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
}

function generateTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to make a payment.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, method } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    if (!method || !["mpesa", "card"].includes(method)) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method must be mpesa or card.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only pay for your own bookings.",
        },
        { status: 403 }
      );
    }

    if (booking.status === "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message: "This booking has already been confirmed.",
        },
        { status: 400 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "This booking has been cancelled.",
        },
        { status: 400 }
      );
    }

    if (booking.totalAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This booking does not require payment.",
        },
        { status: 400 }
      );
    }

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      status: {
        $in: ["pending", "processing", "successful"],
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          message: "A payment already exists for this booking.",
          payment: {
            id: existingPayment._id,
            amount: existingPayment.amount,
            method: existingPayment.method,
            status: existingPayment.status,
            transactionReference: existingPayment.transactionReference,
          },
        },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: user._id,
      amount: booking.totalAmount,
      method,
      status: "pending",
      transactionReference: generateTransactionReference(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully.",
        payment: {
          id: payment._id,
          booking: payment.booking,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionReference: payment.transactionReference,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { paymentId, action } = body;

    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment ID.",
        },
        { status: 400 }
      );
    }

    if (!["success", "fail"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment action.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 }
      );
    }

    if (payment.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only process your own payments.",
        },
        { status: 403 }
      );
    }

    if (["successful", "failed"].includes(payment.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "This payment has already been processed.",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking associated with payment not found.",
        },
        { status: 404 }
      );
    }

    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not own this booking.",
        },
        { status: 403 }
      );
    }

    if (action === "fail") {
      payment.status = "failed";
      await payment.save();

      return NextResponse.json({
        success: false,
        message: "Payment failed.",
        payment: {
          id: payment._id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionReference: payment.transactionReference,
        },
      });
    }

    payment.status = "successful";
    await payment.save();

    booking.status = "confirmed";
    await booking.save();

    let tickets = await Ticket.find({
      booking: booking._id,
    });

    if (tickets.length === 0) {
      tickets = [];

      for (let i = 0; i < booking.quantity; i++) {
        const ticket = await Ticket.create({
          booking: booking._id,
          user: booking.user,
          event: booking.event,
          ticketNumber: generateTicketNumber(),
          status: "valid",
        });

        tickets.push(ticket);
      }
    }

    const event = await Event.findById(booking.event);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event associated with booking not found.",
        },
        { status: 404 }
      );
    }

    await Promise.all([
      createNotification({
        userId: booking.user.toString(),
        type: "booking_confirmed",
        title: "Booking confirmed",
        message: `Your booking for ${event.title} has been confirmed.`,
        preferenceKey: "bookingConfirmed",
      }),

      createNotification({
        userId: booking.user.toString(),
        type: "payment_successful",
        title: "Payment successful",
        message: `Your payment of KES ${payment.amount.toLocaleString()} for ${event.title} was successful.`,
        preferenceKey: "paymentSuccessful",
      }),

      createNotification({
        userId: booking.user.toString(),
        type: "ticket_generated",
        title: "Your tickets are ready",
        message: `${tickets.length} ticket${
          tickets.length !== 1 ? "s" : ""
        } for ${event.title} ${
          tickets.length !== 1 ? "are" : "is"
        } ready.`,
        preferenceKey: "ticketGenerated",
      }),

      createNotification({
        userId: event.organizer.toString(),
        type: "new_booking",
        title: "New booking received",
        message: `A new booking for ${event.title} has been confirmed. ${booking.quantity} ticket${
          booking.quantity !== 1 ? "s" : ""
        } were booked.`,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment successful. Booking confirmed and tickets generated.",
      payment: {
        id: payment._id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionReference: payment.transactionReference,
      },
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
      },
      tickets: tickets.map((ticket) => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
      })),
    });
} catch (error) {
  console.error("Process payment error:", error);

  return NextResponse.json(
    {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to process payment.",
    },
    { status: 500 }
  );
}
}