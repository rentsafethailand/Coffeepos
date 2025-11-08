# Database Schema - Coffee Shop POS

## 🗄️ Master Spreadsheet Schema

### Sheet: Tenants
จัดเก็บข้อมูลร้านค้าทั้งหมดในระบบ

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| tenantId | String (PK) | รหัสร้าน (auto-increment) | TENANT_001 |
| tenantName | String | ชื่อร้าน | ร้านกาแฟดอยช้าง |
| sheetId | String | Spreadsheet ID ของร้าน | 1abc...xyz |
| folderId | String | Folder ID ของร้าน | 1def...uvw |
| licenseKey | String | License key | LIC-2024-001 |
| licenseType | String | ประเภท license | STANDARD, PRO, ENTERPRISE |
| startDate | Date | วันเริ่มใช้งาน | 2024-01-01 |
| endDate | Date | วันหมดอายุ | 2024-12-31 |
| status | String | สถานะ | ACTIVE, SUSPENDED, EXPIRED |
| maxUsers | Number | จำนวน user สูงสุด | 10 |
| ownerName | String | ชื่อเจ้าของ | คุณสมชาย |
| ownerEmail | String | Email เจ้าของ | somchai@example.com |
| ownerPhone | String | เบอร์โทร | 081-234-5678 |
| address | String | ที่อยู่ | 123 ถ.ช้างคลาน |
| taxId | String | เลขผู้เสียภาษี | 1234567890123 |
| createdDate | DateTime | วันที่สร้าง | 2024-01-01 10:30:00 |
| createdBy | String | ผู้สร้าง | ADMIN |
| modifiedDate | DateTime | วันที่แก้ไข | 2024-01-15 14:20:00 |
| modifiedBy | String | ผู้แก้ไข | ADMIN |

### Sheet: Users (Master)
จัดเก็บข้อมูล user ทั้งหมดในระบบ

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| userId | String (PK) | รหัส user | USR_T001_001 |
| tenantId | String (FK) | รหัสร้าน | TENANT_001 |
| username | String (Unique) | ชื่อผู้ใช้ | admin@tenant001 |
| password | String | รหัสผ่าน (hashed) | $2a$10$... |
| role | String | บทบาท | ADMIN, MANAGER, CASHIER, KITCHEN |
| fullName | String | ชื่อ-นามสกุล | สมชาย ใจดี |
| email | String | Email | somchai@example.com |
| phone | String | เบอร์โทร | 081-234-5678 |
| status | String | สถานะ | ACTIVE, INACTIVE |
| lastLogin | DateTime | Login ล่าสุด | 2024-01-15 08:30:00 |
| createdDate | DateTime | วันที่สร้าง | 2024-01-01 10:00:00 |
| createdBy | String | ผู้สร้าง | ADMIN |

### Sheet: Licenses
จัดเก็บข้อมูล license

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| licenseKey | String (PK) | License key | LIC-2024-001 |
| licenseType | String | ประเภท | STANDARD, PRO, ENTERPRISE |
| maxTenants | Number | จำนวนร้านสูงสุด | 1 |
| maxUsers | Number | จำนวน user สูงสุด | 10 |
| maxProducts | Number | จำนวนสินค้าสูงสุด | 100 |
| features | String (JSON) | ฟีเจอร์ที่ได้ | {"pos":true,"inventory":true} |
| price | Number | ราคา | 990 |
| currency | String | สกุลเงิน | THB |
| status | String | สถานะ | ACTIVE, EXPIRED |

---

## 🏪 Tenant Spreadsheet Schema

### Sheet: Products
จัดเก็บข้อมูลสินค้า

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| productId | String (PK) | รหัสสินค้า | PRD_001 |
| sku | String | SKU | ESP-LAT-001 |
| barcode | String | Barcode | 8850123456789 |
| name | String | ชื่อสินค้า | Espresso Latte |
| description | String | รายละเอียด | กาแฟเอสเพรสโซ่ผสมนม |
| category | String | หมวดหมู่ | กาแฟร้อน |
| basePrice | Number | ราคาพื้นฐาน | 45 |
| cost | Number | ต้นทุน | 20 |
| imageUrl | String | URL รูปภาพ | https://drive.google.com/... |
| hasVariants | Boolean | มี variants หรือไม่ | TRUE |
| hasModifiers | Boolean | มี modifiers หรือไม่ | TRUE |
| status | String | สถานะ | ACTIVE, INACTIVE |
| isAvailable | Boolean | วางขายหรือไม่ | TRUE |
| sortOrder | Number | ลำดับการแสดงผล | 1 |
| tags | String (CSV) | Tags | coffee,hot,bestseller |
| createdDate | DateTime | วันที่สร้าง | 2024-01-01 10:00:00 |
| createdBy | String | ผู้สร้าง | ADMIN |
| modifiedDate | DateTime | วันที่แก้ไข | 2024-01-15 14:00:00 |
| modifiedBy | String | ผู้แก้ไข | MANAGER |

