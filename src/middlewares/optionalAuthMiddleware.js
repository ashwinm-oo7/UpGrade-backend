// middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

export const tokenBlacklist = new Set(); // optional
// Verify JWT and attach user to req

export const authMiddleware = async (req, res, next) => {
  // const token = req.cookies.accessToken;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Cookies received:", req.cookies);

  if (!token) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    // console.log("Decoded JWT:", token, decoded);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        msg: "Your account is blocked by admin",
      });
    }

    req.user = user; // now req.user._id and req.user.role work everywhere
    req.userId = user._id; // for convenience
    req.token = token; // store token if needed

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({ msg: "Invalid token" });
  }
};
// Only admin users
export const adminOnly = async (req, res, next) => {
  // Ensure verifyToken runs first
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
