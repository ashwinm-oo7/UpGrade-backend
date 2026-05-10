import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Use .js because it's an ES module
import Otp from "../models/otp.js"; // Add this at the top
import { parseIdentifier, sendMail, sendTelegramOtp } from "../utils/mailer.js";
import { getOtpTemplate } from "../templates/otpTemplate.js";
import dotenv from "dotenv";
import { UAParser } from "ua-parser-js";
import { tokenBlacklist } from "../middlewares/optionalAuthMiddleware.js";
// import cookieParser from "cookie-parser";
import {
  authMiddleware,
  adminOnly,
} from "../middlewares/optionalAuthMiddleware.js";
import rateLimit from "express-rate-limit";
import telegramUser from "../models/telegramUser.js";

const router = express.Router();
dotenv.config();
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_MAX_AGE = process.env.ACCESS_TOKEN_MAX_AGE;
const REFRESH_TOKEN_MAX_AGE = process.env.REFRESH_TOKEN_MAX_AGE;
// const otpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXP = process.env.JWT_EXPIRES_IN;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXP = process.env.JWT_REFRESH_EXP || "7d";
const isProduction = process.env.NODE_ENV === "production";
import crypto from "crypto";
import { logActivity } from "../utils/activityLogger.js";

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again later.",
});

router.get("/telegram-login-token", (req, res) => {
  const token = crypto.randomBytes(16).toString("hex");

  // store temporarily (Redis or memory)
  global.telegramLoginTokens = global.telegramLoginTokens || {};
  global.telegramLoginTokens[token] = {
    createdAt: Date.now(),
    verified: false,
  };

  console.log("🎫 Token generated:", token);
  console.log("📦 Current tokens:", Object.keys(global.telegramLoginTokens));

  res.json({
    token,
    botLink: `https://t.me/MauryaTechBot?start=${token}`,
  });
});

router.post("/telegram-login-verify", async (req, res) => {
  const { token } = req.body;

  console.log("🔍 Verify endpoint called with token:", token);
  console.log(
    "📦 Available tokens:",
    Object.keys(global.telegramLoginTokens || {}),
  );

  if (!token) {
    console.log("❌ No token provided");
    return res.status(400).json({ msg: "Token is required" });
  }

  const record = global.telegramLoginTokens?.[token];

  if (!record) {
    console.log("❌ Token not found:", token);
    return res.status(400).json({ msg: "Token not found or expired" });
  }

  console.log("✅ Token found. Record:", record);

  if (!record.verified) {
    console.log("❌ Token not verified yet:", token);
    return res.status(400).json({ msg: "Not verified yet" });
  }

  const { username, chatId } = record;

  console.log("✨ Token verified! Username:", username, "ChatId:", chatId);

  // Check or create user
  let user = await User.findOne({ email: username });

  if (!user) {
    console.log("👤 Creating new user:", username);
    user = new User({
      email: username,
      password: "telegram-auth",
    });
    await user.save();
  }

  console.log("✅ User ready:", user._id);

  // generate JWT
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXP },
  );

  if (!user.loginSessions) user.loginSessions = [];

  user.loginSessions.push({
    token: refreshToken,
    ip: "telegram",
    browser: "telegram",
    os: "telegram",
    device: "telegram",
    location: "telegram",
    firstLogin: new Date(),
    lastLogin: new Date(),
  });

  await user.save();
  delete global.telegramLoginTokens[token]; // cleanup

  console.log("🎉 Login success for user:", username);

  res.json({
    msg: "Login success",
    accessToken,
    refreshToken, // ✅ MUST
  });
});
router.post("/send-otp", async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ msg: "Email is required" });
  const email = identifier; // store everything in email column

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "User already exists" });
  const recentOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

  // if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < 600000) {
  //   return res.status(429).json({
  //     msg: "Please wait at least 60 seconds before requesting another OTP.",
  //   });
  // }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
  console.log("otp", otp);
  try {
    await Otp.create({ email, otp });
    let result;
    const parsed = parseIdentifier(identifier);

    if (parsed.type === "email") {
      result = await sendMail({
        to: email,
        subject: "Your OTP for Registration",
        html: getOtpTemplate(otp, identifier),
      });
    } else if (parsed.type === "telegram") {
      // 🤖 TELEGRAM FLOW
      result = await sendTelegramOtp(identifier, otp);
    } else if (parsed.type === "telegram_username") {
      const tgUser = await telegramUser.findOne({
        username: parsed.value.replace("@", ""),
      });

      if (!tgUser) {
        return res.status(400).json({
          msg: "Please start our Telegram bot first: https://t.me/MauryaTechBot",
        });
      }

      result = await sendTelegramOtp(tgUser.chatId, otp);
    } else {
      return res.status(400).json({ msg: "Invalid email or Telegram ID" });
    }

    // console.log("response send otp", result);
    if (!result.success) {
      console.error("❌ Email failed:", result.error);
      return res
        .status(400)
        .json({ msg: result.error || "Failed to send OTP email" });
    }

    res.json({ msg: "OTP sent to email." });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ msg: "Failed to send OTP." });
  }
});

