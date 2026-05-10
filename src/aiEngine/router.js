// src/aiEngine/router.js
import express from "express";
import {
  generatePageheaderSQL,
  pageheaderExplain,
} from "./sqlGen/pageheaderSQL.js";
import {
  companyheaderExplain,
  generateCompanyheaderSQL,
} from "./sqlGen/companyheaderSQL.js";
import { detailsExplain } from "./sqlGen/detailheaderSQL.js";
import { reportfooterExplain } from "./sqlGen/reportfooterSQL.js";
import { pagefooterExplain } from "./sqlGen/pagefooterSQL.js";
const sectionsData = {
  companyheader: {
    description:
      "Displays company-level info such as name, address, headings, logos at the top of the report.",
    attributes: [
      { name: "ttop", description: "Top margin of container" },
      { name: "tleft", description: "Left margin of container" },
      { name: "width", description: "Container width" },
      { name: "height", description: "Container height" },
      { name: "line_left", description: "Left border line" },
      { name: "line_right", description: "Right border line" },
      { name: "line_bottom", description: "Bottom border line" },
      { name: "line_up", description: "Top border line" },
      { name: "line_height", description: "Thickness of lines" },
    ],
    keywords: [
      { name: "!heading", description: "Prints formatted heading" },
      { name: "line", description: "Draws horizontal line" },
      { name: "vline", description: "Draws vertical line" },
    ],
    examples: [
      "CREATE VIEW sabrep_companyheader_chlf AS SELECT 'compname' AS colname, 'Transport Pass' AS bname, a.pid AS comp FROM sabcompany a",
    ],
  },
  pageheader: {
    description:
      "Top-level fields like invoice number, party details, date. Appears below companyheader.",
    attributes: [
      { name: "ttop", description: "Top margin of container" },
      { name: "tleft", description: "Left margin of container" },
      { name: "width", description: "Container width" },
      { name: "height", description: "Container height" },
      { name: "line_left", description: "Left border line" },
      { name: "line_right", description: "Right border line" },
      { name: "line_bottom", description: "Bottom border line" },
      { name: "line_up", description: "Top border line" },
      { name: "line_height", description: "Thickness of lines" },
    ],
    keywords: [
      { name: "!heading", description: "Prints formatted heading" },
      { name: "line", description: "Draws horizontal line" },
      { name: "vline", description: "Draws vertical line" },
    ],
    examples: [
      "CREATE VIEW sabrep_pageheader_chlf AS SELECT 'Entno' AS colname, a.sabid, a.entno AS bname FROM tablename a",
    ],
  },
  // Add details, reportfooter, lines etc similarly
};

// Simple intent & section detectors (inline for reliability)
function detectIntent(text) {
  text = (text || "").toLowerCase();
  // First priority → if user asks about drawing lines
  if (
    text.includes("line") ||
    text.includes("draw line") ||
    text.includes("horizontal") ||
    text.includes("vline")
  ) {
    return "LINE_HELP";
  }

  if (
    text.includes("generate") ||
    text.includes("create view") ||
    text.includes("make view") ||
    text.includes("generate view")
  )
    return "SQL_GEN";
  if (
    text.startsWith("what") ||
    text.startsWith("how") ||
    text.includes("explain") ||
    text.includes("format") ||
    text.includes("mandatory") ||
    text.includes("structure")
  )
    return "EXPLAIN";
  if (text.includes("example")) return "EXAMPLE";
  return "SEARCH";
}

function detectSection(text) {
  text = (text || "").toLowerCase();
  if (text.includes("pageheader")) return "pageheader";
  if (text.includes("companyheader")) return "companyheader";
  if (text.includes("details")) return "details";
  if (text.includes("reportfooter") || text.includes("reportfooter"))
    return "reportfooter";
  if (text.includes("pagefooter") || text.includes("pagefooter"))
    return "pagefooter";

  if (text.includes("line")) return "lines";
  if (text.includes("sabrep_topleft") || text.includes("sabrep"))
    return "sabrep_topleft";
  return null;
}

