// src/searchEngine/index.js
import express from "express";
import fuse from "./indexBuilder.js";
import loadAll from "./loader.js";

const router = express.Router();

// Load data first time
await loadAll();

router.get("/search", (req, res) => {
  const q = req.query.q?.trim() || "";
  if (!q) return res.status(400).json({ error: "Missing q" });

  const results = fuse.search(q).slice(0, 20);

  res.json({
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
  const match = fuse._docs.find((d) => d.id === id);
  if (!match) return res.status(404).json({ error: "Not found" });
  res.json(match);
});

router.post("/reload", async (req, res) => {
  await loadAll();
  res.json({ status: "reloaded" });
});

export default router;
