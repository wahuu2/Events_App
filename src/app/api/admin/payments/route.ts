import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Payment from "@/database/payment.model";

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

    const payments = await Payment.find({})
      .populate("user", "firstName lastName email")
      .populate("booking", "bookingReference totalAmount status")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (error) {
    console.error("Admin payments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}