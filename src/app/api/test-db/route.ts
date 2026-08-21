import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database";
import User from "@/database/user.model";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}