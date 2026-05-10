export default function getExplanation(q) {
  q = q.toLowerCase();

  if (q.includes("pageheader")) {
    return `
A PageHeader view must contain 3 mandatory columns:
1) colname  – the field name used in design
2) sabid    – identifies the specific printed record
3) bname    – the output value shown in the header

General format:

CREATE VIEW sabrep_pageheader_<repcode> AS
SELECT '<colname>' AS colname, a.sabid AS sabid, <value> AS bname
FROM <table> a
UNION ALL
SELECT '<colname2>', a.sabid, <value2>
FROM <table> a
UNION ALL
SELECT 'line1', a.sabid, 'line'
FROM <table> a;

This structure binds to sabrep_topleft via matching colname values.
`;
  }

  return "I understand this is a question, but I have no explanation stored for this topic.";
}
