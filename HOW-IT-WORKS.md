# 📚 คู่มือการทำงานของระบบ Coffee Shop POS

## 📋 สารบัญ
1. [ระบบการตั้งค่า (Settings)](#ระบบการตั้งค่า)
2. [ระบบเลือกช่องทางการสั่งซื้อ (Order Channels)](#ระบบเลือกช่องทางการสั่งซื้อ)
3. [ขั้นตอนการจ่ายเงิน (Payment Flow)](#ขั้นตอนการจ่ายเงิน)
4. [การรองรับใบเสร็จ 80mm](#การรองรับใบเสร็จ-80mm)
5. [แนวทางการปรับปรุง](#แนวทางการปรับปรุง)

---

## 1️⃣ ระบบการตั้งค่า

### 🔧 ตำแหน่งในระบบ
**หน้า Settings** (`frontend/index.html:1014-1068`)

### 📝 การตั้งค่าที่มีในปัจจุบัน

#### A. ข้อมูลร้านค้า
```javascript
settings: {
  shopName: '',      // ชื่อร้าน
  phone: '',         // เบอร์โทรศัพท์
  address: '',       // ที่อยู่
}
```

#### B. การตั้งค่าภาษีและใบเสร็จ
```javascript
settings: {
  taxRate: 7,              // อัตราภาษี (%) - ค่าเริ่มต้น 7%
  taxId: '',               // เลขประจำตัวผู้เสียภาษี
  printReceipt: true,      // ⚠️ ยังไม่ได้ implement การพิมพ์จริง
  autoDeductStock: true    // ✅ ทำงานแล้ว - หักสต็อกอัตโนมัติ
}
```

### 💾 การบันทึกการตั้งค่า
- **Frontend**: `app.js:690-700` - function `saveSettings()`
- **Backend**: `code.gs:2800+` - function `updateSettings()`
- **การทำงาน**:
  1. กดปุ่ม "บันทึกการตั้งค่า"
  2. เรียก `saveSettings()`
  3. ส่งข้อมูลไปที่ backend ผ่าน `callAPI('updateSettings', {...})`
  4. บันทึกลง Settings Sheet ในแต่ละ Tenant

---

## 2️⃣ ระบบเลือกช่องทางการสั่งซื้อ

### 🎯 ที่มาของฟีเจอร์
เพิ่งเพิ่มเข้ามาใน commit ล่าสุด เพื่อให้สามารถแยกแยะออเดอร์จากช่องทางต่างๆ เช่น:
- 🏪 หน้าร้าน (POS)
- 🛵 Grab Food
- 📦 LINE MAN
- 🐼 Food Panda
- 🌐 สั่งออนไลน์

### 🖥️ UI Component
**ตำแหน่ง**: `frontend/index.html:632-639`

```html
<select x-model="pos.selectedChannel">
  <option value="POS">🏪 หน้าร้าน</option>
  <option value="GRAB">🛵 Grab Food</option>
  <option value="LINEMAN">📦 LINE MAN</option>
  <option value="FOODPANDA">🐼 Food Panda</option>
  <option value="ONLINE">🌐 สั่งออนไลน์</option>
</select>
```

### ⚙️ State Management
**ตำแหน่ง**: `frontend/app.js:49`

```javascript
pos: {
  selectedChannel: 'POS',  // ค่าเริ่มต้นคือ หน้าร้าน
  // ... other states
}
```

### 🔄 การทำงาน

#### ขั้นตอนที่ 1: เลือกช่องทาง
```
ผู้ใช้เข้าหน้า POS → เลือกช่องทางจาก dropdown → ค่าถูกบันทึกใน pos.selectedChannel
```

#### ขั้นตอนที่ 2: เพิ่มสินค้าลงตะกร้า
```
เลือกสินค้า → เลือก Variants (size, temp, sweetness) → เพิ่มลงตะกร้า
```

#### ขั้นตอนที่ 3: สร้างออเดอร์
**ตำแหน่ง**: `frontend/app.js:539`

```javascript
const response = await this.callAPI('createOrder', {
  shopSheetId: this.shopSheetId,
  username: this.username,
  channel: this.pos.selectedChannel,  // ✅ ส่งค่าช่องทางที่เลือก
  items: orderItems,
  // ... other params
});
```

#### ขั้นตอนที่ 4: Backend บันทึกข้อมูล
**ตำแหน่ง**: `backend/code.gs:1675-1676`

```javascript
const order = [
  orderId,
  orderNumber,
  orderData.channelId || 'CH_001',      // ⚠️ ปัญหา: ยังไม่ได้แปลง channel เป็น channelId
  orderData.channelName || 'หน้าร้าน', // ⚠️ ปัญหา: ควรหา channelName จาก Channels sheet
  // ...
];
```

### ⚠️ ปัญหาที่พบ

#### 1. **ไม่มีการเชื่อมกับ Channels Sheet**
- Frontend ส่งค่า `channel: 'POS'` มาเป็น String
- Backend ควร:
  1. หา Channel จาก Channels Sheet โดยใช้ `channelType = 'POS'`
  2. ดึง `channelId` และ `channelName` จริง
  3. นำ commission rate และ delivery fee มาคำนวณ

#### 2. **ยังไม่มีหน้า Channel Management**
- ไม่สามารถเพิ่ม/แก้ไข/ลบ Channel ได้
- ไม่สามารถตั้งค่า commission rate และ delivery fee ได้
- ไม่มี API: `getChannels()`, `createChannel()`, `updateChannel()`

#### 3. **Hardcoded Values**
```javascript
channelId: 'CH_001',          // ควรหาจาก DB
channelName: 'หน้าร้าน',      // ควรหาจาก DB
```

---

## 3️⃣ ขั้นตอนการจ่ายเงิน

### 🎬 Flow Diagram
```
[หน้า POS] → [เพิ่มสินค้า] → [กดชำระเงิน] → [Payment Modal]
     ↓
[เลือกวิธีชำระ: เงินสด/โอนเงิน]
     ↓
[ยืนยันชำระเงิน] → [สร้างออเดอร์] → [หักสต็อกอัตโนมัติ] → [แสดงผลสำเร็จ]
```

### 📱 Payment Modal
**ตำแหน่ง**: `frontend/index.html:1216-1289`

#### A. เปิด Payment Modal
**Trigger**: คลิกปุ่ม "ชำระเงิน" ในหน้า POS

**Function**: `frontend/app.js:477-488`
```javascript
openPaymentModal() {
  if (this.pos.cart.length === 0) {
    alert('กรุณาเพิ่มสินค้าลงตะกร้าก่อน');
    return;
  }

  // Reset payment state
  this.payment = {
    method: 'CASH',
    received: 0,
    change: 0,
    slipFile: null
  };

  this.modals.payment = true;  // เปิด modal
}
```

#### B. เลือกวิธีชำระเงิน

**ตัวเลือก 1: เงินสด (CASH)**
```html
<div x-show="payment.method === 'CASH'">
  <input type="number" x-model="payment.received" @input="calculateChange()">
  <!-- แสดงเงินทอนอัตโนมัติ -->
  <span x-text="formatCurrency(payment.change)"></span>
</div>
```

**การคำนวณเงินทอน**: `frontend/app.js:490-493`
```javascript
calculateChange() {
  const received = parseFloat(this.payment.received) || 0;
  this.payment.change = Math.max(0, received - this.pos.total);
}
```

**ตัวเลือก 2: โอนเงิน (TRANSFER)**
```html
<div x-show="payment.method === 'TRANSFER'">
  <input type="file" @change="handleSlipUpload($event)" accept="image/*">
</div>
```

**การจัดการไฟล์สลิป**: `frontend/app.js:504-509`
```javascript
handleSlipUpload(event) {
  const file = event.target.files[0];
  if (file) {
    this.payment.slipFile = file;
  }
}
```

#### C. Validation ก่อนยืนยัน
**Function**: `frontend/app.js:495-502`
```javascript
canConfirmPayment() {
  if (this.payment.method === 'CASH') {
    return parseFloat(this.payment.received) >= this.pos.total;
  } else if (this.payment.method === 'TRANSFER') {
    return this.payment.slipFile !== null;  // ต้องอัพโหลดสลิป
  }
  return false;
}
```

#### D. ยืนยันชำระเงิน
**Function**: `frontend/app.js:511-570`

```javascript
async confirmPayment() {
  if (!this.canConfirmPayment()) return;

  this.loading = true;

  try {
    // 1. เตรียมรายการสินค้า
    const orderItems = this.pos.cart.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      variants: JSON.stringify(item.variants),
      addons: JSON.stringify(item.addons)
    }));

    // 2. อัพโหลดสลิปถ้าเป็นโอนเงิน
    let slipUrl = null;
    if (this.payment.method === 'TRANSFER' && this.payment.slipFile) {
      slipUrl = await this.uploadSlip(this.payment.slipFile);
    }

    // 3. สร้างออเดอร์
    const response = await this.callAPI('createOrder', {
      shopSheetId: this.shopSheetId,
      username: this.username,
      channel: this.pos.selectedChannel,  // ช่องทางที่เลือก
      items: orderItems,
      subtotal: this.pos.subtotal,
      tax: this.pos.tax,
      total: this.pos.total,
      paymentMethod: this.payment.method,
      amountReceived: this.payment.received,
      change: this.payment.change,
      slipUrl: slipUrl
    });

    if (response.success) {
      alert('บันทึกออเดอร์สำเร็จ! เลขที่: ' + response.data.orderNumber);

      // ⚠️ ควรพิมพ์ใบเสร็จที่นี่ถ้า settings.printReceipt === true

      this.clearCart();
      this.modals.payment = false;
      await this.loadOrders();
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    this.loading = false;
  }
}
```

#### E. อัพโหลดสลิปโอนเงิน
**Function**: `frontend/app.js:572-606`

```javascript
async uploadSlip(file) {
  // 1. แปลงไฟล์เป็น Base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 2. ส่งไปเก็บใน Google Drive
  const response = await this.callAPI('uploadSlipImage', {
    shopSheetId: this.shopSheetId,
    fileName: file.name,
    mimeType: file.type,
    base64Data: base64
  });

  return response.data.url;  // URL ใน Google Drive
}
```

**Backend**: `backend/code.gs:2100-2150`
- สร้างโฟลเดอร์ `/Slips/YYYY/MM/` อัตโนมัติ
- บันทึกไฟล์ด้วยชื่อ `SLIP_timestamp_random.ext`
- คืนค่า URL สำหรับเข้าถึงไฟล์

### 🔄 Backend Order Creation
**Function**: `backend/code.gs:1600-1750`

```javascript
function createOrder(params) {
  // 1. สร้าง Order ID และ Order Number
  const orderId = 'ORD_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss');
  const orderNumber = '#' + getNextOrderNumber(shopSheet);

  // 2. บันทึกออเดอร์ลง Orders Sheet
  ordersSheet.appendRow([
    orderId,
    orderNumber,
    channelId,
    channelName,
    customerId,
    customerName,
    staffId,
    staffName,
    orderType,
    tableNumber,
    queueNumber,
    subtotal,
    discount,
    tax,
    deliveryFee,
    total,
    paymentMethod,
    'PAID',           // paymentStatus
    receivedAmount,
    changeAmount,
    slipImageUrl,
    'COMPLETED',      // status
    notes,
    new Date(),       // createdDate
    new Date(),       // completedDate
    null,             // cancelledDate
    null              // cancelReason
  ]);

  // 3. บันทึกรายการสินค้าลง OrderItems Sheet
  for (const item of orderItems) {
    orderItemsSheet.appendRow([...itemData]);

    // 4. หักสต็อกอัตโนมัติ (ถ้า settings.autoDeductStock === true)
    deductStockForOrderItem(shopSheet, item);
  }

  return { orderId, orderNumber };
}
```

### 🏪 หักสต็อกอัตโนมัติ
**Function**: `backend/code.gs:1400-1500`

```javascript
function deductStockForOrderItem(shopSheet, orderItem) {
  // 1. หาสูตรที่ตรงกับ product + variants
  const recipe = findMatchingRecipe(shopSheet, orderItem.productId, orderItem.variants);

  if (!recipe) return;  // ไม่มีสูตร ไม่หัก

  // 2. คำนวณจำนวนที่ต้องใช้
  const totalNeeded = recipe.quantity * orderItem.quantity;

  // 3. หักสต็อกจาก InventoryItems Sheet
  const inventorySheet = shopSheet.getSheetByName('InventoryItems');
  // ... update stock

  // 4. บันทึกประวัติใน StockMovements Sheet
  const stockMovementsSheet = shopSheet.getSheetByName('StockMovements');
  stockMovementsSheet.appendRow([
    movementId,
    orderItem.itemId,
    'ORDER',           // movementType
    -totalNeeded,      // quantity (ติดลบ)
    orderItem.orderId, // referenceId
    new Date()
  ]);
}
```

---

## 4️⃣ การรองรับใบเสร็จ 80mm

### ❌ สถานะปัจจุบัน: **ยังไม่รองรับ**

### 🔍 สิ่งที่มีอยู่
1. **Checkbox Setting**: `settings.printReceipt` (แต่ยังไม่ทำงาน)
2. **ข้อมูลร้าน**: `shopName`, `phone`, `address`, `taxId`
3. **ข้อมูลออเดอร์**: ครบถ้วนสำหรับพิมพ์ใบเสร็จ

### 🚫 สิ่งที่ยังไม่มี
1. ❌ Receipt Template HTML สำหรับ 80mm
2. ❌ CSS สำหรับใบเสร็จ thermal printer
3. ❌ Print function (`window.print()`)
4. ❌ การเรียก print หลังสร้างออเดอร์สำเร็จ
5. ❌ ปุ่มพิมพ์ซ้ำในหน้า Orders

### 📏 ข้อกำหนดใบเสร็จ 80mm
```
ความกว้าง: 80mm (302px @ 96 DPI)
ความกว้าง: 58mm (220px @ 96 DPI) - ตัวเลือกเล็กกว่า
ฟอนต์: Monospace (Courier, Consolas)
ขนาดฟอนต์: 10-12px
ระยะขอบ: 5mm (19px)
ตัดกระดาษ: CSS page-break-after: always
```

---

## 5️⃣ แนวทางการปรับปรุง

### 🎯 Priority 1: ระบบพิมพ์ใบเสร็จ 80mm

#### A. สร้าง Receipt Template
**ไฟล์ใหม่**: `frontend/receipt-80mm.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        width: 80mm;
        margin: 0;
        padding: 5mm;
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }
    }

    .receipt {
      width: 70mm;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 1px dashed #000;
      padding-bottom: 10px;
    }

    .shop-name {
      font-size: 16px;
      font-weight: bold;
    }

    .items {
      margin: 10px 0;
    }

    .item {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }

    .total {
      border-top: 1px dashed #000;
      margin-top: 10px;
      padding-top: 10px;
      font-weight: bold;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      border-top: 1px dashed #000;
      padding-top: 10px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="shop-name">${shopName}</div>
      <div>${address}</div>
      <div>โทร: ${phone}</div>
      <div>Tax ID: ${taxId}</div>
    </div>

    <div>
      <div>เลขที่: ${orderNumber}</div>
      <div>วันที่: ${date}</div>
      <div>พนักงาน: ${staffName}</div>
      <div>ช่องทาง: ${channelName}</div>
    </div>

    <div class="items">
      <!-- Loop items -->
      <div class="item">
        <span>${productName} x${qty}</span>
        <span>${price}</span>
      </div>
    </div>

    <div class="total">
      <div class="item">
        <span>รวมย่อย</span>
        <span>${subtotal}</span>
      </div>
      <div class="item">
        <span>ภาษี 7%</span>
        <span>${tax}</span>
      </div>
      <div class="item">
        <span>รวมทั้งสิ้น</span>
        <span>${total}</span>
      </div>
      <div class="item">
        <span>รับเงิน</span>
        <span>${received}</span>
      </div>
      <div class="item">
        <span>เงินทอน</span>
        <span>${change}</span>
      </div>
    </div>

    <div class="footer">
      ขอบคุณที่ใช้บริการ<br>
      www.yourshop.com
    </div>
  </div>
</body>
</html>
```

#### B. เพิ่ม Print Function
**ใน**: `frontend/app.js`

```javascript
printReceipt(orderData) {
  // ถ้าไม่เปิด auto print ให้ข้าม
  if (!this.settings.printReceipt) return;

  // สร้าง receipt HTML
  const receiptWindow = window.open('', '_blank', 'width=302,height=500');
  receiptWindow.document.write(this.generateReceiptHTML(orderData));
  receiptWindow.document.close();

  // รอโหลดเสร็จแล้วพิมพ์
  receiptWindow.onload = () => {
    receiptWindow.print();
    receiptWindow.close();
  };
}

generateReceiptHTML(orderData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { width: 80mm; font-family: monospace; font-size: 11px; }
        /* ... rest of styles ... */
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="shop-name">${this.settings.shopName}</div>
          <div>${this.settings.address}</div>
          <div>โทร: ${this.settings.phone}</div>
          <div>Tax ID: ${this.settings.taxId}</div>
        </div>
        <!-- ... rest of receipt ... -->
      </div>
    </body>
    </html>
  `;
}
```

#### C. เรียกใช้หลังสร้างออเดอร์สำเร็จ
**แก้ไข**: `frontend/app.js:550-560`

```javascript
if (response.success) {
  alert('บันทึกออเดอร์สำเร็จ! เลขที่: ' + response.data.orderNumber);

  // ✅ เพิ่มการพิมพ์ใบเสร็จ
  if (this.settings.printReceipt) {
    this.printReceipt({
      orderNumber: response.data.orderNumber,
      orderDate: new Date(),
      staffName: this.username,
      channelName: this.getChannelName(this.pos.selectedChannel),
      items: this.pos.cart,
      subtotal: this.pos.subtotal,
      tax: this.pos.tax,
      total: this.pos.total,
      received: this.payment.received,
      change: this.payment.change,
      paymentMethod: this.payment.method
    });
  }

  this.clearCart();
  this.modals.payment = false;
  await this.loadOrders();
}
```

#### D. เพิ่มปุ่มพิมพ์ซ้ำในหน้า Orders
**ใน**: `frontend/index.html` - Orders table

```html
<button @click="reprintReceipt(order)"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
  🖨️ พิมพ์ซ้ำ
</button>
```

### 🎯 Priority 2: ระบบจัดการช่องทาง (Channels Management)

#### A. สร้างหน้า Channels Management
**เพิ่มใน**: Settings page

```html
<!-- Channels Management -->
<div class="bg-white rounded-xl shadow-md p-6">
  <h3 class="text-lg font-bold text-gray-800 mb-4">จัดการช่องทางขาย</h3>

  <table class="w-full">
    <thead>
      <tr>
        <th>ชื่อช่องทาง</th>
        <th>ประเภท</th>
        <th>ค่าคอมมิชชั่น (%)</th>
        <th>ค่าจัดส่ง</th>
        <th>สถานะ</th>
        <th>จัดการ</th>
      </tr>
    </thead>
    <tbody>
      <template x-for="channel in channels.list" :key="channel.channelId">
        <tr>
          <td x-text="channel.channelName"></td>
          <td x-text="channel.channelType"></td>
          <td x-text="channel.commissionRate + '%'"></td>
          <td x-text="formatCurrency(channel.deliveryFee)"></td>
          <td>
            <span :class="channel.isActive ? 'badge-success' : 'badge-danger'"
                  x-text="channel.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'"></span>
          </td>
          <td>
            <button @click="editChannel(channel)">แก้ไข</button>
            <button @click="toggleChannel(channel)">
              <span x-text="channel.isActive ? 'ปิด' : 'เปิด'"></span>
            </button>
          </td>
        </tr>
      </template>
    </tbody>
  </table>

  <button @click="openAddChannelModal()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded">
    + เพิ่มช่องทางใหม่
  </button>
</div>
```

#### B. แก้ไข Backend
**ใน**: `backend/code.gs`

```javascript
// ✅ มีอยู่แล้วใน code.gs (line 195-200)
function getChannels(params) {
  const shopSheet = SpreadsheetApp.openById(params.shopSheetId);
  const channelsSheet = shopSheet.getSheetByName('Channels');
  // ... return channels list
}

// ⚠️ ต้องเพิ่ม
function findChannelByType(shopSheet, channelType) {
  const channelsSheet = shopSheet.getSheetByName('Channels');
  const data = channelsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === channelType) {  // column D = channelType
      return {
        channelId: data[i][0],
        channelName: data[i][1],
        channelType: data[i][2],
        commissionRate: data[i][3],
        deliveryFee: data[i][4],
        isActive: data[i][5]
      };
    }
  }

  return null;
}

// ⚠️ แก้ไข createOrder ให้หา channel จาก DB
function createOrder(params) {
  // ... existing code

  // ✅ หา channel จาก Channels sheet
  const channel = findChannelByType(shopSheet, params.channel);

  if (!channel) {
    throw new Error('ไม่พบช่องทางการขาย: ' + params.channel);
  }

  // คำนวณค่าคอมมิชชั่น
  const commission = (params.subtotal * channel.commissionRate) / 100;
  const deliveryFee = channel.deliveryFee || 0;
  const total = params.subtotal + params.tax + deliveryFee;

  const order = [
    orderId,
    orderNumber,
    channel.channelId,      // ✅ ใช้ ID จริง
    channel.channelName,    // ✅ ใช้ชื่อจริง
    // ... rest
  ];

  // ...
}
```

### 🎯 Priority 3: ปรับปรุง UX/UI

#### A. แสดงชื่อช่องทางในตะกร้า
```html
<div class="order-summary">
  <div class="flex justify-between mb-2">
    <span>ช่องทาง:</span>
    <span x-text="getChannelName(pos.selectedChannel)"></span>
  </div>
  <!-- ... rest -->
</div>
```

#### B. เพิ่มไอคอนช่องทางใน Orders List
```html
<span x-html="getChannelIcon(order.channelType)"></span>
```

#### C. Dashboard: กราฟยอดขายแยกตามช่องทาง
```javascript
// ใช้ Chart.js แสดงยอดขายแต่ละช่องทาง
{
  type: 'pie',
  data: {
    labels: ['หน้าร้าน', 'Grab', 'LINE MAN', 'Food Panda'],
    datasets: [{
      data: [50000, 30000, 15000, 5000]
    }]
  }
}
```

---

## ✅ สรุป

### ✔️ ฟีเจอร์ที่ทำงานแล้ว
1. ✅ ระบบ POS พื้นฐาน - เพิ่มสินค้า, เลือก variants, จัดการตะกร้า
2. ✅ ระบบชำระเงิน - เงินสด/โอนเงิน พร้อมอัพโหลดสลิป
3. ✅ หักสต็อกอัตโนมัติตาม Recipe/BOM
4. ✅ เลือกช่องทางการสั่งซื้อ (UI เท่านั้น)
5. ✅ Settings - ข้อมูลร้าน, อัตราภาษี, เลขผู้เสียภาษี

### ⚠️ ฟีเจอร์ที่ยังไม่ทำงาน
1. ❌ **พิมพ์ใบเสร็จ 80mm** - ไม่มี template และ print function
2. ❌ **Channel Management** - ไม่มีหน้าจัดการช่องทาง
3. ❌ **Channel Integration** - ไม่ได้เชื่อมกับ Channels Sheet
4. ❌ **คำนวณค่าคอมมิชชั่น** - ยังไม่มีการคำนวณตามช่องทาง

### 🚀 แนะนำลำดับการพัฒนา
1. **ด่วน**: สร้างระบบพิมพ์ใบเสร็จ 80mm (Priority 1)
2. **สำคัญ**: สร้าง Channels Management (Priority 2)
3. **ปรับปรุง**: เพิ่ม UX/UI features (Priority 3)

---

**สร้างเมื่อ**: 2025-01-XX
**เวอร์ชัน**: 1.0
**ผู้เขียน**: Claude Code
