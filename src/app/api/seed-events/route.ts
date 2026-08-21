import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import User from "@/database/user.model";

export async function POST() {
  try {
    await connectToDatabase();

    const organizer = await User.findOne();

    if (!organizer) {
      return NextResponse.json(
        {
          success: false,
          message: "No user found. Sign up first.",
        },
        { status: 404 }
      );
    }

    const events = await Event.insertMany([
      {
        title: "Nairobi Tech Summit 2026",
        description:
          "A technology conference bringing developers, entrepreneurs, designers and technology enthusiasts together.",
        image:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        location: "Nairobi, Kenya",
        date: new Date("2026-09-12"),
        time: "9:00 AM",
        category: "Technology",
        price: 1500,
        capacity: 500,
        organizer: organizer._id,
      },

      {
        title: "Nairobi Gospel Music Festival",
        description:
          "An uplifting Christian music experience featuring worship, gospel music and fellowship.",
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063",
        location: "Kasarani Stadium, Nairobi",
        date: new Date("2026-09-20"),
        time: "3:00 PM",
        category: "Christian Events",
        price: 1000,
        capacity: 2000,
        organizer: organizer._id,
      },

      {
        title: "Kenya Business & Networking Expo",
        description:
          "Connect with entrepreneurs, professionals and business leaders from across Kenya.",
        image:
          "https://images.unsplash.com/photo-1556761175-b413da4baf72",
        location: "KICC, Nairobi",
        date: new Date("2026-10-03"),
        time: "10:00 AM",
        category: "Business",
        price: 2000,
        capacity: 800,
        organizer: organizer._id,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Test events created successfully",
      events,
    });
  } catch (error) {
    console.error("Seed events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test events",
      },
      { status: 500 }
    );
  }
}