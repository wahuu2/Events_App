import mongoose, { Schema, models } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        // Event-specific types
        "booking_confirmed",
        "payment_successful",
        "ticket_generated",
        "event_updated",
        "event_cancelled",
        "event_reminder",

        // Generic styling types
        "success",
        "warning",
        "info",
        "error",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
