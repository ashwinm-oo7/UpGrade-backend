export function detectIntent(text) {
  text = text.toLowerCase();

  // SQL Generation
  if (
    text.includes("generate") ||
    text.includes("create view") ||
    text.includes("make view")
  )
    return "SQL_GEN";

  // Explanation questions
  if (
    text.startsWith("what") ||
    text.startsWith("how") ||
    text.includes("explain") ||
    text.includes("format") ||
    text.includes("mandatory") ||
    text.includes("structure")
  )
    return "EXPLAIN";

  // Example requests
  if (text.includes("example")) return "EXAMPLE";

  // If none of the above → fallback to Search Engine
  return "SEARCH";
}
