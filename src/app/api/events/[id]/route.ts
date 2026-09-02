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

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "image",
  "location",
  "date",
  "time",
  "category",
  "price",
  "capacity",
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function validateEventFields(event: any) {
  if (!isNonEmptyString(event.title)) {
    return "Title is required.";
  }

  if (!isNonEmptyString(event.description)) {
    return "Description is required.";
  }

  if (!isNonEmptyString(event.image)) {
    return "Image is required.";
  }

  if (!isNonEmptyString(event.location)) {
    return "Location is required.";
  }

  if (!event.date || !isValidDate(event.date)) {
    return "Date must be a valid date.";
  }

  if (!isNonEmptyString(event.time)) {
    return "Time is required.";
  }

  if (!isNonEmptyString(event.category)) {
    return "Category is required.";
  }

  if (
    typeof event.title === "string" &&
    event.title.trim().length > 200
  ) {
    return "Title is too long.";
  }

  if (
    typeof event.location === "string" &&
    event.location.trim().length > 200
  ) {
    return "Location is too long.";
  }

  if (
    typeof event.category === "string" &&
    event.category.trim().length > 100
  ) {
    return "Category is too long.";
  }

  if (
    typeof event.time === "string" &&
    event.time.trim().length > 50
  ) {
    return "Time is too long.";
  }

  if (
    typeof event.description === "string" &&
    event.description.trim().length > 5000
  ) {
    return "Description is too long.";
  }

  if (
    typeof event.image === "string" &&
    event.image.trim().length > 2000
  ) {
    return "Image URL is too long.";
  }

  const price = Number(event.price);

  if (!Number.isFinite(price)) {
    return "Price must be a valid number.";
  }

  if (price < 0) {
    return "Price cannot be negative.";
  }

  const capacity = Number(event.capacity);

  if (!Number.isFinite(capacity)) {
    return "Capacity must be a valid number.";
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    return "Capacity must be a whole number greater than 0.";
  }

  return null;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Validate MongoDB ObjectId before querying.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(id)
      .populate(
        "organizer",
        "firstName lastName email imageUrl"
      )
      .lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
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
        message: "Failed to fetch event.",
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

    // 1. Validate ObjectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID.",
        },
        { status: 400 }
      );
    }

    // 2. Authenticate.
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    // 3. Authorization.
    if (currentUser.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can update events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 4. Find event.
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
        },
        { status: 404 }
      );
    }

    // 5. Ownership check.
    if (
      event.organizer.toString() !==
      currentUser._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own events.",
        },
        { status: 403 }
      );
    }

    // 6. Parse request body safely.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be a valid object.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as Record<string, unknown>;

    // 7. Reject unexpected fields.
    const unknownFields = Object.keys(requestBody).filter(
      (field) =>
        !ALLOWED_UPDATE_FIELDS.includes(
          field as (typeof ALLOWED_UPDATE_FIELDS)[number]
        )
    );

    if (unknownFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Unexpected field(s): ${unknownFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // 8. Apply only allowed fields.
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (
        Object.prototype.hasOwnProperty.call(
          requestBody,
          field
        )
      ) {
        const value = requestBody[field];

        if (
          [
            "title",
            "description",
            "image",
            "location",
            "time",
            "category",
          ].includes(field)
        ) {
          if (!isNonEmptyString(value)) {
            return NextResponse.json(
              {
                success: false,
                message: `${field} must be a non-empty string.`,
              },
              { status: 400 }
            );
          }

          event[field] = value.trim();
        } else if (field === "date") {
          if (!isValidDate(value)) {
            return NextResponse.json(
              {
                success: false,
                message: "Date must be a valid date.",
              },
              { status: 400 }
            );
          }

          event.date = new Date(value as string | number);
        } else if (field === "price") {
          const numericPrice = Number(value);

          if (
            typeof value === "boolean" ||
            !Number.isFinite(numericPrice)
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Price must be a valid number.",
              },
              { status: 400 }
            );
          }

          if (numericPrice < 0) {
            return NextResponse.json(
              {
                success: false,
                message: "Price cannot be negative.",
              },
              { status: 400 }
            );
          }

          event.price = numericPrice;
        } else if (field === "capacity") {
          const numericCapacity = Number(value);

          if (
            typeof value === "boolean" ||
            !Number.isFinite(numericCapacity)
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Capacity must be a valid number.",
              },
              { status: 400 }
            );
          }

          if (
            !Number.isInteger(numericCapacity) ||
            numericCapacity < 1
          ) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Capacity must be a whole number greater than 0.",
              },
              { status: 400 }
            );
          }

          event.capacity = numericCapacity;
        }
      }
    }

    // 9. Validate the complete event after applying updates.
    const validationError = validateEventFields(event);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }

    // 10. Save validated event.
    await event.save();

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update event.",
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

    // 1. Validate ObjectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event ID.",
        },
        { status: 400 }
      );
    }

    // 2. Authenticate.
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    // 3. Only organizers can delete events.
    if (currentUser.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can delete events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // 4. Find event.
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found.",
        },
        { status: 404 }
      );
    }

    // 5. Ownership check.
    if (
      event.organizer.toString() !==
      currentUser._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own events.",
        },
        { status: 403 }
      );
    }

    // 6. Delete event.
    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete event.",
      },
      { status: 500 }
    );
  }
}