import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Optional for without-login
  topic: { type: String, required: false }, // Topic of conversation
  messages: [
    {
      role: { type: String, enum: ["user", "bot"], required: true },
      content: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
