import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import NotificationPreference from "@/database/notification-preference.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
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

    await connectToDatabase();

    let preferences = await NotificationPreference.findOne({
      user: user._id,
    }).lean();

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: user._id,
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        bookingConfirmed: preferences.bookingConfirmed,
        paymentSuccessful: preferences.paymentSuccessful,
        ticketGenerated: preferences.ticketGenerated,
        eventUpdated: preferences.eventUpdated,
        eventCancelled: preferences.eventCancelled,
        eventReminder: preferences.eventReminder,
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notification preferences.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

    const body = await request.json();

    const allowedFields = [
      "bookingConfirmed",
      "paymentSuccessful",
      "ticketGenerated",
      "eventUpdated",
      "eventCancelled",
      "eventReminder",
    ];

    const updates: Record<string, boolean> = {};

    for (const field of allowedFields) {
      if (field in body) {
        if (typeof body[field] !== "boolean") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a boolean.`,
            },
            { status: 400 }
          );
        }

        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid preference fields were provided.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

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
          lean: true,
        }
      );

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully.",
      preferences: {
        bookingConfirmed: preferences.bookingConfirmed,
        paymentSuccessful: preferences.paymentSuccessful,
        ticketGenerated: preferences.ticketGenerated,
        eventUpdated: preferences.eventUpdated,
        eventCancelled: preferences.eventCancelled,
        eventReminder: preferences.eventReminder,
      },
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification preferences.",
      },
      { status: 500 }
    );
  }
}