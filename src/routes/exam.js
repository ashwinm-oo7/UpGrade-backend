// routes/exam.js
import express from "express";
const router = express.Router();
import Exam from "../models/Exam.js";
import Mcq from "../models/mcq.js";
import {
  adminOnly,
  authMiddleware,
} from "../middlewares/optionalAuthMiddleware.js";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import QRCode from "qrcode";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
const certLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
});
import fs from "fs";
import { downloadCertificateService } from "../services/certificateService.js";
import { getIO } from "../utils/socket.js";
import { logActivity } from "../utils/activityLogger.js";
const certificateTemplate = path.resolve("src/assets/certificate-template.png");
const signatureImage = path.resolve("src/assets/signature.png");
const sealImage = path.resolve("src/assets/seal.png");

// START EXAM
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { domain, level } = req.body;
    const userId = req.user._id;
    const attempts = await Exam.countDocuments({
      user: userId,
      domain,
      level,
      submitted: true,
      isReset: false, // 🔥 IGNORE RESET ATTEMPTS
    });

    if (attempts >= 5) {
      return res.status(403).json({
        message: "Maximum attempts reached for this level",
      });
    }
    // Check if exam already exists and not submitted
    const existing = await Exam.findOne({
      user: userId,
      domain,
      level,
      submitted: false,
    });
    if (existing) return res.json({ examId: existing._id });
    // console.log("userids", userId);
    // Create new exam attempt
    const questions = await Mcq.aggregate([
      { $match: { domain, level } },
      { $sample: { size: 25 } },
    ]);
    console.log(questions[0]);
    if (questions.length === 0) {
      return res.status(400).json({
        message: "No questions available for this exam",
      });
    }
    const totalQuestionsTime = questions.reduce(
      (sum, q) => sum + (q.timeLimit || 0),
      0,
    );

    const duration = totalQuestionsTime * 60 * 1000;
    console.log("Total Time:", totalQuestionsTime);
    console.log("Duration current Time :", new Date(Date.now()));

    console.log("Duration BEFORE SAVE:", duration);
    console.log("EndTime BEFORE SAVE:", new Date(Date.now() + duration));
    const exam = new Exam({
      user: userId,
      domain,
      level,
      questions: questions.map((q) => q._id),
      startTime: new Date(),
      endTime: new Date(Date.now() + duration), // 🔥 IMPORTANT
    });
    await exam.save();
    const io = getIO();

    io.to("admins").emit("newExamAttempt", {
      type: "START",
      message: `${req.user?.name || "User"} started ${domain} Level ${level}`,
      examId: exam._id,
      createdAt: new Date(),
    });
    await logActivity({
      userId: userId,
      action: "EXAM_START",
      metadata: { domain, level },
      req,
    });
    res.json({
      examId: exam._id,
      endTime: exam.endTime, // ✅ REQUIRED
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start exam" });
  }
});
// SUBMIT EXAM
router.post("/submit/:examId", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    // 🔒 Validate examId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (new Date() > exam.endTime) {
      return res.status(400).json({
        message: "Exam time expired",
      });
    }
    // 🚫 Prevent double submission
    if (exam.submitted) {
      return res.json({
        message: "Exam already submitted",
        score: exam.score,
        percentage: exam.percentage,
      });
    }

    // 📥 Fetch questions
    const questions = await Mcq.find({
      _id: { $in: exam.questions },
    });

    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        message: "No questions found for this exam",
      });
    }
    // 🔥 CRITICAL: fallback to DB answers if frontend missing
    const finalAnswers =
      answers && Object.keys(answers).length > 0
        ? answers
        : Object.fromEntries(
            exam.answers.map((a) => [
              a.questionId.toString(),
              a.selectedAnswer,
            ]),
          );

    // 🧠 Calculate score
    let score = 0;

    const answerRecords = questions.map((q) => {
      const selected = answers?.[q._id] || null;
      const isCorrect = selected === q.correctAnswer;

      if (isCorrect) score++;

      return {
        questionId: q._id,
        selectedAnswer: selected,
        isCorrect,
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    const certificateEligible = percentage >= 80;

    // 🧾 Prepare update object
    const updateData = {
      answers: answerRecords,
      score,
      percentage,
      certificateEligible,
      submitted: true,
      endTime: new Date(),
      certificateIssuedAt: certificateEligible ? new Date() : null,
    };

    // ✅ Only add certificateId if eligible (NO NULL BUG)
    if (certificateEligible) {
      updateData.certificateId = `${exam.domain}-L${exam.level}-${crypto
        .randomBytes(3)
        .toString("hex")}`;
    }

    // 🔄 Atomic update (prevents race condition)
    const updatedExam = await Exam.findOneAndUpdate(
      { _id: examId, submitted: false },
      updateData,
      { new: true },
    );

    if (!updatedExam) {
      return res.json({ message: "Exam already submitted" });
    }

    // 📡 SOCKET EVENT
    const io = getIO();

    io.to("admins").emit("newExamAttempt", {
      message: `${req.user?.name || req.user?.email || "A user"} submitted ${
        exam.domain
      } Level ${exam.level}`,
      examId: exam._id,
      percentage,
      createdAt: new Date(),
    });
    await logActivity({
      userId: req.user._id,
      action: "EXAM_SUBMIT",
      metadata: {
        domain: exam.domain,
        level: exam.level,
        score: exam.score,
      },
      req,
    });
    // ✅ RESPONSE
    return res.json({
      message: "Exam submitted successfully",
      score,
      percentage,
      certificateEligible,
      answers: answerRecords,
    });
  } catch (err) {
    console.error("❌ Error submitting exam:", err);
    return res.status(500).json({
      message: "Failed to submit exam",
    });
  }
});
// --- AUTOSAVE EXAM ---
router.post("/autosave/:examId", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers = {}, timeLeft } = req.body;
    console.log("autosave/:examId", examId, answers);
    // Find the exam, only if it's not submitted
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid examId" });
    }

    // const examObjectId = new mongoose.Types.ObjectId(examId);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (exam.submitted) {
      return res.status(400).json({
        message: "Exam already submitted",
      });
    }
    // console.log("exams", exam);
    // Update answers partially (don't calculate score yet)
    const answerRecords = Object.entries(answers).map(
      ([questionId, selected]) => ({
        questionId,
        selectedAnswer: selected,
        isCorrect: null, // we'll calculate correctness on final submit
      }),
    );

    // Merge with existing saved answers
    const updatedAnswersMap = {};
    exam.answers.forEach(
      (a) => (updatedAnswersMap[a.questionId.toString()] = a),
    );
    // New answers (🔥 FIXED .toString())
    answerRecords.forEach((a) => {
      updatedAnswersMap[a.questionId.toString()] = a;
    });

    exam.answers = Object.values(updatedAnswersMap);

    // ✅ Update remaining time
    if (timeLeft !== undefined) {
      exam.endTime = new Date(Date.now() + timeLeft * 1000);
    }

    await exam.save();
    const io = getIO();

    // only notify every 5 answers (important)
    if (exam.answers.length % 5 === 0) {
      io.to("admins").emit("newExamAttempt", {
        type: "PROGRESS",
        message: `User is attempting exam (${exam.answers.length} answers)`,
        examId,
        progress: exam.answers.length,
        createdAt: new Date(),
      });
    }
    return res.json({
      message: "Exam autosaved",
      savedAnswers: exam.answers.length,
      savedAt: new Date(),
    });
  } catch (err) {
    console.error("Autosave failed", err);
    res.status(500).json({ message: "Failed to autosave exam" });
  }
});
// GET QUESTIONS FOR EXAM
router.get("/:examId", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // const questions = await Mcq.aggregate([
    //   {
    //     $match: {
    //       domain: exam.domain,
    //       level: exam.level,
    //     },
    //   },
    //   { $sample: { size: 25 } },
    // ]);
    const questions = await Mcq.find({
      _id: { $in: exam.questions },
    });

    res.json({
      examId: exam._id,
      domain: exam.domain,
      level: exam.level,
      questions,
      endTime: exam.endTime, // ✅ REQUIRED
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

router.get(
  "/certificateWAIT/download/:domain/:level",
  certLimiter,
  authMiddleware,
  async (req, res) => {
    try {
      const level = Number(req.params.level);

      if (!req.params.domain || isNaN(level)) {
        return res.status(400).json({
          message: "Invalid certificate request",
        });
      }
      const exam = await Exam.findOne({
        user: req.user._id,
        domain: req.params.domain,
        level: Number(req.params.level),
        certificateEligible: true,
      });

      if (!exam) {
        return res.status(403).json({ message: "Certificate not available" });
      }

      const verifyUrl = `${process.env.FRONTEND_URL}/verify/${exam.certificateId}`;

      const qrImage = await QRCode.toDataURL(verifyUrl);

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=certificate-${exam.domain}-L${exam.level}.pdf`,
      );

      res.setHeader("Content-Type", "application/pdf");
      doc.image(certificateTemplate, 0, 0, { width: 842 });
      doc.image(signatureImage, 620, 420, { width: 120 });
      doc.image(sealImage, 380, 350, { width: 90 });
      if (
        !fs.existsSync(certificateTemplate) ||
        !fs.existsSync(signatureImage) ||
        !fs.existsSync(sealImage)
      ) {
        console.error("Certificate assets missing");

        return res.status(500).json({
          message: "Certificate assets not found",
        });
      }
      doc.pipe(res);

      doc.fontSize(32).text("Certificate of Achievement", { align: "center" });

      doc.moveDown();

      doc.fontSize(20).text(`This certifies that`, { align: "center" });

      doc.moveDown();

      doc.fontSize(26).text(`${req.user.email}`, { align: "center" });

      doc.moveDown();

      doc.text(`Completed ${exam.domain} Level ${exam.level}`, {
        align: "center",
      });

      doc.moveDown();

      doc.text(`Score: ${exam.percentage}%`, { align: "center" });

      doc.text(`Certificate ID: ${exam.certificateId}`, { align: "center" });

      doc.image(qrImage, 650, 350, { width: 100 });

      doc.end();
    } catch (err) {
      console.error("Certificate generation failed:", err);

      return res.status(500).json({
        message: "Failed to generate certificate",
      });
    }
  },
);
router.get("/verify/:certificateId", async (req, res) => {
  const exam = await Exam.findOne({
    certificateId: req.params.certificateId,
  }).populate("user", "email name");

  if (!exam) {
    // console.log("examhashs", exam);

    return res.status(404).json({
      valid: false,
    });
  }
  const hashData =
    exam.certificateId +
    exam.user._id +
    exam.user.name +
    exam.user.email +
    exam.domain +
    exam.level +
    exam.percentage +
    exam.certificateIssuedAt;

  const hash = crypto.createHash("sha256").update(hashData).digest("hex");
  // console.log("hashs", hash);
  res.json({
    valid: true,
    user: exam.user.email,
    userfullname: exam.user.name,
    domain: exam.domain,
    level: exam.level,
    score: exam.percentage,
    issuedAt: exam.certificateIssuedAt,
    blockchainHash: hash,
  });
});

router.get(
  "/exam/my-certificates",
  certLimiter,
  authMiddleware,
  async (req, res) => {
    // console.log("my-certificates", req.userId);
    try {
      // 1️⃣ Validate authenticated user
      if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
        return res.status(400).json({
          message: "Invalid User",
        });
      }

      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const userId = req.user._id;

      // 2️⃣ Fetch certificates
      const certificates = await Exam.find({
        user: userId,
        certificateEligible: true,
      })
        .select("domain level percentage certificateId certificateIssuedAt")
        .sort({ certificateIssuedAt: -1 })
        .lean()
        .populate({
          path: "user",
          select: "nameLocked",
          options: { lean: true },
        });

      // console.log("Certificate Get", certificates[0]?.user?.nameLocked);
      if (!certificates[0]?.user?.nameLocked) {
        console.log("Certificate Get", certificates[0]?.user?.nameLocked);
        return res.status(400).json({
          success: false,
          msg: "Name must be locked before generating certificate",
        });
      }

      // 3️⃣ Handle empty result
      if (!certificates || certificates.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No certificates found",
          data: [],
        });
      }

      // 4️⃣ Success response
      return res.status(200).json({
        success: true,
        count: certificates.length,
        data: certificates,
      });
    } catch (error) {
      console.error("Fetch certificates error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch certificates",
      });
    }
  },
);

router.get("/attempt/:examId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId).populate("user", "name email");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Mcq.find({
      domain: exam.domain,
      level: exam.level,
    }).sort("step");

    res.json({
      exam,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load attempt" });
  }
});

router.get(
  "/certificate/download/:domain/:level/:certificateId",
  certLimiter,
  downloadCertificateService,
);

export default router;
