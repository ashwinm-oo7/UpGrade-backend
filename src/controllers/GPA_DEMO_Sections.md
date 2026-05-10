## Page 1
## Erp software which is represnt technology to provide user fast integrate billing and stock data format and any transaction related data to be store and any time access easily also if any exist data in the millions of records so we can search and see the data.

## Erp software format suppose some data are majorly used example city,state,country,delivery address ,party name for creditors and debtors,bank name,account number,Account Holder Name,Register Name,type ,category. this kind of data which will be reusable so this data will be used in transaction form and some times in master forms in particular column and during save time will be save pid value instead of bname column value,bname column value will be visible to see only and save pid value.
- But there is a property of saveFld which is true then only it will save pid value instead of bname value.
- If saveFld property value will be False then they saved bname value instead of pid value and make sure this time you have to sure datatype will be nvarchar because in the bname column value is nvarchar data pid have a int value datatype.
- Also bydefault saveon property value is true so that why its saved the value whatever format but saveon will be false then they dont save any value because backend checked during save validation saveon property value.

### ERP Documentation: Master Forms and Help Integration in Transaction Forms

When a user clicks on any text box and presses F3, a help window opens displaying the properties of the specific column.
---

## Page 2

### Overview

This ERP system is specifically designed for the textile industry, incorporating various modules, including:

Master

Transactional

Company

Inventory

Report

Utility

Production

Store Modules

This document explains the architecture of Master Forms (FormType = M) and their interaction with Transactional Forms (FormType = T) using a centralized help mechanism. This mechanism is based on a central form table and various master tables.


## Form Table
# ERP Master Forms Reference

This document provides a comprehensive reference for **Master Forms** used in the ERP system tailored for the **textile industry**. Each form represents a key data entity and connects with transactional forms for real-time operations and data flow.

## 📘 Purpose

To outline the Master Tables and their respective functions within the ERP ecosystem. These master entries serve as the backbone for various modules such as Sales, Inventory, Production, Reports, and Utilities.

---

## 🧾 Master Table Mapping

| **Master Name**            | **Table Name**     | **Purpose / Description**                       | **Type Code** |
|---------------------------|--------------------|--------------------------------------------------|---------------|
| Account Master            | `asab9`            | Party or ledger account name                    | 118           |
| Transport Master          | `asab9`            | Transport company name                          | 117           |
| Broker Master             | `asab9`            | Broker or agent name                            | 116           |
| Cash Account Master       | `asab9`            | Cash A/C ledger                                  | 119           |
| Salesman Master           | `asab9`            | Sales representative name                        | Custom        |
| State Master              | `asab23`           | State name                                       |               |
| City Master               | `asab26`           | City or town name                                |               |
| District Master           | `asab20`           | District name                                    |               |
| Country Master            | `asab24`           | Country name                                     |               |
| Godown Master             | `asab33`           | Warehouse/Godown name                            |               |
| Product Group Master      | `asab3`            | Product categorization group                     |               |
| Design Master             | `asab5`            | Design code                                      |               |
| Shade Master              | `asab51`           | Shade number                                     |               |
| Quality Master            | `asab15`           | Fabric or yarn quality name                      |               |
| Rack Master               | `ASAB_RACK`        | Rack or shelf identifier                         |               |
| Unit Master               | `asab_unit`        | Measurement unit (e.g., meter, kg)              |               |
| Narration Master          | `asab22`           | Short description for transactions               |               |
| Courier Master            | `asab9`            | Courier company name                             | Custom        |
| Job Type Master           | `asab_jobtype`     | Types of jobwork                                 |               |
| Tax Master                | `asab14`           | Tax name (e.g., CGST, SGST)                      |               |
| HSN Rate Master           | `asab_hsn_up`      | HSN code with applicable tax rates               |               |
| Yarn Type Master          | `asab4_yarn`       | Yarn type                                        |               |
| Yarn Shade Master         | `asab51_yarn`      | Yarn color or shade                              |               |
| Blend Master              | `asab_blendmst`    | Fabric blend information                         |               |
| Count Master              | `asab_count`       | Yarn count or thickness                          |               |
| Port Master               | `asab61`           | Shipping port name                               |               |
| Machine No Master         | `Asab57`           | Machine ID or number                             |               |
| Size Master               | `asab_Size`        | Product size specification                       |               |
| Weave Master              | `asab_weave`       | Type of fabric weave                             |               |
| Dyeing Type Master        | `asab_dyeingtype`  | Type of dyeing process                           |               |
| Currency Master           | `asab63`           | Currency name or code                            |               |
| Term Condition Master     | `Asab24_Term`      | Sales/purchase terms                             |               |
| Design Card Entry         | `asab60`           | Job-specific design details                      |               |
| Envelop Courier Master    | `asab9_courier`    | Courier envelope options                         |               |

---

## 🛠️ Integration Notes

- All master forms are registered in the `saberpmenu` table with a unique `regcode`.
- Use `FormType = 'M'` for Master forms, `'T'` for Transaction forms, and `'R'` for Report forms.
- The `tablename` column distinguishes between forms and menu items.
- Nested menus are managed using the `Parentmenu` field, allowing hierarchical menu structures.
- Each new form is assigned a unique `pid`, generated using a sequence mechanism.
- Pressing the **F3** key on a field opens a help popup displaying selectable entries from the related master table.
- In saberpmenu table have a column :
- * bname :This column is used for Form Name which shown in the top of form which is unique
- * Tablename : This column will be used for main table of form 
- * Formtype : this column is used for type of form which master,transaction, etc.
- * active : this column is used for this form will be active or not like it will be visible form or not and this column cntltype always checkbox in sabtopleft 
- parentid : this column decide this form in which menu or sabmenu nested structure.
- Regcode : this will regcode of form and this will be unique.
* Note : If the Tablename column value is null or empty then software will be understand this data will be menu or sabmenu depends parentid value data if tablevalue is not empty then it will understand this data will be form and the tablename column value will be main table of form and this pid will be generate here in saberpmenu table which will be type of form and the value store in maintable column type and datatype int it will automatically do software. 

---

## 💡 Usage in Forms

When a user selects any input field and presses **F3**, a contextual help window appears, listing all valid values from the corresponding master table. This feature simplifies data entry and ensures consistency throughout the ERP system.

---


