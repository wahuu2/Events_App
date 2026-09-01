import mongoose, { Schema, models } from "mongoose";

const notificationPreferenceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bookingConfirmed: {
      type: Boolean,
      default: true,
    },

    paymentSuccessful: {
      type: Boolean,
      default: true,
    },

    ticketGenerated: {
      type: Boolean,
      default: true,
    },

    eventUpdated: {
      type: Boolean,
      default: true,
    },

    eventCancelled: {
      type: Boolean,
      default: true,
    },

    eventReminder: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationPreference =
  models.NotificationPreference ||
  mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
  );

export default NotificationPreference;