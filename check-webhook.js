#!/usr/bin/env node

/**
 * Check Telegram Webhook Status
 */

import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.log("❌ TELEGRAM_BOT_TOKEN not found in .env");
  console.log("Add this to .env: TELEGRAM_BOT_TOKEN=your_token_here");
  process.exit(1);
}

async function checkWebhook() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    console.log(`📡 Checking webhook info...\n`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      const webhook = data.result;
      console.log("✅ Webhook Status:");
      console.log(`   URL: ${webhook.url || "❌ Not set"}`);
      console.log(`   IP: ${webhook.ip_address || "N/A"}`);
      console.log(`   Pending updates: ${webhook.pending_update_count || 0}`);
      console.log(`   Last error: ${webhook.last_error_message || "None"}`);
      console.log(
        `   Last error time: ${
          webhook.last_error_date
            ? new Date(webhook.last_error_date * 1000)
            : "N/A"
        }`,
      );

      if (!webhook.url) {
        console.log("\n⚠️  Webhook not set! You need to configure it.");
        console.log("Run this to set webhook:");
        console.log(
          "   curl -X POST https://api.telegram.org/bot" +
            BOT_TOKEN +
            '/setWebhook -d "url=YOUR_NGROK_URL/auth/telegram-webhook"',
        );
      }
    } else {
      console.log("❌ Error:", data.description);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

checkWebhook();
