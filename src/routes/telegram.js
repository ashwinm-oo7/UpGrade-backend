import express from "express";
import TelegramUser from "../models/telegramUser.js";

const router = express.Router();

router.post("/telegram-webhook", async (req, res) => {
  console.log("🔥 TELEGRAM WEBHOOK HIT");
  console.log("📨 Webhook body:", JSON.stringify(req.body, null, 2));

  // ✅ Send response immediately
  res.sendStatus(200);

  // ✅ Process async AFTER response
  handleTelegram(req.body);
});

const handleTelegram = async (body) => {
  try {
    const message = body.message;

    if (!message) {
      console.log("❌ No message field in webhook");
      return;
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const username = message.from.username || `tg_${userId}`;
    const textPayload = message.text;

    console.log("📩 Message received from:", username, "ChatId:", chatId);
    console.log("📝 Message text:", textPayload);

    // Extract token from /start TOKEN format
    const payload = textPayload?.split(" ")[1];
    console.log("🔑 Extracted payload:", payload);

    // Save user mapping to DB
    try {
      await TelegramUser.findOneAndUpdate(
        { username },
        { chatId, userId, username },
        { upsert: true },
      );
      console.log("💾 Saved TelegramUser:", username, chatId);
    } catch (dbErr) {
      console.error("❌ DB error saving user:", dbErr);
    }

    // 🔥 LOGIN FLOW - Mark token as verified
    if (payload) {
      console.log("🔍 Checking token:", payload);
      console.log(
        "📦 Token not found:",
        Object.keys(global.telegramLoginTokens || {}),
      );

      if (global.telegramLoginTokens?.[payload]) {
        console.log("✅ TOKEN FOUND! Marking as verified...");

        global.telegramLoginTokens[payload].verified = true;
        global.telegramLoginTokens[payload].chatId = chatId;
        global.telegramLoginTokens[payload].username = username;

        console.log("🎉 TOKEN VERIFIED!");
        console.log("✨ Token data:", global.telegramLoginTokens[payload]);
        if (global.io) {
          global.io.to(payload).emit("telegram_verified", {
            success: true,
            username,
            chatId,
          });

          console.log("📡 Socket event emitted for token:", payload);
        }
      } else {
        console.log("❌ Token not found in storage:", payload);
      }
    } else {
      console.log(
        "ℹ️ No payload in message (user didn't use /start with token)",
      );
    }
  } catch (err) {
    console.error("❌ Telegram async error:", err);
  }
};

export default router;
