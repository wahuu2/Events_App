import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

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

    return NextResponse.json({
      success: true,
      message: "Admin access verified",
      user: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    console.error("Admin test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}