import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = {};

    // Search by title, description, or location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category !== "all") {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    const events = await Event.find(filter)
      .populate(
        "organizer",
        "firstName lastName email imageUrl"
      )
      .sort({ date: 1 });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the currently logged-in MongoDB user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    // Only organizers can create events
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can create events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      title,
      description,
      image,
      location,
      date,
      time,
      category,
      price,
      capacity,
    } = body;

    // Basic validation
    if (
      !title ||
      !description ||
      !image ||
      !location ||
      !date ||
      !time ||
      !category ||
      price === undefined ||
      capacity === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required event fields.",
        },
        { status: 400 }
      );
    }

    // Validate numbers
    const eventPrice = Number(price);
    const eventCapacity = Number(capacity);

    if (
      Number.isNaN(eventPrice) ||
      Number.isNaN(eventCapacity)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Price and capacity must be valid numbers.",
        },
        { status: 400 }
      );
    }

    if (eventPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price cannot be negative.",
        },
        { status: 400 }
      );
    }

    if (eventCapacity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Capacity must be at least 1.",
        },
        { status: 400 }
      );
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      image,
      location,
      date,
      time,
      category,
      price: eventPrice,
      capacity: eventCapacity,
      organizer: user._id,
    });

    // Return the newly created event
    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event.",
      },
      { status: 500 }
    );
  }
}