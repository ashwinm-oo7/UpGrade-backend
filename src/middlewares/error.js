import { GoogleGenAI } from "@google/genai"; // Import the correct SDK
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat function that handles the response
export async function streamChat(req, res) {
  const { messages } = req.body; // Expect messages to be in request body

  // Set up headers for streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  try {
    // Send the request to Gemini API to generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001", // Replace with correct model
      contents: messages, // Message content to send
    });

    // Check if the response has text and send it as a stream
    // if (response && response.text) {
    //   res.write(response.text);
    // }

    // res.end();

    const code = response.text; // Assuming the response contains Java code

    // Send the Java code as part of the response
    res.json({ content: code });
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    res.status(500).send("Error communicating with Gemini API");
  }
}
