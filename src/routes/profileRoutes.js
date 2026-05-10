import express from "express";

import {
  getProfile,
  updateProfile,
  sendPasswordOtp,
  verifyOtpAndChangePassword,
  getUserProfile,
} from "../controllers/profileController.js";

import { authMiddleware } from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

router.put("/update", authMiddleware, updateProfile);

router.post("/change-password/send-otp", authMiddleware, sendPasswordOtp);

router.post(
  "/change-password/verify",
  authMiddleware,
  verifyOtpAndChangePassword,
);
router.get("/getid", authMiddleware, getUserProfile);

export default router;
