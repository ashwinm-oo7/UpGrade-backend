import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 1, max: 30 },
    step: { type: Number, required: true, min: 1, max: 100 },
    timeLimit: { type: Number, default: 2 },
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: "Exactly 4 options required",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"],
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate questions in same domain + level + step
mcqSchema.index({ domain: 1, level: 1, step: 1 }, { unique: true });

const Mcq = mongoose.model("Mcq", mcqSchema);
export default Mcq;
