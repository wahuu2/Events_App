import mongoose, { Schema, models } from "mongoose";

const ticketSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },
  },
  {
    timestamps: true,
  }
);

const Ticket =
  models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;