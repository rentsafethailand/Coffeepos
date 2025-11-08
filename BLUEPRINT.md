# ☕ Coffee Shop POS - System Blueprint

เอกสารสถาปัตยกรรมและการออกแบบระบบจัดการร้านกาแฟแบบ Multi-tenant

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Business Logic Flow](#business-logic-flow)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Security & Authentication](#security--authentication)
9. [Key Features Implementation](#key-features-implementation)
10. [Deployment Architecture](#deployment-architecture)

---

## 1. System Overview

### 1.1 Project Vision

ระบบจัดการร้านกาแฟแบบ Cloud-based ที่รองรับการทำงานหลายสาขา (Multi-tenant) ด้วย Google Apps Script โดยมีจุดเด่นคือ:

- 🌐 **Zero Infrastructure Cost** - ไม่ต้องจ่ายค่า Server
- 🔄 **Real-time Sync** - ข้อมูลอัพเดททันทีผ่าน Google Sheets
- 📱 **Responsive Design** - ใช้งานได้ทั้ง Desktop และ Mobile
- 🎯 **Product Variants** - รองรับการปรับแต่งสินค้าแบบละเอียด
- 📦 **Auto Stock Management** - หักสต็อกอัตโนมัติตาม Recipe

### 1.2 Technology Stack

```
┌─────────────────────────────────────────┐
│           Frontend Layer                 │
├─────────────────────────────────────────┤
│  • Alpine.js (Reactive Framework)       │
│  • Tailwind CSS (UI Styling)            │
│  • Chart.js (Data Visualization)        │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Communication Layer               │
├─────────────────────────────────────────┤
│  • google.script.run (API Calls)        │
│  • Promise-based async operations       │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           Backend Layer                  │
├─────────────────────────────────────────┤
│  • Google Apps Script (Server)          │
│  • JavaScript ES6+                       │
│  • Built-in Services (Sheets, Drive)    │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           Data Layer                     │
├─────────────────────────────────────────┤
│  • Google Sheets (Database)             │
│  • Google Drive (File Storage)          │
└─────────────────────────────────────────┘
```

### 1.3 Core Principles

1. **Separation of Concerns**
   - Frontend: UI/UX และ State Management
   - Backend: Business Logic และ Data Access
   - Database: Data Storage และ Relationships

2. **Multi-tenant Isolation**
   - แต่ละ Tenant มี Spreadsheet แยกกัน
   - Folder แยกสำหรับเก็บไฟล์แต่ละสาขา
   - Master Sheet ควบคุมทุก Tenant

3. **Scalability**
   - รองรับการเพิ่ม Tenant ได้ไม่จำกัด
   - Data แยก Sheet ตาม Tenant
   - Performance ไม่ลดลงเมื่อมีหลายสาขา

---

## 2. Architecture Design

### 2.1 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Users                                  │
│                    (Browsers)                                 │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ↓
┌──────────────────────────────────────────────────────────────┐
│              Google Apps Script Web App                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               doGet(e)                                 │  │
│  │  • Serve HTML Pages                                    │  │
│  │  • Include Templates (index, superadmin)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         google.script.run Functions                    │  │
│  │  • login()        • getProducts()                      │  │
│  │  • createOrder()  • getDashboardData()                 │  │
│  │  • uploadSlipImage() • getSalesReport()                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ Apps Script Services
             ↓
┌──────────────────────────────────────────────────────────────┐
│                    Google Services                            │
│                                                               │
│  ┌─────────────────────┐      ┌─────────────────────┐       │
│  │   Google Sheets     │      │    Google Drive     │       │
│  │                     │      │                     │       │
│  │ • Master Sheet      │      │ • Master Folder     │       │
│  │ • Tenant Sheets     │      │ • Tenant Folders    │       │
│  │ • Data Tables       │      │ • Slip Images       │       │
│  └─────────────────────┘      └─────────────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Multi-tenant Architecture

```
Master Folder (Google Drive)
├── Master Spreadsheet
│   ├── Sheet: Tenants        → รายการร้านค้าทั้งหมด
│   ├── Sheet: Users           → Super Admin Users
│   ├── Sheet: Licenses        → License Management
│   └── Sheet: AuditLog        → System-wide Logs
│
├── Tenants/
│   ├── [Tenant_001]/
│   │   ├── Tenant_001.xlsx    → Tenant Spreadsheet
│   │   ├── Slips/
│   │   │   ├── 2024/
│   │   │   │   ├── 01/
│   │   │   │   ├── 02/
│   │   │   │   └── ...
│   │   └── Backups/
│   │
│   ├── [Tenant_002]/
│   │   └── ...
│   │
│   └── [Tenant_N]/
│       └── ...
│
└── Backups/
    └── Daily/
        └── [Date]/
```

### 2.3 Request Flow

```
User Action (Click ชำระเงิน)
    ↓
Alpine.js Event Handler (@click="confirmPayment()")
    ↓
callAPI('createOrder', params)
    ↓
Check: google.script.run available?
    ├─ Yes → google.script.run.createOrder(params)
    └─ No  → mockAPI('createOrder', params) [Dev Mode]
    ↓
Backend: createOrder(params)
    ├─ 1. Validate params
    ├─ 2. Open Tenant Spreadsheet (shopSheetId)
    ├─ 3. Create Order Record
    ├─ 4. Loop through Order Items
    │      ├─ Get Recipe for Product + Variants
    │      ├─ Calculate Total Quantity Needed
    │      ├─ Deduct Stock from Inventory
    │      └─ Record Stock Movement
    ├─ 5. Update Order Status
    └─ 6. Return Response
    ↓
Response: { success: true, data: { orderNumber: 'ORD-001' } }
    ↓
Frontend: Success Handler
    ├─ Show Success Alert
    ├─ Clear Cart
    ├─ Reload Dashboard Data
    └─ Update UI
```

---

## 3. Database Schema

### 3.1 Master Spreadsheet Schema

#### Sheet: Tenants
```
┌────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column     │ Type        │ Description  │ Required  │ Unique   │ Example      │
├────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id         │ String      │ Tenant ID    │ Yes       │ Yes      │ TENANT_001   │
│ name       │ String      │ Shop Name    │ Yes       │ No       │ Coffee House │
│ sheetId    │ String      │ Sheet ID     │ Yes       │ Yes      │ 1A2B3C...    │
│ folderId   │ String      │ Folder ID    │ Yes       │ Yes      │ 4D5E6F...    │
│ isActive   │ Boolean     │ Active?      │ Yes       │ No       │ TRUE         │
│ createdAt  │ Date        │ Created      │ Yes       │ No       │ 2024-01-01   │
│ contactName│ String      │ Contact      │ No        │ No       │ John Doe     │
│ phone      │ String      │ Phone        │ No        │ No       │ 02-123-4567  │
│ email      │ Email       │ Email        │ No        │ No       │ email@...    │
│ address    │ Text        │ Address      │ No        │ No       │ Bangkok      │
└────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘
```

### 3.2 Tenant Spreadsheet Schema

#### Sheet: Products
```
┌────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column     │ Type        │ Description  │ Required  │ Unique   │ Example      │
├────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id         │ String      │ Product ID   │ Yes       │ Yes      │ P001         │
│ sku        │ String      │ SKU Code     │ Yes       │ Yes      │ LATTE-001    │
│ name       │ String      │ Product Name │ Yes       │ No       │ ลาเต้        │
│ category   │ Enum        │ Category     │ Yes       │ No       │ COFFEE       │
│ price      │ Number      │ Base Price   │ Yes       │ No       │ 100.00       │
│ cost       │ Number      │ Cost         │ No        │ No       │ 45.00        │
│ description│ Text        │ Description  │ No        │ No       │ กาแฟลาเต้... │
│ isActive   │ Boolean     │ Active?      │ Yes       │ No       │ TRUE         │
│ imageUrl   │ URL         │ Image URL    │ No        │ No       │ https://...  │
│ createdAt  │ Date        │ Created      │ Yes       │ No       │ 2024-01-01   │
│ updatedAt  │ Date        │ Updated      │ Yes       │ No       │ 2024-01-15   │
└────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘

Categories: COFFEE, TEA, BEVERAGE, FOOD, DESSERT
```

#### Sheet: Variants
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Variant ID   │ Yes       │ Yes      │ V001         │
│ productId   │ String      │ Product ID   │ Yes       │ No       │ P001         │
│ variantType │ Enum        │ Type         │ Yes       │ No       │ SIZE         │
│ variantValue│ String      │ Value        │ Yes       │ No       │ LARGE        │
│ priceAdjust │ Number      │ Price +/-    │ Yes       │ No       │ +10.00       │
│ isActive    │ Boolean     │ Active?      │ Yes       │ No       │ TRUE         │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘

Variant Types:
  - SIZE: SMALL, MEDIUM, LARGE
  - TEMPERATURE: HOT, COLD, ICED
  - SWEETNESS: 0%, 25%, 50%, 75%, 100%
  - ICE: NO_ICE, LESS_ICE, NORMAL_ICE, EXTRA_ICE
  - MILK: REGULAR, SOY, ALMOND, OAT
```

#### Sheet: Modifiers (Add-ons)
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Modifier ID  │ Yes       │ Yes      │ M001         │
│ name        │ String      │ Name         │ Yes       │ No       │ วิปครีม      │
│ price       │ Number      │ Price        │ Yes       │ No       │ 10.00        │
│ category    │ String      │ Category     │ No        │ No       │ TOPPING      │
│ isActive    │ Boolean     │ Active?      │ Yes       │ No       │ TRUE         │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘
```

#### Sheet: InventoryItems
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Item ID      │ Yes       │ Yes      │ I001         │
│ sku         │ String      │ SKU          │ Yes       │ Yes      │ COFFEE-BEAN  │
│ name        │ String      │ Name         │ Yes       │ No       │ เมล็ดกาแฟ   │
│ unit        │ String      │ Unit         │ Yes       │ No       │ กรัม         │
│ stock       │ Number      │ Current Stock│ Yes       │ No       │ 5000         │
│ reorderPoint│ Number      │ Min Stock    │ Yes       │ No       │ 1000         │
│ cost        │ Number      │ Unit Cost    │ No        │ No       │ 0.50         │
│ supplierId  │ String      │ Supplier     │ No        │ No       │ SUP001       │
│ updatedAt   │ Date        │ Updated      │ Yes       │ No       │ 2024-01-15   │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘
```

#### Sheet: Recipes (BOM)
```
┌──────────────────┬─────────────┬──────────────┬───────────┬──────────────────┐
│ Column           │ Type        │ Description  │ Required  │ Example          │
├──────────────────┼─────────────┼──────────────┼───────────┼──────────────────┤
│ id               │ String      │ Recipe ID    │ Yes       │ R001             │
│ productId        │ String      │ Product ID   │ Yes       │ P001             │
│ variantCombination│ JSON       │ Variants     │ No        │ {"SIZE":"LARGE"} │
│ itemId           │ String      │ Inventory ID │ Yes       │ I001             │
│ quantity         │ Number      │ Qty/Unit     │ Yes       │ 18.0             │
│ unit             │ String      │ Unit         │ Yes       │ กรัม             │
└──────────────────┴─────────────┴──────────────┴───────────┴──────────────────┘

Example Recipe for "ลาเต้ (LARGE, HOT)":
  - เมล็ดกาแฟ: 18 กรัม
  - นมสด: 200 ml
  - น้ำตาล: 10 กรัม
  - ถ้วย Large: 1 ใบ
```

#### Sheet: Orders
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Order ID     │ Yes       │ Yes      │ O001         │
│ orderNumber │ String      │ Order #      │ Yes       │ Yes      │ ORD-20240101 │
│ channel     │ Enum        │ Channel      │ Yes       │ No       │ POS          │
│ customerId  │ String      │ Customer     │ No        │ No       │ C001         │
│ staffId     │ String      │ Staff        │ No        │ No       │ U001         │
│ subtotal    │ Number      │ Subtotal     │ Yes       │ No       │ 250.00       │
│ tax         │ Number      │ Tax          │ Yes       │ No       │ 17.50        │
│ discount    │ Number      │ Discount     │ No        │ No       │ 0.00         │
│ total       │ Number      │ Total        │ Yes       │ No       │ 267.50       │
│ status      │ Enum        │ Status       │ Yes       │ No       │ COMPLETED    │
│ createdAt   │ Date        │ Created      │ Yes       │ No       │ 2024-01-01   │
│ completedAt │ Date        │ Completed    │ No        │ No       │ 2024-01-01   │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘

Channels: POS, DELIVERY, ONLINE
Status: PENDING, COMPLETED, CANCELLED
```

#### Sheet: OrderItems
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Item ID      │ Yes       │ Yes      │ OI001        │
│ orderId     │ String      │ Order ID     │ Yes       │ No       │ O001         │
│ productId   │ String      │ Product ID   │ Yes       │ No       │ P001         │
│ productName │ String      │ Product Name │ Yes       │ No       │ ลาเต้        │
│ variants    │ JSON        │ Variants     │ No        │ No       │ {"SIZE":...} │
│ modifiers   │ JSON Array  │ Modifiers    │ No        │ No       │ ["M001"]     │
│ quantity    │ Number      │ Quantity     │ Yes       │ No       │ 2            │
│ price       │ Number      │ Unit Price   │ Yes       │ No       │ 110.00       │
│ subtotal    │ Number      │ Subtotal     │ Yes       │ No       │ 220.00       │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘
```

#### Sheet: Payments
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Payment ID   │ Yes       │ Yes      │ PAY001       │
│ orderId     │ String      │ Order ID     │ Yes       │ No       │ O001         │
│ method      │ Enum        │ Method       │ Yes       │ No       │ CASH         │
│ amount      │ Number      │ Amount       │ Yes       │ No       │ 300.00       │
│ received    │ Number      │ Received     │ No        │ No       │ 300.00       │
│ change      │ Number      │ Change       │ No        │ No       │ 32.50        │
│ reference   │ String      │ Reference    │ No        │ No       │ SLIP001      │
│ slipUrl     │ URL         │ Slip Image   │ No        │ No       │ https://...  │
│ createdAt   │ Date        │ Created      │ Yes       │ No       │ 2024-01-01   │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘

Methods: CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER, QR_CODE, E_WALLET
```

#### Sheet: StockMovements
```
┌─────────────┬─────────────┬──────────────┬───────────┬──────────┬──────────────┐
│ Column      │ Type        │ Description  │ Required  │ Unique   │ Example      │
├─────────────┼─────────────┼──────────────┼───────────┼──────────┼──────────────┤
│ id          │ String      │ Movement ID  │ Yes       │ Yes      │ SM001        │
│ itemId      │ String      │ Inventory ID │ Yes       │ No       │ I001         │
│ type        │ Enum        │ Type         │ Yes       │ No       │ DEDUCT       │
│ quantity    │ Number      │ Quantity     │ Yes       │ No       │ -18.0        │
│ stockBefore │ Number      │ Stock Before │ Yes       │ No       │ 5000.0       │
│ stockAfter  │ Number      │ Stock After  │ Yes       │ No       │ 4982.0       │
│ reference   │ String      │ Reference    │ No        │ No       │ O001         │
│ note        │ Text        │ Note         │ No        │ No       │ Auto deduct  │
│ username    │ String      │ User         │ Yes       │ No       │ admin        │
│ createdAt   │ Date        │ Created      │ Yes       │ No       │ 2024-01-01   │
└─────────────┴─────────────┴──────────────┴───────────┴──────────┴──────────────┘

Types: DEDUCT (ขาย), ADD (เติม), ADJUST (ปรับ), RETURN (คืน)
```

### 3.3 Entity Relationship Diagram

```
┌──────────────┐              ┌──────────────┐
│   Tenants    │─────────────→│  Products    │
│              │   1      N   │              │
│ • id         │              │ • id         │
│ • name       │              │ • tenantId   │
│ • sheetId    │              │ • name       │
│ • folderId   │              │ • price      │
└──────────────┘              └──────┬───────┘
                                     │
                                     │ 1
                                     │
                                     │ N
                              ┌──────▼───────┐
                              │   Variants   │
                              │              │
                              │ • id         │
                              │ • productId  │
                              │ • type       │
                              │ • value      │
                              │ • priceAdjust│
                              └──────────────┘

┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│   Products   │─────────────→│   Recipes    │←─────────────│ InventoryItems│
│              │   1      N   │              │   N      1   │              │
│ • id         │              │ • productId  │              │ • id         │
│ • name       │              │ • itemId     │              │ • name       │
└──────────────┘              │ • quantity   │              │ • stock      │
                              │ • variants   │              │ • unit       │
                              └──────────────┘              └──────┬───────┘
                                                                   │
                                                                   │ 1
                                                                   │
                                                                   │ N
                                                            ┌──────▼───────┐
                                                            │StockMovements│
                                                            │              │
                                                            │ • itemId     │
                                                            │ • type       │
                                                            │ • quantity   │
                                                            └──────────────┘

┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│    Orders    │─────────────→│  OrderItems  │←─────────────│   Products   │
│              │   1      N   │              │   N      1   │              │
│ • id         │              │ • orderId    │              │ • id         │
│ • orderNumber│              │ • productId  │              └──────────────┘
│ • total      │              │ • quantity   │
│ • status     │              │ • variants   │
└──────┬───────┘              └──────────────┘
       │
       │ 1
       │
       │ 1
┌──────▼───────┐
│   Payments   │
│              │
│ • orderId    │
│ • method     │
│ • amount     │
│ • slipUrl    │
└──────────────┘
```

---

## 4. API Endpoints

### 4.1 Authentication APIs

#### `login(params)`
```javascript
// Request
{
  username: String,
  password: String
}

// Response
{
  success: Boolean,
  data: {
    username: String,
    role: String,
    tenantId: String,
    shopSheetId: String,
    tenantName: String
  },
  message: String?
}

// Business Logic
1. Validate credentials format
2. Query Master Sheet -> Users
3. Hash password and compare
4. Get tenant info from Tenants sheet
5. Create session token
6. Return user data + tenant info
```

#### `logout(params)`
```javascript
// Request
{
  sessionToken: String
}

// Response
{
  success: Boolean,
  message: String
}

// Business Logic
1. Validate session token
2. Mark session as expired
3. Return success
```

### 4.2 Product APIs

#### `getProducts(params)`
```javascript
// Request
{
  shopSheetId: String
}

// Response
{
  success: Boolean,
  data: [
    {
      id: String,
      sku: String,
      name: String,
      category: String,
      price: Number,
      isActive: Boolean,
      ...
    }
  ]
}

// Business Logic
1. Open Tenant Spreadsheet
2. Read Products sheet
3. Filter active products
4. Return array
```

#### `createProduct(params)`
```javascript
// Request
{
  shopSheetId: String,
  name: String,
  category: String,
  price: Number,
  cost: Number?,
  description: String?,
  variants: Array<{
    type: String,
    value: String,
    priceAdjust: Number
  }>?
}

// Response
{
  success: Boolean,
  data: {
    productId: String
  }
}

// Business Logic
1. Validate required fields
2. Generate unique ID
3. Insert to Products sheet
4. If variants provided, insert to Variants sheet
5. Return product ID
```

#### `getVariants(params)`
```javascript
// Request
{
  shopSheetId: String,
  productId: String
}

// Response
{
  success: Boolean,
  data: [
    {
      id: String,
      productId: String,
      variantType: String,
      variantValue: String,
      priceAdjust: Number,
      isActive: Boolean
    }
  ]
}
```

### 4.3 Order APIs

#### `createOrder(params)`
```javascript
// Request
{
  shopSheetId: String,
  username: String,
  channel: String,
  items: [
    {
      productId: String,
      productName: String,
      quantity: Number,
      price: Number,
      variants: Object,
      addons: Array
    }
  ],
  subtotal: Number,
  tax: Number,
  total: Number,
  paymentMethod: String,
  amountReceived: Number?,
  change: Number?,
  slipUrl: String?
}

// Response
{
  success: Boolean,
  data: {
    orderId: String,
    orderNumber: String
  }
}

// Business Logic Flow
1. Validate all parameters
2. Open Tenant Spreadsheet
3. Generate Order ID and Number
4. Begin Transaction:
   a. Insert Order record
   b. Insert OrderItems records
   c. For each OrderItem:
      - Find matching Recipe
      - Calculate total quantity needed
      - Deduct from InventoryItems
      - Record StockMovement
   d. Insert Payment record
5. Commit Transaction
6. Return order info

// Key Function: deductStockForOrderItem()
For item in orderItems:
  1. Get Recipe matching (productId + variants)
  2. Calculate: needed = recipe.quantity * item.quantity
  3. Update InventoryItems: stock = stock - needed
  4. Insert StockMovement record
```

#### `getOrders(params)`
```javascript
// Request
{
  shopSheetId: String,
  startDate: String?,
  endDate: String?,
  status: String?
}

// Response
{
  success: Boolean,
  data: [
    {
      id: String,
      orderNumber: String,
      channel: String,
      total: Number,
      status: String,
      createdAt: String,
      itemCount: Number
    }
  ]
}
```

#### `getOrderDetail(params)`
```javascript
// Request
{
  shopSheetId: String,
  orderId: String
}

// Response
{
  success: Boolean,
  data: {
    order: { ... },
    items: [ ... ],
    payment: { ... }
  }
}
```

### 4.4 Inventory APIs

#### `getInventoryItems(params)`
```javascript
// Request
{
  shopSheetId: String
}

// Response
{
  success: Boolean,
  data: [
    {
      id: String,
      sku: String,
      name: String,
      unit: String,
      stock: Number,
      reorderPoint: Number,
      cost: Number
    }
  ]
}
```

#### `adjustStock(params)`
```javascript
// Request
{
  shopSheetId: String,
  itemId: String,
  type: String,      // 'ADD' | 'ADJUST'
  quantity: Number,
  note: String?,
  username: String
}

// Response
{
  success: Boolean,
  data: {
    movementId: String,
    newStock: Number
  }
}

// Business Logic
1. Get current stock
2. Calculate new stock
3. Update InventoryItems
4. Insert StockMovement record
5. Return new stock level
```

### 4.5 Dashboard & Reports APIs

#### `getDashboardData(params)`
```javascript
// Request
{
  shopSheetId: String,
  date: String?  // Default: today
}

// Response
{
  success: Boolean,
  data: {
    totalSales: Number,
    totalOrders: Number,
    lowStockItems: Number,
    totalProfit: Number,
    topProducts: [
      {
        name: String,
        count: Number,
        revenue: Number
      }
    ],
    lowStockList: [
      {
        id: String,
        name: String,
        stock: Number,
        unit: String
      }
    ]
  }
}

// Business Logic
1. Calculate today's sales (SUM Orders WHERE date = today)
2. Count today's orders
3. Count items WHERE stock <= reorderPoint
4. Calculate profit (sales - costs)
5. Get top 5 products by quantity sold
6. Get items with low stock
7. Return aggregated data
```

#### `getSalesReport(params)`
```javascript
// Request
{
  shopSheetId: String,
  startDate: String,
  endDate: String
}

// Response
{
  success: Boolean,
  data: {
    totalSales: Number,
    totalOrders: Number,
    avgOrderValue: Number,
    dailySales: [
      {
        date: String,
        sales: Number,
        orders: Number
      }
    ],
    topProducts: [ ... ],
    salesByChannel: { ... }
  }
}
```

### 4.6 File Upload APIs

#### `uploadSlipImage(params)`
```javascript
// Request
{
  shopSheetId: String,
  filename: String,
  mimeType: String,
  base64Data: String
}

// Response
{
  success: Boolean,
  data: {
    url: String,
    fileId: String
  }
}

// Business Logic
1. Get tenant folder from Master Sheet
2. Get/Create Slips folder
3. Get/Create Year folder (e.g., 2024)
4. Get/Create Month folder (e.g., 01)
5. Decode base64 to Blob
6. Create file in folder
7. Return file URL
```

### 4.7 Super Admin APIs

#### `getTenants(params)`
```javascript
// Response
{
  success: Boolean,
  data: {
    tenants: [ ... ],
    stats: {
      totalTenants: Number,
      activeTenants: Number,
      totalRevenue: Number,
      totalOrders: Number
    }
  }
}
```

#### `createTenant(params)`
```javascript
// Request
{
  name: String,
  contactName: String,
  phone: String,
  email: String,
  address: String?,
  adminUsername: String,
  adminPassword: String
}

// Response
{
  success: Boolean,
  data: {
    tenantId: String,
    sheetId: String,
    folderId: String
  }
}

// Business Logic
1. Generate Tenant ID
2. Create Tenant Folder
3. Create Tenant Spreadsheet
4. Create all sheets (Products, Orders, etc.)
5. Create admin user
6. Insert to Master Tenants sheet
7. Return IDs
```

---

## 5. Frontend Components

### 5.1 Component Architecture

```
Alpine.js App (coffeeShopApp)
├── State Management
│   ├── User State (username, role, shopSheetId)
│   ├── POS State (cart, products, variants)
│   ├── Orders State (list, filters)
│   ├── Inventory State (items)
│   ├── Dashboard State (stats, charts)
│   └── Settings State (shop config)
│
├── Pages (x-show based routing)
│   ├── LoginPage
│   ├── DashboardPage
│   ├── POSPage
│   ├── OrdersPage
│   ├── ProductsPage
│   ├── InventoryPage
│   ├── ReportsPage
│   └── SettingsPage
│
├── Modals
│   ├── VariantSelectorModal
│   ├── PaymentModal
│   ├── OrderDetailModal
│   ├── ProductFormModal
│   └── StockAdjustModal
│
└── Components
    ├── Navigation
    │   ├── TopBar
    │   └── Sidebar
    ├── Cards
    │   ├── StatsCard
    │   ├── ProductCard
    │   └── OrderCard
    └── Forms
        ├── LoginForm
        ├── ProductForm
        └── PaymentForm
```

### 5.2 State Structure

```javascript
coffeeShopApp() {
  return {
    // App State
    loading: Boolean,
    isAuthenticated: Boolean,
    currentPage: String,
    sidebarOpen: Boolean,

    // User Data
    username: String,
    userRole: String,
    tenantId: String,
    shopSheetId: String,
    shopName: String,

    // POS
    pos: {
      cart: Array<CartItem>,
      subtotal: Number,
      tax: Number,
      total: Number,
      searchQuery: String,
      selectedCategory: String,
      filteredProducts: Array,
      allProducts: Array
    },

    // Selected Product (for Variant Modal)
    selectedProduct: Object,
    selectedVariants: {
      size: String,
      temperature: String,
      sweetness: String
    },
    selectedAddons: Array<String>,
    variantQuantity: Number,

    // Payment
    payment: {
      method: String,
      received: Number,
      change: Number,
      slipFile: File?
    },

    // Orders
    orders: {
      list: Array,
      filteredList: Array,
      filters: {
        date: String,
        status: String,
        channel: String,
        searchQuery: String
      }
    },

    // Products
    products: {
      list: Array
    },

    // Inventory
    inventory: {
      list: Array
    },

    // Dashboard
    dashboardData: {
      totalSales: Number,
      totalOrders: Number,
      lowStockItems: Number,
      totalProfit: Number,
      topProducts: Array,
      lowStockList: Array
    },

    // Reports
    reports: {
      startDate: String,
      endDate: String,
      totalSales: Number,
      totalOrders: Number,
      avgOrderValue: Number
    },

    // Settings
    settings: {
      shopName: String,
      phone: String,
      address: String,
      taxRate: Number,
      taxId: String,
      printReceipt: Boolean,
      autoDeductStock: Boolean
    },

    // Modals
    modals: {
      variantSelector: Boolean,
      payment: Boolean,
      orderDetail: Boolean,
      productForm: Boolean,
      stockAdjust: Boolean
    }
  }
}
```

### 5.3 Key Functions

#### Authentication
```javascript
login()           // Login with credentials
logout()          // Logout and clear session
checkSavedSession() // Restore session from localStorage
```

#### Data Loading
```javascript
loadInitialData()  // Load all data on app start
loadDashboard()    // Load dashboard stats
loadProducts()     // Load products list
loadOrders()       // Load orders history
loadInventory()    // Load inventory items
loadReports()      // Load sales reports
```

#### POS Functions
```javascript
searchProducts()         // Search products by query
filterProducts()         // Filter by category
openVariantSelector()    // Open variant modal
calculateVariantPrice()  // Calculate price with variants
addToCart()             // Add product to cart
removeFromCart()        // Remove from cart
updateQuantity()        // Update cart item quantity
clearCart()             // Clear all cart items
updateCartTotals()      // Recalculate subtotal/tax/total
openPaymentModal()      // Open payment modal
confirmPayment()        // Process payment and create order
uploadSlip()            // Upload slip image (if transfer)
```

#### Utility Functions
```javascript
formatCurrency()   // Format number as THB currency
formatDateTime()   // Format date to Thai format
callAPI()          // Generic API caller
mockAPI()          // Mock API for development
```

---

## 6. Business Logic Flow

### 6.1 Order Creation Flow (Auto Stock Deduction)

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "ยืนยันชำระเงิน"                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  confirmPayment()                                            │
│  1. Validate payment (cash >= total OR slip uploaded)       │
│  2. Prepare orderItems array                                │
│  3. Upload slip image (if method = TRANSFER)                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  callAPI('createOrder', params)                              │
│  → google.script.run.createOrder(params)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: createOrder(params)                                │
│                                                              │
│  Step 1: Open Tenant Spreadsheet                            │
│  ├─ SpreadsheetApp.openById(params.shopSheetId)            │
│  └─ Get all sheets                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Generate Order ID                                   │
│  ├─ orderId = 'O' + timestamp + random                      │
│  └─ orderNumber = 'ORD-' + YYYYMMDD + '-' + seq             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Insert Order Record                                 │
│  └─ Orders sheet.appendRow([...orderData])                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Process Order Items (Loop)                         │
│  FOR EACH item in params.items:                             │
│    ├─ Insert OrderItem record                               │
│    └─ deductStockForOrderItem(item)                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  deductStockForOrderItem(item)                               │
│                                                              │
│  Step 4.1: Get Recipes                                      │
│  ├─ Read Recipes sheet                                      │
│  └─ Find recipes WHERE productId = item.productId           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4.2: Match Variant Combination                        │
│  FOR EACH recipe:                                           │
│    ├─ Parse recipe.variantCombination (JSON)                │
│    └─ Compare with item.variants                            │
│                                                              │
│  Example Match:                                             │
│    Recipe: {"SIZE":"LARGE","TEMP":"HOT"}                    │
│    Item:   {"size":"LARGE","temperature":"HOT"}             │
│    → MATCH! ✓                                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4.3: Calculate Quantity Needed                        │
│  FOR EACH matched recipe:                                   │
│    quantityNeeded = recipe.quantity * item.quantity         │
│                                                              │
│  Example:                                                    │
│    Recipe: เมล็ดกาแฟ 18g per unit                           │
│    Order: 2 cups                                            │
│    → Need: 18 * 2 = 36g                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4.4: Deduct from Inventory                           │
│  ├─ Find row in InventoryItems WHERE id = recipe.itemId    │
│  ├─ currentStock = row.stock                                │
│  ├─ newStock = currentStock - quantityNeeded               │
│  ├─ Check: newStock >= 0? (prevent negative stock)         │
│  └─ Update row.stock = newStock                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4.5: Record Stock Movement                           │
│  StockMovements.appendRow([                                 │
│    id: 'SM' + timestamp,                                    │
│    itemId: recipe.itemId,                                   │
│    type: 'DEDUCT',                                          │
│    quantity: -quantityNeeded,                               │
│    stockBefore: currentStock,                               │
│    stockAfter: newStock,                                    │
│    reference: orderId,                                      │
│    note: 'Auto deduct from order',                          │
│    username: params.username,                               │
│    createdAt: now                                           │
│  ])                                                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼ (Repeat for all items)
             │
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Insert Payment Record                              │
│  Payments.appendRow([                                        │
│    id, orderId, method, amount, received,                   │
│    change, slipUrl, createdAt                               │
│  ])                                                         │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Return Success                                     │
│  return {                                                    │
│    success: true,                                           │
│    data: {                                                  │
│      orderId: orderId,                                      │
│      orderNumber: orderNumber                               │
│    }                                                        │
│  }                                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: Success Handler                                   │
│  1. Show alert("บันทึกออเดอร์สำเร็จ!")                      │
│  2. Clear cart                                              │
│  3. Close payment modal                                     │
│  4. Reload dashboard (to update stats)                      │
│  5. Reload inventory (to show new stock levels)             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Variant Matching Algorithm

```javascript
// ฟังก์ชัน: matchVariants(recipeVariants, orderVariants)
// Purpose: เทียบว่า Variant ของ Recipe ตรงกับ Order หรือไม่

function matchVariants(recipeVariants, orderVariants) {
  // recipeVariants: {"SIZE":"LARGE","TEMP":"HOT"}
  // orderVariants: {"size":"LARGE","temperature":"HOT"}

  // Normalize keys (convert to uppercase)
  const normalizedRecipe = normalizeVariantKeys(recipeVariants);
  const normalizedOrder = normalizeVariantKeys(orderVariants);

  // Check all recipe keys exist in order
  for (let key in normalizedRecipe) {
    if (normalizedRecipe[key] !== normalizedOrder[key]) {
      return false; // Not match
    }
  }

  return true; // Match!
}

// Example Matching:
Recipe 1: {"SIZE":"LARGE"}
Order:    {"size":"LARGE","temperature":"HOT"}
→ MATCH (Order มี SIZE=LARGE)

Recipe 2: {"SIZE":"LARGE","TEMP":"HOT"}
Order:    {"size":"LARGE","temperature":"HOT"}
→ MATCH (ตรงทุก key)

Recipe 3: {"SIZE":"MEDIUM"}
Order:    {"size":"LARGE","temperature":"HOT"}
→ NOT MATCH (SIZE ไม่ตรง)
```

---

## 7. Data Flow Diagrams

### 7.1 Login Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────→│Frontend │────→│ Backend │────→│ Master  │
│ Input   │     │Alpine.js│     │code.gs  │     │ Sheet   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │ 1. Enter      │               │               │
     │ credentials   │               │               │
     ├──────────────→│               │               │
     │               │               │               │
     │               │ 2. login()    │               │
     │               ├──────────────→│               │
     │               │               │               │
     │               │               │ 3. Query      │
     │               │               │ Users sheet   │
     │               │               ├──────────────→│
     │               │               │               │
     │               │               │ 4. Return     │
     │               │               │ user data     │
     │               │               │←──────────────┤
     │               │               │               │
     │               │ 5. Validate   │               │
     │               │ password      │               │
     │               │←──────────────┤               │
     │               │               │               │
     │               │ 6. Get tenant │               │
     │               │ info          │               │
     │               ├──────────────→│               │
     │               │               │               │
     │               │               │ 7. Query      │
     │               │               │ Tenants       │
     │               │               ├──────────────→│
     │               │               │               │
     │               │ 8. Return     │ 8. Return     │
     │               │ session data  │ tenant        │
     │               │←──────────────┤←──────────────┤
     │               │               │               │
     │ 9. Save       │               │               │
     │ localStorage  │               │               │
     │←──────────────┤               │               │
     │               │               │               │
     │ 10. Navigate  │               │               │
     │ to Dashboard  │               │               │
     │←──────────────┤               │               │
```

### 7.2 POS - Add to Cart Flow

```
User                Frontend            Backend            Database
 │                     │                   │                  │
 │ Click Product       │                   │                  │
 ├────────────────────→│                   │                  │
 │                     │                   │                  │
 │                     │ Open Variant      │                  │
 │                     │ Selector Modal    │                  │
 │←────────────────────┤                   │                  │
 │                     │                   │                  │
 │ Select:             │                   │                  │
 │ - Size: LARGE       │                   │                  │
 │ - Temp: COLD        │                   │                  │
 │ - Sweet: 50%        │                   │                  │
 │ - Addon: วิปครีม    │                   │                  │
 ├────────────────────→│                   │                  │
 │                     │                   │                  │
 │                     │ Calculate Price   │                  │
 │                     │ = Base (100)      │                  │
 │                     │ + Large (+10)     │                  │
 │                     │ + Addon (+10)     │                  │
 │                     │ = 120 THB         │                  │
 │                     │                   │                  │
 │ Click "เพิ่มลงตะกร้า"│                   │                  │
 ├────────────────────→│                   │                  │
 │                     │                   │                  │
 │                     │ Add to pos.cart:  │                  │
 │                     │ {                 │                  │
 │                     │   productId,      │                  │
 │                     │   productName,    │                  │
 │                     │   price: 120,     │                  │
 │                     │   quantity: 1,    │                  │
 │                     │   variants: {},   │                  │
 │                     │   addons: []      │                  │
 │                     │ }                 │                  │
 │                     │                   │                  │
 │                     │ updateCartTotals()│                  │
 │                     │                   │                  │
 │ Show Updated Cart   │                   │                  │
 │←────────────────────┤                   │                  │
```

---

## 8. Security & Authentication

### 8.1 Authentication Flow

1. **Password Hashing**
   ```javascript
   // Hash password with SHA-256
   function hashPassword(password) {
     const hash = Utilities.computeDigest(
       Utilities.DigestAlgorithm.SHA_256,
       password
     );
     return Utilities.base64Encode(hash);
   }
   ```

2. **Session Management**
   - Store session in `localStorage`
   - Include: username, role, tenantId, shopSheetId
   - Auto-restore on page reload
   - Clear on logout

3. **Authorization**
   ```javascript
   // Check user role before sensitive operations
   if (userRole !== 'ADMIN') {
     return { success: false, message: 'Unauthorized' };
   }
   ```

### 8.2 Data Isolation

1. **Tenant Isolation**
   - Each tenant has separate Spreadsheet
   - Cannot access other tenant's data
   - `shopSheetId` validates ownership

2. **Parameter Validation**
   ```javascript
   // Always validate shopSheetId belongs to tenant
   function validateAccess(shopSheetId, tenantId) {
     const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
     const tenant = getTenantById(tenantId);
     return tenant.sheetId === shopSheetId;
   }
   ```

### 8.3 Input Validation

```javascript
// Example: Validate product creation
function validateProduct(params) {
  const errors = [];

  if (!params.name || params.name.length < 2) {
    errors.push('Product name must be at least 2 characters');
  }

  if (!params.price || params.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!['COFFEE','TEA','BEVERAGE','FOOD','DESSERT'].includes(params.category)) {
    errors.push('Invalid category');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
```

---

## 9. Key Features Implementation

### 9.1 Product Variants System

**Components:**
1. **Variant Definition (Database)**
   ```
   Variants Sheet:
   - Each variant has: type, value, priceAdjust
   - Example: SIZE=LARGE, priceAdjust=+10
   ```

2. **Variant Selector (Frontend)**
   ```html
   <!-- Size Selection -->
   <button @click="selectedVariants.size = 'LARGE'"
           :class="selectedVariants.size === 'LARGE' ? 'selected' : ''">
     Large (+10฿)
   </button>
   ```

3. **Price Calculation**
   ```javascript
   calculateVariantPrice() {
     let price = this.selectedProduct.price; // Base: 100

     if (this.selectedVariants.size === 'LARGE') {
       price += 10; // Size adjustment
     }

     this.selectedAddons.forEach(addon => {
       if (addon.includes('10฿')) price += 10;
     });

     return price; // Final: 120
   }
   ```

### 9.2 Auto Stock Deduction

**Key Concepts:**

1. **Recipe/BOM Mapping**
   ```
   Product: ลาเต้ (LARGE, HOT)
   ↓
   Recipes:
   - เมล็ดกาแฟ: 18g
   - นมสด: 250ml
   - น้ำตาล: 12g
   - ถ้วย Large: 1 ใบ
   ```

2. **Deduction Logic**
   ```javascript
   // When order is created with qty=2
   For each recipe item:
     needed = recipe.quantity * order.quantity
     newStock = currentStock - needed

   Example:
   - เมล็ดกาแฟ: 5000g - (18g * 2) = 4964g
   - นมสด: 10000ml - (250ml * 2) = 9500ml
   ```

3. **Stock Movement Tracking**
   ```
   Every deduction creates a StockMovement record:
   - Type: DEDUCT
   - Quantity: -36 (negative)
   - Reference: Order ID
   - Username: Who made the order
   ```

### 9.3 File Upload System

**Flow:**

1. **Frontend: Convert to Base64**
   ```javascript
   const reader = new FileReader();
   reader.onload = (e) => {
     const base64 = e.target.result.split(',')[1];
     uploadSlip(base64);
   };
   reader.readAsDataURL(file);
   ```

2. **Backend: Create Folder Structure**
   ```javascript
   Master Folder
   └── Tenants/
       └── [TenantID]/
           └── Slips/
               └── 2024/
                   └── 01/
                       └── slip_1234567890.jpg
   ```

3. **Backend: Save File**
   ```javascript
   const blob = Utilities.newBlob(
     Utilities.base64Decode(base64Data),
     mimeType,
     filename
   );

   const file = folder.createFile(blob);
   const url = file.getUrl();

   return { url, fileId: file.getId() };
   ```

### 9.4 Reports & Analytics

**Dashboard Calculations:**

```javascript
// Today's Sales
SELECT SUM(total) FROM Orders
WHERE DATE(createdAt) = TODAY()
AND status = 'COMPLETED'

// Top Products (Last 30 days)
SELECT
  productName,
  SUM(quantity) as count,
  SUM(subtotal) as revenue
FROM OrderItems
JOIN Orders ON Orders.id = OrderItems.orderId
WHERE Orders.createdAt >= DATE_SUB(NOW(), 30 DAYS)
GROUP BY productName
ORDER BY count DESC
LIMIT 5

// Low Stock Items
SELECT * FROM InventoryItems
WHERE stock <= reorderPoint
ORDER BY stock ASC
```

---

## 10. Deployment Architecture

### 10.1 Google Apps Script Deployment

```
Google Cloud Platform
└── Apps Script Project
    ├── Files
    │   ├── setup.gs
    │   ├── code.gs
    │   ├── index.html
    │   ├── app.js.html
    │   └── superadmin.html
    │
    ├── Deployments
    │   └── Web App
    │       ├── Version: 1
    │       ├── Execute as: Me (owner)
    │       └── Access: Anyone
    │
    └── Triggers
        └── (None - all on-demand)
```

### 10.2 Data Storage Architecture

```
Google Drive
└── Master Folder (MASTER_FOLDER_ID)
    ├── Master Spreadsheet (MASTER_SHEET_ID)
    │   └── Sheets: Tenants, Users, Licenses, AuditLog
    │
    ├── Tenants/
    │   ├── TENANT_001/
    │   │   ├── TENANT_001.xlsx
    │   │   └── Slips/YYYY/MM/
    │   │
    │   └── TENANT_002/
    │       └── ...
    │
    └── Backups/
        └── Daily/
```

### 10.3 Scalability Considerations

**Limitations:**
- Google Sheets: Max 10 million cells per spreadsheet
- Apps Script: 6 min execution time limit
- Drive: 15 GB free storage per account

**Solutions:**
1. **Separate Sheets per Tenant**
   - Prevents hitting cell limits
   - Each tenant isolated

2. **Pagination for Large Datasets**
   ```javascript
   function getOrders(params) {
     const limit = params.limit || 100;
     const offset = params.offset || 0;
     // Return subset of data
   }
   ```

3. **Archival Strategy**
   - Move old orders to Archive sheet monthly
   - Keep last 3 months in main sheet

4. **Caching**
   ```javascript
   const cache = CacheService.getScriptCache();

   // Cache dashboard data for 5 minutes
   function getDashboard() {
     const cached = cache.get('dashboard');
     if (cached) return JSON.parse(cached);

     const data = calculateDashboard();
     cache.put('dashboard', JSON.stringify(data), 300);
     return data;
   }
   ```

---

## 11. Performance Optimization

### 11.1 Frontend Optimization

1. **Lazy Loading**
   - Load products only when POS page opened
   - Load orders only when needed

2. **Debouncing**
   ```javascript
   // Search with debounce
   let searchTimeout;
   function searchProducts() {
     clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
       this.filterProducts();
     }, 300);
   }
   ```

3. **Local State Management**
   - Keep cart in memory
   - Only save to server on checkout

### 11.2 Backend Optimization

1. **Batch Operations**
   ```javascript
   // Instead of row-by-row:
   for (item of items) {
     sheet.appendRow(item); // SLOW
   }

   // Use batch:
   const data = items.map(item => [...values]);
   sheet.getRange(startRow, 1, data.length, cols).setValues(data);
   ```

2. **Minimize Sheet Reads**
   ```javascript
   // Read once, filter in memory
   const allData = sheet.getDataRange().getValues();
   const filtered = allData.filter(row => row[5] === 'ACTIVE');
   ```

3. **Use getValues() instead of getValue()**
   ```javascript
   // Slow: 100 API calls
   for (let i = 0; i < 100; i++) {
     const value = sheet.getRange(i, 1).getValue();
   }

   // Fast: 1 API call
   const values = sheet.getRange(1, 1, 100, 1).getValues();
   ```

---

## 12. Future Enhancements

### 12.1 Planned Features

1. **Customer Loyalty Program**
   - Points system
   - Member tiers
   - Rewards redemption

2. **Kitchen Display System (KDS)**
   - Real-time order display for baristas
   - Order status tracking
   - Preparation time tracking

3. **Mobile App**
   - React Native app
   - Barcode scanning
   - Offline support

4. **Advanced Analytics**
   - Sales forecasting
   - Inventory optimization
   - Customer behavior analysis

5. **Integration APIs**
   - LINE OA integration
   - Food delivery platforms
   - Accounting software (Flowaccount, Sellsuki)

### 12.2 Technical Debt

1. **Testing**
   - Add unit tests for critical functions
   - E2E testing with Playwright

2. **Error Handling**
   - Improve error messages
   - Add retry logic
   - Better logging system

3. **Documentation**
   - API documentation with examples
   - Video tutorials
   - Admin guide

---

## 13. Appendix

### 13.1 Glossary

| Term | Definition |
|------|------------|
| **Tenant** | หนึ่งสาขาร้านกาแฟในระบบ Multi-tenant |
| **Variant** | ตัวเลือกปรับแต่งสินค้า (Size, Temperature, etc.) |
| **Modifier** | ท้อปปิ้งหรือส่วนเสริม (Add-ons) |
| **Recipe/BOM** | Bill of Materials - สูตรวัตถุดิบของสินค้า |
| **Stock Movement** | บันทึกการเคลื่อนไหวของสต็อก |
| **SKU** | Stock Keeping Unit - รหัสสินค้า |
| **POS** | Point of Sale - ระบบขายหน้าร้าน |
| **shopSheetId** | ID ของ Spreadsheet เฉพาะ Tenant |

### 13.2 Code Conventions

**Naming:**
- Variables: camelCase (`productName`)
- Constants: UPPER_SNAKE_CASE (`MASTER_SHEET_ID`)
- Functions: camelCase (`createOrder()`)
- Classes: PascalCase (`OrderManager`)

**Comments:**
```javascript
// Single-line comment for simple explanations

/**
 * Multi-line comment for function documentation
 * @param {String} productId - The product ID
 * @returns {Object} Product data
 */
```

**File Organization:**
```
// 1. Constants
const CONFIG = { ... };

// 2. Entry Points
function doGet() { ... }
function doPost() { ... }

// 3. API Functions (Alphabetical)
function createOrder() { ... }
function getOrders() { ... }

// 4. Helper Functions
function generateId() { ... }
function formatDate() { ... }
```

---

**Document Version:** 1.0.0
**Last Updated:** 2024-01-15
**Author:** Claude Code (Anthropic)

---

© 2024 Coffee Shop POS System - All Rights Reserved
