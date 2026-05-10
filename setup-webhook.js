#!/usr/bin/env node

/**
 * Set Telegram Webhook
 * Usage: node setup-webhook.js https://abc123.ngrok.io
 */

import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ngrokURL = process.argv[2];

if (!BOT_TOKEN) {
  console.log("❌ TELEGRAM_BOT_TOKEN not found in .env");
  process.exit(1);
}

if (!ngrokURL) {
  console.log("❌ Usage: node setup-webhook.js https://abc123.ngrok.io");
  console.log("\nExample:");
  console.log("   node setup-webhook.js https://1234abcd.ngrok.io");
  process.exit(1);
}

const webhookUrl = `${ngrokURL}/auth/telegram-webhook`;

async function setWebhook() {
  try {
    console.log(`🔧 Setting webhook...\n`);
    console.log(`   Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
    console.log(`   Webhook URL: ${webhookUrl}\n`);

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `url=${encodeURIComponent(webhookUrl)}`,
    });

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Webhook set successfully!");
      console.log(`   URL: ${webhookUrl}`);

      // Now check it
      console.log(`\n📡 Verifying webhook...\n`);

      const checkUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();

      if (checkData.ok) {
        const webhook = checkData.result;
        console.log("✅ Current Webhook Info:");
        console.log(`   URL: ${webhook.url}`);
        console.log(`   IP: ${webhook.ip_address || "N/A"}`);
        console.log(`   Pending updates: ${webhook.pending_update_count || 0}`);
        console.log(`   Last error: ${webhook.last_error_message || "None"}\n`);
        console.log("🎉 Ready to test! Run:");
        console.log("   npm start");
        console.log("   node test-telegram-flow.js");
      }
    } else {
      console.log("❌ Error:", data.description);
      console.log("\nResponse:", data);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

setWebhook();