## 📁 Table Storage

All referenced tables (asab*, saberpmenu, etc.) are stored in Microsoft SQL Server. Ensure proper indexing and define foreign key relationships for optimal query performance and data integrity.


---

## 🧩 Future Enhancements

- Implement user access control to manage form visibility based on roles.

- Introduce version control for master data to track historical changes.

- Enable logging of master data modifications for audit and compliance purposes.


---

- 📢 For technical implementation using Node.js or any other backend stack, contact the development team or refer to the Backend API Documentation.



### 📝 Creating Forms – Step-by-Step Guide
- Open the Form Registration Editor
Navigate to the top-left File Menu, click on Registration, and open the Form Registration Editor to begin creating a new form.

- Set the Menu Name
Fill in the MenuName field. This value will be displayed as the form name in the application header.

- Select the Parent Menu
Use the Parentmenu field to select a parent item from the existing records. This determines under which main or sub-menu (nested structure) your form will appear.

- Specify the Table Name
Enter the table name in the tablename field. This identifies the form as an actual data form (not just a menu or sub-menu).
## - ⚠️ Note: A non-empty tablename signifies this is a form, not just a menu placeholder. This field maps to backend logic and links with the sabtable and saberpmenu tables.

- Enter a Unique Regcode
Provide a unique regcode which acts as the form’s menu code in the saberpmenu table.

- Set the Form Type
Choose a FormType from the available options:

M – Master Form

T – Transaction Form

R – Report Form

- Activate the Form
Ensure the Active checkbox is selected. If not selected, the form will remain hidden and will not appear in the front end. This flag is handled via the backend.

- Save the Form
Click the Save button. A unique pid will be generated using a sequence, which is then stored in the FormType field of the saberpmenu table and linked as the type column in the main form table.


- This menuRegistation Form main Table is Saberpmenu and every time creating a form it will generate Pid and this Pid will be type of Form
  
### Note 
### * To see All The Form in the Software
```sql
Select * from saberpmenu
```
- In this Table you will see MenuName,pid,TableName,regType etc.
  
### 1. Master Forms (`FormType = M`)

Master forms are used to store reference or configuration data that is reusable across other modules. Each master form is uniquely identified by a `type` code and stores data in specific tables, most notably the shared table `asab9`.

### 1.1 Table Structure: `asab9`

The `asab9` table acts as a generalized storage for many different master forms. It includes the following important columns:

- **Pid (Primary ID)**:
    - Auto-generated sequential number.
    - Uniquely identifies each row.

- **bname (Business Name)**:
    - Stores the value or name of the master item.
    - Used in lookup or help functionality.

- **type**:
    - Distinguishes different master forms sharing the same table.
    - Acts as a filter for retrieving specific master records.

### 1.2 Examples of Master Forms in `asab9`

| Type Code | Master Form Name    |
|-----------|---------------------|
| 118       | Account Master      |
| 117       | Transport Master    |
| 116       | Broker Master       |
| 119       | Cash Account Master |
| Custom    | Salesman Master     |
| Custom    | Courier Master      |

---

## Page 3

### 2. Transaction Forms (`FormType = T`)

Transaction forms are used for day-to-day operations like production, purchases, sales, etc. These forms often require references to master data, which is implemented through the help functionality.

### 2.1 Help Feature

Help is a mechanism that allows the user to select or reference master data (such as Account, Transport, Broker, etc.) from within a transaction form.

### 2.2 How Help Works

When the user needs to select an Account or other master data in a transaction form:

1. The ERP executes a query on the `asab9` table.
2. It filters records using the `type` code to return only the relevant master entries.

**Example Query**:

```sql
SELECT Pid, bname FROM asab9 WHERE type = 118
```
 
## Page 3

This fetches all Account Master entries.

### 2.3 Practical Flow

1. User opens a Transaction form.
2. Clicks on a Help icon or field.
3. ERP runs the query on `asab9` (or other relevant master table).
4. Displays a popup or dropdown with available values.
5. User selects an option.
6. The selected value (`Pid` and `bname`) is saved into the transaction record.

---

## Page 4

### 3. Master Table Reference List with `bname`

This section explains the purpose of each `bname` field in the respective tables.

| Master Name         | Table Name   | `bname` Purpose                        | Type Code (if `asab9`) |
|---------------------|--------------|----------------------------------------|------------------------|
| Account Master      | `asab9`      | Party or ledger account name           | 118                    |
| Transport Master    | `asab9`      | Transport company name                 | 117                    |
| Broker Master       | `asab9`      | Broker or agent name                   | 116                    |
| Cash Account Master | `asab9`      | Cash A/C ledger                        | 119                    |
| Salesman Master     | `asab9`      | Sales representative name              | Custom                 |
| State Master        | `asab23`     | State name                             | -                      |
| City Master         | `asab26`     | City or town name                      | -                      |
| District Master     | `asab20`     | District name                          | -                      |
| Country Master      | `asab24`     | Country name                           | -                      |
| Warehouse Master    | `asab33`     | Warehouse/Go down name                 | -                      |
| Product Group Master| `asab3`      | Group name for categorizing products   | -                      |
| Design Master       | `asab5`      | Design code or name                    | -                      |
| Shade Master        | `asab51`     | Shade number or description            | -                      |
| Quality Master      | `asab15`     | Factory or quality name                | -                      |
| Rack Master         | `ASAB_RACK`  | Rack or shelf identifier               | -                      |
| Unit Master         | `asab_unit`  | Measurement unit (e.g., meter, kg)     | -                      |
| Narration Master    | `asab22`     | Short description for transactions     | -                      |
| Courier Master      | `asab9`      | Courier company name                   | Custom                 |
| Job Type Master     | `asab_jobtype`| Types of jobs or job work categories   | -                      |
| Tax Master          | `asab14`     | Tax name (CGST, SGST, etc.)            | -                      |
| HSN Rate Master     | `asab_hsn_up`| HSN code with applicable tax rates     | -                      |
| Yarn Type Master    | `asab4_yarn` | Type of yarn used                      | -                      |
| Yarn Shade Master   | `asab51_yarn`| Yarn color code or shade               | -                      |
| Blend Master        | `asab_blendmst`| Fabric blend information               | -                      |
| Count Master        | `asab_count` | Yarn count or thickness                | -                      |
| Port Master         | `asab61`     | Shipping port name                     | -                      |

 


