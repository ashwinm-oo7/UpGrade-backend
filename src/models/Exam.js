// models/Exam.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String, required: true },
    level: { type: Number, required: true },
    // 🔥 store randomized questions
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MCQ",
      },
    ],

    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "MCQ" },
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    percentage: Number,
    certificateId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined, // 🔥 IMPORTANT
    },
    certificateEligible: {
      type: Boolean,
      default: false,
    },
    isReset: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: Date,

    submitted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