### Sheet: Variants
จัดเก็บ variants ของสินค้า (ขนาด, อุณหภูมิ, ความหวาน)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| variantId | String (PK) | รหัส variant | VAR_001 |
| productId | String (FK) | รหัสสินค้า | PRD_001 |
| variantType | String | ประเภท variant | SIZE, TEMPERATURE, SWEETNESS |
| variantValue | String | ค่า variant | MEDIUM, HOT, 50% |
| displayName | String | ชื่อแสดง | กลาง, ร้อน, 50% |
| priceAdjust | Number | ปรับราคา (+/-) | +10 |
| isDefault | Boolean | เป็นค่า default หรือไม่ | TRUE |
| isAvailable | Boolean | พร้อมขายหรือไม่ | TRUE |
| sortOrder | Number | ลำดับการแสดงผล | 2 |

**ตัวอย่าง Variant Types:**
- **SIZE**: SMALL, MEDIUM, LARGE, EXTRA_LARGE
- **TEMPERATURE**: HOT, COLD, ICED, FRAPPE
- **SWEETNESS**: 0%, 25%, 50%, 75%, 100%
- **ICE**: NO_ICE, LESS_ICE, NORMAL_ICE, EXTRA_ICE
- **MILK**: NO_MILK, LOW_FAT, FULL_CREAM, SOY, ALMOND

### Sheet: Modifiers
จัดเก็บ modifiers/add-ons (ท้อปปิ้ง, ช็อตเพิ่ม)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| modifierId | String (PK) | รหัส modifier | MOD_001 |
| productId | String (FK) | รหัสสินค้า (null = ทั่วไป) | PRD_001 |
| name | String | ชื่อ | เพิ่มช็อตกาแฟ |
| description | String | รายละเอียด | เพิ่มความเข้มข้น |
| price | Number | ราคาเพิ่ม | 25 |
| cost | Number | ต้นทุน | 10 |
| modifierType | String | ประเภท | EXTRA_SHOT, TOPPING, SYRUP |
| maxQuantity | Number | จำนวนสูงสุด | 3 |
| isAvailable | Boolean | พร้อมขายหรือไม่ | TRUE |
| sortOrder | Number | ลำดับการแสดงผล | 1 |

**ตัวอย่าง Modifiers:**
- EXTRA_SHOT: เพิ่มช็อตกาแฟ, เพิ่มช็อตเอสเพรสโซ
- TOPPING: วิปครีม, ช็อกโกแลตชิพ, คาราเมล
- SYRUP: ไซรัปวานิลลา, ไซรัปคาราเมล, ไซรัปเฮเซลนัท
- MILK: เปลี่ยนนมสด, เปลี่ยนนมถั่วเหลือง

### Sheet: InventoryItems
จัดเก็บวัตถุดิบ/ส่วนผสม

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| itemId | String (PK) | รหัสวัตถุดิบ | INV_001 |
| itemCode | String | รหัสอ้างอิง | MILK-001 |
| itemName | String | ชื่อวัตถุดิบ | นมสดพาสเจอร์ไรส์ |
| category | String | หมวดหมู่ | นม, กาแฟ, น้ำเชื่อม |
| unit | String | หน่วย | ml, g, kg, ถุง |
| currentStock | Number | สต็อกปัจจุบัน | 5000 |
| minStock | Number | สต็อกขั้นต่ำ | 1000 |
| maxStock | Number | สต็อกสูงสุด | 10000 |
| reorderPoint | Number | จุดสั่งซื้อใหม่ | 1500 |
| reorderQty | Number | จำนวนสั่งซื้อแนะนำ | 5000 |
| unitCost | Number | ราคาต่อหน่วย | 1.5 |
| supplierId | String (FK) | รหัสผู้จำหน่าย | SUP_001 |
| status | String | สถานะ | IN_STOCK, LOW_STOCK, OUT_OF_STOCK |
| lastPurchaseDate | Date | วันซื้อล่าสุด | 2024-01-10 |
| lastPurchasePrice | Number | ราคาซื้อล่าสุด | 7500 |
| createdDate | DateTime | วันที่สร้าง | 2024-01-01 10:00:00 |