## Page 5

### Master Table Reference List with `bname`

| Master Name             | Table Name  | `bname` Purpose                             | Type Code (if `asab9`) |
|-------------------------|-------------|---------------------------------------------|------------------------|
| Machine No Master       | `Asab57`    | Machine ID or number                        | -                      |
| Size Master             | `asab_Size` | Size specification for products             | -                      |
| Weave Master            | `asab_weave`| Type of fabric weave                        | -                      |
| Dyeing Type Master      | `asab_dyeingtype` | Type of dyeing process                  | -                      |
| Currency Master         | `asab63`    | Currency name or code                       | -                      |
| Term Condition Master   | `Asab24_Term` | Sales/purchase terms                      | -                      |
| Design Card Entry       | `asab60`    | Job-specific design details                 | -                      |
| Envelope Courier Master | `asab9_courier` | Courier envelope options                  | -                      |

---

### 4. Creating Custom Labels and Input Fields using `sabtopleft`

In ERP, if a user wants to create a custom **Link Label** or **Sab Text** (input box) in any form, the configuration is done by inserting records into the `sabtopleft` table. Users can copy configuration from any existing form.

### 4.1 Steps to Create:

1. Open an existing form where the control exists.
2. Click on the Label or Input Box.
3. Press **Ctrl + C** to copy the control configuration query.

### 4.2 Example Insert Queries

For Input Box(Sab Text):
const sqlExample = `
```sql
INSERT INTO sabtopleft 
(BCODE, ttop, tleft, Color, Fontsize, Height, WIDTH, VISIBLE, Ronly, ALIGN, cntltype, TableName, TextLength, Mask, sabuser, sno, comp, ycode, CanNotEmpty, Validate, Carryon, SaveFld, tabind, sabdivision, superuser, division, aftersavereadonly, REGTYPE, FORMTYPE, cloudid, subtype, PID, TYPE)
VALUES 
('PARTY','100','75','Red','8','22','250','True','False','Left','SabText','ASAB9','32767','None','0','133','1','1516','False','True','N','True','4','0','0','10','False','0','0','20900182','277',123,'wjo');
``` 


## Page 6

For Label (LinkLabel):
 ```sql
INSERT INTO sabtopleft 
(BCODE, ttop, tleft, Color, Fontsize, Height, WIDTH, bname, FORMAT, VISIBLE, Ronly, cntltype, TextLength, Mask, sabuser, sno, comp, ycode, CanNotEmpty, Validate, SaveFld, tabind, sabdivision, superuser, division, aftersavereadonly, REGTYPE, FORMTYPE, cloudid, subtype, PID, TYPE)
VALUES 
('LPARTY','100','5','Black','8','22','85','Party','0','True','False','LinkLabel','0','None','0','136','1','1516','False','False','True','113','0','0','10','False','0','0','20900182','277',123,'wjo');
 ```
 
Replace 123 with the PID of the form you are adding to, and wjo with its corresponding TYPE (menu code).
 
---------------------- -------------- ---------------------- -------------- ---------------------- -------------- -----------------
----- ----
 
# 5. GRID Creation
- Grid  is created using `sabtopleft` table with `cntltype = SumSabGrid`.
- Grid structure and columns are defined in `SabGridDtl` with the `GridName` matching the `BCODE` in `sabtopleft`.

### Grid Definition

```sql
INSERT INTO sabtopleft (..., cntltype, TableName, ..., PID, TYPE)
VALUES (..., 'SumSabGrid', 'wjo_BSAB50_po', ..., ZPID, 'ZTYPE');

