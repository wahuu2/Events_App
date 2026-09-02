import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "registration_confirmed",
        "booking_confirmed",
        "payment_successful",
        "ticket_generated",
        "new_booking",
        "event_updated",
        "event_cancelled",
        "event_reminder",
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

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Notification =
  models.Notification ||
  model("Notification", NotificationSchema);

export default Notification;