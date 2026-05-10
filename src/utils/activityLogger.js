import Activity from "../models/Activity.js";

import { getIO } from "./socket.js";

export const logActivity = async ({ userId, action, metadata = {}, req }) => {
  try {
    const activity = await Activity.create({
      user: userId,
      action,
      metadata,
      ip: req.ip,
      device: req.headers["user-agent"],
    });

    // 🔥 EMIT LIVE UPDATE
    const io = getIO();

    io.to("admins").emit("activityUpdate", activity);
  } catch (err) {
    console.error("Activity log failed:", err);
  }
};
