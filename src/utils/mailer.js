import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { google } from "googleapis";
import { buildReplyBody } from "./mailBody.js";
dotenv.config(); // loads env vars from .env

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
);
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client,
});

export const getInbox = async (label = "INBOX", pageToken = null) => {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: [label], // 🔥 THIS IS THE FIX
      maxResults: 50,
      pageToken,
    });

    console.log("res", res.data.messages);
    return {
      messages: res.data.messages || [],
      nextPageToken: res.data.nextPageToken,
    };
  } catch (err) {
    console.error("Inbox fetch error:", err);
    return { messages: [], nextPageToken: null };
  }
};
const decodeBase64 = (data) => {
  if (!data) return "";

  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf-8");
};

const getBody = (payload) => {
  let html = null;
  let text = null;

  const walk = (parts) => {
    for (let part of parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        html = decodeBase64(part.body.data);
      }

      if (part.mimeType === "text/plain" && part.body?.data) {
        text = decodeBase64(part.body.data);
      }

      if (part.parts) {
        walk(part.parts);
      }
    }
  };

  if (payload.parts) {
    walk(payload.parts);
  } else if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // ✅ PRIORITY: HTML first
  if (html) return html;

  // fallback
  if (text) return `<pre>${text}</pre>`;

  return "";
};
const formatEmailDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
};
const cleanHtml = (html) => {
  return html.replace(/https?:\/\/[^\s"]+/g, (url) => {
    try {
      const u = new URL(url);
      return u.origin; // keep only base domain
    } catch {
      return url;
    }
  });
};

export const getEmailDetails = async (id) => {
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
  });

  const headers = res.data.payload.headers;
  console.log("response", res.data.payload);
  const getHeader = (name) => headers.find((h) => h.name === name)?.value;
  const labels = res.data.labelIds || [];

  let category = "primary";

  if (labels.includes("CATEGORY_SOCIAL")) {
    category = "social";
  } else if (labels.includes("CATEGORY_PROMOTIONS")) {
    category = "promo";
  }

  const rawBody = getBody(res.data.payload);
  const body = cleanHtml(rawBody);
  const rawFrom = getHeader("From");

  const nameMatch = rawFrom?.match(/^(.*)<.*>$/);

  const cleanFrom = nameMatch ? nameMatch[1].trim() : rawFrom?.split("@")[0];
  const rawDate = getHeader("Date");
  const bodyreg = body.replace(
    /GitHub/g,
    `<img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="16" /> GitHub`,
  );
  return {
    id,
    subject: getHeader("Subject"),
    from: cleanFrom,
    fullfrom: rawFrom,
    date: formatEmailDate(rawDate), // ✅ formatted
    snippet: res.data.snippet,
    body: bodyreg,
    // 👇 NEW FIELDS
    read: !labels.includes("UNREAD"),
    starred: labels.includes("STARRED"),
    labels,
    category,
  };
};

export const replyEmail = async (req, res) => {
  try {
    const { to, subject, message, originalEmail } = req.body;

    const html = buildReplyBody(originalEmail, message);

    const result = await sendMail({
      to,
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      html,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reply failed" });
  }
};
// Create reusable transporter
const transporterWAITS = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const createTransporter = async () => {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
};
export const toggleStar = async (id) => {
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      addLabelIds: ["STARRED"],
      removeLabelIds: [],
    },
  });
};
export const markAsRead = async (id) => {
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });
};
export const moveToTrash = async (id) => {
  await gmail.users.messages.trash({
    userId: "me",
    id,
  });
};
export const deleteForever = async (id) => {
  await gmail.users.messages.delete({
    userId: "me",
    id,
  });
};
// Generic function to send styled emails
export const sendMail = async ({ to, subject, html }) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"UpGrade" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendTelegramMessage = async ({ chatId, text }) => {
  try {
    const res = await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML", // supports formatting
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    const errData = error.response?.data;

    console.error("❌ Telegram Error:", errData || error.message);
    if (errData?.description?.includes("chat not found")) {
      return {
        success: false,
        error:
          "Telegram not connected. Please start the bot first: https://t.me/MauryaTechBot",
      };
    }

    return {
      success: false,
      error: errData?.description || error.message,
    };
  }
};
export const sendTelegramOtp = async (chatId, otp) => {
  const appName = "UpGrade"; // you can move to env later
  const appLink = process.env.DeployLink || "https://yourwebsite.com";

  const message = `
🔐 <b>${appName} • Secure Verification</b>

━━━━━━━━━━━━━━━

Your One-Time Password (OTP):

👉 <b style="font-size:18px;">${otp}</b>

⏳ Valid for <b>5 minutes</b>

━━━━━━━━━━━━━━━

⚠️ <b>Security Notice</b>
Do not share this code with anyone.
Our team will never ask for your OTP.

━━━━━━━━━━━━━━━

🌐 <a href="${appLink}">Open ${appName}</a>
`;

  return await sendTelegramMessage({
    chatId,
    text: message,
  });
};
export const parseIdentifier = (value) => {
  const input = value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ Email
  if (emailRegex.test(input)) {
    return {
      type: "email",
      value: input,
    };
  }

  // ✅ Numeric → Telegram chat ID
  if (/^\d+$/.test(input)) {
    return {
      type: "telegram",
      value: input,
    };
  }

  // ✅ Username (with or without @)
  const username = input.startsWith("@") ? input.slice(1) : input;

  if (/^[a-zA-Z0-9_]{5,}$/.test(username)) {
    return {
      type: "telegram_username",
      value: username,
    };
  }

  return {
    type: "invalid",
    value: input,
  };
};
export const sendTelegramLoginAlert = async ({
  chatId,
  ip,
  device,
  browser,
  os,
}) => {
  const message = `
🚨 <b>New Login Detected</b>

Device: ${browser} on ${os}
Type: ${device}
IP: ${ip}
Time: ${new Date().toLocaleString()}

If this wasn't you, change password immediately.
  `;

  return await sendTelegramMessage({
    chatId,
    text: message,
  });
};
