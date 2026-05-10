import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  action: {
    type: String,
    required: true,
  },

  metadata: {
    type: Object,
  },

  ip: String,
  device: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Activity", activitySchema);
