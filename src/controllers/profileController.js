import User from "../models/user.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { sendMail } from "../utils/mailer.js";
import mongoose from "mongoose"; // For ObjectId check
import { getUserProfileService } from "../services/profileService.js";

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    if (!isValidObjectId(req.userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findById(req.userId).select("-password");
    // console.log("USERS", user);

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    if (!isValidObjectId(req.userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const {
      name,
      phone,
      address,
      education,
      workExperiences,
      hobbies,
      skills,
      careerObjective,
      nameLocked, // 👈 from frontend
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 1. NAME LOCK PROTECTION
    if (user.nameLocked) {
      if (name && name !== user.name) {
        return res.status(403).json({
          msg: "Name is locked and cannot be changed",
        });
      }
    }

    // 🔥 2. NAME CHANGE TRACKING (before lock)
    if (!user.nameLocked && name && name !== user.name) {
      user.nameHistory.push({
        name: user.name,
        changedAt: new Date(),
      });

      user.name = name;
    }

    // 🔥 3. LOCK NAME (ONE TIME ONLY)
    if (!user.nameLocked && nameLocked === true) {
      user.nameLocked = true;
      user.nameLockedAt = new Date();
    }

    // 🔥 4. NORMAL FIELDS UPDATE
    user.phone = phone;
    user.address = address;
    user.education = education;
    user.workExperiences = workExperiences;
    user.hobbies = hobbies;
    user.skills = skills;
    user.careerObjective = careerObjective;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

// SEND OTP
export const sendPasswordOtp = async (req, res) => {
  try {
    if (!isValidObjectId(req.userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const { oldPassword } = req.body;
    if (!oldPassword)
      return res.status(400).json({ msg: "Old password required" });

    const user = await User.findById(req.userId);
    console.log("userde", user);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ msg: "Old password incorrect" });

    const otp = otpGenerator.generate(6, {
      digits: true, // ✅ include digits
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log("sendPasswordOtp", otp);
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    try {
      if (!user.email) throw new Error("User email not defined");

      await sendMail({
        to: user.email,
        subject: "Password Change OTP",
        html: `Your OTP is <b>${otp}</b>. It will expire in 5 minutes.`,
      });
      res.json({
        msg: "OTP sent to email",
        otpExpiry: user.otpExpiry,
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);

      // Reset OTP if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res
        .status(500)
        .json({ msg: "Failed to send OTP email. Try again later." });
    }
  } catch (error) {
    console.error("sendPasswordOtp error:", error);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
}; // VERIFY OTP AND CHANGE PASSWORD
export const verifyOtpAndChangePassword = async (req, res) => {
  try {
    if (!isValidObjectId(req.userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const { otp, newPassword } = req.body;

    if (!otp || !newPassword)
      return res.status(400).json({ msg: "OTP and new password required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ msg: "No OTP requested" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (error) {
    console.error("verifyOtpAndChangePassword error:", error);
    res.status(500).json({ msg: "Password change failed" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // const { username } = req.params;

    // console.log("getprofile", req.user);
    const profile = await getUserProfileService(req.userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
