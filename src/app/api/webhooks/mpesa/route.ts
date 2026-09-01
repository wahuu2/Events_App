import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import Payment from "@/database/payment.model";
import Booking from "@/database/booking.model";
import Ticket from "@/database/ticket.model";
import Notification from "@/database/notification.model";
import Event from "@/database/event.model";

/**
 * Handle M-Pesa payment callback
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse incoming JSON from M-Pesa
    const body = await request.json();

    // Example Safaricom callback structure:
    // {
    //   "Body": {
    //     "stkCallback": {
    //       "MerchantRequestID": "...",
    //       "CheckoutRequestID": "...",
    //       "ResultCode": 0,
    //       "ResultDesc": "The service request is processed successfully.",
    //       "CallbackMetadata": {
    //         "Item": [
    //           { "Name": "Amount", "Value": 1000 },
    //           { "Name": "MpesaReceiptNumber", "Value": "ABC123XYZ" },
    //           { "Name": "TransactionDate", "Value": 20260901123045 },
    //           { "Name": "PhoneNumber", "Value": 2547xxxxxxx }
    //         ]
    //       }
    //     }
    //   }
    // }

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json(
        { success: false, message: "Invalid M-Pesa callback payload." },
        { status: 400 }
      );
    }

    const resultCode = callback.ResultCode;
    const metadata = callback.CallbackMetadata?.Item || [];

    const amount = metadata.find((i: any) => i.Name === "Amount")?.Value;
    const receipt = metadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

    // 2. Connect to DB
    await connectToDatabase();

    // 3. Find payment by transactionReference (you should map CheckoutRequestID → Payment)
    const payment = await Payment.findOne({
      transactionReference: callback.CheckoutRequestID,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found." },
        { status: 404 }
      );
    }

    // 4. Find booking
    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    // 5. Handle success vs failure
    if (resultCode !== 0) {
      payment.status = "failed";
      await payment.save();

      return NextResponse.json({ success: false, message: "Payment failed." });
    }

    // Success
    payment.status = "successful";
    payment.transactionReference = receipt;
    await payment.save();

    booking.status = "confirmed";
    await booking.save();

    // 6. Generate tickets
    const existingTickets = await Ticket.find({ booking: booking._id });
    let tickets = existingTickets;

    if (existingTickets.length === 0) {
      tickets = [];
      for (let i = 0; i < booking.quantity; i++) {
        const ticket = await Ticket.create({
          booking: booking._id,
          user: booking.user,
          event: booking.event,
          ticketNumber: `TKT-${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`,
          status: "valid",
        });
        tickets.push(ticket);
      }
    }

    // 7. Notifications
    const event = await Event.findById(booking.event);
    await Notification.create([
      {
        user: booking.user,
        type: "payment_successful",
        title: "Payment successful",
        message: `Your payment of KES ${amount} for ${event?.title} was successful.`,
      },
      {
        user: booking.user,
        type: "booking_confirmed",
        title: "Booking confirmed",
        message: `Your booking for ${event?.title} has been confirmed.`,
      },
      {
        user: booking.user,
        type: "ticket_generated",
        title: "Your tickets are ready",
        message: `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""} for ${event?.title} ${tickets.length !== 1 ? "are" : "is"} ready.`,
      },
    ]);

    // 8. Return response
    return NextResponse.json({
      success: true,
      message: "M-Pesa payment processed successfully.",
      payment,
      booking,
      tickets,
    });
  } catch (error) {
    console.error("M-Pesa webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process M-Pesa webhook." },
      { status: 500 }
    );
  }
}
