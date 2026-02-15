import express from "express";
import asyncHandler from "../handler/asyncHandler.js";
import invoiceController from "../controller/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(invoiceController.listInvoicesByUser));
router.post("/", authMiddleware, asyncHandler(invoiceController.createInvoice));
router.get("/:id/pdf", authMiddleware, asyncHandler(invoiceController.downloadInvoicePdf));
router.get("/:id", authMiddleware, asyncHandler(invoiceController.getInvoiceById));
router.post("/archive", authMiddleware, asyncHandler(invoiceController.archiveInvoice));
router.post("/restore", authMiddleware, asyncHandler(invoiceController.restoreInvoice));

export default router;
