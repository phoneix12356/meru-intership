import { Schema, model } from "mongoose";

const invoiceLineSchema = new Schema(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const InvoiceLine = model("InvoiceLine", invoiceLineSchema);

export default InvoiceLine;
