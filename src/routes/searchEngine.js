// src/routes/searchEngine.js
import express from "express";
import { loadAll } from "../searchEngine/loader.js";
import { getFuse, getDocs } from "../searchEngine/fuseStore.js";
import getExplanation from "./explain.js";

const router = express.Router();

// load once on first import
await loadAll();

router.get("/search", (req, res) => {
  const q = req.query.q?.trim().toLowerCase() || "";
  if (!q) return res.status(400).json({ error: "Missing q" });

  // --------------------------------------------
  // 1. Detect if user is asking a QUESTION
  // --------------------------------------------
  const questionWords = ["what", "how", "why", "format", "explain", "define"];
  const isQuestion = questionWords.some((w) => q.startsWith(w));

  if (isQuestion) {
    // RETURN EXPLANATION INSTEAD OF SEARCH RESULTS
    return res.json({
      mode: "question",
      query: q,
      explanation: getExplanation(q),
    });
  }

  // --------------------------------------------
  // 2. Normal search mode
  // --------------------------------------------
  const fuse = getFuse();
  const results = fuse.search(q).slice(0, 20);

  return res.json({
    mode: "search",
    query: q,
    count: results.length,
    results: results.map((r) => ({
      id: r.item.id,
      type: r.item.type,
      title: r.item.title,
      snippet: r.item.content.substring(0, 200),
      score: r.score,
    })),
  });
});

router.get("/doc/:id", (req, res) => {
  const id = req.params.id;
  const docs = getDocs();

  const found = docs.find((d) => d.id === id);
  if (!found) return res.status(404).json({ error: "Not found" });

  res.json(found);
});

router.post("/reload", async (req, res) => {
  await loadAll();
  return res.json({ status: "reloaded" });
});

export default router;
