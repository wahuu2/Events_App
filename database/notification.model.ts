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
        "registration_confirmed",
        "booking_confirmed",
        "payment_successful",
        "ticket_generated",
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
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;