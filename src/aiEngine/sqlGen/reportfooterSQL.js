export function reportfooterExplain() {
  return `
# 📘 ReportFooter View Explanation  
The **ReportFooter** section is printed at the **bottom of the report**, after the Details section is Finished.

This area is used for:  
- Summary Totals  
- Taxes (GST/TDS)  
- Grand Totals  
- Footer remarks  
- Horizontal line  
- Signature blocks  
- Grid-style summary tables  

The ReportFooter is fully dynamic and supports **multiple child views** (text, grid1, grid2, etc.).

---

# 🔷 View Naming Rule  
\`sabrep_reportfooter_<repcode>\`

Examples:  
- sabrep_reportfooter_chlf  
- sabrep_reportfooter_inwe  

This is the **main controller view** that tells the backend which footer sub-views to execute.

---

# 🔷 Structure of Main Footer View  
Example:

\`\`\`sql
CREATE VIEW sabrep_reportfooter_chlf AS     
SELECT 'text' AS tag, 'sabrep_reportfooter_chlf_text' AS sabreptable,'text' tabletag          
UNION ALL
SELECT 'grid', 'sabrep_reportfooter_chlf_grid','grid' tabletag 
UNION ALL
SELECT 'grid', 'sabrep_reportfooter_chlf_grid1','grid1' tabletag 
\`\`\`

# 🔷 Mandatory Columns in Main Footer View

| Column        | Purpose |
|--------------|---------|
| **tag**       | identifies footer type: **text** or **grid** |
| **sabreptable** | the actual VIEW name that system will execute |
|**tabletag**|Indicate the View name on the last after repcode ex: sabrep_reportfooter_?repcode)_tabletag)|

### ✔ Important Notes:

- The backend creates a container in \`sabrep_topleft_box\` with:
  **section = reportfooter_<tabletag>**
  
  Example:  
  - reportfooter_text  
  - reportfooter_grid  
  - reportfooter_grid1  

- Backend will look for:  
  \`sabrep_reportfooter_<repcode>_<tabletag>\`

- Each row in footer runs its own SQL child view.

---
## 📌 Visual Example (reportfooter Section)
 - Below image shows how the reportfooter container appears inside a report \`sabrep_topleft_box\` table in section column value \`reportfooter\` and also with child container reportfooter_?repcode)_?tabletag):
 - ![reportfooter Section Example](/ai-images/sabreptopleft_section.png)


 
 - Below image shows how the reportfooter design appears inside a report in \`sabrep_topleft\` table:

 
 - ![reportfooter Section Example](/ai-images/sabrep_topleft_reportfooter.png)
---

# 🔷 Meaning of tag Column
| tag  | Meaning |
|------|---------|
| **text** | Simple text-based footer items (Totals, remarks, signatures, line, etc.) |
| **grid** | Table-format values like GST/TDS breakup, summary grid |

- The tag tells the backend **how to render the footer section**.

----
### Engine Behavior  
For each row in \`sabreptable\` column, backend automatically executes:

\`\`\`sql
SELECT sabid, colname, bname
FROM <sabreptable>
WHERE sabid = ?sabid
\`\`\`

So the system dynamically calls:  
- \`sabrep_reportfooter_chlf_text\`  
- \`sabrep_reportfooter_chlf_grid\`

---

# 🔷 Footer Text View (Child View)

\`\`\`sql
CREATE VIEW sabrep_reportfooter_chlf_text AS
SELECT 'TotalAmount' AS colname, a.sabid, SUM(a.amount) AS bname
FROM bsab_trkchl_mid a
UNION ALL
SELECT 'line1', a.sabid, 'line' AS bname
FROM bsab_trkchl_mid a;
\`\`\`

### ✔ Mandatory Columns in Footer(Text View)

| Column    | Purpose |
|-----------|---------|
| **colname** | Must match sabrep_topleft.colname |
| **sabid**   | Identifies which entry's footer to show |
| **bname**   | Printed output OR keyword (line, vline, !heading) |

---

# 🔷 📌 Footer Grid View - Data View (Child View)
Example of data view:

\`\`\`sql
CREATE VIEW sabrep_reportfooter_chlf_grid AS
SELECT 
    a.sabid,
    a.gstper,
    a.taxable,
    a.cgst,
    a.sgst,
    a.igst
FROM somegsttable a;
\`\`\`

This returns **row-level data** for the grid.

---
# 🔷 Footer Grid Metadata View — “_view” View

The  **requires a metadata view** ending with \`view\` to understand:
- How many columns grid has  
- Column headings  
- Column ordering  

\`\`\`sql
CREATE VIEW sabrep_reportfooter_chlf_grid_view AS
SELECT 
    ordinal_position AS pid,
    column_name AS bname,
    column_name AS head
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'sabrep_reportfooter_chlf_grid';
\`\`\`

### ✔ Mandatory Columns (Grid Metadata View)

| Column | Purpose |
|--------|--------|
| **pid** | order of columns |
| **bname** | actual column name |
| **head** | display caption in grid |

---
# 🔷 sabrep_topleft_box Attributes  
(For section = reportfooter_<tabletag>)

| Attribute | Meaning |
|-----------|---------|
| **repcode** | Identifier of the report |
| **section** | reportfooter_<tabletag> (e.g., reportfooter_text) |
| **ttop** | Distance from top where footer begins |
| **tleft** | Left margin (for text footer) |
| **width** | Width of footer container (0 = auto width) |
| **height** | Height of footer container |
| **line_left/right/up/bottom** | Border lines |
| **line_height** | Border thickness |

---

# 🔷 sabrep_topleft Attributes  
(section = reportfooter_<tabletag>)

| Field | Purpose |
|-------|---------|
| **colname** | Must match colname in child view |
| **caption** | Visible label in footer (Total, GST %, etc.) |
| **align** | left / right / center |
| **bold** | Bold text |
| **visible** | 1/0 |
| **width** | Column width |
| **Suppress** | Hide repeating values |

---

# 🔷 ✔ Runtime Flow (How Backend Execution Footer Logic)

1️⃣ System loads the main footer view  
\`sabrep_reportfooter_<repcode>\`

Example output:

| tag  | sabreptable                       | tabletag |
|------|-----------------------------------|----------|
| text | sabrep_reportfooter_chlf_text     | text     |
| grid | sabrep_reportfooter_chlf_grid     | grid     |

---

### 2️⃣ For each row → backend executes the sub-view

If tag = text →  
Executes:  
\`sabrep_reportfooter_<repcode>_text\`

If tag = grid →  
Executes:  
\`sabrep_reportfooter_<repcode>_grid\`

---

### 3️⃣ Child views must return required fields

✔ For **text views** → must return:  
- sabid  
- colname  
- bname  

✔ For **grid views** → must return:  
- sabid  
- required columns  
- And a companion \`_view\` metadata view  

---

### 4️⃣ Backend prints the footer section  
- Text section prints labels + values  
- Grid section prints table layout  
- Borders & alignment come from sabrep_topleft_box + sabrep_topleft  

---

# ✔ Summary (Final)

- **ReportFooter** supports **multiple text & grid sections**.  
- Main view controls which child views to run.  
- Each child view must follow naming rules.  
- **Text views** behave like PageHeader.  
- **Grid views** behave like Details section.  
- Metadata “_view” is mandatory for grid systems.  
- sabrep_topleft & sabrep_topleft_box determine layout.

---
  `;
}
