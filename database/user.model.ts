import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    imageUrl: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },

    notificationPreferences: {
      type: [String],
      enum: [
        "booking_confirmed",
        "payment_successful",
        "ticket_generated",
        "event_updated",
        "event_cancelled",
        "event_reminder",
        "success",
        "warning",
        "info",
        "error",
      ],
      default: ["success", "warning", "info", "error"],
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;