// Lightweight templates and SQL generators (expandable)

function pageheaderExample() {
  return `Example view name: sabrep_pageheader_gtnx
Make sure sabrep_topleft.colname values match the colname entries in this view.`;
}

// SQL generators

const router = express.Router();

// POST /ai/ask
router.post("/ask", express.json(), (req, res) => {
  const textRaw = (req.body && req.body.text) || "";
  const text = textRaw.trim();

  if (!text) return res.status(400).json({ error: "empty text" });

  const intent = detectIntent(text);
  const section = detectSection(text);

  // EXPLAIN INTENT
  if (intent === "EXPLAIN") {
    if (section === "pageheader")
      return res.json({ mode: "EXPLAIN", answer: pageheaderExplain() });
    if (section === "companyheader")
      return res.json({ mode: "EXPLAIN", answer: companyheaderExplain() });
    if (section === "details")
      return res.json({ mode: "EXPLAIN", answer: detailsExplain() });
    if (section === "reportfooter")
      return res.json({ mode: "EXPLAIN", answer: reportfooterExplain() });
    if (section === "pagefooter")
      return res.json({ mode: "EXPLAIN", answer: pagefooterExplain() });

    // generic fallback explain
    return res.json({
      mode: "EXPLAIN",
      answer: `I can explain pageheader, companyheader, details, reportfooter,pagefooter . Try: "what is pageheader view format?"`,
    });
  }

  // EXAMPLE INTENT
  if (intent === "EXAMPLE") {
    if (section === "pageheader")
      return res.json({ mode: "EXAMPLE", answer: pageheaderExample() });
    return res.json({
      mode: "EXAMPLE",
      answer: "Ask for an example of pageheader, companyheader, or details.",
    });
  }

  // SQL generation
  if (intent === "SQL_GEN") {
    // robust table/recode extraction patterns
    let repcode =
      text.match(/repcode\s*[:=]?\s*([a-z0-9_]+)/i)?.[1] ||
      text.match(/repcode\s+([a-z0-9_]+)/i)?.[1] ||
      text.match(/for\s+([a-z0-9_]+)\s+repcode/i)?.[1];
    let table =
      text.match(/table\s*name\s*[:=]?\s*([a-z0-9_]+)/i)?.[1] ||
      text.match(/tablename\s*[:=]?\s*([a-z0-9_]+)/i)?.[1] ||
      text.match(/table\s*[:=]?\s*([a-z0-9_]+)/i)?.[1] ||
      text.match(/from\s+([a-z0-9_]+)\s/i)?.[1];

    // try a fallback capture of any token after 'repcode'/'table'
    if (!repcode)
      repcode = text.match(/\brepcode\b.*?([a-z0-9_]+)/i)?.[1] || null;
    if (!table) table = text.match(/\btable\b.*?([a-z0-9_]+)/i)?.[1] || null;

    if (!repcode || !table) {
      return res.json({
        mode: "SQL_GEN",
        success: false,
        message:
          "Missing repcode or table name. Example: 'generate pageheader for repcode inwe table asab9'",
      });
    }

    if (section === "pageheader") {
      const sql = generatePageheaderSQL(repcode, table);
      return res.json({ mode: "SQL_GEN", success: true, sql });
    }
    if (section === "companyheader") {
      const sql = generateCompanyheaderSQL(repcode, table);
      return res.json({ mode: "SQL_GEN", success: true, sql });
    }

    // fallback SQL for unknown section - simple pattern:
    return res.json({
      mode: "SQL_GEN",
      success: false,
      message:
        "Section not recognized for SQL generation. Mention pageheader or companyheader or details.",
    });
  }

  // Default: fallback to search instruction (frontend has search)
  return res.json({
    mode: "SEARCH",
    message:
      "No direct intent detected: try 'what is pageheader view' or 'generate pageheader repcode inwe table asab9'.",
  });
});

export default router;
