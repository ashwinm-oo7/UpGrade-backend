// models/conversation.js
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"] },
    content: String,
  },
  { _id: false }
);

const convoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Conversation", convoSchema);
