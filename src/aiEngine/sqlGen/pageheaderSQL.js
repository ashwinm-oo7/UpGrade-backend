export function generatePageheaderSQL(repcode, table) {
  return `
CREATE VIEW sabrep_pageheader_${repcode} AS
SELECT 'Entno' AS colname, a.sabid, a.entno AS bname
FROM ${table} a
UNION ALL
SELECT 'Entdt', a.sabid, CONVERT(nvarchar, a.entdt, 110)
FROM ${table} a
UNION ALL
SELECT 'party', a.sabid, CONVERT(nvarchar, a.party)
FROM ${table} a
UNION ALL
SELECT 'line1', a.sabid, 'line'
FROM ${table} a;
  `;
}

export function pageheaderExplain() {
  return `
# 📘 PageHeader View Explanation
This **pageheader** section container view below companyheader
A PageHeader view is used for top-level fields like:
- EntNo
- EntDt
- Party details
- Horizontal line (line1)
- etc
------------------------------------------------------------
🔷 **Mandatory Columns**
------------------------------------------------------------
## Mendatory column in this view is:colname ,bname,sabid
| Column  | Purpose |
|--------|---------|
| **colname** | used for understand what kind of data for a developer  also usedcase for connectivity design alignment location in the table sabrep_topleft.colname . |
| **bname**   | printed text OR keyword (line, vline, !heading)/this bname value will be seen as a output in the Report. |
| **sabid**    | connectivity in report which record want to show at a time. |

 * This section Defines in the Page Top container declared after companyheader container.
 * pageheader in which we mentioned debtor party  details and invoice no and date if they required in report:
 * view name: sabrep_pageheader_?repcode)
## Note:
* ?repcode) means its dyanmic repcode that particular report which is mentioned in the SDL File section **Sabreport** key **repcode**=xyz.so its mean **sabrep_pageheader_xyz**


## Meaning:
- colname must match sabrep_topleft.colname  
- bname appears as output unless it is a keyword  
- sabid ensures only selected entry is printed  

------------------------------------------------------------
## 🔷 View Naming Rule 
 - sabrep_pageheader_<repcode>

 - Example:
  - sabrep_pageheader_chlf
  - sabrep_pageheader_inwe
------------------------------------------------------------
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

  ### These keywords generate **layout elements**, not plain text.

------------------------------------------------------------
## 📌 Visual Example (Pageheader Section)
 - Below image shows how the companyheader container appears inside a report \`sabrep_topleft_box\` table in section column value \`pageheader\`:
 - ![pageheader Section Example](/ai-images/sabreptopleft_section.png)


 
 - Below image shows how the pageheader design appears inside a report in \`sabrep_topleft\` table:

 
 - ![pageheader Section Example](/ai-images/sabrep_topleft_pageheader.png)
------
## 🔷 Common Attributes  
(Defined in **sabrep_topleft_Box** → section = pageheader)
below will explain all the column of sabrep_topleft_Box table which is attribute in the software for a container.

| Attribute | Meaning |
|----------|---------|
| **repcode** | report identifier |
| **section** | pageheader  (pageheader section show below companyheader container)|
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


------------------------------------------------------------
## 🔷 Example View  
### (pageheader_chlf)

------------------------------------------------------------

\`\`\`sql
CREATE VIEW sabrep_pageheader_chlf AS             
SELECT 'Entno' AS colname, a.sabid, a.entno AS bname 
FROM tablename a             
UNION ALL            
SELECT 'Entdt', a.sabid, CONVERT(nvarchar, a.entdt, 110) AS bname 
FROM tablename a            
UNION ALL            
SELECT 'line1', a.sabid, 'line' AS bname 
FROM tablename a;
\`\`\`


------------------------------------------------------------
## 🔷 Understanding Mandatory Columns

### 1) **colname**:
   - Used for alignment and design  
   - Must match **sabrep_topleft.colname**  

### 2) **bname**:
- Printed output OR keyword (!heading / line / vline)

### 3) **sabid**:
- connectivity in report which record want to show at a time.  
------------------------------------------------------------
## 🔷 sabrep_topleft Table — Key Fields
------------------------------------------------------------
| Field | Purpose |
|-------|---------|
| **repcode** | report code/report identifier |
| **section** | \`pageheader\` (This section column also important to define in which section mentioned the design and the value show in that particular section and the section name First defined in the table sabrep_topleft_box in section column)|
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
------------------------------------------------------------
## ✔ Summary  
- The **pageHeader** defines party details ex :*name,address,orderno/invoice,entry no,entry date and party gstno ..etc* for the top of the report page below companyheader container.  
- It uses keywords, alignment fields, and view-based SQL to dynamically fetch Party info purpose.
---

`;
}
