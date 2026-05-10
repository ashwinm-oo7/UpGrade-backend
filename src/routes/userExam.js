import express from "express";
import Exam from "../models/Exam.js";
import Mcq from "../models/mcq.js";
import User from "../models/user.js";
import {
  authMiddleware,
  adminOnly,
} from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();

// GET exam attempts
router.get("/attemptsWait", authMiddleware, async (req, res) => {
  try {
    const { domain, level } = req.query;

    const exams = await Exam.find({
      domain,
      level,
      user: req.userId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const buildFilter = (field, filter, isNumber = false) => {
  if (!filter) return {};

  const conditions = [];

  // 🔍 SEARCH (regex)
  if (filter.search) {
    conditions.push({
      [field]: {
        $regex: filter.search,
        $options: "i",
      },
    });
  }

  // ✅ MULTI SELECT (checkbox)
  if (filter.selected && filter.selected.length > 0) {
    if (isNumber) {
      conditions.push({
        [field]: {
          $in: filter.selected.map((v) => Number(v)),
        },
      });
    } else {
      conditions.push({
        [field]: {
          $in: filter.selected,
        },
      });
    }
  }

  // 🔥 OR inside column
  if (conditions.length > 0) {
    return { $or: conditions };
  }

  return {};
};
const parseJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return null;
  }
};
router.get("/attempts", authMiddleware, async (req, res) => {
  try {
    const {
      domain,
      level,
      page = 1,
      limit = 10,

      userName,
      email,
      score,
      createdAt, // 🔥 NEW
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 parse filters
    const fUser = parseJSON(userName);
    const fEmail = parseJSON(email);
    const fScore = parseJSON(score);
    const fDate = parseJSON(createdAt);

    const andFilters = [];

    const userNameFilter = buildFilter("user.name", fUser);
    const emailFilter = buildFilter("user.email", fEmail);
    const scoreFilter = buildFilter("score", fScore, true);

    if (userNameFilter) andFilters.push(userNameFilter);
    if (emailFilter) andFilters.push(emailFilter);
    if (scoreFilter) andFilters.push(scoreFilter);

    // 🔥 DATE RANGE FILTER
    if (fDate?.from || fDate?.to) {
      const dateQuery = {};

      if (fDate.from) {
        dateQuery.$gte = new Date(fDate.from);
      }
      if (fDate.to) {
        dateQuery.$lte = new Date(fDate.to);
      }

      andFilters.push({ createdAt: dateQuery });
    }

    const pipeline = [
      {
        $match: {
          ...(domain && { domain }),
          ...(level && { level: Number(level) }),
          user: req.userId,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $match: andFilters.length ? { $and: andFilters } : {},
      },

      // 🔥 SORTING
      {
        $sort: {
          [sortBy]: order === "asc" ? 1 : -1,
        },
      },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: Number(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Exam.aggregate(pipeline);

    res.json({
      data: result[0].data,
      total: result[0].totalCount[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
// GET exam detail
router.get("/attempt/:examId", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      user: req.userId, // 🔐 CRITICAL
    }).populate("user", "name email");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Mcq.find({
      domain: exam.domain,
      level: exam.level,
    });

    res.json({ exam, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET domains where exams exist
router.get("/domains", authMiddleware, async (req, res) => {
  try {
    const domains = await Exam.find({
      user: req.userId, // 🔐 filter by user
      submitted: true, // optional but recommended
    }).distinct("domain");

    res.json(domains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET levels inside domain
router.get("/levels/:domain", authMiddleware, async (req, res) => {
  try {
    const levels = await Exam.find({
      user: req.userId, // 🔐 filter by user
      domain: req.params.domain,
      submitted: true, // optional
    }).distinct("level");

    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
