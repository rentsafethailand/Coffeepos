# Backend Updates Needed for Channels Management

## 📋 สรุปการอัปเดตที่ต้องทำใน backend/code.gs

### 1. อัปเดต Channels Sheet Schema

เพิ่ม columns ใหม่ใน Channels sheet:
- Column I (8): `orderNumberMode` - ค่า: `AUTO` หรือ `MANUAL`
- Column J (9): `orderNumberFormat` - รูปแบบเลขออเดอร์ เช่น `#{NNNN}`, `ORD{YYYY}{MM}{DD}-{NNN}`

**Location**: `backend/setup.gs` - function `createDemoTenant()` หรือ `setupChannelsSheet()`

```javascript
const channelsHeaders = [
  'channelId',       // A
  'channelName',     // B
  'channelType',     // C
  'commissionRate',  // D
  'deliveryFee',     // E
  'isActive',        // F
  'settings',        // G
  'createdDate',     // H
  'orderNumberMode', // I (NEW)
  'orderNumberFormat' // J (NEW)
];
```

### 2. อัปเดต getChannels() Function

**Location**: `backend/code.gs:2367-2401`

**เพิ่ม**:
```javascript
orderNumberMode: row[8] || 'AUTO',       // AUTO or MANUAL
orderNumberFormat: row[9] || '#{NNNN}'   // Format for AUTO mode
```

**แก้ไข return**:
```javascript
return {
  success: true,
  data: channels  // เปลี่ยนจาก { channels: channels }
};
```

### 3. อัปเดต createChannel() Function

**Location**: `backend/code.gs:2406-2440`

**เพิ่มใน channel array**:
```javascript
const channel = [
  channelId,
  params.channel.channelName,
  params.channel.channelType || 'OTHER',
  params.channel.commissionRate || 0,
  params.channel.deliveryFee || 0,
  params.channel.isActive !== false,
  params.channel.settings ? JSON.stringify(params.channel.settings) : '{}',
  new Date(),
  params.channel.orderNumberMode || 'AUTO',        // NEW
  params.channel.orderNumberFormat || '#{NNNN}'    // NEW
];
```

### 4. อัปเดต updateChannel() Function

**Location**: `backend/code.gs:2445-2470`

**เพิ่ม**:
```javascript
if (params.channel.orderNumberMode !== undefined) {
  sheet.getRange(i + 1, 9).setValue(params.channel.orderNumberMode);
}
if (params.channel.orderNumberFormat !== undefined) {
  sheet.getRange(i + 1, 10).setValue(params.channel.orderNumberFormat);
}
```

### 5. สร้าง generateOrderNumber() Helper Function

**Location**: เพิ่มใหม่หลัง updateChannel()

```javascript
/**
 * Generate order number based on format template
 * @param {string} format - Format template (e.g., "#{NNNN}", "ORD{YYYY}{MM}{DD}-{NNN}")
 * @param {number} sequence - Current sequence number
 * @returns {string} - Generated order number
 */
function generateOrderNumber(format, sequence) {
  const now = new Date();

  // Get date parts
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Replace date placeholders
  let result = format
    .replace('{YYYY}', year)
    .replace('{MM}', month)
    .replace('{DD}', day);

  // Find and replace number placeholders {NNNN}
  const numberMatch = result.match(/\{(N+)\}/);
  if (numberMatch) {
    const digits = numberMatch[1].length;  // จำนวนหลัก
    const paddedNumber = String(sequence).padStart(digits, '0');
    result = result.replace(/\{N+\}/, paddedNumber);
  }

  return result;
}

/**
 * Get next sequence number for a channel
 * @param {Spreadsheet} tenantSS - Tenant spreadsheet
 * @param {string} channelId - Channel ID
 * @returns {number} - Next sequence number
 */
function getNextOrderSequence(tenantSS, channelId) {
  const ordersSheet = tenantSS.getSheetByName('Orders');
  const data = ordersSheet.getDataRange().getValues();

  // Count orders from this channel today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let maxSequence = 0;
  for (let i = 1; i < data.length; i++) {
    const orderChannelId = data[i][2];  // Column C: channelId
    const orderDate = new Date(data[i][19]);  // Column T: createdDate
    orderDate.setHours(0, 0, 0, 0);

    if (orderChannelId === channelId && orderDate.getTime() === today.getTime()) {
      // Extract sequence from order number if possible
      maxSequence++;
    }
  }

  return maxSequence + 1;
}
```

### 6. อัปเดต createOrder() Function

**Location**: `backend/code.gs:1600-1750`

**เพิ่มก่อน create order:**

