"use client";

import { useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export default function PaymentButton({ bookingId }: { bookingId: string }) {
  const [status, setStatus] = useState<string>("idle");
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  // Initialize Socket.IO client
  const socket = io(process.env.NEXT_PUBLIC_BASE_URL!, {
    transports: ["websocket"],
  });

  // Listen for real-time notifications
  socket.on("notification", (data) => {
    if (data.type === "payment_successful") {
      setStatus("Payment successful ✅");
    }
    if (data.type === "booking_confirmed") {
      setStatus("Booking confirmed 🎉");
    }
    if (data.type === "ticket_generated") {
      setStatus("Tickets ready 🎫");
    }
  });

  const handlePayment = async () => {
    try {
      setStatus("Initiating payment…");

      const res = await axios.post("/api/payments", {
        bookingId,
        method: "mpesa",
      });

      setPaymentInfo(res.data.payment);
      setStatus("STK push sent 📲 — check your phone");
    } catch (err: any) {
      setStatus("Payment initiation failed ❌");
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Pay with M-Pesa
      </button>

      {status && <p className="text-sm">{status}</p>}

      {paymentInfo && (
        <div className="mt-2 text-xs text-gray-600">
          <p>Transaction Ref: {paymentInfo.transactionReference}</p>
          <p>Status: {paymentInfo.status}</p>
        </div>
      )}
    </div>
  );
}
