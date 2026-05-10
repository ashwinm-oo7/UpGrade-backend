---
title: Report Designing — ERP
source: "Report Designing Steps.docx"
summary: "Design-time metadata, views and rendering flow for dynamic ERP report engine."
---

# Report Designing (ERP)

**Purpose:** Build dynamic reports from database metadata (no hard-coded layouts). All report designs are stored in tables & views; the engine reads those definitions and renders the report at runtime.

_Source: original doc._ :contentReference[oaicite:1]{index=1}

---

## Overview

The system uses three primary tables to store report definitions and layout:

1. `sabtopleft_report_up` — report master (header / regcode based report) each report have one record/per sabid.  
2. `sabrep_topleft` — fields/controls metadata (position, font, alignment,style)  
3. `sabrep_topleft_Box` — section containers (section name, size, location)

These tables are related using `sabid` as the primary link. Views named `sabrep_<section>_<regcode>` provide data for each section.

---

## Table: sabtopleft_report_up (Report Master)

**Purpose:** store high-level report info and metadata.

```sql
CREATE TABLE [dbo].[sabtopleft_report_up](
   NULL,
  [type] [int] NOT NULL,
  [comp] [int] NOT NULL,
  [ycode] [int] NOT NULL,
  [udate] [smalldatetime] NULL,
  [sabuser] [bigint] NULL,
  [mode] [bigint] NULL,
  [division] [int] NOT NULL,
  [pid] [bigint] NOT NULL,
  [sabid] [bigint] NOT NULL,
   NULL,
  [repname] [int] NULL,
  [allcomp] [int] NULL,
   NULL,
  CONSTRAINT [PK_sabtopleft_report_up] PRIMARY KEY CLUSTERED ([sabid] ASC)
);
```
| Column       | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| **repcode**  | Unique report code key.                                 |
| **type**     | Report type (invoice, purchase, receipt, etc.)          |
| **comp**     | Company ID.                                             |
| **ycode**    | Financial year code.                                    |
| **udate**    | Last update date.                                       |
| **sabuser**  | User ID creating/changing report.                       |
| **mode**     | Creation/Edit mode flag.                                |
| **division** | Branch / division code.                                 |
| **pid**      | Parent ID reference.                                    |
| **sabid**    | Primary Unique ID for this report. Used as foreign key. |
| **mstid**    | Master table ID.                                        |
| **repname**  | Report display name ID.                                 |
| **allcomp**  | Whether report applies to all companies.                |
| **menucode** | Menu mapping code.                                      |

---------------------------------------------------
## 🟦 2. TABLE — sabrep_topleft
**Purpose:**
This table stores each report field’s layout:

Captions

Coordinates (top, left)

Width, height

Bold/Font formatting

Grouping, alignment

Table/sub-table structures

Row-by-row positioning

Used in the Form Report Designing — middle table.
``` sql
CREATE TABLE [dbo].[sabrep_topleft](
	[rtype] int NULL,
	[repcode] nvarchar(20) NULL,
	[section] nvarchar(100) NULL,
	[colname] nvarchar(max) NULL,
	[caption] nvarchar(max) NULL,
	[ttop] int NULL,
	[tleft] int NULL,
	[symbol] nvarchar(10) NULL,
	[width] int NULL,
	[bold] int NULL,
	[fontsize] int NULL,
	[total] nvarchar(10) NULL,
	[pid] int NULL,
	[sabid] bigint NULL,
	[sabuser] bigint NULL,
	[hleft] int NULL,
	[height] int NULL,
	[sno] int NULL,
	[rowid] bigint NULL,
	[sabrowid] bigint NOT NULL,
	[type] int NULL,
	[comp] int NULL,
	[udate] smalldatetime NULL,
	[ycode] int NULL,
	[division] int NULL,
	[formating] nvarchar(100) NULL,
	[align] nvarchar(20) NULL,
	[subreptable] nvarchar(10) NULL,
	[id] int IDENTITY(1,1) NOT NULL,
	[ttag] nvarchar(40) NULL,
	[tabletag] nvarchar(40) NULL,
	[colid] int NULL,
	[visible] int NULL,
	[groupname] nvarchar(40) NULL,
	[lcaption] nvarchar(100) NULL,
	[fontname] nvarchar(20) NULL,
	[footerformula] nvarchar(40) NULL,
	[cellformula] nvarchar(40) NULL,
 PRIMARY KEY CLUSTERED ([sabrowid] ASC)
)
```
### 📌 Positioning
| Field      | Meaning               |
| ---------- | --------------------- |
| **ttop**   | Y-axis position (mm). |
| **tleft**  | X-axis position (mm) values in which view mentioned in the column bname. |
| **height** | Field height (mm).    |
| **width**  | Field width (mm) both caption and value both width defined overall ex: if 200 then caption and value in the 200 width.     |


