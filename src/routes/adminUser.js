import express from "express";
import User from "../models/user.js";
import {
  authMiddleware,
  adminOnly,
} from "../middlewares/optionalAuthMiddleware.js";
import Exam from "../models/Exam.js";
import Activity from "../models/Activity.js";
import mongoose from "mongoose"; // For ObjectId check
import { logActivity } from "../utils/activityLogger.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";
import { ROLE_PERMISSIONS } from "../utils/rolePermissions.js";
import {
  deleteForever,
  getEmailDetails,
  getInbox,
  markAsRead,
  moveToTrash,
  replyEmail,
  sendMail,
  toggleStar,
} from "../utils/mailer.js";

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET PROFILE

router.get(
  "/activity/:userId",
  authMiddleware,
  requirePermission("canViewActivity"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ msg: "Invalid user ID" });
      }

      const logs = await Activity.find({
        user: new mongoose.Types.ObjectId(userId), // ✅ FIX
      })
        .sort({ createdAt: -1 })
        .limit(100);
      console.log("logs", userId, logs);
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to fetch activity" });
    }
  },
);
router.put(
  "/set-permissions/:userId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { permissions },
        { new: true },
      );

      res.json({
        msg: "Permissions updated",
        permissions: user.permissions,
      });
    } catch (err) {
      res.status(500).json({ msg: "Failed to update permissions" });
    }
  },
);
/* =========================
   🚫 BLOCK / UNBLOCK USER
========================= */

router.put(
  "/block/:userId",
  authMiddleware,
  requirePermission("canBlockUser"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.isBlocked = !user.isBlocked;

      await user.save();
      await logActivity({
        userId: user._id,
        action: "ADMIN_BLOCK",
        metadata: { by: req.user._id },
        req,
      });
      res.json({
        msg: user.isBlocked ? "User blocked" : "User unblocked",
        isBlocked: user.isBlocked,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to update user" });
    }
  },
);

router.put("/set-role/:userId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = role;

    // 🔥 AUTO APPLY TEMPLATE
    if (role !== "custom") {
      user.permissions = ROLE_PERMISSIONS[role];
    }

    await user.save();

    res.json({
      msg: "Role updated",
      role: user.role,
      permissions: user.permissions,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update role" });
  }
});
router.get("/getAll", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email isBlocked nameLocked createdAt permissions role")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
});
router.put(
  "/reset-attempts",
  authMiddleware,
  requirePermission("canResetAttempts"),
  async (req, res) => {
    try {
      const { userId, domain, level } = req.body;

      const result = await Exam.updateMany(
        {
          user: userId,
          domain,
          level,
          submitted: true,
          isReset: false,
        },
        {
          $set: { isReset: true },
        },
      );

      res.json({
        msg: "Attempts reset successfully",
        modified: result.modifiedCount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to reset attempts" });
    }
  },
);
router.put(
  "/toggle-name-lock/:userId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const adminId = req.user._id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // 🔄 TOGGLE LOCK
      user.nameLocked = !user.nameLocked;
      user.nameLockedByAdmin = true;

      // 🧾 AUDIT LOG
      user.nameLockHistory.push({
        action: user.nameLocked ? "LOCK" : "UNLOCK",
        by: adminId,
        at: new Date(),
      });

      await user.save();

      res.json({
        msg: user.nameLocked
          ? "Name locked by admin"
          : "Name unlocked by admin",
        nameLocked: user.nameLocked,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to update name lock" });
    }
  },
);
router.get("/emails", async (req, res) => {
  const { pageToken } = req.query;

  const data = await getInbox("INBOX", pageToken);

  const detailed = await Promise.all(
    data.messages.map((m) => getEmailDetails(m.id)),
  );

  res.json({
    emails: detailed,
    nextPageToken: data.nextPageToken,
  });
});
router.get("/emails/sent", async (req, res) => {
  const { pageToken } = req.query;

  const data = await getInbox("SENT", pageToken);

  const detailed = await Promise.all(
    data.messages.map((m) => getEmailDetails(m.id)),
  );

  res.json({
    emails: detailed,
    nextPageToken: data.nextPageToken,
  });
});
router.get("/emails/trash", async (req, res) => {
  const { pageToken } = req.query;
  const data = await getInbox("TRASH", pageToken);

  const detailed = await Promise.all(
    data.messages.map((m) => getEmailDetails(m.id)),
  );
  res.json({
    emails: detailed,
    nextPageToken: data.nextPageToken,
  });
});

// 📄 GET SINGLE EMAIL
router.get("/emails/:id", async (req, res) => {
  const email = await getEmailDetails(req.params.id);
  res.json(email);
});

// ✉️ SEND EMAIL
router.post("/emails", async (req, res) => {
  const { to, subject, body } = req.body;
  const result = await sendMail({ to, subject, html: body });
  res.json(result);
});

// ⭐ STAR / UNSTAR
router.patch("/emails/:id/star", async (req, res) => {
  await toggleStar(req.params.id);
  res.json({ success: true });
});

// 👁 MARK AS READ
router.patch("/emails/:id/read", async (req, res) => {
  await markAsRead(req.params.id);
  res.json({ success: true });
});

// 🗑 MOVE TO TRASH
router.delete("/emails/:id", async (req, res) => {
  await moveToTrash(req.params.id);
  res.json({ success: true });
});

// ❌ PERMANENT DELETE
router.delete("/emails/:id/forever", async (req, res) => {
  await deleteForever(req.params.id);
  res.json({ success: true });
});
router.post("/emails/reply", replyEmail);

export default router;
