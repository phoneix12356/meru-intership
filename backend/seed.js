import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./model/user.js";
import Invoice from "./model/invoice.js";
import InvoiceLine from "./model/invoiceLine.js";
import Payment from "./model/payment.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany({});
    await Invoice.deleteMany({});
    await InvoiceLine.deleteMany({});
    await Payment.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "Demo Admin",
      email: "admin@example.com",
      password: hashedPassword,
    });
    console.log("Demo user created: admin@example.com / password123");

    const invoice1 = await Invoice.create({
      userId: user._id,
      invoiceNumber: "INV-2024-001",
      customerName: "Acme Corp",
      issueDate: new Date("2024-01-01"),
      dueDate: new Date("2024-02-01"),
      status: "DRAFT",
      currency: "USD",
      subTotal: 1000,
      taxRate: 10,
      taxAmount: 100,
      total: 1100,
      amountPaid: 0,
      balanceDue: 1100,
    });

    await InvoiceLine.create({
      invoiceId: invoice1._id,
      description: "Cloud Hosting Service",
      quantity: 1,
      unitPrice: 1000,
      lineTotal: 1000,
    });

    const invoice2 = await Invoice.create({
      userId: user._id,
      invoiceNumber: "INV-2023-099",
      customerName: "Globex Inc",
      issueDate: new Date("2023-11-01"),
      dueDate: new Date("2023-12-01"),
      status: "DRAFT",
      currency: "EUR",
      subTotal: 500,
      taxRate: 5,
      taxAmount: 25,
      total: 525,
      amountPaid: 100,
      balanceDue: 425,
    });

    await InvoiceLine.create({
      invoiceId: invoice2._id,
      description: "Consultation Fee",
      quantity: 5,
      unitPrice: 100,
      lineTotal: 500,
    });

    await Payment.create({
      invoiceId: invoice2._id,
      amount: 100,
      paymentDate: new Date("2023-11-15"),
    });

    console.log("Seed data created successfully!");
    console.log(`Use this ID for testing: ${invoice2._id}`);

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
