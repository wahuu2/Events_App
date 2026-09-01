import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import User from "@/database/user.model";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const event = await verifyWebhook(request);

    await connectToDatabase();

    // USER CREATED
    if (event.type === "user.created") {
      const {
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        primary_email_address_id,
      } = event.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      // Check whether this user already exists
      const existingUser = await User.findOne({
        clerkId: id,
      });

      // Create the user only if they don't already exist
      const user = await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          firstName: first_name,
          lastName: last_name,
          email: primaryEmail?.email_address,
          imageUrl: image_url,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("User created in MongoDB:", id);

      // Create welcome notification only for a genuinely new user
      if (!existingUser && user) {
        await createNotification({
          userId: user._id.toString(),
          type: "registration_confirmed",
          title: "Welcome to EventApp",
          message:
            "Your EventApp account has been created successfully.",
        });

        console.log("Registration notification created:", id);
      }
    }

    // USER UPDATED
    if (event.type === "user.updated") {
      const {
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        primary_email_address_id,
      } = event.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          firstName: first_name,
          lastName: last_name,
          email: primaryEmail?.email_address,
          imageUrl: image_url,
        },
        {
          new: true,
        }
      );

      console.log("User updated in MongoDB:", id);
    }

    // USER DELETED
    if (event.type === "user.deleted") {
      await User.findOneAndDelete({
        clerkId: event.data.id,
      });

      console.log("User deleted from MongoDB:", event.data.id);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook verification/database error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
      },
      { status: 400 }
    );
  }
}