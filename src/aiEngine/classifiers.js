export function detectSection(text) {
  text = text.toLowerCase();

  if (text.includes("pageheader")) return "pageheader";
  if (text.includes("companyheader")) return "companyheader";
  if (text.includes("details")) return "details";
  if (text.includes("footer")) return "reportfooter";
  if (text.includes("line")) return "lines";
  if (text.includes("sabrep_topleft")) return "sabrep_topleft";

  return null;
}
