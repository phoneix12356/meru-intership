import express from "express";
import authController from "../controller/authController.js";
import asyncHandler from "../handler/asyncHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authMiddleware, asyncHandler(authController.me));

export default router;
