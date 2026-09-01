import Notification from "@/database/notification.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Booking from "@/database/booking.model";
import Payment from "@/database/payment.model";
import { getCurrentUser } from "@/lib/auth";
import Ticket from "@/database/ticket.model";
import Event from "@/database/event.model";

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

/**
 * Create a payment for a booking
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get the currently logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to make a payment." },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await request.json();
    const { bookingId, method } = body;

    // 3. Validate booking ID
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    // 4. Validate payment method
    if (!method || !["mpesa", "card"].includes(method)) {
      return NextResponse.json(
        { success: false, message: "Payment method must be mpesa or card." },
        { status: 400 }
      );
    }

    // 5. Connect to MongoDB
    await connectToDatabase();

    // 6. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    // 7. Make sure the booking belongs to the logged-in user
    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You can only pay for your own bookings." },
        { status: 403 }
      );
    }

    // 8. Make sure the booking still needs payment
    if (booking.status === "confirmed") {
      return NextResponse.json(
        { success: false, message: "This booking has already been confirmed." },
        { status: 400 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "This booking has been cancelled." },
        { status: 400 }
      );
    }

    // 9. Make sure the booking has an amount to pay
    if (booking.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "This booking does not require payment." },
        { status: 400 }
      );
    }

    // 10. Check whether a payment already exists
    const existingPayment = await Payment.findOne({
      booking: booking._id,
      status: { $in: ["pending", "processing", "successful"] },
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

    // 11. Create payment
    const payment = await Payment.create({
      booking: booking._id,
      user: user._id,
      amount: booking.totalAmount,
      method,
      status: "pending",
      transactionReference: generateTransactionReference(),
    });

    // 12. Return payment information
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
      { success: false, message: "Failed to create payment." },
      { status: 500 }
    );
  }
}

/**
 * Process a payment
 *
 * NOTE:
 * This currently simulates payment success/failure.
 * Later this endpoint will be replaced by real M-Pesa/Card payment verification.
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Get the currently logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await request.json();
    const { paymentId, action } = body;

    // 3. Validate payment ID
    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment ID." },
        { status: 400 }
      );
    }

    // 4. Validate action
    if (!["success", "fail"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment action." },
        { status: 400 }
      );
    }

    // 5. Connect to MongoDB
    await connectToDatabase();

    // 6. Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found." },
        { status: 404 }
      );
    }

    // 7. Make sure the payment belongs to the logged-in user
    if (payment.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You can only process your own payments." },
        { status: 403 }
      );
    }

    // 8. Don't process completed payments
    if (payment.status === "successful") {
      return NextResponse.json(
        { success: false, message: "This payment has already been completed." },
        { status: 400 }
      );
    }

    // 9. Don't process failed payments again
    if (payment.status === "failed") {
      return NextResponse.json(
        { success: false, message: "This payment has already failed." },
        { status: 400 }
      );
    }

    // 10. Find the booking associated with the payment
    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking associated with payment was not found." },
        { status: 404 }
      );
    }

    // 11. Make sure the booking belongs to the same user
    if (booking.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You do not own this booking." },
        { status: 403 }
      );
    }

    // 12. Simulate failed payment
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

    // 13. Mark payment successful
    payment.status = "successful";
    await payment.save();

    // 14. Confirm the booking
    booking.status = "confirmed";
    await booking.save();

    // 15. Generate tickets for the confirmed booking
    const existingTickets = await Ticket.find({ booking: booking._id });
    let tickets = existingTickets;

    if (existingTickets.length === 0) {
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

        // 16. Create notifications
    await Notification.create([
      {
        user: booking.user,
        type: "payment_successful",
        title: "Payment successful",
        message: `Your payment of KES ${payment.amount.toLocaleString()} for ${event.title} was successful.`,
      },
      {
        user: booking.user,
        type: "booking_confirmed",
        title: "Booking confirmed",
        message: `Your booking for ${event.title} has been confirmed.`,
      },
      {
        user: booking.user,
        type: "ticket_generated",
        title: "Your tickets are ready",
        message: `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""} for ${event.title} ${tickets.length !== 1 ? "are" : "is"} ready.`,
      },
    ]);

    // 17. Return successful result
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
      { success: false, message: "Failed to process payment." },
      { status: 500 }
    );
  }
}
