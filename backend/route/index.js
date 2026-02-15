import express from "express";
import authRoutes from "./authRoute.js";
import invoiceRoutes from "./invoiceRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/invoices", paymentRoutes);

export default router;
