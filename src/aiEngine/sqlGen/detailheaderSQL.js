export function detailsExplain() {
  return `
# 📘 Details View Explanation

The **Details** section is the **middle part of the report page**, below the pageheader container.  

This is where **repeating line-items / transaction rows** are printed (e.g. item list in an invoice, permit list, etc.).

---

## 🔷 Purpose of the Details View

The details view is the **data provider** for the Details section.

- Every line printed in the Details grid comes from this view.  
- For each report section, the engine expects a view based on the rule:

\`sabrep_<section>_<repcode>\`

So for:

- **section** = \`details\`  
- **repcode** = \`chlf\`  

The engine **automatically expects** this view:

\`sabrep_details_chlf\`

This view returns **all the transaction rows** that the Details section should print.

---

## 🔷 Example Details View (sabrep_details_chlf)

\`\`\`sql
CREATE VIEW sabrep_details_chlf AS
SELECT  
    a.sabid,
    a.sno,
    asab9_a.person   AS party,
    asab9_a.pdukanno,
    a.permit
FROM bsab_trkchl_mid a 
LEFT JOIN asab9 AS asab9_a ON a.party = asab9_a.pid;
\`\`\`

- \`bsab_trkchl_mid\` = transaction (details) table  
- \`asab9\`           = master party table  
- Join is used to fetch **party name** and **shop number (pdukanno)** from the master table.

---

## 🔷 Mandatory Columns in Details View

In the **details** view, the important columns are:

| Column    | Purpose                                                                 |
|-----------|-------------------------------------------------------------------------|
| **sabid** | links each detail row to a specific report entry from current form record |


> * In this case, the details view directly returns **data columns** (like \`sno\`, \`party\`, \`permit\`) instead of using \`colname/bname\` pairs.  
> * But **whatever column name is used in design in table \`sabrep_topleft\`** must **exist in this view** if not then it will ignored in the output.
> * In the details view **colname** and **bname** not compulsory column.
> * Mandatory colum will be sabid(connectivity in report which record want to show at a time) and other requirements column in this view.

### sabid (very important)

- \`sabid\` is the master key that tells the engine **which document/entry is being printed**.  
- The engine **always filters** the view like:

\`\`\`sql
SELECT * 
FROM sabrep_details_chlf
WHERE sabid = ?sabid
\`\`\`

**Note:** \`?sabid\) / \`?columnname\) means:
- The value is taken dynamically from the **currently open form**.
- Only rows **belonging to that specific entry** are printed in the Details section.

---

## 🔷 Container Attributes – detailheader (sabrep_topleft_Box)

 - The **details container** itself (the big box where the grid starts) is defined in  \`sabrep_topleft_Box\` with **section = detailheader**.

 - These attributes control **where the container appears** and **how its border looks**:

 | Attribute        | Meaning                                                                                                      |
 |------------------|--------------------------------------------------------------------------------------------------------------|
 | **repcode**      | Report identifier                                                                                           |
 |  **section**      | \`detailheader\` → defines the container for the details area (below pageheader)                            |
 | **ttop**         | Top margin (distance from top of page where the details container starts)                                   |
 | **tleft**        | *Not used* for details container                                                                            |
 | **width**        | Container width (by default: full width based on report section width for this repcode)                     |
 | **height**       | Container height (overall height of details block)                                                          |
 | **line_left**    | Show left border line                                                                                       |
 | **line_right**   | Show right border line                                                                                      |
 | **line_bottom**  | Show bottom border line                                                                                     |
 | **line_up**      | Show top border line                                                                                        |
 | **line_height**  | Border thickness / cell height effect for all four sides of the container                                   |

 > These attributes are for the **outer container** of the details section, not for each individual column.

## 📌 Visual Example (Details Section)
 - Below image shows how the details grid appears inside a report \`sabrep_topleft_box\` table in section column value \`detailheader\`:

 - ![detailheader Section Example](/ai-images/sabreptopleft_section.png)

  - Below image shows how the details design appears inside a report in \`sabrep_topleft\` table:

 - ![detailheader Section Example](/ai-images/sabrep_topleft_details.png)

---
## Note: sabrep_details_?repcode)_view 
- This view purpose to get the column and there datatype used in the backend of software report.
- Also used for sabrep_topleft table where colname column will be used for taking the help connectivity connection in design report.
* ex : repcode=chlf
\`\`\`sql
create view sabrep_details_chlf_view as      
SELECT ordinal_position pid ,column_name bname,column_name  head   FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'sabrep_details_chlf' 

\`\`\`

---
## 🔷 Column Layout – sabrep_topleft (section = details)

Inside the details container, each **column** (Sr.No, Party, Permit, etc.) is defined in  
 - \`sabrep_topleft\` with **section = details**.

Here each row describes **one visible column** in the grid.

| Field        | Purpose                                                                                         |
|-------------|--------------------------------------------------------------------------------------------------|
| **repcode** | Report code / identifier                                                                         |
| **section** | \`details\` – tells the engine this row belongs to the details section                           |
| **ttop**    | *Not used* in details (position is handled by row layout)                                       |
| **tleft**   | *Not used* in details                                                                           |
| **height**  | Height of the cell                                                                              |
| **width**   | Width of the column                                                                             |
| **line_left**   | *Not used* in details                                                                       |
| **line_right**  | *Not used* in details                                                                       |
| **line_bottom** | *Not used* in details                                                                       |
| **line_up**     | *Not used* in details                                                                       |
| **line_height** | *Not used* in details                                                                       |
| **total** | In details section work for using Aggregate Function in paricular colum ex: **sum/max/min/count** and **total** its a keyword to showing the caption in footer which is mentioned in the view \`sabrep_grouping_?repcode)\`|
| **bold** | **1/0** Makes the text appear in bold style when printed in the report. |
| **align** | text start from the (**left/right/centre**) this three option. |
| **Suppress**|(Y/N) Prevents repeating identical values in consecutive rows. If the same value appears in every row, only the first row will show it and all following rows will hide it.|
| **caption** | Column header text displayed at the top of the grid (e.g. "Sr.No", "Party", "Permit")           |
| **colname** | **Very important**: must match exactly the column name returned by the view \`sabrep_details_<repcode>\` |
| **visible**|**(1/0)** values: The visible attribute decides whether this column should be shown to the user in the report output. The field still exists in the view and the engine reads the value, but does not display it in the final report.|

## ✔ What Suppress Actually Does (Clear Explanation)
  * In many ERP reports, a column contains the same value for all rows.
     - Example: Party Name, Bill No, Date, Category, etc.
      - Without suppression, the report looks like: \`Suppress=N\`

      | Sno | Party         | Item | Qty |
      | --- | ------------- | ---- | --- |
      | 1   | Rahul Traders | A1   | 10  |
      | 2   | Rahul Traders | B2   | 20  |
      | 3   | Rahul Traders | C3   | 15  |
      | 4   | maurya Traders | A1   | 90  |
      | 5   | maurya Traders | B2   | 80  |

      - Here Party = Rahul Traders repeats in every row, which looks messy and is unnecessary.

      - With Suppress = true, output becomes: \`Suppress=Y\`

      | Sno | Party         | Item | Qty |
      | --- | ------------- | ---- | --- |
      | 1   | Rahul Traders | A1   | 10  |
      | 2   |               | B2   | 20  |
      | 3   |               | C3   | 15  |
      | 4   | maurya Traders| A1   | 90  |
      | 5   |               | B2   | 80  |

      - The value is printed only in the first row, and then suppressed (hidden) in subsequent rows.

      | Attribute    | Meaning                                                                                                                                                                                                            |
      | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
      | **Suppress** | If consecutive rows contain the **same value**, this option prints the value only in the **first occurrence** and suppresses (hides) it in all following rows. Used to avoid repetition and keep the report clean. |

📌 **Rule:**  
  > Whatever **colname** is used in **\`sabrep_topleft\`** for **section = details**  
  > **must exist as a column in the details view**.

  - Example rows in \`sabrep_topleft\`:

     | section | colname  | caption  |
     |--------|----------|----------|
     | details | sno      | Sr.No    |
     | details | party    | Party    |
     | details | pdukanno | Dukan No |
     | details | permit   | Permit   |

  * If any colname (e.g. \`party\`) is not present as a column in \`sabrep_details_<repcode>\`, then that column will be **invisible**.

---

## 🔷 Runtime Flow – When Does the Details View Execute?

 - When the user clicks **PRINT REPORT**:

1. **Load master record**  
   - Engine reads \`sabtopleft_report_up\` and gets **sabid** of the current entry.

2. **Load section design**  
   - From \`sabrep_topleft\` → gets all fields/columns for sections (**companyheader**, **pageheader**, **details**, etc.)  
   - From \`sabrep_topleft_Box\` → gets containers (companyheader box, detailheader box, etc.)

3. **Find details view**  
   - For section = details and repcode = \`chlf\`, it looks for : \`sabrep_details_chlf\`

4. **Execute details view**  
   - Engine runs:

\`\`\`sql
SELECT *
FROM sabrep_details_chlf
WHERE sabid = ?sabid
\`\`\`

5. **Print rows**  
   - For **each row** returned by the view:
     - One line is printed in the details grid.  
   - If 10 rows are returned → 10 lines are printed.  
   - If 0 rows are returned → the details grid is empty.

6. **Why only these columns?**  
   - Because report design (in \`sabrep_topleft\`) only references those colnames.  
   - Any column not referenced in \`sabrep_topleft\` is ignored in **layout**.  
   - Any colname present in \`sabrep_topleft\` and missing from the view then will be ignored in **layout**.

---

## ✔ Summary

- The **Details view** (\`sabrep_details_<repcode>\`) is the **data source** for the repeating grid.  
- The **sabrep_topleft_Box** entry with section = \`detailheader\` defines the **container box**.  
- The **sabrep_topleft** entries with section = \`details\` define **each visible column and there properties**.  
- \`sabid\` links the details rows to the correct master record.  
- The design will only work correctly if all **colname** entries in \`sabrep_topleft\` exist in the details view.

---
                        ┌────────────────────────────┐
                        │ 1️⃣ User Opens Form Record │
                        │     sabid = 12540          │
                        └──────────────┬─────────────┘
                                       │
                                       ▼
                        ┌────────────────────────────┐
                        │ 2️⃣ Engine Loads Report    │
                        │   sabtopleft_report_up     │
                        │   (gets repcode + sabid)   │
                        └──────────────┬─────────────┘
                                       │
                                       ▼
          ┌───────────────────────────────────────────────────────────┐
          │ 3️⃣ Load Layout Metadata                                   │
          │                                                           │
          │  🔹 sabrep_topleft_box → container (detailheader)         │
          │  🔹 sabrep_topleft → columns for section = details        │
          └──────────────┬────────────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────────────┐
            │ 4️⃣ Locate Details View                  │
            │     sabrep_details_<repcode>            │
            │ Example: sabrep_details_chlf            │
            └──────────────┬──────────────────────────┘
                           │
                           ▼
           ┌────────────────────────────────────────────┐
           │ 5️⃣ Engine Executes Details View SQL        │
           │ SELECT * FROM sabrep_details_chlf          │
           │ WHERE sabid = 12540                        │
           └──────────────┬─────────────────────────────┘
                           │
                           ▼
       ┌────────────────────────────────────────────────────────┐
       │ 6️⃣ View Returns Multiple Rows                         │
       │  (line items for details grid)                         │
       │                                                        │
       │  sabid | sno | party | pdukanno | permit               │
       │  ---------------------------------------------------   │
       │  12540 |  1  | John  |   101    | ABC123               │
       │  12540 |  2  | John  |   101    | XYZ555               │
       │  12540 |  3  | John  |   101    | LMN999               │
       └──────────────┬─────────────────────────────────────────┘
                      │
                      ▼
     ┌──────────────────────────────────────────────────────────┐
     │ 7️⃣ Engine Prints One Line Per Row                       │
     │  Applies:                                                │
     │    • Column width                                        │
     │    • Align left/right/center                             │
     │    • Bold / Visible                                      │
     │    • SUPPRESS rule (hide repeating values)               │
     └──────────────────────────────────────────────────────────┘

---
`;
}