### Sheet: Recipes
จัดเก็บสูตรการใช้วัตถุดิบ (BOM - Bill of Materials)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| recipeId | String (PK) | รหัสสูตร | RCP_001 |
| productId | String (FK) | รหัสสินค้า | PRD_001 |
| variantCombination | String (JSON) | Combination ของ variants | {"SIZE":"MEDIUM","TEMP":"HOT"} |
| itemId | String (FK) | รหัสวัตถุดิบ | INV_001 |
| quantity | Number | จำนวนที่ใช้ | 200 |
| unit | String | หน่วย | ml |
| notes | String | หมายเหตุ | สำหรับแก้วกลางแบบร้อน |
| createdDate | DateTime | วันที่สร้าง | 2024-01-01 10:00:00 |

**ตัวอย่าง Recipe:**
```
Product: Espresso Latte (Medium, Hot)
Recipe:
- เมด็กาแฟ Espresso: 18g
- นมสด: 200ml
- น้ำตาล (50%): 10g
- ถ้วย Medium: 1 ใบ
```

### Sheet: Orders
จัดเก็บข้อมูลออเดอร์

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| orderId | String (PK) | รหัสออเดอร์ | ORD_20240115_001 |
| orderNumber | String (Unique) | เลขออเดอร์ | #001 |
| channelId | String (FK) | รหัสช่องทาง | CH_001 |
| channelName | String | ชื่อช่องทาง | หน้าร้าน, LINE OA, Grab |
| customerId | String (FK) | รหัสลูกค้า (optional) | CST_001 |
| customerName | String | ชื่อลูกค้า | คุณสมหญิง |
| staffId | String (FK) | รหัสพนักงาน | STF_001 |
| staffName | String | ชื่อพนักงาน | สมชาย |
| orderType | String | ประเภทออเดอร์ | DINE_IN, TAKEAWAY, DELIVERY |
| tableNumber | String | เลขโต๊ะ | A-05 |
| queueNumber | String | เลขคิว | Q-042 |
| subtotal | Number | ยอดรวมก่อนภาษี | 135 |
| discount | Number | ส่วนลด | 15 |
| tax | Number | ภาษี (7%) | 8.4 |
| deliveryFee | Number | ค่าจัดส่ง | 0 |
| total | Number | ยอดรวมทั้งสิ้น | 128.4 |
| paymentMethod | String | วิธีชำระเงิน | CASH, TRANSFER, QR, CARD |
| paymentStatus | String | สถานะการชำระ | PENDING, PAID, REFUNDED |
| receivedAmount | Number | เงินที่รับ | 200 |
| changeAmount | Number | เงินทอน | 71.6 |
| slipImageUrl | String | URL รูปสลิป | https://drive.google.com/... |
| status | String | สถานะออเดอร์ | PENDING, PREPARING, READY, COMPLETED, CANCELLED |
| notes | String | หมายเหตุ | ไม่ใส่น้ำแข็ง |
| createdDate | DateTime | วันที่สร้าง | 2024-01-15 10:30:00 |
| completedDate | DateTime | วันที่เสร็จ | 2024-01-15 10:45:00 |
| cancelledDate | DateTime | วันที่ยกเลิก | - |
| cancelReason | String | เหตุผลยกเลิก | - |

### Sheet: OrderItems
จัดเก็บรายการสินค้าในออเดอร์

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| orderItemId | String (PK) | รหัสรายการ | OI_001 |
| orderId | String (FK) | รหัสออเดอร์ | ORD_20240115_001 |
| productId | String (FK) | รหัสสินค้า | PRD_001 |
| productName | String | ชื่อสินค้า | Espresso Latte |
| variants | String (JSON) | Variants ที่เลือก | {"SIZE":"MEDIUM","TEMP":"HOT"} |
| modifiers | String (JSON) | Modifiers ที่เลือก | [{"id":"MOD_001","qty":1}] |
| variantText | String | ข้อความ variants | กลาง, ร้อน, หวาน 50% |
| specialInstructions | String | คำขอพิเศษ | น้ำแข็งน้อย |
| quantity | Number | จำนวน | 2 |
| unitPrice | Number | ราคาต่อหน่วย | 65 |
| subtotal | Number | ยอดรวม | 130 |
| cost | Number | ต้นทุนต่อหน่วย | 25 |
| totalCost | Number | ต้นทุนรวม | 50 |
| profit | Number | กำไร | 80 |
| status | String | สถานะ | PENDING, PREPARING, READY |

