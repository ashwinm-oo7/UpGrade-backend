import mongoose from "mongoose";

const telegramUserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  chatId: String,
  firstName: String,
  updatedAt: Date,
});

export default mongoose.model("TelegramUser", telegramUserSchema);
