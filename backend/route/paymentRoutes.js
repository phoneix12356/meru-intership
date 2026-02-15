import express from "express";
import paymentController from "../controller/paymentController.js";
import asyncHandler from "../handler/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/payments", authMiddleware, asyncHandler(paymentController.addPayment));

export default router;