### 📌 Field Content
| Field         | Meaning                         |
| ------------- | ------------------------------- |
|**repcode**|This repcode column most important to unique identity report code | 
|**section**|This section column also important to define in which section mentioned the design and the value show in that particular section and the section name First defined in the table sabrep_topleft_box in section column.| 
| **colname**   | View colname and sabrep_topleft.colname must match value for designing then only connected to there alignment location font  name.           |
| **caption**   | Printed label befor Value.                  |
| **lcaption**  | Location of caption which X axis
| **symbol**    | ₹, $, or special in between caption and text value.         |
| **formating** | Number format (###,##0.00 etc.) |
| **align**     | Font alignment : left / center / right.          |




### 📌 Font
| Field        | Meaning               |
| ------------ | --------------------- |
| **bold**     | 1 = bold, 0 = normal. |
| **fontsize** | Font size.            |
| **fontname** | Font family.          |

### 📌 Grouping / Totals
| Field             | Meaning                 |
| ----------------- | ----------------------- |
| **total**         | Total type (sum/count). |
| **groupname**     | Group header name.      |
| **footerformula** | Formula at footer.      |
| **cellformula**   | Formula per cell.       |


### 📌 Keys
| Field        | Meaning                    |
| ------------ | -------------------------- |
| **sabid**    | FK → sabtopleft_report_up. |
| **sabrowid** | Unique row ID.             |
| **rowid**    | Running row ID.            |


---------------------------------------------------
## 🟦 3. TABLE — sabrep_topleft_Box
**Purpose**: This table defines SabReport Sections such as:
####	[sabrep_topleft_Box]: Purpose to insert Section structure in report and used in Form Report designing  section format.
Note: This table is used for a section location and size width and height mentioned.    
``` sql
CREATE TABLE [dbo].[sabrep_topleft_Box](
	[repcode] [nvarchar](20) NULL,
	[section] [nvarchar](100) NULL,
	[height] [int] NULL,
	[width] [int] NULL,
	[landscape] [nvarchar](1) NULL,
	[iconurl] [nvarchar](150) NULL,
	[iconurlh] [int] NULL,
	[iconurlw] [int] NULL,
	[line_left] [nvarchar](1) NULL,
	[line_bottom] [nvarchar](1) NULL,
	[pageno] [nvarchar](10) NULL,
	[ttop] [int] NULL,
	[tleft] [int] NULL,
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sabid] [bigint] NOT NULL,
	[comp] [int] NULL,
	[ycode] [int] NULL,
	[division] [int] NULL,
	[type] [int] NULL,
	[sabuser] [bigint] NULL,
	[pid] [int] NULL,
	[sno] [int] NULL,
	[sabrowid] [bigint] NOT NULL,
	[rowid] [bigint] NULL,
	[udate] [smalldatetime] NULL,
	[amttoword] [nvarchar](1) NULL,
	[colcount] [int] NULL,
	[accrossdown] [nvarchar](20) NULL,
	[lcaption] [nvarchar](100) NULL,
	[caption] [nvarchar](100) NULL,
	[line_top] [nvarchar](2) NULL,
	[line_right] [nvarchar](2) NULL,
	[line_height] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[sabrowid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[sabrep_topleft_Box]  WITH CHECK ADD  CONSTRAINT [FK_sabrep_topleft_Box] FOREIGN KEY([sabid])
REFERENCES [dbo].[sabtopleft_report_up] ([sabid])
GO

ALTER TABLE [dbo].[sabrep_topleft_Box] CHECK CONSTRAINT [FK_sabrep_topleft_Box]
GO

```
## Section Keywords & Semantics

  * report: main container / page settings (report section is mainly used for declared page size and width
		   which will be the main container for the report 
                 every component will be under in this report section.)

*  companyheader_image: logo position (ttop=0,tleft=0,width=80,height=80)

* companyheader: company name and address (width=0 → stretch full page) (this section used for view the image in the 
                companyheader section on top left side corner and the location
                mentioned  ttop=0,tleft=0,width=80,height=80
                so in the left top corner will be seen the output.)

* pageheader: document header (EntNo, EntDt, etc.)

* details: transaction line items

* reportfooter: totals / summary (renders once at the end)

* pagefooter: page-level footer (appears on each page)
   *   This section appears at the bottom of every page in a report — specifically,on the last line (footer area) of each page.
   * It is used to display information that should repeat on all pages, such as:
     * 	Page numbers (e.g., Page 1 of 10)
     * Date and time of printing
     * Report title or company name
     * Confidentiality note or signature line

**Note Important: sabrep_topleft.colname values must match the column names returned by the corresponding
  sabrep_?section)_?regcode) view. This is how the engine binds design → data.** 