INSERT INTO sabtopleft 
(BCODE, ttop, tleft, Color, Fontsize, Height, WIDTH, bname, FORMAT, VISIBLE, Ronly, cntltype, TableName,TextLength, Mask, sabuser, sno, comp, ycode, CanNotEmpty, Validate, SaveFld, tabind, sabdivision, superuser, division, aftersavereadonly, REGTYPE, FORMTYPE, cloudid, subtype, PID, TYPE)
VALUES 
('','100','5','Black','8','22','85','','0','True','False','SumSabGrid','TableName','0','None','0','136','1','1516','False','False','True','113','0','0','10','False','0','0','20900182','277',ZPID,'ZType');
```
 -  changed PID value which is form type
 - Make sure cntltype='SumSabGrid'
 - Type will be form menucode
 - tableName will be which is requirement its up to Form data
  
### Grid Column
```sql
INSERT INTO SabGridDtl (..., GridName, colname, TableName, ..., PID, TYPE)
VALUES (..., 'BSAB50GRD', 'brand', 'asab15', ..., ZPID, 'ZTYPE');
```
### colname in SabGridDtl refers to the actual database column.
- •	TableName in both tables tells where data comes from or links to.
- •	sabtable (e.g., asab15) is used for help popups to allow user to select PIDs, but system displays     bname while storing only Pid.
- •	System handles joins and help windows automatically.

### 5.1 Common Columns Requiring SabTable Help
- Many columns use integer PIDs and support help selection from sabtables (e.g., asab15, asab9, etc.). Examples include:
- •	debit, menureg, Party, refrowid, reg
- •	godown, milllotno, MILLNAME, prodid, shade, dsnoid, Unit
- •	hsn, gradeid, retailer, size, Color, loom, pipeno, prgno
- •	Bleach, chltype, biltype, yarn_count, ordersno, handloom
- •	Addless, CalcOn, taxid, acid, STATUS, paytype, brand
- •	ind, machine, Sampletype, shadeID, width, Certificate_Name
- •	selvage, mono_yn, typ, sauda, cnt_yn, delat, dis_div
- These are typically of type int and backed by sabtables with selectable bname values and stored Pids.

----------------------------------------------------------------------------------------------------------------------------------
Great! Here's a fully elaborated addition to the documentation that explains how the software handles saving form and grid data in the backend using sabtopleft, sabgriddtl, and saberpmenu tables. I've kept it structured and detailed to match the rest of your ERP documentation:

## 5. Data Saving Mechanism in Master & Transaction Forms
When a user fills out a form and clicks on the Save button, the ERP automatically generates SQL INSERT or UPDATE statements in the backend. This operation is dynamically handled based on configuration from tables such as sabtopleft, sabgriddtl, and saberpmenu.
________________________________________
### 5.1 Main Table Determination (saberpmenu)
Each form is defined in the saberpmenu table, and one of its key columns is TableName, which indicates the main table for storing form data.
•	Example:
If a form has a MenuCode = WJO and in saberpmenu the TableName = asab5, then asab5 is considered the main table where the form's data will be saved.
________________________________________
### 5.2 Input Controls (SabText, LinkLabel, etc.)
- All the form input fields are defined in the sabtopleft table, where each control has a BCODE. This BCODE corresponds directly to the column name in the main table.
- •	Controls with cntltype = 'SabText' or 'LinkLabel' are treated as input fields.
- •	The backend scans for all sabtopleft rows where:
- o	cntltype = SabText or LinkLabel
- o	SaveFld = 'True'
Insert Operation Example:
Suppose your form has:
|BCODE|	SaveFld	| cntltype
|party |	True	|SabText
|shade|	True|	SabText
|hsn	|True	|SabText
And the main table is asab5. The backend generates:
```sql
INSERT INTO asab5 (party, shade, hsn) VALUES (123, 45, 9965)
```
- Note: Values like party, shade, hsn are typically PIDs referencing their respective master tables. On-screen, bname is shown via automatic joins.


### 5.3 Grid Controls (SumSabGrid)
Grids are defined using cntltype = 'SumSabGrid' in the sabtopleft table. The following applies:
-	Grid Table is determined by the TableName in the grid's sabtopleft entry (e.g., bsab42)
-	Grid Columns are defined in the sabgriddtl table, where:
-	GridName matches the BCODE of the grid
-	colname represents the actual field in the grid table
-	SaveFld = 'True' indicates which columns should be saved
### Grid Insert Operation Example:
- If the grid BSAB50GRD has the following columns in sabgriddtl:
colname	SaveFld
prodid	True
shade	True
And TableName = bsab42, the backend will do:
```sql 
INSERT INTO bsab42 (prodid, shade) VALUES (12, 76)
```
Like the form fields, these values are also generally PIDs pointing to master tables and shown as bname in the UI using LEFT JOIN logic.

### In Grid LoadSQL is compulsory
#### New ERP Software
- LoadSql: LoadSQL is Generated by backend Technology it will generate automatic by used bcode of sabgriddtl table which particular Grid also if particular column have a sabtable value then it will automatically join but if you want to coustom so make LoadSQL sections
- Coustom LoadSQL : Criteria of filter also you have to mentioned key in sections of LOADSQL which 'autosql=N' then it will not access automatic LOadSQL it will acsess coustom LoadSQL sections.
- But always remember LoadSQL will compulsory mentioned in the Grid.  
- In LoadSql when we used where clause 'Where maintable.sabid=?sabid) it means Grid table which is main table of Loadsql section Query'.
- example : suppose Grid table have a bsab40 which will be main table of Grid and this table will be Loadsql section Query
- This is just example code : 
- ```sql
   select a.prodid,a.dsnoid,a.shade,a.qty,a.rate,a.amount,a.sno,a.sabrowid from bsab40 a
    ```
  and some time some column will take the help. help means it will take help from another table like prodid,dsnoid,shade this three column take the help of asab15,asab5,asab30 respectively then the query will be with joining example
     ```sql 
	 select a.prodid prodid,b.bname prodid,a.dsnoid dsnoidid,c.bname dsnoid,a.shade shadeid,d.bname shadeid,a.qty,a.rate,a.amount,a.sno,a.sabrowid from bsab40 a 
	 left join asab15 b on a.proid=b.pid
	 left join asab5 c on a.dsnoid=c.pid
	 left join asab51 d on a.shade=d.pid
	 where a.sabid=?sabid)
	 
	 ```
- If you see i have taken the alias of a.prodid prodid,b.bname prodid because a.prodid store the pid value of asab15 table like in which column we take the help in that we store the pid so its means that column id value so i have taken in last columnnameid,and in the bname column value which columnname which is in grid columnname exact so suppose which is proid is column in grid so we take the naming of bname column alias that same name and the pid column which a.prodid will be prodidid. system will get understood which column have pid column have it that why we do this format.
- bsab40 its a main table of Grid in which we create in sabtopleft table and cntltype column which value is sumsabgrid that why this is Grid in that TableName column value will be something there so that value will be main table of Grid.
   
### 5.4 Auto Join and Display Logic
  For fields such as party, prodid, shade,pprodid,pdsnoid etc. that store PID:
-	The system performs an automatic LEFT JOIN with the related master table.
-	It fetches and displays the bname field (from the master table) in the UI.
-	This enables users to see readable names instead of ID.
#### Example Join Logic:
```sql
SELECT A.party, B.bname as party_name
FROM asab5 A
LEFT JOIN asab9 B ON A.party = B.Pid AND B.type = 118
SELECT A.party, B.bname as party_name
FROM asab5 A
LEFT JOIN asab9 B ON A.party = B.Pid AND B.type = 118
```
### 5.5 Fixed/Common Columns
Some forms include common fields that also follow this logic:
-	Common Field Examples:
-	party, prodid, shade, hsn, unit, acno, refrowid, debit, dsnoid, gradeid, milllotno, status, etc.

All these fields store PIDs as INT values and fetch names via their associated sabtable using LEFT JOINs.

### 5.6 Save Condition Summary
- Control Type	Save Condition	Saved In	Value Stored
- SabText	SaveFld = True	Main Table	PID / Text
- LinkLabel	SaveFld = True	Main Table	Static text
- SumSabGrid	SaveFld = True	Grid Table	PID / Value




### Benefits of This Architecture
-	Centralized Data: Using asab9 for multiple masters simplifies maintenance.
-	Flexibility: Easily add new masters by assigning a new type value.
-	Efficiency: Helps reduce redundant tables and improves data consistency.
-	User-Friendly: Quick lookup via Help makes data entry efficient and error-free.
________________________________________
### Appendix: Full Master List with Table Names
(Refer to your attached master table mappings for detailed reference.)
________________________________________

# GPA Sections
## 1)Help:
```sql
Len=2
Sql= select a.bname Cntl,a.pid as Cntlid from asab2 a
Whr=where a.active=1 and   (isnull(a.allcomp,0)=0 or isnull(a.allcomp,0)=!compcode )  AND a.type=102
Ord=order by a.bname
Cols=1
Col1=Cntl=Cntl
```
Query Configuration Structure
Each query is configured using the following keys:
1.	Len
-	Description: In the textbox you can write upto 2 character so when enter 
-  User will get the suggestion whatever they search related to that two characters
o	Example: Len = 2 (This means user mu in the input box of city column then they get the value mu related suggestion like Mumbai or something else.)
2.	Sql (SQL Clause)
-	Description: Contains the main SQL SELECT statement, including the fields to be retrieved and the primary table.
-	Note:
While the Sql key can include the entire SQL query (with SELECT, WHERE, ORDER BY), long or complex queries can be simplified by using the Whr and Ord keys separately. This modular approach makes the query management more efficient and easier to maintain.
3. Whr (WHERE Clause)
-	Description: Defines the conditions that filter the data. This key is used when you want to write the WHERE clause separately from the main SQL query.
4. Ord (ORDER BY Clause)
-	Description: Specifies how the result set should be sorted. This key is used when you want to write the ORDER BY clause separately from the main SQL query.
1. Cols (Column Mapping Configuration)
•	Description: Defines the mapping between the database columns and the display columns in the application interface.


- Cols = 1
Col1 = Cntl = Cntl
Explanation:
Cntl (Left Side): The display name of the column in the UI.
Cntl (Right Side): The actual field name from the SQL query (a.pid in this case).

### Explanation:
- Fetches  bname as Cntl and pid as Cntlid from the asab2 table.
Filters active records with specific conditions (Whr).
Orders the result by bname (Ord).
Displays Cntl in the UI, which maps to the Cntl field in the query.

### key Points
-	Flexible Query Management:
-	For short queries, you can write the entire SQL in the Sql key.
-	For complex queries, use the Whr and Ord keys to separate the logic, making the query easier to read, manage, and maintain.
-	Dynamic Generation: This approach allows for easy modification without changing the core codebase.
-	Error Handling: Ensure proper validation of the Whr and Ord clauses to avoid SQL injection risks.
-	Performance Considerations: For complex queries, consider optimizing indexes in the MSSQL database.
## 2) [LoadSql] Section - Data Loading Configuration
 The [LoadSql] section is one of the most critical parts of the ini file for the grid configuration. It defines the SQL query used to load data into the grid from the specified table. This section must always be present in every grid's configuration.
### Key Points:
-	Compulsory Section: Every grid configuration file must include the [LoadSql] section.
-	Purpose: The SQL query defined here is responsible for retrieving the necessary data to populate the grid.
-	Column Mapping: Ensure that the query selects only the columns that are required by the grid. These should match the grid’s structure.
### Configuration Structure for [LoadSql]
1.	Sql (SQL Query for Data Loading):
-	Description: This key contains the SQL SELECT statement used to retrieve the data from the database and load it into the grid.
-	Important: If the grid relies on data from another table (e.g., help tables for dropdowns, additional information), those columns should be included in the query using - LEFT JOIN with the main grid table.
-	Example:
```sql
Sql = SELECT a.* FROM tablename a
```
- This selects all columns from the tablename.
- Whr (WHERE Clause for Filtering Data)

-	Description: The WHERE clause defines the conditions used to filter the data when loading it into the grid. The filtering typically involves the use of parameters passed into the query (e.g., ?sabid).
### -	Important: The condition in the WHERE clause can include dynamic values or placeholders such as ?sabid), which will be replaced during execution they take current sabid column value which is present in the form.
-	Example:Grid maintable alias will be suppose a then
Whr = WHERE a.sabid = ?sabid)
- This filters the data where the sabid column in tablename matches a provided value.
-  Ord (ORDER BY Clause for Sorting Data):
-	Description: This clause defines how the data should be ordered when it is returned from the query. It usually involves sorting based on one or more columns.
-	Example:
Ord = ORDER BY a.columnname
1. This orders the results by the columnname in tablename.
Additional Guidelines:
-	Handling Help Tables:
-	If the grid’s columns use data from another table (referred to as the “help” table), those columns should be joined in the query using a LEFT JOIN. This ensures that the required data is fetched from the help table as well.
-	Example with LEFT JOIN:
```sql
Sql = SELECT a.*, b.help_column FROM tablename a
       LEFT JOIN help_table b ON a.column = b.pid
