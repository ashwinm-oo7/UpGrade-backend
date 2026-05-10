import cron from "node-cron";
import Exam from "../models/Exam.js";
import Mcq from "../models/mcq.js";

const startAutoSubmitJob = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("⏱ Checking expired exams...");

    try {
      const expiredExams = await Exam.find({
        submitted: false,
        endTime: { $lt: new Date() },
      });

      for (const exam of expiredExams) {
        console.log("Auto-submitting:", exam._id);

        const questions = await Mcq.find({
          _id: { $in: exam.questions },
        });

        let score = 0;

        const finalAnswers = Object.fromEntries(
          exam.answers.map((a) => [a.questionId.toString(), a.selectedAnswer]),
        );

        const answerRecords = questions.map((q) => {
          const selected = finalAnswers[q._id.toString()] || null;
          const isCorrect = selected === q.correctAnswer;

          if (isCorrect) score++;

          return {
            questionId: q._id,
            selectedAnswer: selected,
            isCorrect,
          };
        });

        const percentage = Math.round((score / questions.length) * 100);

        await Exam.findByIdAndUpdate(exam._id, {
          answers: answerRecords,
          score,
          percentage,
          submitted: true,
          endTime: new Date(),
        });
      }
    } catch (err) {
      console.error("❌ Cron error:", err);
    }
  });
};

export default startAutoSubmitJob;
