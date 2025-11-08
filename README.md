# ☕ Coffee Shop POS - ระบบจัดการร้านกาแฟ

ระบบจัดการร้านกาแฟแบบครบวงจรบน Google Apps Script พร้อม Multi-tenant Support

## ✨ Features

- 🏪 **Multi-tenant System** - รองรับหลายสาขาในระบบเดียว
- 🎯 **Product Variants** - ปรับแต่งสินค้า (ขนาด, อุณหภูมิ, ความหวาน, ท้อปปิ้ง)
- 📦 **Auto Stock Deduction** - หักสต็อกอัตโนมัติตาม Recipe/BOM
- 💰 **POS System** - ระบบขายหน้าร้านพร้อม Payment
- 📊 **Reports & Analytics** - รายงานการขายและสต็อก
- 📁 **File Upload** - เก็บรูปสลิปโอนเงินแยกตามปี/เดือน
- 🔐 **Authentication** - ระบบ Login และสิทธิ์การใช้งาน

---

## 📋 Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Usage](#usage)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)

---

## 🎯 Requirements

- Google Account
- Google Drive
- Google Apps Script
- เบราว์เซอร์ที่รองรับ (Chrome, Edge, Firefox, Safari)

---

## 📥 Installation

### Step 1: สร้าง Google Apps Script Project

