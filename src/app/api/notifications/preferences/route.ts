import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import NotificationPreference from "@/database/notification-preference.model";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_FIELDS = [
  "bookingConfirmed",
  "paymentSuccessful",
  "ticketGenerated",
  "eventUpdated",
  "eventCancelled",
  "eventReminder",
] as const;

type PreferenceField = (typeof ALLOWED_FIELDS)[number];

function formatPreferences(preferences: any) {
  return {
    bookingConfirmed: preferences.bookingConfirmed,
    paymentSuccessful: preferences.paymentSuccessful,
    ticketGenerated: preferences.ticketGenerated,
    eventUpdated: preferences.eventUpdated,
    eventCancelled: preferences.eventCancelled,
    eventReminder: preferences.eventReminder,
  };
}

/**
 * GET — Get notification preferences for the
 * currently authenticated user.
 */
export async function GET() {
  try {
    // 1. Authenticate the current user.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    // 2. Connect to the database.
    await connectToDatabase();

    // 3. Only retrieve preferences belonging to this user.
    let preferences = await NotificationPreference.findOne({
      user: user._id,
    }).lean();

    // 4. Create default preferences if none exist.
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: user._id,
      });
    }

    // 5. Return only allowed preference fields.
    return NextResponse.json({
      success: true,
      preferences: formatPreferences(preferences),
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);

    // Do not expose internal errors.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notification preferences.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Update notification preferences for the
 * currently authenticated user.
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Authenticate the current user.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    // 2. Parse the request body safely.
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

    // 3. Make sure the body is a JSON object.
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

    // 4. Only allow known preference fields.
    const updates: Partial<Record<PreferenceField, boolean>> = {};

    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(requestBody, field)) {
        const value = requestBody[field];

        if (typeof value !== "boolean") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a boolean.`,
            },
            { status: 400 }
          );
        }

        updates[field] = value;
      }
    }

    // 5. Reject requests that contain no valid preference fields.
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid preference fields were provided.",
        },
        { status: 400 }
      );
    }

    // 6. Connect to the database.
    await connectToDatabase();

    // 7. Update only the authenticated user's preferences.
    const preferences =
      await NotificationPreference.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          $set: updates,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

    if (!preferences) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update notification preferences.",
        },
        { status: 500 }
      );
    }

    // 8. Return the updated preferences.
    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully.",
      preferences: formatPreferences(preferences),
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);

    // Do not expose internal database errors.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification preferences.",
      },
      { status: 500 }
    );
  }
}