## Views: naming and mandatory columns
* Each section must have a view with the naming pattern:
* sabrep_?section)_?regcode) : e.g. sabrep_companyheader_chlf.
* Mandatory columns per view:
  * sabrep_companyheader_*: colname, bname, comp
  * sabrep_pageheader_*: sabid, colname, bname
  * sabrep_details_*: sabid, plus line item columns (e.g., sno, party, permit)
  * sabrep_reportfooter_*: tag, subreptable (subreptable identifies a view to execute, can be text or grid)
  * sabrep_pagefooter_*: tag, subreptable, tabletag**
  * View example (company header):
``` sql  
  CREATE VIEW sabrep_companyheader_?regcode) AS
SELECT 'compname' colname, 'Transport Pass' bname, pid a.comp
FROM sabcompany a 
UNION ALL
SELECT 'compadr', 'Collector Palghar (Supply Dept)' bname, a.pid
FROM sabcompany a
UNION ALL
SELECT 'line1','line',a.pid FROM sabcompany a 
UNION ALL
SELECT 'heading','!heading' bname,a.pid FROM sabcompany a

``` 
**Mandatory columns in these views:  colname, bname, comp (where applicable).** 

***Special keywords (colname / bname)***
* Heading — printed as section heading
* line — draw horizontal line
* vline — draw vertical line
These reserved keywords produce graphics/layout behavior rather than textual data.

             
**Note:Always must match when insert/update in sabrep_topleft table in that column colname value must match with the view sabrep_????????? In that column colname then
only design setup.
Sabrep_topleft.colname=viewname.colname** 

### section List below 
1) **Report**: This section Defines The Page Requirement:

**column wise explaination below:**
* repcode: repcode of the report which is unique for each report.
* section: report section for the page.
* ttop   : top left corner start
* tleft  : page left side start
* height : page height of the report
* width  : page width of the report
* Landscape:(Y/N) page format landscape or not
* pageno: down-Pageno option show below of the page in bottom or up above of the page on top in the company_header section.
  
2) **Report_line**: This section Defines The Page Line Requirement:

**column wise explaination below:**
* repcode: repcode of the report
* section: report_line section for the page.
* ttop   : top left corner start
* tleft  : page left side start
* height : page line height of the report (100) values means from top to bottom.
* width  : page line width of the report

1) **companyheader**: This section Defines in the Page Top container declared
   companyheader in which we mentioned company details if they required in report:
   view name: sabrep_companyheader_?regcode)
   Note: ?regcode) means its dyanmic repcode that particular report which is mentioned in the sdl File repcode=xyz.so its mean (sabrep_companyheader_xyz)
``` sql  
  CREATE VIEW sabrep_companyheader_chlf AS
SELECT 'compname' colname, 'Transport Pass' bname, a.pid comp
FROM sabcompany a 
UNION ALL
SELECT 'compadr', 'Collector Palghar (Supply Dept)' bname, a.pid
FROM sabcompany a
UNION ALL
SELECT 'line1','line',a.pid FROM sabcompany a 
UNION ALL
SELECT 'heading','!heading' bname,a.pid FROM sabcompany a
``` 
### Mendatory column in this view is:colname ,bname,comp
  * a)colname:used for understand what kind of data for a developer understand also usedcase for connectivity design alignment location in the table sabrep_topleft.
Note:Later will explain
  * b)bname: this bname value will be seen as a output in the Report.
 * c)comp:connectivity in report which record want to show at a time.
  
  **A1)!Heading: This is key will be used in the section for Dynamic store that Heading.**

  **A2)line: This keyword is reserved in the software for used case make a line in Horizontal Format.**
   
   **A3)vline: This keyword is reserved in the software for used case make a line in Vertical  Format.**

**sabrep_topleft table column wise explaination below:**
* repcode: repcode of the report
* section: companyheader section for the top page show the company details.
* ttop   : top left corner start
* tleft  : page left side start
* height : height of the container report 
* width  : width of the container report
  
2) **pageheader**: This section Defines in the Page Top container declared
   pageheader in which we mentioned debtor party  details and invoice no and date if they required in report:
 view name: sabrep_pageheader_?regcode)
   Note: ?regcode) means its dyanmic repcode that particular report which is mentioned in the sdl File repcode=xyz.so its mean (sabrep_companyheader_xyz)