// Route: Verify OTP and Register
router.post("/verify-otp", async (req, res) => {
  const { identifier, password, otp } = req.body;
  console.log("Received OTP verification request:", { identifier, otp });
  const email = identifier; // store same field

  try {
    const record = await Otp.findOne({ email, otp });
    console.log("OTP record from DB:", record);

    if (!record) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }
    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      await Otp.deleteMany({ email });
      console.log("User already exists. Deleted OTPs.");
      return res.status(400).json({ msg: "User already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    console.log("User registered successfully:", user);

    await Otp.deleteMany({ email });
    res.json({ msg: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Registration failed." });
    console.error("Error in OTP verification:", error);

    await Otp.deleteMany({ email });
  }
});
router.get("/sessions", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("loginSessions");

  res.json(user.loginSessions);
});
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    if (user?.isBlocked) {
      return res.status(403).json({
        msg: "Your account is blocked by admin.\n Contact Support!!!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const parser = new UAParser(req.headers["user-agent"]);
    const deviceInfo = parser.getResult();

    const browser = deviceInfo.browser.name || "Unknown";
    const os = deviceInfo.os.name || "Unknown";
    const device = deviceInfo.device.type || "desktop";
    let location = "Unknown";

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await response.json();
      location = geo.country_name || "Unknown";
    } catch (err) {
      console.log("Geo lookup failed");
    }
    // -------------------------
    // GENERATE TOKENS
    // -------------------------

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXP },
    );

    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXP,
    });
    // -------------------------
    // INIT SESSION ARRAY
    // -------------------------
    if (!user.loginSessions) user.loginSessions = [];

    // -------------------------
    // CHECK EXISTING SESSION
    // -------------------------
    const existingSession = user.loginSessions.find(
      (s) =>
        s.ip === ip &&
        s.browser === browser &&
        s.os === os &&
        s.device === device,
    );

    if (!existingSession) {
      // LIMIT SESSIONS (max 5)
      if (user.loginSessions.length >= 5) {
        user.loginSessions.shift();
      }

      // ADD NEW SESSION
      user.loginSessions.push({
        token: refreshToken,
        ip,
        browser,
        os,
        device,
        location,
        firstLogin: new Date(),
        lastLogin: new Date(),
      });

      // OPTIONAL EMAIL ALERT
      await sendMail({
        to: user.email,
        subject: "New Device Login Detected",
        html: `
          <h2>Security Alert</h2>
          <p>A new device logged into your account.</p>

          <b>Device:</b> ${browser} on ${os}<br/>
          <b>Type:</b> ${device}<br/>
          <b>IP:</b> ${ip}<br/>
          <b>Time:</b> ${new Date().toLocaleString()}<br/>

          If this wasn't you, change your password immediately.
        `,
      });

      console.log("New device login:", ip, browser, os);
    } else {
      // UPDATE LAST LOGIN
      existingSession.lastLogin = new Date();
    }

    // -------------------------
    // SAVE USER
    // -------------------------

    await user.save();
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: isProduction ? "None" : "Lax",

    //   maxAge: Number(ACCESS_TOKEN_MAX_AGE),
    //   path: "/",
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: isProduction ? "None" : "Lax",
    //   maxAge: Number(REFRESH_TOKEN_MAX_AGE),
    //   path: "/",
    // });
    await logActivity({
      userId: user._id,
      action: "LOGIN",
      req,
    });
    res.json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      role: user.role,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: "Login failed",
    });
  }
});
router.post("/refresh", async (req, res) => {
  const { token } = req.body;

  // console.log("/refresh", token);
  if (!token) {
    return res.status(403).json({ msg: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    console.log("user.loginSessions", token);
    if (!user || !user.loginSessions) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const sessionExists = user.loginSessions.find((s) => s.token === token);
    // console.log("Incoming token:", token);

    // console.log(
    //   "Stored tokens:",
    //   user.loginSessions.map((s) => s.token),
    // );
    if (!sessionExists) {
      console.log("sessionExists", sessionExists);
      return res.status(403).json({ msg: "Invalid refresh token" });
    }
    // console.log("User fetch from db", user);
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // res.cookie("accessToken", newAccessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: isProduction ? "None" : "Lax",
    //   maxAge: Number(ACCESS_TOKEN_MAX_AGE),
    //   path: "/",
    // });

    res.json({ accessToken: newAccessToken, msg: "Token refreshed" });
  } catch (err) {
    return res.status(403).json({ msg: "Invalid refresh token" });
  }
});
router.post("/logout", authMiddleware, async (req, res) => {
  const refreshToken = req.body.refreshToken;

  const user = await User.findById(req.userId);

  if (user && user.loginSessions) {
    user.loginSessions = user.loginSessions.filter(
      (s) => s.token !== refreshToken,
    );

    await user.save();
  }

  res.json({ msg: "Logged out from this device" });
});

router.post("/logout-all", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);

  if (user) {
    user.loginSessions = []; // 🔥 clear all sessions
    await user.save();
  }

  res.json({ msg: "Logged out from all devices" });
});
// router.post("/logout", async (req, res) => {
//   const token = req.cookies.refreshToken;

//   if (token) {
//     const decoded = jwt.decode(token);
//     const user = await User.findById(decoded.userId);

//     if (user) {
//       user.refreshToken = null;
//       await user.save();
//     }
//   }

//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");

//   res.json({ msg: "Logged out successfully" });
// });

router.get("/me", authMiddleware, async (req, res) => {
  // console.log("Cookies:", req.cookies);
  try {
    const user = await User.findById(req.userId).select("-password");
    // console.log("USERID", req.userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    res.json({
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    res.status(500).json({
      msg: "Failed to fetch user",
    });
  }
});

export default router;