### Sheet: Channels
จัดเก็บช่องทางขาย

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| channelId | String (PK) | รหัสช่องทาง | CH_001 |
| channelName | String | ชื่อช่องทาง | หน้าร้าน |
| channelType | String | ประเภท | POS, LINE_OA, GRAB, FOODPANDA |
| commissionRate | Number | ค่าคอมมิชชั่น (%) | 30 |
| deliveryFee | Number | ค่าจัดส่ง | 0 |
| isActive | Boolean | เปิดใช้งาน | TRUE |
| settings | String (JSON) | การตั้งค่า | {"apiKey":"...", "webhook":"..."} |

### Sheet: Customers
จัดเก็บข้อมูลลูกค้า

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| customerId | String (PK) | รหัสลูกค้า | CST_001 |
| customerName | String | ชื่อลูกค้า | คุณสมหญิง ใจดี |
| phone | String (Unique) | เบอร์โทร | 081-234-5678 |
| email | String | Email | somying@example.com |
| lineId | String | LINE ID | Ub1234567890abcdef |
| address | String | ที่อยู่ | 456 ถ.นิมมาน |
| points | Number | คะแนนสะสม | 350 |
| totalOrders | Number | จำนวนออเดอร์ | 15 |
| totalSpent | Number | ยอดซื้อรวม | 4500 |
| lastOrderDate | Date | ออเดอร์ล่าสุด | 2024-01-15 |
| memberSince | Date | สมาชิกเมื่อ | 2023-12-01 |
| tier | String | ระดับ | BRONZE, SILVER, GOLD, PLATINUM |
| status | String | สถานะ | ACTIVE, INACTIVE |

### Sheet: Staff
จัดเก็บข้อมูลพนักงาน

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| staffId | String (PK) | รหัสพนักงาน | STF_001 |
| userId | String (FK) | รหัส user | USR_T001_001 |
| staffCode | String | รหัสพนักงาน | EMP001 |
| fullName | String | ชื่อ-นามสกุล | สมชาย ใจดี |
| nickname | String | ชื่อเล่น | ชาย |
| position | String | ตำแหน่ง | Barista, Cashier, Manager |
| department | String | แผนก | Front, Kitchen |
| phone | String | เบอร์โทร | 081-234-5678 |
| email | String | Email | somchai@example.com |
| hireDate | Date | วันเริ่มงาน | 2023-01-15 |
| salary | Number | เงินเดือน | 15000 |
| commissionRate | Number | ค่าคอมมิชชั่น (%) | 5 |
| status | String | สถานะ | ACTIVE, RESIGNED, SUSPENDED |

### Sheet: Suppliers
จัดเก็บข้อมูลผู้จำหน่าย

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| supplierId | String (PK) | รหัสผู้จำหน่าย | SUP_001 |
| supplierName | String | ชื่อผู้จำหน่าย | บริษัท กาแฟดี จำกัด |
| contactPerson | String | ผู้ติดต่อ | คุณสมศักดิ์ |
| phone | String | เบอร์โทร | 02-123-4567 |
| email | String | Email | contact@coffee.com |
| address | String | ที่อยู่ | 789 ถ.พระราม 4 |
| taxId | String | เลขผู้เสียภาษี | 0123456789012 |
| paymentTerms | String | เงื่อนไขชำระเงิน | Net 30 days |
| creditLimit | Number | วงเงินเครดิต | 100000 |
| rating | Number | คะแนน (1-5) | 4.5 |
| status | String | สถานะ | ACTIVE, INACTIVE |

