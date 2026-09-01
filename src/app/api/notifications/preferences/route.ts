import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import User from "@/database/user.model";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { preferences } = body;

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { success: false, message: "Preferences must be an array." },
        { status: 400 }
      );
    }

    user.notificationPreferences = preferences;
    await user.save();

    return NextResponse.json({
      success: true,
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update preferences." },
      { status: 500 }
    );
  }
}
