export function pageheaderExplain() {
  return `
📘 PageHeader View Explanation

A PageHeader view is used for top-level fields like:
- EntNo
- EntDt
- Party details
- Horizontal line (line1)

✅ Mandatory Columns:
- colname
- sabid
- bname

🧩 Naming Rule:
sabrep_pageheader_<repcode>

🧱 Example Structure:
CREATE VIEW sabrep_pageheader_<repcode> AS
SELECT 'Entno', sabid, entno FROM <table>
UNION ALL
SELECT 'Entdt', sabid, CONVERT(nvarchar, entdt, 110) FROM <table>
UNION ALL
SELECT 'line1', sabid, 'line' FROM <table>;
`;
}

export function pageheaderExample() {
  return `
📘 Example View Name:
sabrep_pageheader_gtnx

📘 Example Usage:
colname and sabid MUST match sabrep_topleft design mappings.
`;
}
