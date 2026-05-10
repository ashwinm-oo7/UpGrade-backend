import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Chat from "../models/Chat.js"; // Importing Chat model

// dotenv setup
import dotenv from "dotenv";
import user from "../models/user.js";
import ReservedChat from "../models/reservedChat.js";
dotenv.config();

// Required for `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini init
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper function to read markdown file
const readMarkdownFilewait = () => {
  const filePath = path.join(__dirname, "./GPA_DEMO_Sections.md");
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return "Sorry, I couldn't load the system setup details.";
  }
};

const readMarkdownFile = () => {
  const files = ["./GPA_DEMO_Sections.md", "./FCI.md"]; // Add more files as needed
  let combinedContent = "";

  files.forEach((file) => {
    const filePath = path.join(__dirname, file);
    try {
      const data = fs.readFileSync(filePath, "utf8");
      combinedContent += `\n\n---\n\nFile: ${path.basename(file)}\n\n${data}`;
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
      combinedContent += `\n\nFile: ${file} could not be read.\n`;
    }
  });

  return combinedContent || "No setup files could be loaded.";
};

async function retryWithBackoff(fn, retries = 2, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const backoff = delay * Math.pow(2, i) + Math.random() * 1000;
      console.warn(`Retrying due to 503... (${i + 1})`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

export async function newChat(req, res) {
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
}
// Main chat handler
function fallbackSmartAnswer(userQuery) {
  const rawData = readMarkdownFile(); // already in your code

  const sections = rawData.split(/---/g); // split multiple files

  let bestMatch = null;
  let bestScore = 0;

  // Simple keyword match scoring
  const keywords = userQuery.toLowerCase().split(" ");

  for (const section of sections) {
    let score = 0;
    const lowerSection = section.toLowerCase();

    keywords.forEach((word) => {
      if (word.length > 3 && lowerSection.includes(word)) score++;
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = section.trim();
    }
  }

  // If no good match → generic fallback
  if (!bestMatch || bestScore < 2) {
    return `⚠️ AI service is temporarily unavailable.

But based on your saved ERP files, here’s a short helpful response:

📝 **Summary:**
${rawData.slice(0, 400)}...`;
  }

  return `⚠️ AI Mode OFF (Fallback)

Here’s what I found related to your question:

${bestMatch}`;
}

export async function streamChat(req, res) {
  const userId = req.user?.userId || req.body.userID || null;
  const chatId = req.params.chatId || null;
  const conversation = req.body.conversation || [];
  const lastUserMessage = conversation[conversation.length - 1]?.content || "";

  try {
    // Try Gemini API first
    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: [{ role: "user", parts: [{ text: lastUserMessage }] }],
      })
    );

    const generatedText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!generatedText) throw new Error("Invalid AI response");

    // Save chat + send response as before
    res.json({ content: generatedText });
  } catch (err) {
    console.log("🚨 AI FAILED → Fallback Activated");

    const offlineResponse = fallbackSmartAnswer(lastUserMessage);

    // Save the fallback chat also
    if (userId) {
      await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        {
          $push: {
            messages: [
              { role: "user", content: lastUserMessage },
              { role: "bot", content: offlineResponse },
            ],
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({ content: offlineResponse, mode: "fallback" });
  }
}

// 📜 Fetch Chat History for Logged In User
export async function getChatHistory(req, res) {
  try {
    if (!req.params.chatId) {
      return res.status(400).json({ message: "Chat ID missing" });
    }
    next();

    const { chatId } = req.params;
    const userId = req.user?.userId || req.body.userID || null;
    // const userids = await user.findById({ _id: userId });

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login to view history." });
    }

    // const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(404).json({ message: "No chat history found." });
    }

    res.json({ conversation: chat });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// 📜 Reset Chat History (Logged In)
export async function resetChatHistory(req, res) {
  try {
    const userId = req.user?.userId;
    const chatId = req.params.chatId || null; // Optional chatId

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login to clear history." });
    }
    if (chatId) {
      // Delete a specific chat
      const deletedChat = await Chat.findOneAndDelete({ _id: chatId, userId });

      if (!deletedChat) {
        return res
          .status(404)
          .json({ message: "No chat history found to clear." });
      }

      return res.json({ message: "Chat history cleared successfully!" });
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function resetChatFull(req, res) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login to clear history." });
    }

    if (userId) {
      // Delete a specific chat

      // Delete all chats for the user
      const result = await Chat.deleteMany({ userId });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "No chat history found to delete." });
      }

      return res.json({ message: "All chat history deleted successfully." });
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getChatById(req, res) {
  try {
    const userId = req.user?.userId || req.body.userID || null;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    const chats = await Chat.find({ userId }).select("topic _id"); // Fetch all chats for the user
    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chat history found." });
    }

    res.json({ conversations: chats });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