1. เปิด [Google Apps Script](https://script.google.com/)
2. คลิก **New Project**
3. ตั้งชื่อโปรเจกต์ เช่น "Coffee Shop POS"

### Step 2: เพิ่มไฟล์ทั้งหมด

สร้างไฟล์ใน Apps Script ดังนี้:

#### 📄 Code Files (.gs)

1. **setup.gs**
   - Copy โค้ดจาก `backend/setup.gs`
   - ใช้สำหรับติดตั้งระบบครั้งแรก

2. **code.gs**
   - Copy โค้ดจาก `backend/code.gs`
   - ไฟล์หลักสำหรับ API และ Entry Points

#### 📄 HTML Files (.html)

3. **index.html**
   - Copy โค้ดจาก `backend/index.html`
   - หน้า POS หลัก

4. **app.js.html**
   - Copy โค้ดจาก `backend/app.js.html`
   - Alpine.js Application Logic

5. **superadmin.html**
   - Copy โค้ดจาก `backend/superadmin.html`
   - หน้า Super Admin

> **💡 Tip:** ใน Apps Script ไฟล์ HTML ต้องลงท้ายด้วย `.html` เสมอ

---

## ⚙️ Configuration

### Step 1: รัน Setup Script ครั้งแรก

1. เปิดไฟล์ `setup.gs`
2. รันฟังก์ชัน `setupMasterSystem()`
3. อนุญาตสิทธิ์ให้ Apps Script เข้าถึง Drive และ Sheets
4. รอจนเสร็จ (ประมาณ 30-60 วินาที)
5. ตรวจสอบ Logs:
   ```
   ✅ Master Folder created: <FOLDER_ID>
   ✅ Master Sheet created: <SHEET_ID>
   ✅ Demo Tenant created: <TENANT_ID>
   ```

### Step 2: กำหนดค่า Configuration

1. เปิดไฟล์ `code.gs`
2. แก้ไขบรรทัดที่ 33-34:

```javascript
// ⚠️ แก้ไขค่าเหล่านี้จาก Logs ของ setup
const MASTER_SHEET_ID = 'YOUR_MASTER_SHEET_ID_HERE';  // ← ใส่ SHEET_ID
const MASTER_FOLDER_ID = 'YOUR_MASTER_FOLDER_ID_HERE'; // ← ใส่ FOLDER_ID
```

3. **บันทึกไฟล์** (Ctrl/Cmd + S)

---

## 🚀 Deployment

### วิธีที่ 1: Deploy as Web App (แนะนำ)

1. คลิก **Deploy** → **New deployment**
2. เลือก type: **Web app**
3. ตั้งค่า:
   - **Description:** "Coffee Shop POS v1.0"
   - **Execute as:** **Me** (คุณ)
   - **Who has access:** **Anyone** หรือ **Anyone with Google account**
4. คลิก **Deploy**
5. **Copy Web App URL**

> **🔗 Web App URL จะมีรูปแบบ:**
> `https://script.google.com/macros/s/...../exec`

---

## 🎮 Usage

### เข้าใช้งานระบบ

1. เปิด **Web App URL** ที่ได้จาก Deploy
2. Login ด้วยบัญชีตัวอย่าง:

| Username | Password | สิทธิ์ |
|----------|----------|--------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| demo | demo | Demo |

### การใช้งานหน้า POS

1. คลิก **ขายหน้าร้าน** (POS)
2. เลือกสินค้าจาก Product Grid
3. **กำหนด Variant:**
   - ขนาด: Small / Medium / Large
   - อุณหภูมิ: Hot / Cold
   - ความหวาน: 0% / 25% / 50% / 75% / 100%
   - ท้อปปิ้ง: วิปครีม / ช็อตกาแฟ / นมถั่วเหลือง
4. คลิก **เพิ่มลงตะกร้า**
5. คลิก **ชำระเงิน**
6. เลือกวิธีชำระเงิน: **เงินสด** หรือ **โอนเงิน**
7. ยืนยันการชำระเงิน

> **💡 Tip:** ระบบจะ **หักสต็อกอัตโนมัติ** ตาม Recipe/BOM ที่กำหนดไว้!

### หน้า Super Admin

เข้าใช้งาน Super Admin:
```
https://script.google.com/macros/s/.../exec?page=superadmin
```

ฟีเจอร์:
- ดูรายการร้านค้าทั้งหมด (Tenants)
- เพิ่มร้านค้าใหม่
- เปิด/ปิดการใช้งานร้านค้า
- ดูสถิติรวมทั้งระบบ

---

## 📁 Project Structure

```
Coffeepos/
├── 📂 backend/              # Google Apps Script Files
│   ├── setup.gs             # ติดตั้งระบบครั้งแรก
│   ├── code.gs              # API & Entry Points
│   ├── index.html           # หน้า POS หลัก
│   ├── app.js.html          # Alpine.js Logic
│   └── superadmin.html      # หน้า Super Admin
│
├── 📂 frontend/             # Development Files (Local)
│   ├── index.html           # ไฟล์ต้นฉบับ
│   ├── app.js               # ไฟล์ต้นฉบับ
│   └── superadmin.html      # ไฟล์ต้นฉบับ
│
├── 📂 database/
│   └── schema.md            # Database Schema
│
├── 📂 analysis/
│   ├── system-analysis.md
│   ├── development-roadmap.md
│   └── missing-features-detailed.md
│
├── PROJECT_STRUCTURE.md
└── README.md                # ไฟล์นี้
```

---

## 🔧 API Documentation

### การเรียกใช้ API

ระบบใช้ **`google.script.run`** สำหรับเรียก API โดยตรง:

```javascript
// ตัวอย่างการเรียกใช้
google.script.run
  .withSuccessHandler(function(response) {
    console.log('Success:', response);
  })
  .withFailureHandler(function(error) {
    console.error('Error:', error);
  })
  .functionName(parameters);
```

### สำคัญ!

- ✅ **ใช้ `google.script.run`** (Production)
- ✅ ไม่ต้อง deploy Web App เพื่อเรียก API
- ✅ เรียกฟังก์ชันได้โดยตรงจาก frontend
- ✅ Type-safe และ error handling ดีกว่า
- ❌ **ไม่ใช้ `fetch()` + Web App URL** อีกต่อไป

### ฟังก์ชัน API ที่มี

#### Authentication
- `login(params)` - เข้าสู่ระบบ
- `logout(params)` - ออกจากระบบ

#### Products
- `getProducts(params)` - รายการสินค้าทั้งหมด
- `createProduct(params)` - เพิ่มสินค้าใหม่
- `updateProduct(params)` - แก้ไขสินค้า
- `getVariants(params)` - รายการ Variants

#### Orders
- `createOrder(params)` - สร้างออเดอร์ + หักสต็อกอัตโนมัติ
- `getOrders(params)` - รายการออเดอร์
- `getOrderDetail(params)` - รายละเอียดออเดอร์

#### Inventory
- `getInventoryItems(params)` - รายการสต็อก
- `adjustStock(params)` - ปรับสต็อก

#### Dashboard & Reports
- `getDashboardData(params)` - ข้อมูล Dashboard
- `getSalesReport(params)` - รายงานการขาย

#### File Upload
- `uploadSlipImage(params)` - Upload รูปสลิปโอนเงิน

---

## 🎨 Technologies Used

### Frontend
- **Alpine.js** - Reactive JavaScript Framework
- **Tailwind CSS** - Utility-first CSS Framework
- **Chart.js** - Data Visualization

### Backend
- **Google Apps Script** - Server-side JavaScript
- **Google Sheets** - Database
- **Google Drive** - File Storage

---

## 🐛 Troubleshooting

### ปัญหา: HTML ไม่แสดงผล

**วิธีแก้:**
1. ตรวจสอบว่า deploy แบบ **Web app** แล้ว
2. ตรวจสอบว่าตั้ง **Who has access: Anyone**
3. ลอง deploy version ใหม่

### ปัญหา: API ไม่ทำงาน

**วิธีแก้:**
1. ตรวจสอบว่ากำหนด `MASTER_SHEET_ID` และ `MASTER_FOLDER_ID` แล้ว
2. ตรวจสอบว่ารันฟังก์ชัน `setupMasterSystem()` แล้ว
3. เปิด **Executions** log ใน Apps Script เพื่อดู error

### ปัญหา: ไม่สามารถ Login

**วิธีแก้:**
1. ตรวจสอบว่ามีข้อมูล Demo User ใน Master Sheet
2. ลองรัน `setupMasterSystem()` ใหม่
3. ตรวจสอบ Console log ในเบราว์เซอร์

---

## 📝 Development Mode

สำหรับการพัฒนาแบบ Local (ไม่ต้อง deploy):

1. เปิดไฟล์ `frontend/index.html` ในเบราว์เซอร์
2. ระบบจะ **ตรวจสอบอัตโนมัติ** ว่ามี `google.script.run` หรือไม่
3. ถ้าไม่มี → ใช้ **Mock API** สำหรับทดสอบ
4. Console จะแสดง: `🧪 Running in development mode - using Mock API`

**ข้อดี:**
- ✅ ทดสอบได้โดยไม่ต้อง deploy
- ✅ มีข้อมูลตัวอย่างสำหรับ UI development
- ✅ รองรับทั้ง Production และ Development

---

## 📄 License

MIT License - สามารถใช้งานและแก้ไขได้อย่างอิสระ

---

## 👨‍💻 Author

Created by Claude Code (Anthropic)

---

## 🙏 Credits

- **Tailwind CSS** - https://tailwindcss.com/
- **Alpine.js** - https://alpinejs.dev/
- **Chart.js** - https://www.chartjs.org/
- **Google Apps Script** - https://developers.google.com/apps-script

---

## 📞 Support

หากมีคำถามหรือต้องการความช่วยเหลือ:
- เปิด **Issue** ใน GitHub Repository
- ตรวจสอบ **Execution logs** ใน Apps Script
- ดู **Console logs** ในเบราว์เซอร์

---

**🎉 Happy Coding! ☕**