``` sql 
CREATE  view sabrep_pageheader_chlf as             
select 'Entno' colname,a.sabid,a.entno bname from tablename a             
union all            
select 'Entdt' ,a.sabid,convert(nvarchar,a.entdt,110)bname from tablename a             
union all            
select 'LINE1 ',a.sabid,'line' bname from tablename a         
   ```
### Mendatory column in this view is:colname ,bname,sabid
  * a)colname:used for understand what kind of data for a developer understand also usedcase for connectivity design alignment location in the table sabrep_topleft.
Note:Later will explain
  * b)bname: this bname value will be seen as a output in the Report.
 * c)sabid:connectivity in report which record want to show at a time.

**column wise explaination below:**
* repcode: repcode of the report
* section: pageheader section for the top page show the party or coustomer details.
* ttop   : top left corner start
* tleft  : page left side start
* height : height of the container report 
* width  : width of the container report
* line_left: Container border line show in the left side
* line_right: Container border line show in the right side
* line_bottom: Container border line show in the bottom side
* line_up : Container border line show in the up side
* line_height: Container border height show in the top and bottom side and width for left and right side all four side line effect there size.
* caption: caption show for value label
* colname: colname exact same in the mentioned of view sabrep_pageheader_?regcode). its dynamic regcode which report is mentioned.

3) **details**: This section Defines in the Page mid container declared
   * This view represents the DETAILS SECTION of your report.
In ERP reporting, the Details section is where all line-items or transaction rows appear.
   * This view supplies the exact data the report engine will repeat for every row in the “details” grid.
   *  Why this View Exists? (Core Purpose)
       ##
	    ```
		*  sabrep_details_chlf is a data provider for the DETAILS section of the report with regcode = chlf
        *  Your report engine follows a strict rule:
        *  For every section in a report, a view must exist whose name is: sabrep_?section)_?regcode)
        *  So for:
        * Section: details
		* Repcode: chlf
		* The engine automatically expects this view:		=> sabrep_details_chlf
		➤ This view provides ALL the transaction rows that the “Details” part of the report should print.
``` sql 
CREATE VIEW sabrep_details_chlf AS
SELECT  
    a.sabid,
    a.sno,
    asab9_a.person AS party,
    asab9_a.pdukanno,
    a.permit
FROM bsab_trkchl_mid a 
LEFT JOIN asab9 AS asab9_a ON a.party = asab9_a.pid;
   ```
### Mendatory column in this view is:colname ,bname,sabid
  * a) colname:used for understand what kind of data for a developer understand also usedcase for connectivity design alignment location in the table sabrep_topleft.
Note:Later will explain
  * b) bname: this bname value will be seen as a output in the Report.
 * c) sabid:connectivity in report which record want to show at a time
    * (sabid is the master key that tells your report engine which specific record is being printed.).
  * Your engine always passes something like:
  ```sql
  WHERE sabid = ?sabid)
  ```
***Note : ?columnname) it means current form any column values passed from that current open form.
So only the rows belonging to this specific report entry print.***

**sabrep_topleft table=>column wise explaination below:**
* repcode: repcode of the report
* section: pageheader section for the top page show the party or coustomer details.
* ttop   : not work in details
* tleft  : nor work in details
* height : height of the cell 
* width  : width of the cell 
* line_left: not work in details
* line_right: not work in details
* line_bottom: not work in details
* line_up : not work in details
* line_height: not work in details
* caption: not work in details
* colname: colname exact same in the mentioned of view sabrep_details_?Repcode). its dynamic regcode which report is mentioned.  
```sql When Does the View Execute? (Runtime Flow)
When user clicks PRINT REPORT:

1) Report engine loads sabtopleft_report_up → gets sabid

2) Engine loads section metadata from:

  * sabrep_topleft

  * sabrep_topleft_Box

3) Then it finds this view:

  * sabrep_details_chlf

4) Engine executes:

➤ SELECT * FROM sabrep_details_chlf WHERE sabid = ?sabid)

5) For each row returned → engine prints one detail row
   ➤ If 10 rows returned → 10 lines print in the Details Section
   ➤ If 0 rows returned → Details section prints empty

6) Why Only These Columns?

Because these are the columns your report design refers to.

In sabrep_topleft, you will have rows like:
| section | colname  | caption  |
| ------- | -------- | -------- |
| details | sno      | Sr.No    |
| details | party    | Party    |
| details | pdukanno | Dukan No |
| details | permit   | Permit   |

Meaning:

Whatever colname is used in design must exist in this view

If design has a column missing from this view → report shows blank
```

