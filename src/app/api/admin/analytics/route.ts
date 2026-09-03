import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
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

    const [
      totalUsers,
      totalOrganizers,
      totalAdmins,
      totalEvents,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalTickets,
      validTickets,
      usedTickets,
      cancelledTickets,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "organizer" }),
      User.countDocuments({ role: "admin" }),

      Event.countDocuments({}),

      Booking.countDocuments({}),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "cancelled" }),

      Ticket.countDocuments({}),
      Ticket.countDocuments({ status: "valid" }),
      Ticket.countDocuments({ status: "used" }),
      Ticket.countDocuments({ status: "cancelled" }),
    ]);

    const confirmedBookingRecords = await Booking.find({
      status: "confirmed",
    })
      .select("totalAmount")
      .lean();

    const revenue = confirmedBookingRecords.reduce(
      (total, booking) => total + (Number(booking.totalAmount) || 0),
      0
    );

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          organizers: totalOrganizers,
          admins: totalAdmins,
        },

        events: {
          total: totalEvents,
        },

        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
        },

        revenue: {
          confirmedBookingRevenue: revenue,
        },

        tickets: {
          total: totalTickets,
          valid: validTickets,
          used: usedTickets,
          cancelled: cancelledTickets,
        },
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}