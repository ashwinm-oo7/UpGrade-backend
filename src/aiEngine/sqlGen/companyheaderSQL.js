export function companyheaderExplain() {
  return `
# 🏢 CompanyHeader View Explanation

The **CompanyHeader** section is used to display company-level information such as:

- Company Name  
- Address  
- Heading text  
- Horizontal / Vertical lines  
- etc.  

This section appears at the **top of the first page** unless configured to repeat.

---

## 🔷 View Naming Rule  
\`sabrep_companyheader_<repcode>\`

**Examples:**
- sabrep_companyheader_chlf  
- sabrep_companyheader_inwe  

---

## 🔷 Mandatory Columns

| Column  | Purpose |
|--------|---------|
| **colname** | connects to sabrep_topleft.colname |
| **bname**   | printed text OR keyword (line, vline, !heading) |
| **comp**    | fetches company-level values |

---

## 🔷 Special Keywords (inside **bname**)

| Keyword  | Meaning                     |
|----------|-----------------------------|
| !heading | prints a formatted heading  |
| line     | draws a horizontal line     |
| vline    | draws a vertical line       |

### Notes:
  - **!heading** : This is key will be used in the SDL **SabReport** section for Dynamic store that key **Heading** ex: heading=Invoice Report.
  - **line**     : This keyword is reserved in the software for used case make a line in Horizontal Format.
  - **vline**    : This keyword is reserved in the software for used case make a line in Vertical  Format.

These keywords generate **layout elements**, not plain text.

---
## 📌 Visual Example (Companyheader Section)
 - Below image shows how the companyheader container appears inside a report \`sabrep_topleft_box\` table in section column value \`detailheader\`:
 - ![detailheader Section Example](/ai-images/sabreptopleft_section.png)


 - Below image shows how the details design appears inside a report in \`sabrep_topleft\` table:

 - ![Companyheader Section Example](/ai-images/sabrep_topleft_companyheader.png)

## 🔷 Common Attributes  
(Defined in **sabrep_topleft_Box** → section = companyheader)
below will explain all the column of sabrep_topleft_Box table which is attribute in the software for a container.

| Attribute | Meaning |
|----------|---------|
| **repcode** | report identifier |
| **section** | companyheader  (companyheader section for the top page show the company details)|
| **ttop** | top margin |
| **tleft** | left margin |
| **width**   | container width  (if width is zero then it make full width which is mentioned in the report section value in the width column.)|
| **height** | container height |
|**line_left**| Container border line show in the left side|
| **line_right**| Container border line show in the right side|
| **line_bottom**| Container border line show in the bottom side|
| **line_up** | Container border line show in the up side|
| **line_height**| Container border height show in the top and bottom side and width for left and right side all four side line effect there size.|


### Notes:
- Must match **sabrep_topleft.colname** in the view column colname.
- repcode selects correct view dynamically

---

## 🔷 Example View  
### (companyheader_chlf)

\`\`\`sql
CREATE VIEW sabrep_companyheader_chlf AS
SELECT 'compname' AS colname, 'Transport Pass' AS bname, a.pid AS comp
FROM sabcompany a
UNION ALL
SELECT 'compadr', 'Collector Palghar (Supply Dept)', a.pid
FROM sabcompany a
UNION ALL
SELECT 'line1', 'line', a.pid
FROM sabcompany a
UNION ALL
SELECT 'heading', '!heading', a.pid
FROM sabcompany a;
\`\`\`

---

## 🔷 Understanding Mandatory Columns

### 1) **colname**:
   - Used for alignment and design  
   - Must match **sabrep_topleft.colname**  

### 2) **bname**:
- Printed output OR keyword (!heading / line / vline)

### 3) **comp**:
- Identifies which company record to pull  

---

## 🔷 sabrep_topleft Table — Key Fields

| Field | Purpose |
|-------|---------|
| **repcode** | report code/report identifier |
| **section** | \`companyheader\` (This section column also important to define in which section mentioned the design and the value show in that particular section and the section name First defined in the table sabrep_topleft_box in section column)|
| **ttop** |   starting Y position / vertical start position / start top of the container |
| **tleft** | starting X position / horizontal start position / start left of the cotainer |
| **height** |element height |
| **width** | element width |
| **fontsize** | text size |
| **fontname** | text font |
| **line_height** | border height/thickness |
| **bold** | **1/0** Makes the text appear in bold style when printed in the report. |
| **align** | text start from the (left/right/centre) this three option. |
| **visible**|(1/0) values: The visible attribute decides whether this column should be shown to the user in the report output. The field still exists in the view and the engine reads the value, but does not display it in the final report.|

### Note  
- If **width = 0**, the value becomes **auto-centered** and **tleft is ignored**.
- If **width > 0**, the value becomes **start from left side** and **tleft is not ignored**.

---

## ✔ Summary  
- The **CompanyHeader** defines *branding, logo, headings, and company details* for the top of the report page.  
- It uses keywords, alignment fields, and view-based SQL to dynamically fetch company info.

---
`;
}

export function generateCompanyheaderSQL(repcode, table) {
  if (!repcode || !table) return null;
  return `CREATE VIEW sabrep_companyheader_${repcode} AS
SELECT 'compname' AS colname, a.compname AS bname, a.pid AS comp FROM ${table} a
UNION ALL
SELECT 'compadr', a.address AS bname, a.pid FROM ${table} a
UNION ALL
SELECT 'line1', a.pid, 'line' AS bname FROM ${table} a;`;
}
