import express from "express";
import Exam from "../models/Exam.js";
import Mcq from "../models/mcq.js";
import User from "../models/user.js";
import {
  authMiddleware,
  adminOnly,
} from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();

// GET domains where exams exist
router.get("/domains", authMiddleware, adminOnly, async (req, res) => {
  try {
    const domains = await Exam.distinct("domain");
    // console.log("Domains", domains);
    res.json(domains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET levels inside domain
router.get("/levels/:domain", authMiddleware, adminOnly, async (req, res) => {
  try {
    const levels = await Exam.find({ domain: req.params.domain }).distinct(
      "level",
    );

    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET exam attempts
const buildFilter = (field, filter, isNumber = false) => {
  if (!filter) return {};

  const conditions = [];

  const fieldRef = typeof field === "string" ? `$${field}` : field;

  // 🔍 SEARCH
  if (filter.search) {
    conditions.push({
      $expr: {
        $regexMatch: {
          input: fieldRef,
          regex: filter.search,
          options: "i",
        },
      },
    });
  }

  // ✅ SELECT
  if (filter.selected && filter.selected.length > 0) {
    if (isNumber) {
      conditions.push({
        $expr: {
          $in: [fieldRef, filter.selected.map((v) => Number(v))],
        },
      });
    } else {
      conditions.push({
        $expr: {
          $in: [fieldRef, filter.selected],
        },
      });
    }
  }

  return conditions.length ? { $or: conditions } : {};
};
const parseJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return null;
  }
};
router.get("/attempts", authMiddleware, adminOnly, async (req, res) => {
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
    // 🔥 DATE CHECKBOX
    if (fDate?.selected && fDate.selected.length > 0) {
      andFilters.push({
        $expr: {
          $in: [
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            fDate.selected,
          ],
        },
      });
    }

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
router.get("/attempts/meta", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { domain, level } = req.query;

    const match = {
      ...(domain && { domain }),
      ...(level && { level: Number(level) }),
    };

    const [userName, email, score, createdAt] = await Promise.all([
      Exam.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $group: { _id: null, values: { $addToSet: "$user.name" } } },
      ]),

      Exam.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $group: { _id: null, values: { $addToSet: "$user.email" } } },
      ]),

      Exam.aggregate([
        { $match: match },
        { $group: { _id: null, values: { $addToSet: "$score" } } },
      ]),

      Exam.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            values: {
              $addToSet: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
          },
        },
      ]),
    ]);

    res.json({
      userName: userName[0]?.values || [],
      email: email[0]?.values || [],
      score: score[0]?.values || [],
      createdAt: createdAt[0]?.values || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET exam detail
router.get("/attempt/:examId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId).populate(
      "user",
      "name email",
    );
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Mcq.find({
      domain: exam.domain,
      level: exam.level,
    });
    // console.log("Get results", exam, questions);
    res.json({
      exam,
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get(
  "/analytics/summary",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const totalAttempts = await Exam.countDocuments({ submitted: true });

      const avgScoreAgg = await Exam.aggregate([
        { $match: { submitted: true } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]);

      const avgScore = avgScoreAgg[0]?.avgScore || 0;

      const domainStats = await Exam.aggregate([
        { $match: { submitted: true } },
        {
          $group: {
            _id: "$domain",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({
        totalAttempts,
        avgScore: Math.round(avgScore),
        domainStats,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load analytics" });
    }
  },
);
export default router;
