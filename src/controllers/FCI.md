# 🏢 Project: ERP System for Food Corporation of India (FCI)
### 🔗 [https://fcivlts.in](https://fcivlts.in)
### we creating for this Database Name will FCI

## 📘 Overview
The **Food Corporation of India (FCI)** has played a vital role in transforming India’s food security — shifting from a crisis-management approach to a stable and efficient system.

To enhance its operational efficiency, FCI now requires a comprehensive **ERP system** to:

- Manage government orders for commodities like:
  - Ration
  - Rice (*Chawal*)
  - Wheat (*Gheu*)
- Monitor and control distribution to various ration shops
- Track inventory levels and movement in real-time
- Ensure compliance and transparency in supply chain operations

---

### ✨ Key Goals:
- Digitally manage and track **commodity allocations** (e.g., ration, rice, wheat)
- Automate **distribution planning** to regional shops
- Implement area-based **logistics planning** using vehicle type logic
- Maintain **master records** across cities, parties, transports, and products
- Enable **real-time visibility** into vehicle, inventory, and shop allocations

---

## 🚛 Logistics & Transportation Management

Transportation is a key component of FCI’s supply process. The ERP will handle vehicle assignment, load balancing, and delivery planning based on destination constraints.

The ERP will also manage transportation logistics. FCI uses two types of trucks for supply:

### ✅ Truck Types and Use Cases

- **8-Wheeler Trucks**
  - Assigned to destinations with **limited roadside space or narrow streets**
  - Ideal for small shop locations with parking constraints

- **12-Wheeler Trucks**
  - Sent to areas with **wider roads and sufficient space for parking**
  - Used for larger deliveries to major distribution centers or towns

> 🧠 **Note**: Truck allocation is pre-linked with each party based on their location’s road access. This prevents routing issues and delays.


🚚 *Truck allocation is pre-determined based on party address infrastructure and area suitability.*

---
## 🗺️ Area Master Configuration

To manage location-based routing and logistics, the system includes a comprehensive **AreaMaster** menu with the following forms:

- **Country Master**
- **State Master**
- **District Master**
- **City Master**

These masters help segment and validate delivery routes, ensure accurate address mapping, and support reporting at regional levels.

---

---

## 🗂️ Master Table Mapping

Below is a detailed mapping of all master forms used in the ERP system. Each master is linked to a specific table and has a defined purpose in the data architecture.

| **Master Name**             | **Table Name**       | **Purpose / Description**                         | **Type Code** |
|-----------------------------|----------------------|---------------------------------------------------|---------------|
| Account Master              | `asab9`              | Party or ledger account name                      | 118           |
| Transport Master            | `asab9`              | Transport company name                            | 117           |
| Broker Master               | `asab9`              | Broker or agent name                              | 116           |
| Cash Account Master         | `asab9`              | Cash account ledger                               | 119           |
| Salesman Master             | `asab9`              | Sales representative name                         | Custom        |
| Courier Master              | `asab9`              | Courier company name                              | Custom        |
| Envelop Courier Master      | `asab9_courier`      | Courier envelope options                          |               |
| State Master                | `asab23`             | State name                                        |               |
| City Master                 | `asab26`             | City or town name                                 |               |
| District Master             | `asab20`             | District name                                     |               |
| Country Master              | `asab24`             | Country name                                      |               |
| Godown Master               | `asab33`             | Warehouse / godown name                           |               |
| Product Group Master        | `asab3`              | Product categorization group                      |               |
| Design Master               | `asab5`              | Design code                                       |               |
| Shade Master                | `asab51`             | Shade number                                      |               |
| Quality Master              | `asab15`             | Fabric or yarn quality                            |               |
| Rack Master                 | `ASAB_RACK`          | Rack or shelf identifier                          |               |
| Unit Master                 | `asab_unit`          | Measurement unit (e.g., meter, kg)                |               |
| Narration Master            | `asab22`             | Short description for transactions                |               |
| Job Type Master             | `asab_jobtype`       | Types of jobwork                                  |               |
| Tax Master                  | `asab14`             | Tax name (e.g., CGST, SGST)                       |               |
| HSN Rate Master             | `asab_hsn_up`        | HSN code with applicable tax rates                |               |
| Yarn Type Master            | `asab4_yarn`         | Yarn type                                         |               |
| Yarn Shade Master           | `asab51_yarn`        | Yarn color or shade                               |               |
| Blend Master                | `asab_blendmst`      | Fabric blend information                          |               |
| Count Master                | `asab_count`         | Yarn count or thickness                           |               |
| Port Master                 | `asab61`             | Shipping port name                                |               |
| Machine No Master           | `Asab57`             | Machine ID or number                              |               |
| Size Master                 | `asab_Size`          | Product size specification                        |               |
| Weave Master                | `asab_weave`         | Type of fabric weave                              |               |
| Dyeing Type Master          | `asab_dyeingtype`    | Type of dyeing process                            |               |
| Currency Master             | `asab63`             | Currency name or code                             |               |
| Term Condition Master       | `Asab24_Term`        | Sales / purchase terms and conditions             |               |
| Design Card Entry           | `asab60`             | Job-specific design details                       |               |

---

### ✅ Functional Modules to Add
- **Order Management System**  
  For creating, editing, and tracking commodity dispatch orders.

- **Truck Dispatch Board**  
  Visual board to show truck schedules, allocations, and current dispatch status.

- **Delivery Confirmation & Proof Upload**  
  Option for shopkeepers to confirm delivery and upload digital signatures or documents.

- **User Access Control (UAC)**  
  Role-based permissions: Admin, Dispatcher, Warehouse Operator, Government Viewer, etc.

- **Commodity Stock Ledger**  
  Real-time stock movement of ration, chawal, gheu by godown and region.

- **Shop Master + GPS Coordinates**  
  Helps map truck routes and verify which trucks can access the area.

---

## 📈 Analytics & Reporting Suggestions

- **Area-wise Supply vs Demand Dashboard**
- **Truck Utilization Efficiency Report**
- **Godown Inventory Aging**
- **Party-wise Delivery Punctuality**
- **Weekly Distribution Forecast**

---


