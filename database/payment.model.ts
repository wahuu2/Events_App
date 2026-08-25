import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema(
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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["mpesa", "card"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "successful", "failed"],
      default: "pending",
    },

    transactionReference: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;