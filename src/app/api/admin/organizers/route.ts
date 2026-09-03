import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import User from "@/database/user.model";

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

    const organizers = await User.find({
      role: "organizer",
    })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      organizers,
      count: organizers.length,
    });
  } catch (error) {
    console.error("Admin organizers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}