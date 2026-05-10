// src/searchEngine/indexBuilder.js
import Fuse from "fuse.js";
import { setFuse } from "./fuseStore.js";

export function buildIndex(rawData) {
  const docs = [];

  const push = (d) => docs.push(d);

  // metadata.json
  const metadata = rawData["metadata.json"];
  if (metadata) {
    push({
      id: "metadata",
      type: "metadata",
      title: metadata.title,
      content: metadata.summary,
      raw: metadata,
    });
  }

  // tables.json
  rawData["tables.json"]?.tables?.forEach((t) =>
    push({
      id: `table:${t.tablename}`,
      type: "table",
      title: t.tablename,
      content: t.description,
      raw: t,
    })
  );

  // sections.json
  rawData["sections.json"]?.sections?.forEach((s) =>
    push({
      id: `section:${s.section}`,
      type: "section",
      title: s.section,
      content: s.description,
      raw: s,
    })
  );

  // views.json
  rawData["views.json"]?.views?.forEach((v) => {
    const name = v.view_name || v.view_name_pattern;
    push({
      id: `view:${name}`,
      type: "view",
      title: name,
      content: v.description + "\n" + (v.sql_example || ""),
      raw: v,
    });
  });

  // explanations
  rawData["explanations.json"]?.explanations?.forEach((e) =>
    push({
      id: `explanation:${e.id}`,
      type: "explanation",
      title: e.title,
      content: e.content,
      raw: e,
    })
  );

  // examples
  rawData["examples.json"]?.examples?.forEach((ex) =>
    push({
      id: `example:${ex.id}`,
      type: "example",
      title: ex.title,
      content: ex.content,
      raw: ex,
    })
  );

  // Build Fuse
  const fuse = new Fuse(docs, {
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    keys: [
      { name: "title", weight: 0.6 },
      { name: "content", weight: 0.4 },
    ],
  });

  // Store it globally
  setFuse(fuse, docs);

  console.log("Index Built:", docs.length, "documents");
}
