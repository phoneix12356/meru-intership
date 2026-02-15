import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Payment = model("Payment", paymentSchema);

export default Payment;