```
- In this example:
•	The query loads all columns from tablename (a.*).
-	It also selects help_column from the help_table (b).
-	A LEFT JOIN ensures that if there is no matching record in the help_table, the result from the main table is still returned.

### Complete Example of [LoadSql] Section
- [LoadSql] this is format to write the sections
  
```sql
Sql = SELECT a.proid prodidid, b.bname proid,a.sno 
      FROM asab40 a
      LEFT JOIN asab15 b ON a.proid = b.pid
Whr = WHERE a.sabid = ?sabid)
Ord = ORDER BY a.sno
```

*	Explanation:
- ?sabid): This is used for current form current record sabid fetch it means in Grid we used in the where clause for fetching current record data sabid data fetch in the grid.
- ?cloumnName) : This is syntax current form column value fetch on current record shown in the screen,this syntax created in the software backend side.   
-	The SQL query loads all columns from tablename (a.*) and the help_column from help_table (b).
-	A LEFT JOIN ensures that data from the help_table is included even if no matching record exists.
-	The WHERE clause filters records by the sabid value.
-	The results are sorted by columnname from tablename.
________________________________________
* Key Takeaways:
-	Grid Data Loading: The [LoadSql] section is responsible for retrieving and loading the necessary data into the grid.
-	Column Selection: Ensure the SQL query only selects the columns required by the grid, including any columns from "help" tables.
-	LEFT JOIN: If any grid column is derived from another table (e.g., a help table), ensure the SQL query properly joins those tables using LEFT JOIN.
-	Dynamic Filtering: Use dynamic placeholders (e.g., ?sabid)) in the WHERE clause to filter data based on user inputs or other runtime parameters.

## 3) [Bname Leave] Section

* Overview:
  The "Bname Leave" section of your ERP software ensures that the value entered in the bname field is unique across the system. The purpose of this section is to validate that no duplicate values are stored in the bname column of the asab9_courier table. If a duplicate value is detected, the system prevents saving the data and alerts the user.
* Purpose:
 The objective of this section is to check if the value being entered in the bname field is already present in the database. If the value exists in the bname column (for any record other than the current one), the system prevents the user from saving the form and displays an error message.
Process Flow:
1.	User Input: The user enters a value into the bname field (which is an input field in the form).
2.	Backend Validation: Upon submitting the form, the system runs a query to check if the entered value in the bname field already exists in the database, excluding the current record based on the sabid.
3.	SQL Query Execution:
o	Query:
SELECT bname 
FROM asab9_courier 
WHERE bname = ?bname.text AND sabid <> ?sabid

 # * Parameters:
-	?bname.text: The value currently being entered in the bname field.
-	?sabid: The sabid (which identifies the current record being edited) is used to exclude the current record from the duplicate check.
-  Query Logic:
-	The SQL query checks for any records in the asab9_courier table where the bname matches the entered value (?bname.text) and the sabid does not match the current sabid. This prevents the system from mistakenly flagging the record the user is currently editing.

-  Duplicate Check:
-	If the query returns any records, it means that the bname value already exists in the database for a different record (i.e., a duplicate).
-	If no results are returned, it indicates that the bname value is unique, and the data can be saved.
Error Message:
-	Message ID: Msg1
-	Message Text: Duplicate Name..
-	This message is displayed when a duplicate value is detected in the bname column.

# 4) Delecheck :
```sql
Sql2 = SELECT a.pid FROM asab_repname a WHERE sabid = ?sabid
```
-	sabid → The unique ID of the record currently open on screen.
-	This query checks if the current record (sabid) exists in the asab_repname table.
-	If any rows are returned, deletion is not allowed.
If the record is referenced by another transaction (e.g., already billed):
-	Each record has a unique sabrowid.
-	Other forms/modules (e.g., invoices) may store this value in their refrowid field.
-	Before deleting, a cross-module check is performed.
```sql
SELECT * FROM billing_table WHERE refrowid = ?sabrowid
```
-  If a row exists → it means the current record is already used in billing.
-  Result → Prevent deletion
Condition	Description	Allow Deletion?
Record exists in current table (asab_repname)	Record is active and saved	❌ No
sabrowid is used as refrowid in another table	Record is referenced in another module (e.g., billing)	❌ No
No reference or dependencies	Record is not used anywhere else	✅ Yes
		
# 5) Formula Properties
- Suppose user want to calculate amount in amount column then there is a option on click f3 you will see many properties in that Formula Properties which will you to write Formula rate * qty.
- example : rate * qty means there is rate column and qty column both column value will be multiply and store in that Amount column automatically because software backend handle Formula are stored in which column so in that column example :column=FormulaValue

# 6) saveFld Properties
- there is a option True and False if True then during save time it will be stored the value which is mentioned current time and value is present also. and if the False then it will not be stored. if the value is available or not.

# 7) ?Sabid) 
- ?ColumnName) it is Syntax of Erp Software it will be used current form sabid data will be fetched or used.
-  if this syntax used in any query so its means current value are fetching.
-  this syntax will be used in any sections.
  
- example 
```sql
select bname,pid from asab23 where sabid=?sabid)
```

- as like that if another column is ?Column) so its means same they fetch the value on that current Form record which is visible on screen 

## 📋 Notes:
-	This mechanism protects data integrity by preventing accidental deletion of used/linked records.
-	Consider implementing user alerts or logs for failed deletion attempts for auditing.

## 5) Repcode Leave sections
### Purpose:
- Ensures that the repcode (report code) entered by the user is unique across records. Prevents saving or updating if the same code already exists for another entry.
 Validation Rule
- "Report Code Already Created In..."
This message appears when the user tries to use a repcode that already exists in another record (except the currently edited one).
```
Sql1 = SELECT pid 
        FROM asab_repname A 
        WHERE repcode = ?repcode.text) 
          AND ?repcode.text) <> '' 
          AND sabid <> ?sabid
