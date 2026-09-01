import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can access this resource",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const events = await Event.find({
      organizer: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Organizer events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizer events",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can create events",
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

    // Validate required fields
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

    // Convert numbers
    const eventPrice = Number(price);
    const eventCapacity = Number(capacity);

    // Validate price
    if (Number.isNaN(eventPrice) || eventPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    // Validate capacity
    if (
      Number.isNaN(eventCapacity) ||
      !Number.isInteger(eventCapacity) ||
      eventCapacity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Capacity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    // Validate date
    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid event date.",
        },
        { status: 400 }
      );
    }

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      location: location.trim(),
      date: eventDate,
      time: time.trim(),
      category: category.trim(),
      price: eventPrice,
      capacity: eventCapacity,

      // IMPORTANT:
      // The server determines the organizer.
      organizer: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create organizer event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event.",
      },
      { status: 500 }
    );
  }
}