export function companyheaderExplain() {
  return `
🏢 CompanyHeader View Explanation

Used for:
- Company Name
- Address
- Logo
- Heading
- Lines

Mandatory Columns:
- colname
- bname
- comp

Example:
CREATE VIEW sabrep_companyheader_<repcode> AS
SELECT 'compname', compname, comp FROM sabcompany
UNION ALL
SELECT 'compadr', address, comp FROM sabcompany;
`;
}