```
Condition	Meaning
-     repcode=?repcode.text) 
- Checks if the entered repcode already exists
?repcode.text) <> ''	Ensures the repcode field is not empty
sabid <> ?sabid	Excludes the current record from the check (used during edit/update)
If this query returns any record, the entered repcode is not unique, and saving is blocked.
Msg1 = "Report Code Already Created In.."
This message informs the user that the entered repcode is already present in another record and cannot be reused.

## Notes:
•	This check prevents duplicate report codes, maintaining data consistency.
•	Consider enhancing user experience by showing where the existing code is used (record ID or description).


# 📊 example gpademo Database Schema Documentation

This document outlines the core database tables for the `example gpademo` system, focused on dynamic form and grid configuration, layout management, and modular control in an enterprise application environment.

---

## 🧾 Table: `saberpmenu`

Manages the registration and configuration of form modules used throughout the system.

### Key Columns:
| Column        | Type           | Description                                           |
|---------------|----------------|-------------------------------------------------------|
| `pid`         | `bigint`       | Unique module identifier (Primary key)               |
| `bname`       | `nvarchar(100)`| Form name / business module name                     |
| `tablename`   | `nvarchar(80)` | Related data table name                              |
| `seceft`      | `int`          | Security effect level                                |
| `credit` / `debit` | `bit`     | Indicates transactional nature                       |
| `active`      | `bit`          | Whether the module is active                         |
| `shortkey`    | `nvarchar(10)` | Shortcut key for access                              |
| `allcomp`     | `int`          | Company scope                                        |
| `verify`      | `bit`          | If the form requires verification                    |
| `formtype`    | `nvarchar(10)` | Form type (UI category)                              |
| `superuser`   | `int`          | Superuser-specific access level                      |

🔗 **Referenced in:**
- `asab_fromtype`, `asab12`, `asab15_rate`, `asab2`, `asab7`, `lot_lot_mid`, and other transactional tables

📌 **Indexes:**
- `saberpmenu_pid` — unique non-clustered index on `pid`

---

## 🧩 Table: `sabsections`

Stores metadata and values for sections inside dynamic SDL forms.

### Key Columns:
| Column       | Type             | Description                              |
|--------------|------------------|------------------------------------------|
| `MenuCode`   | `nvarchar(25)`   | Associated menu/module code              |
| `SdlFileName`| `nvarchar(50)`   | Associated layout or SDL file            |
| `Section`    | `nvarchar(50)`   | Form section identifier                  |
| `SabKey`     | `nvarchar(50)`   | Key in section (field ID or logic key)   |
| `SabValue`   | `nvarchar(max)`  | Value or configuration                   |

---

## 🧮 Table: `sabgriddtl`

Defines the layout and rules of dynamic grid-based UIs.

### Key Columns:
| Column     | Type             | Description                              |
|------------|------------------|------------------------------------------|
| `TYPE`     | `nvarchar(15)`   | Grid context type                        |
| `GridName` | `nvarchar(80)`   | Grid identifier                          |
| `colname`  | `nvarchar(80)`   | Column field name                        |
| `header`   | `nvarchar(200)`  | Display header                           |
| `visible`  | `bit`            | Column visibility                        |
| `align`    | `bit`            | Text alignment (left/right)              |
| `sum`      | `bit`            | Whether to calculate column total        |
| `Readonly` | `bit`            | Field is readonly                        |
| `Format`   | `nvarchar(4)`    | Field formatting (e.g. currency, % etc.) |
| `FORMULA`  | `nvarchar(100)`  | Dynamic calculation                      |

---

## 📐 Table: `sabformresize`

Stores customizable form size and position settings.

### Key Columns:
| Column       | Type             | Description                      |
|--------------|------------------|----------------------------------|
| `H`, `W`, `T`, `L` | `smallint` | Height, Width, Top, Left         |
| `StartColor` | `nvarchar(80)`   | Form background start color      |
| `EndColor`   | `nvarchar(80)`   | Gradient end color               |

---

## 🎨 Table: `sabtopleft`

Handles UI component layout and appearance for form rendering.

### Key Columns:
| Column       | Type             | Description                           |
|--------------|------------------|---------------------------------------|
| `BCODE`      | `nvarchar(80)`   | Control/block code                    |
| `ttop`, `tleft` | `int`        | Control top and left position         |
| `Color`      | `nvarchar(200)`  | Background or text color              |
| `Fontname`   | `nvarchar(200)`  | Font used for control text            |
| `Visible`    | `bit`            | Whether control is visible            |
| `Readonly`   | `bit`            | If field is editable                  |
| `TextLength` | `int`            | Character limit                       |

---

## 🗂️ Foreign Key Dependencies

`[saberpmenu]` is referenced by:
- `asab_fromtype`, `asab12`, `asab15_rate`, `asab2`, `asab7`
- `capps_cr_approval`, `lot_lot_mid`, `covnote_bsab_cover_up`
- `pocan_bsab52ordcan`, `socan_bsab52ordcan`

---

## 📌 Notes

- The tables support dynamic rendering of forms, controls, and data grids.
- Structure is highly customizable for multi-tenant systems (via `cloudid`, `comp`, etc.)
- All tables include `sabrowid` or `pid` as a unique row identifier.

---

## 🔐 Security & Access

Ensure proper role-based access control (RBAC) on `saberpmenu` and form rendering modules. Sensitive configuration should be handled with restricted access.

---

## 🧰 Tech Stack

- **SQL Server** (backend schema)
- Compatible with .NET or Node.js middleware systems

---

> © example gpademo ERP Framework | Designed for modular, scalable enterprise forms and reporting.

# Database Schema - example gpademo

This README documents the creation of key database tables and their relationships for the `example gpademo` SQL Server database. The tables are part of a module dealing with accounting, taxation, and ERP-style menus.

---

## 📁 Tables

### 1. `gprcn_bsab44`

This table stores detailed tax breakdowns and calculations linked with entries in `gprcn_bsab42`.

### Fields:
- `pid`, `rowid`, `type`, `comp`, `ycode`: Identifiers and classification
- `taxid`, `addless`, `acid`: Foreign keys
- `onamt`, `rate`, `amount`, `ratio`: Financial fields
- `sabid`, `sabrowid`: Reference to main entry
- `invno`, `recal`, `roundoff`: Invoice and rounding details
- `cloudid`, `subtype`, `txtntype`: Metadata

### Constraints:
- Primary Key: `sabrowid`
- Foreign Keys:
  - `acid` → `asab9(pid)`
  - `addless` → `sabaddless(pid)`
  - `calcon` → `sabtaxcalon(pid)`
  - `sabid` → `gprcn_bsab42(sabid)`
  - `taxid` → `asab14(pid)`

---

### 2. `gprcn_bsab45`

Similar to `gprcn_bsab44`, likely representing another type of transaction or stage.

### Fields:
Same as `gprcn_bsab44` with an additional:
- `prtled`: Printed ledger tag

### Constraints:
- Primary Key: `sabrowid`
- Foreign Keys:
  - `acid` → `asab9(pid)`
  - `addless` → `sabaddless(pid)`
  - `calcon` → `sabtaxcalon(pid)`
  - `sabid` → `gprcn_bsab42(sabid)`
  - `taxid` → `asab14(pid)`

---

### 3. `saberpmenu`

Stores metadata for ERP system menus and form configurations.

### Fields:
- `bname`, `tablename`, `regcode`: Identification and linkage
- `debit`, `credit`, `seceft`: Accounting permissions
- `sms`, `email`, `barcode`, `printed`: Notifications and output settings
- `sabid`, `pid`, `parentid`, `cloudid`: Relationships and hierarchy
- `formtype`, `shortkey`, `shortname`: UI shortcuts and customization

---
## Script Table
```
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[asab20](
	[pid] [bigint] NOT NULL,
	[bname] [nvarchar](200) NULL,
	[state] [bigint] NULL,
	[descr] [nvarchar](200) NULL,
	[comp] [int] NOT NULL,
	[active] [tinyint] NULL,
	[allcomp] [tinyint] NULL,
	[udate] [smalldatetime] NULL,
	[ycode] [int] NOT NULL,
	[btype] [int] NULL,
	[type] [int] NOT NULL,
	[sabuser] [bigint] NULL,
	[mode] [bigint] NULL,
	[superuser] [smallint] NULL,
	[division] [int] NOT NULL,
	[sms] [bit] NULL,
	[email] [bit] NULL,
	[printed] [bit] NULL,
	[barcode] [bit] NULL,
	[sabid] [int] NOT NULL,
	[cloudid] [bigint] NULL,
	[subtype] [bigint] NULL,
	[txtntype] [int] NULL,
 CONSTRAINT [PK_Asab20_pid] PRIMARY KEY CLUSTERED 
(
	[pid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[asab20]  WITH CHECK ADD  CONSTRAINT [FK_asab20_state] FOREIGN KEY([state])
REFERENCES [dbo].[asab23] ([pid])
GO

ALTER TABLE [dbo].[asab20] CHECK CONSTRAINT [FK_asab20_state]
GO

```




```
USE [DatabaseName]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[asab20](
	[pid] [bigint] NOT NULL,
	[bname] [nvarchar](200) NULL,
	[state] [bigint] NULL,
	[descr] [nvarchar](200) NULL,
	[comp] [int] NOT NULL,
	[active] [tinyint] NULL,
	[allcomp] [tinyint] NULL,
	[udate] [smalldatetime] NULL,
	[ycode] [int] NOT NULL,
	[btype] [int] NULL,
	[type] [int] NOT NULL,
	[sabuser] [bigint] NULL,
	[mode] [bigint] NULL,
	[superuser] [smallint] NULL,
	[division] [int] NOT NULL,
	[sms] [bit] NULL,
	[email] [bit] NULL,
	[printed] [bit] NULL,
	[barcode] [bit] NULL,
	[sabid] [int] NOT NULL,
	[cloudid] [bigint] NULL,
	[subtype] [bigint] NULL,
	[txtntype] [int] NULL,
 CONSTRAINT [PK_Asab20_pid] PRIMARY KEY CLUSTERED 
(
	[pid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[asab20]  WITH CHECK ADD  CONSTRAINT [FK_asab20_state] FOREIGN KEY([state])
REFERENCES [dbo].[asab23] ([pid])
GO

ALTER TABLE [dbo].[asab20] CHECK CONSTRAINT [FK_asab20_state]
GO

```

```
USE [DataBaseName]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[asab26](
	[pid] [bigint] NOT NULL,
	[bname] [nvarchar](100) NULL,
	[district] [bigint] NULL,
	[allcomp] [tinyint] NULL,
	[active] [tinyint] NULL,
	[std] [nvarchar](10) NULL,
	[udate] [smalldatetime] NULL,
	[comp] [int] NOT NULL,
	[state] [bigint] NULL,
	[country] [bigint] NULL,
	[ycode] [int] NOT NULL,
	[btype] [int] NULL,
	[type] [int] NOT NULL,
	[sabuser] [bigint] NULL,
	[mode] [bigint] NULL,
	[superuser] [smallint] NULL,
	[division] [int] NOT NULL,
	[pin] [nvarchar](7) NULL,
	[courier] [bigint] NULL,
	[sms] [bit] NULL,
	[email] [nvarchar](50) NULL,
	[printed] [bit] NULL,
	[barcode] [bit] NULL,
	[impcode] [nvarchar](30) NULL,
	[lsbcode] [nvarchar](20) NULL,
	[sabid] [int] NOT NULL,
	[distance] [nvarchar](10) NULL,
	[ddistance] [nvarchar](100) NULL,
	[adr1] [nvarchar](400) NULL,
	[adr2] [nvarchar](400) NULL,
	[adr3] [nvarchar](400) NULL,
	[city] [int] NULL,
	[telr] [nvarchar](40) NULL,
	[telo] [nvarchar](40) NULL,
	[hast] [int] NULL,
	[party] [bigint] NULL,
	[retailer] [int] NULL,
	[cell] [nvarchar](120) NULL,
	[gstno] [nvarchar](100) NULL,
	[person] [nvarchar](200) NULL,
	[cloudid] [bigint] NULL,
	[subtype] [bigint] NULL,
	[txtntype] [int] NULL,
 CONSTRAINT [PK_Asab26_pid] PRIMARY KEY CLUSTERED 
(
	[pid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[asab26]  WITH CHECK ADD  CONSTRAINT [FK_asab26_Country] FOREIGN KEY([country])
REFERENCES [dbo].[asab24] ([pid])
GO

ALTER TABLE [dbo].[asab26] CHECK CONSTRAINT [FK_asab26_Country]
GO

ALTER TABLE [dbo].[asab26]  WITH CHECK ADD  CONSTRAINT [FK_asab26_courier] FOREIGN KEY([courier])
REFERENCES [dbo].[asab9] ([pid])
GO

ALTER TABLE [dbo].[asab26] CHECK CONSTRAINT [FK_asab26_courier]
GO

ALTER TABLE [dbo].[asab26]  WITH CHECK ADD  CONSTRAINT [FK_asab26_District] FOREIGN KEY([district])
REFERENCES [dbo].[asab20] ([pid])
GO

ALTER TABLE [dbo].[asab26] CHECK CONSTRAINT [FK_asab26_District]
GO

ALTER TABLE [dbo].[asab26]  WITH CHECK ADD  CONSTRAINT [FK_asab26_PARTY] FOREIGN KEY([party])
REFERENCES [dbo].[asab9] ([pid])
GO

ALTER TABLE [dbo].[asab26] CHECK CONSTRAINT [FK_asab26_PARTY]
GO

ALTER TABLE [dbo].[asab26]  WITH CHECK ADD  CONSTRAINT [FK_asab26_State] FOREIGN KEY([state])
REFERENCES [dbo].[asab23] ([pid])
GO

ALTER TABLE [dbo].[asab26] CHECK CONSTRAINT [FK_asab26_State]
GO
```

## ⚙️ SQL Server Settings
All scripts use:
- `SET ANSI_NULLS ON`
- `SET QUOTED_IDENTIFIER ON`

These ensure proper handling of NULLs and quoted identifiers for compatibility and safety.

---

## 🔗 Relationships Summary

| Table         | References                 |
|---------------|----------------------------|
| gprcn_bsab44  | asab9, sabaddless, sabtaxcalon, gprcn_bsab42, asab14 |
| gprcn_bsab45  | asab9, sabaddless, sabtaxcalon, gprcn_bsab42, asab14 |
| saberpmenu    | No explicit foreign keys, used for ERP navigation & config |

---

## 📌 Notes

- Money and datetime types are used for financial accuracy and timestamping.
- Relationships are enforced via `FOREIGN KEY` constraints for data integrity.
- Ideal for ERP systems that require configurable menus and accounting modules.

---