### Sheet: PurchaseOrders
จัดเก็บใบสั่งซื้อ

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| poId | String (PK) | รหัส PO | PO_20240115_001 |
| poNumber | String (Unique) | เลข PO | PO-2024-001 |
| supplierId | String (FK) | รหัสผู้จำหน่าย | SUP_001 |
| supplierName | String | ชื่อผู้จำหน่าย | บริษัท กาแฟดี จำกัด |
| orderDate | Date | วันที่สั่ง | 2024-01-15 |
| expectedDate | Date | วันที่คาดว่าจะได้รับ | 2024-01-20 |
| receivedDate | Date | วันที่รับของ | 2024-01-19 |
| subtotal | Number | ยอดรวม | 15000 |
| discount | Number | ส่วนลด | 500 |
| tax | Number | ภาษี | 1015 |
| total | Number | รวมทั้งสิ้น | 15515 |
| status | String | สถานะ | DRAFT, PENDING, APPROVED, RECEIVED, CANCELLED |
| notes | String | หมายเหตุ | ส่งก่อน 10:00 น. |
| createdBy | String | ผู้สร้าง | MANAGER |
| approvedBy | String | ผู้อนุมัติ | ADMIN |
| receivedBy | String | ผู้รับของ | STF_001 |

### Sheet: POItems
จัดเก็บรายการสินค้าในใบสั่งซื้อ

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| poItemId | String (PK) | รหัสรายการ | POI_001 |
| poId | String (FK) | รหัส PO | PO_20240115_001 |
| itemId | String (FK) | รหัสวัตถุดิบ | INV_001 |
| itemName | String | ชื่อวัตถุดิบ | นมสดพาสเจอร์ไรส์ |
| quantity | Number | จำนวนสั่ง | 10000 |
| receivedQty | Number | จำนวนรับ | 10000 |
| unit | String | หน่วย | ml |
| unitPrice | Number | ราคาต่อหน่วย | 1.5 |
| subtotal | Number | ยอดรวม | 15000 |

### Sheet: Promotions
จัดเก็บโปรโมชั่น/ส่วนลด

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| promotionId | String (PK) | รหัสโปรโมชั่น | PRM_001 |
| promotionName | String | ชื่อโปรโมชั่น | ซื้อ 1 แถม 1 |
| promotionType | String | ประเภท | PERCENTAGE, FIXED, BUY_X_GET_Y |
| discountValue | Number | มูลค่าส่วนลด | 50 (%) หรือ 20 (฿) |
| minPurchase | Number | ยอดซื้อขั้นต่ำ | 100 |
| applicableProducts | String (JSON) | สินค้าที่ใช้ได้ | ["PRD_001", "PRD_002"] |
| applicableChannels | String (JSON) | ช่องทางที่ใช้ได้ | ["CH_001"] |
| couponCode | String | รหัสคูปอง | NEWYEAR2024 |
| startDate | DateTime | วันเริ่ม | 2024-01-01 00:00:00 |
| endDate | DateTime | วันสิ้นสุด | 2024-01-31 23:59:59 |
| usageLimit | Number | จำนวนครั้งสูงสุด | 100 |
| usageCount | Number | ใช้ไปแล้ว | 45 |
| isActive | Boolean | เปิดใช้งาน | TRUE |

### Sheet: Payments
จัดเก็บรายการชำระเงิน

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| paymentId | String (PK) | รหัสการชำระเงิน | PAY_001 |
| orderId | String (FK) | รหัสออเดอร์ | ORD_20240115_001 |
| paymentMethod | String | วิธีชำระ | CASH, TRANSFER, QR, CARD |
| amount | Number | จำนวนเงิน | 128.4 |
| receivedAmount | Number | เงินที่รับ | 200 |
| changeAmount | Number | เงินทอน | 71.6 |
| referenceNumber | String | เลขอ้างอิง | REF123456 |
| slipImageUrl | String | URL รูปสลิป | https://drive.google.com/... |
| status | String | สถานะ | SUCCESS, PENDING, FAILED |
| paidDate | DateTime | วันที่ชำระ | 2024-01-15 10:30:00 |

