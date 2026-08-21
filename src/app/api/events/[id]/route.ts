import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id).populate(
      "organizer",
      "firstName lastName email imageUrl"
    );

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can update events",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    if (event.organizer.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own events",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "title",
      "description",
      "image",
      "location",
      "date",
      "time",
      "category",
      "price",
      "capacity",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        event[field] = body[field];
      }
    }

    await event.save();

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID",
        },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can delete events",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    if (event.organizer.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own events",
        },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete event",
      },
      { status: 500 }
    );
  }
}