```javascript
// Get channel info
const channelsSheet = tenantSS.getSheetByName('Channels');
const channelsData = channelsSheet.getDataRange().getValues();

let channel = null;
for (let i = 1; i < channelsData.length; i++) {
  if (channelsData[i][2] === params.channel) {  // Match channelType
    channel = {
      channelId: channelsData[i][0],
      channelName: channelsData[i][1],
      channelType: channelsData[i][2],
      commissionRate: channelsData[i][3],
      deliveryFee: channelsData[i][4],
      isActive: channelsData[i][5],
      orderNumberMode: channelsData[i][8] || 'AUTO',
      orderNumberFormat: channelsData[i][9] || '#{NNNN}'
    };
    break;
  }
}

if (!channel) {
  throw new Error('ไม่พบช่องทางการขาย: ' + params.channel);
}

// Generate or use manual order number
let orderNumber;
if (channel.orderNumberMode === 'MANUAL') {
  // Use manual order number from params
  if (!params.manualOrderNumber) {
    throw new Error('กรุณาระบุเลขที่ออเดอร์สำหรับช่องทาง ' + channel.channelName);
  }
  orderNumber = params.manualOrderNumber;
} else {
  // AUTO mode: generate order number
  const sequence = getNextOrderSequence(tenantSS, channel.channelId);
  orderNumber = generateOrderNumber(channel.orderNumberFormat, sequence);
}

// Calculate commission
const commission = (params.subtotal * channel.commissionRate) / 100;
const deliveryFee = channel.deliveryFee || 0;
const total = params.subtotal + params.tax + deliveryFee;
```

**แก้ไข order array:**

```javascript
const order = [
  orderId,
  orderNumber,           // ใช้ orderNumber ที่สร้างขึ้น
  channel.channelId,     // ใช้จาก channel object
  channel.channelName,   // ใช้จาก channel object
  // ... rest of fields
];
```

---

## 🔧 ขั้นตอนการ Deploy

### 1. อัปเดต Setup Script
แก้ไข `backend/setup.gs` เพื่อเพิ่ม columns ใหม่ใน Channels sheet

### 2. อัปเดต Code.gs
```bash
# แก้ไขตาม instructions ข้างต้น
# - getChannels()
# - createChannel()
# - updateChannel()
# - สร้าง generateOrderNumber()
# - สร้าง getNextOrderSequence()
# - แก้ไข createOrder()
```

### 3. Deploy to Google Apps Script
1. เปิด Apps Script project
2. Copy code จาก `backend/code.gs` ไป paste ใน Apps Script editor
3. บันทึกและ Deploy

### 4. เพิ่ม Demo Channels
เพิ่ม demo channels ใน `backend/setup.gs`:

```javascript
// Add demo channels
const channelsSheet = tenantSS.getSheetByName('Channels');
const demoChannels = [
  ['CH_001', 'หน้าร้าน', 'POS', 0, 0, true, '{}', new Date(), 'AUTO', '#{NNNN}'],
  ['CH_002', 'Grab Food', 'GRAB', 30, 0, true, '{}', new Date(), 'MANUAL', ''],
  ['CH_003', 'LINE MAN', 'LINEMAN', 25, 0, true, '{}', new Date(), 'MANUAL', ''],
  ['CH_004', 'Food Panda', 'FOODPANDA', 35, 15, true, '{}', new Date(), 'MANUAL', ''],
  ['CH_005', 'สั่งออนไลน์', 'ONLINE', 0, 0, true, '{}', new Date(), 'AUTO', 'WEB{YYYY}{MM}{DD}-{NNN}']
];

demoChannels.forEach(channel => {
  channelsSheet.appendRow(channel);
});
```

---

## ✅ Testing Checklist

- [ ] GET /getChannels - ดึงรายการ channels พร้อม orderNumberMode และ orderNumberFormat
- [ ] POST /createChannel - สร้าง channel ใหม่พร้อม AUTO/MANUAL mode
- [ ] PUT /updateChannel - แก้ไข channel รวม orderNumberMode
- [ ] POST /createOrder (AUTO) - สร้างออเดอร์โดยระบบสร้างเลขอัตโนมัติ
- [ ] POST /createOrder (MANUAL) - สร้างออเดอร์โดยส่ง manualOrderNumber มา
- [ ] ทดสอบรูปแบบต่างๆ:
  - `#{NNNN}` → #0001, #0002
  - `ORD{YYYY}{MM}{DD}-{NNN}` → ORD20250108-001
  - `{YYYY}-{MM}-{DD}-{NNNNN}` → 2025-01-08-00001

---

**Created**: 2025-01-08
**Status**: Pending Implementation
**Priority**: High