### Sheet: StockMovements
จัดเก็บประวัติการเคลื่อนไหวของสต็อก

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| movementId | String (PK) | รหัสการเคลื่อนไหว | MOV_001 |
| itemId | String (FK) | รหัสวัตถุดิบ | INV_001 |
| itemName | String | ชื่อวัตถุดิบ | นมสดพาสเจอร์ไรส์ |
| movementType | String | ประเภท | IN, OUT, ADJUST, WASTE |
| quantity | Number | จำนวน | -200 |
| unit | String | หน่วย | ml |
| beforeQty | Number | จำนวนก่อน | 5000 |
| afterQty | Number | จำนวนหลัง | 4800 |
| referenceType | String | ประเภทอ้างอิง | ORDER, PO, ADJUSTMENT |
| referenceId | String | รหัสอ้างอิง | ORD_20240115_001 |
| reason | String | เหตุผล | ขายสินค้า, รับของจาก PO |
| notes | String | หมายเหตุ | - |
| createdDate | DateTime | วันที่บันทึก | 2024-01-15 10:30:00 |
| createdBy | String | ผู้บันทึก | STF_001 |

### Sheet: Settings
จัดเก็บการตั้งค่าของร้าน

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| settingKey | String (PK) | Key | shop_name |
| settingValue | String | Value | ร้านกาแฟดอยช้าง |
| settingType | String | ประเภท | STRING, NUMBER, BOOLEAN, JSON |
| description | String | คำอธิบาย | ชื่อร้าน |
| category | String | หมวดหมู่ | GENERAL, TAX, RECEIPT, NOTIFICATION |

**ตัวอย่าง Settings:**
- `shop_name`: ชื่อร้าน
- `shop_address`: ที่อยู่
- `shop_phone`: เบอร์โทร
- `tax_rate`: อัตราภาษี (0.07 = 7%)
- `currency`: สกุลเงิน (THB)
- `receipt_footer`: ข้อความท้ายใบเสร็จ
- `promptpay_number`: เบอร์ PromptPay

### Sheet: AuditLog
จัดเก็บประวัติการใช้งาน

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| logId | String (PK) | รหัส log | LOG_001 |
| userId | String | รหัส user | USR_T001_001 |
| username | String | ชื่อผู้ใช้ | admin |
| action | String | การกระทำ | CREATE, UPDATE, DELETE, LOGIN |
| module | String | โมดูล | PRODUCTS, ORDERS, USERS |
| recordId | String | รหัสข้อมูล | PRD_001 |
| changes | String (JSON) | การเปลี่ยนแปลง | {"price": {"old": 45, "new": 50}} |
| ipAddress | String | IP Address | 203.0.113.1 |
| userAgent | String | User Agent | Mozilla/5.0... |
| timestamp | DateTime | เวลา | 2024-01-15 10:30:00 |

---

## 🔗 Foreign Key Relationships

```
Tenants
  └─> Users (tenantId)
  └─> Products (via sheetId)

Products
  ├─> Variants (productId)
  ├─> Modifiers (productId)
  └─> Recipes (productId)

Recipes
  └─> InventoryItems (itemId)

Orders
  ├─> OrderItems (orderId)
  ├─> Customers (customerId)
  ├─> Staff (staffId)
  ├─> Channels (channelId)
  └─> Payments (orderId)

OrderItems
  ├─> Products (productId)
  └─> Recipes (trigger stock deduction)

PurchaseOrders
  ├─> Suppliers (supplierId)
  └─> POItems (poId)

POItems
  └─> InventoryItems (itemId)

StockMovements
  └─> InventoryItems (itemId)
```

---

## 📊 Index Strategy (for faster queries)

**Products:**
- productId (PK)
- sku (Unique)
- category + status

**Orders:**
- orderId (PK)
- orderNumber (Unique)
- createdDate + status

**InventoryItems:**
- itemId (PK)
- status (for low stock alerts)

---

## 🔒 Data Validation Rules

### Products
- `basePrice` > 0
- `cost` >= 0
- `cost` <= `basePrice`
- `status` IN ('ACTIVE', 'INACTIVE')

### Orders
- `total` = `subtotal` - `discount` + `tax` + `deliveryFee`
- `changeAmount` = `receivedAmount` - `total` (if cash)
- `status` IN ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')

### InventoryItems
- `currentStock` >= 0
- `minStock` >= 0
- `reorderPoint` >= `minStock`

---

## 📝 Notes

1. **Auto-increment IDs**: ใช้ counter ใน Settings sheet
2. **Soft Delete**: ใช้ `status` = 'INACTIVE' แทนการลบ
3. **JSON Fields**: เก็บข้อมูลซับซ้อนเป็น JSON string
4. **DateTime Format**: YYYY-MM-DD HH:MM:SS
5. **Currency**: เก็บเป็นตัวเลข ไม่เก็บสัญลักษณ์สกุลเงิน
