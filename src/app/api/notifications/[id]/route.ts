import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/database";
import Notification from "@/database/notification.model";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET — Get one notification
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notification = await Notification.findOne({
      _id: id,
      user: user._id,
    }).lean();

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error("Get notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notification.",
      },
      { status: 500 }
    );
  }
}

// PATCH — Mark notification as read/unread
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.read !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "The 'read' field must be a boolean.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: user._id,
      },
      {
        read: body.read,
      },
      {
        new: true,
        lean: true,
      }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.read
        ? "Notification marked as read."
        : "Notification marked as unread.",
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error("Update notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification.",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete notification.",
      },
      { status: 500 }
    );
  }
}