import express from "express";
import {
  getChatById,
  getChatHistory,
  resetChatHistory,
  streamChat,
} from "../controllers/chatController.js";

const router = express.Router();
import { authMiddleware } from "../middlewares/optionalAuthMiddleware.js";
import Chat from "../models/Chat.js";

router.post("/savedchat/:chatId", authMiddleware, streamChat);
router.post("/savedchat", authMiddleware, streamChat);
router.get("/chat/history/:chatId", authMiddleware, getChatHistory);
// 📜 Reset (Clear) Chat History for Logged In User
router.delete("/chat/reset/:chatId", authMiddleware, resetChatHistory);
router.get("/chat/getChatID", authMiddleware, getChatById);

router.post("/new-chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userID || null;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login to start a new chat." });
    }

    const { topic } = req.body; // Optional: You can pass a topic with the new chat

    const newChat = new Chat({
      userId,
      topic: topic || "General", // Default topic if none is provided
      messages: [],
    });

    await newChat.save();

    res.json({
      message: "New chat started successfully!",
      chatId: newChat._id, // Send the unique chat ID to the frontend
      chat: newChat,
    });
  } catch (error) {
    console.error("Error starting new chat:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
