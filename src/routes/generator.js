import express from "express";

const router = express.Router();

/*
  Input example:
  "create pageheader for repcode inwe table asab9"
*/
router.post("/generate-view", (req, res) => {
  const text = req.body.text?.toLowerCase() || "";
  console.log("/generate-view", text);
  // extract repcode
  const repcodeMatch = text.match(/repcode\s+([a-z0-9_]+)/);
  const repcode = repcodeMatch ? repcodeMatch[1] : null;

  // extract table name
  const tableMatch =
    text.match(/table\s*name\s*is\s*([a-z0-9_]+)/) ||
    text.match(/tablename\s*([a-z0-9_]+)/) ||
    text.match(/table\s*is\s*([a-z0-9_]+)/) ||
    text.match(/table\s*=\s*([a-z0-9_]+)/) ||
    text.match(/table\s*:\s*([a-z0-9_]+)/) ||
    text.match(/table\s+([a-z0-9_]+)/);

  const table = tableMatch ? tableMatch[1] : null;

  // extract requested section type
  let section = null;
  if (text.includes("pageheader")) section = "pageheader";
  if (text.includes("companyheader")) section = "companyheader";
  if (text.includes("details")) section = "details";
  if (text.includes("reportfooter")) section = "reportfooter";

  if (!repcode || !table || !section) {
    return res.json({
      success: false,
      message: "Missing repcode or table or section in text",
      detected: { repcode, table, section },
    });
  }

  // generate SQL based on type
  let sql = "";

  if (section === "pageheader") {
    sql = `
CREATE VIEW sabrep_pageheader_${repcode} AS
SELECT 'Entno' AS colname, a.sabid AS sabid, a.entno AS bname
FROM ${table} a
UNION ALL
SELECT 'Entdt', a.sabid, CONVERT(nvarchar, a.entdt, 110)
FROM ${table} a
UNION ALL
SELECT 'line1', a.sabid, 'line'
FROM ${table} a;
`;
  }

  if (section === "companyheader") {
    sql = `
CREATE VIEW sabrep_companyheader_${repcode} AS
SELECT 'compname' AS colname, a.compname AS bname, a.pid AS comp
FROM ${table} a
UNION ALL
SELECT 'compadr', a.address, a.pid
FROM ${table} a
UNION ALL
SELECT 'line1', 'line', a.pid
FROM ${table} a;
`;
  }

  if (section === "details") {
    sql = `
CREATE VIEW sabrep_details_${repcode} AS
SELECT a.sabid,
       a.sno,
       a.itemname,
       a.qty,
       a.rate
FROM ${table} a;
`;
  }

  // add more templates as needed...

  return res.json({
    success: true,
    repcode,
    table,
    section,
    sql,
  });
});

export default router;
