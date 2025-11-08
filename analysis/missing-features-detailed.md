# Missing Features - Detailed Specifications

## 🎨 UI/UX Improvements Needed

### 1. Product Variant Selector Modal
**Current:** ใช้ default variants เสมอ
**Need:** Modal ให้เลือก variants และ modifiers

```html
<!-- Modal Structure -->
<div class="modal" x-show="showVariantModal">
  <div class="modal-content">
    <h3>เลือก [Product Name]</h3>

    <!-- Variants Section -->
    <div class="variant-section">
      <h4>ขนาด</h4>
      <div class="variant-options">
        <button @click="selectVariant('size', 'S')">เล็ก (+0฿)</button>
        <button @click="selectVariant('size', 'M')">กลาง (+10฿)</button>
        <button @click="selectVariant('size', 'L')">ใหญ่ (+20฿)</button>
      </div>
    </div>

    <div class="variant-section">
      <h4>ความร้อน</h4>
      <div class="variant-options">
        <button @click="selectVariant('temperature', 'hot')">ร้อน</button>
        <button @click="selectVariant('temperature', 'cold')">เย็น</button>
      </div>
    </div>

    <div class="variant-section">
      <h4>ความหวาน</h4>
      <div class="variant-options">
        <button @click="selectVariant('sweetness', '0')">ไม่หวาน</button>
        <button @click="selectVariant('sweetness', '25')">25%</button>
        <button @click="selectVariant('sweetness', '50')">50%</button>
        <button @click="selectVariant('sweetness', '75')">75%</button>
        <button @click="selectVariant('sweetness', '100')">100%</button>
      </div>
    </div>

    <!-- Modifiers Section -->
    <div class="modifiers-section">
      <h4>เพิ่มเติม</h4>
      <div class="modifier-item">
        <input type="checkbox" x-model="modifiers" value="whipped_cream">
        <span>วิปครีม (+15฿)</span>
      </div>
      <div class="modifier-item">
        <input type="checkbox" x-model="modifiers" value="extra_shot">
        <span>เพิ่มช็อต (+25฿)</span>
      </div>
      <div class="modifier-item">
        <input type="checkbox" x-model="modifiers" value="syrup">
        <span>ไซรัป (+10฿)</span>
      </div>
    </div>

    <!-- Special Instructions -->
    <div class="special-instructions">
      <h4>หมายเหตุ</h4>
      <textarea x-model="specialInstructions"
                placeholder="เช่น น้ำแข็งน้อย, ไม่ใส่นม"></textarea>
    </div>

    <!-- Summary -->
    <div class="summary">
      <p class="total">ราคารวม: <span x-text="calculatePrice()"></span> ฿</p>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button @click="addToCart()">เพิ่มในตะกร้า</button>
      <button @click="closeModal()">ยกเลิก</button>
    </div>
  </div>
</div>
```

**Functions Needed:**
```javascript
selectVariant(type, value) {
  this.selectedVariants[type] = value;
  this.updatePrice();
}

toggleModifier(modifier) {
  const index = this.selectedModifiers.indexOf(modifier);
  if (index > -1) {
    this.selectedModifiers.splice(index, 1);
  } else {
    this.selectedModifiers.push(modifier);
  }
  this.updatePrice();
}

calculatePrice() {
  let price = this.basePrice;

  // Add variant price adjustments
  Object.keys(this.selectedVariants).forEach(variantType => {
    const variantValue = this.selectedVariants[variantType];
    const variant = this.product.variants.find(
      v => v.variantType === variantType && v.variantValue === variantValue
    );
    if (variant) {
      price += variant.priceAdjust || 0;
    }
  });

  // Add modifier prices
  this.selectedModifiers.forEach(modifierId => {
    const modifier = this.product.modifiers.find(m => m.id === modifierId);
    if (modifier) {
      price += modifier.price;
    }
  });

  return price;
}

addToCart() {
  const item = {
    productId: this.product.productId,
    productName: this.product.name,
    variants: { ...this.selectedVariants },
    modifiers: [...this.selectedModifiers],
    specialInstructions: this.specialInstructions,
    quantity: 1,
    unitPrice: this.calculatePrice(),
    subtotal: this.calculatePrice()
  };

  this.cart.push(item);
  this.closeModal();
}
```

---

### 2. Payment Method Selection
**Current:** ไม่มี
**Need:** เลือกวิธีชำระเงิน และจัดการเงินทอน

```html
<!-- Payment Modal -->
<div class="modal" x-show="showPaymentModal">
  <div class="modal-content">
    <h3>ชำระเงิน</h3>

    <!-- Order Summary -->
    <div class="order-summary">
      <div class="summary-row">
        <span>ยอดรวม</span>
        <span x-text="formatCurrency(cartSubtotal)"></span>
      </div>
      <div class="summary-row">
        <span>ส่วนลด</span>
        <span x-text="formatCurrency(cartDiscount)"></span>
      </div>
      <div class="summary-row">
        <span>ภาษี (7%)</span>
        <span x-text="formatCurrency(cartTax)"></span>
      </div>
      <div class="summary-row total">
        <span>รวมทั้งสิ้น</span>
        <span x-text="formatCurrency(cartTotal)"></span>
      </div>
    </div>

    <!-- Payment Method Selection -->
    <div class="payment-methods">
      <h4>เลือกวิธีชำระเงิน</h4>
      <div class="method-grid">
        <button @click="selectPaymentMethod('cash')"
                :class="{'selected': paymentMethod === 'cash'}">
          💵 เงินสด
        </button>
        <button @click="selectPaymentMethod('bank_transfer')"
                :class="{'selected': paymentMethod === 'bank_transfer'}">
          🏦 โอนเงิน
        </button>
        <button @click="selectPaymentMethod('qr')"
                :class="{'selected': paymentMethod === 'qr'}">
          📱 QR Code
        </button>
        <button @click="selectPaymentMethod('credit_card')"
                :class="{'selected': paymentMethod === 'credit_card'}">
          💳 บัตรเครดิต
        </button>
      </div>
    </div>

    <!-- Cash Payment Details -->
    <div x-show="paymentMethod === 'cash'" class="payment-details">
      <h4>รับเงินสด</h4>
      <input type="number"
             x-model="receivedAmount"
             @input="calculateChange()"
             placeholder="จำนวนเงินที่รับ"
             class="amount-input">

      <!-- Quick Amount Buttons -->
      <div class="quick-amounts">
        <button @click="setReceivedAmount(100)">100฿</button>
        <button @click="setReceivedAmount(500)">500฿</button>
        <button @click="setReceivedAmount(1000)">1,000฿</button>
        <button @click="setReceivedAmount(cartTotal)">พอดี</button>
      </div>

      <div class="change-amount" x-show="change > 0">
        <span>เงินทอน:</span>
        <span class="amount" x-text="formatCurrency(change)"></span>
      </div>

      <div class="error" x-show="receivedAmount < cartTotal">
        ⚠️ จำนวนเงินไม่เพียงพอ
      </div>
    </div>

    <!-- QR Code Payment -->
    <div x-show="paymentMethod === 'qr'" class="payment-details">
      <div class="qr-code-container">
        <canvas id="qrCode"></canvas>
        <p>สแกน QR Code เพื่อชำระเงิน</p>
        <p class="amount" x-text="formatCurrency(cartTotal)"></p>
      </div>
      <button @click="checkPaymentStatus()">ตรวจสอบสถานะการชำระเงิน</button>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button @click="confirmPayment()"
              :disabled="!canConfirmPayment()"
              class="btn-primary">
        ยืนยันการชำระเงิน
      </button>
      <button @click="closePaymentModal()" class="btn-secondary">
        ยกเลิก
      </button>
    </div>
  </div>
</div>
```

**Functions Needed:**
```javascript
selectPaymentMethod(method) {
  this.paymentMethod = method;

  if (method === 'qr') {
    this.generateQRCode();
  }

  if (method === 'cash') {
    this.receivedAmount = '';
    this.change = 0;
  }
}

calculateChange() {
  this.change = Math.max(0, this.receivedAmount - this.cartTotal);
}

setReceivedAmount(amount) {
  this.receivedAmount = amount;
  this.calculateChange();
}

canConfirmPayment() {
  if (this.paymentMethod === 'cash') {
    return this.receivedAmount >= this.cartTotal;
  }
  return true;
}

generateQRCode() {
  // Use QRCode.js library
  const qr = new QRCode(document.getElementById("qrCode"), {
    text: this.generatePromptPayString(),
    width: 256,
    height: 256
  });
}

generatePromptPayString() {
  // PromptPay format
  const phoneNumber = this.shopSettings.promptpayNumber;
  const amount = this.cartTotal;

  // Generate EMV QR Code string
  return `00020101021129370016${phoneNumber}5802TH5912${this.shopName}54${amount}6304`;
}

async confirmPayment() {
  this.loading = true;

  try {
    const orderData = {
      items: this.cart,
      subtotal: this.cartSubtotal,
      discount: this.cartDiscount,
      tax: this.cartTax,
      total: this.cartTotal,
      paymentMethod: this.paymentMethod,
      receivedAmount: this.receivedAmount,
      change: this.change
    };

    const response = await this.callAPI('createOrder', {
      shopSheetId: this.shopSheetId,
      orderData: orderData
    });

    if (response.success) {
      // Print receipt
      this.printReceipt(response.data);

      // Clear cart
      this.cart = [];
      this.closePaymentModal();

      // Show success message
      alert('✅ ชำระเงินสำเร็จ!');
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('❌ เกิดข้อผิดพลาด');
  } finally {
    this.loading = false;
  }
}
```

---

### 3. Order Detail Modal
**Current:** แสดง alert() เท่านั้น
**Need:** Modal แสดงรายละเอียดครบถ้วน

```html
<!-- Order Detail Modal -->
<div class="modal" x-show="showOrderDetailModal">
  <div class="modal-content large">
    <div class="modal-header">
      <h3>รายละเอียดออเดอร์ #<span x-text="selectedOrder.orderNumber"></span></h3>
      <button @click="closeOrderDetailModal()">✕</button>
    </div>

    <div class="modal-body">
      <!-- Order Info -->
      <div class="order-info">
        <div class="info-row">
          <span class="label">วันที่:</span>
          <span x-text="formatDateTime(selectedOrder.createdDate)"></span>
        </div>
        <div class="info-row">
          <span class="label">ช่องทาง:</span>
          <span x-text="selectedOrder.channelName"></span>
        </div>
        <div class="info-row">
          <span class="label">ลูกค้า:</span>
          <span x-text="selectedOrder.customerName || '-'"></span>
        </div>
        <div class="info-row">
          <span class="label">พนักงาน:</span>
          <span x-text="selectedOrder.staffName"></span>
        </div>
        <div class="info-row">
          <span class="label">สถานะ:</span>
          <span class="badge" :class="getStatusClass(selectedOrder.status)"
                x-text="getStatusText(selectedOrder.status)"></span>
        </div>
      </div>

      <!-- Order Items -->
      <div class="order-items">
        <h4>รายการสินค้า</h4>
        <table>
          <thead>
            <tr>
              <th>รายการ</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            <template x-for="item in selectedOrder.items" :key="item.id">
              <tr>
                <td>
                  <div class="item-name" x-text="item.productName"></div>
                  <div class="item-variants" x-text="item.variantText"></div>
                  <div class="item-note" x-show="item.specialInstructions"
                       x-text="'หมายเหตุ: ' + item.specialInstructions"></div>
                </td>
                <td x-text="formatCurrency(item.unitPrice)"></td>
                <td x-text="item.quantity"></td>
                <td x-text="formatCurrency(item.subtotal)"></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-row">
          <span>ยอดรวม</span>
          <span x-text="formatCurrency(selectedOrder.subtotal)"></span>
        </div>
        <div class="summary-row">
          <span>ส่วนลด</span>
          <span x-text="formatCurrency(selectedOrder.discount)"></span>
        </div>
        <div class="summary-row">
          <span>ภาษี</span>
          <span x-text="formatCurrency(selectedOrder.tax)"></span>
        </div>
        <div class="summary-row total">
          <span>รวมทั้งสิ้น</span>
          <span x-text="formatCurrency(selectedOrder.total)"></span>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="payment-info">
        <h4>ข้อมูลการชำระเงิน</h4>
        <div class="info-row">
          <span class="label">วิธีชำระ:</span>
          <span x-text="getPaymentMethodText(selectedOrder.paymentMethod)"></span>
        </div>
        <div x-show="selectedOrder.paymentMethod === 'cash'">
          <div class="info-row">
            <span class="label">รับเงิน:</span>
            <span x-text="formatCurrency(selectedOrder.receivedAmount)"></span>
          </div>
          <div class="info-row">
            <span class="label">เงินทอน:</span>
            <span x-text="formatCurrency(selectedOrder.change)"></span>
          </div>
        </div>
      </div>

      <!-- Status Timeline -->
      <div class="status-timeline">
        <h4>สถานะออเดอร์</h4>
        <template x-for="status in selectedOrder.statusHistory" :key="status.timestamp">
          <div class="timeline-item">
            <div class="timeline-time" x-text="formatDateTime(status.timestamp)"></div>
            <div class="timeline-status" x-text="getStatusText(status.status)"></div>
            <div class="timeline-user" x-text="status.updatedBy"></div>
          </div>
        </template>
      </div>
    </div>

    <div class="modal-footer">
      <button @click="printReceipt(selectedOrder)" class="btn-secondary">
        🖨️ พิมพ์ใบเสร็จ
      </button>
      <button x-show="selectedOrder.status === 'PENDING'"
              @click="updateOrderStatus(selectedOrder.orderId, 'PREPARING')"
              class="btn-primary">
        เริ่มทำ
      </button>
      <button x-show="selectedOrder.status === 'PREPARING'"
              @click="updateOrderStatus(selectedOrder.orderId, 'COMPLETED')"
              class="btn-success">
        เสร็จสิ้น
      </button>
      <button x-show="selectedOrder.status === 'PENDING'"
              @click="cancelOrder(selectedOrder.orderId)"
              class="btn-danger">
        ยกเลิก
      </button>
    </div>
  </div>
</div>
```

---

### 4. Receipt Generation & Printing
**Current:** ไม่มี
**Need:** สร้างและพิมพ์ใบเสร็จ

```javascript
printReceipt(order) {
  // Create receipt HTML
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${order.orderNumber}</title>
      <style>
        @media print {
          body { font-family: monospace; width: 80mm; }
          .header { text-align: center; margin-bottom: 10px; }
          .shop-name { font-size: 18px; font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .item-row { display: flex; justify-content: space-between; }
          .total-row { font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${this.shopName}</div>
        <div>${this.shopSettings.address}</div>
        <div>โทร: ${this.shopSettings.phone}</div>
        <div>Tax ID: ${this.shopSettings.taxId}</div>
      </div>

      <div class="divider"></div>

      <div class="order-info">
        <div>ใบเสร็จ: ${order.orderNumber}</div>
        <div>วันที่: ${this.formatDateTime(order.createdDate)}</div>
        <div>พนักงาน: ${order.staffName}</div>
        <div>ช่องทาง: ${order.channelName}</div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${order.items.map(item => `
          <div class="item-row">
            <div>${item.productName}</div>
            <div>${this.formatCurrency(item.subtotal)}</div>
          </div>
          ${item.variantText ? `<div class="item-variant">${item.variantText}</div>` : ''}
          <div class="item-qty">x${item.quantity} @ ${this.formatCurrency(item.unitPrice)}</div>
        `).join('')}
      </div>

      <div class="divider"></div>

      <div class="summary">
        <div class="item-row">
          <div>ยอดรวม</div>
          <div>${this.formatCurrency(order.subtotal)}</div>
        </div>
        <div class="item-row">
          <div>ส่วนลด</div>
          <div>${this.formatCurrency(order.discount)}</div>
        </div>
        <div class="item-row">
          <div>ภาษี (7%)</div>
          <div>${this.formatCurrency(order.tax)}</div>
        </div>
        <div class="divider"></div>
        <div class="item-row total-row">
          <div>รวมทั้งสิ้น</div>
          <div>${this.formatCurrency(order.total)}</div>
        </div>
      </div>

      ${order.paymentMethod === 'cash' ? `
        <div class="divider"></div>
        <div class="payment">
          <div class="item-row">
            <div>รับเงิน</div>
            <div>${this.formatCurrency(order.receivedAmount)}</div>
          </div>
          <div class="item-row">
            <div>เงินทอน</div>
            <div>${this.formatCurrency(order.change)}</div>
          </div>
        </div>
      ` : ''}

      <div class="divider"></div>

      <div class="footer">
        <div>ขอบคุณที่ใช้บริการ</div>
        <div>กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน</div>
      </div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
```

---

## 📦 Complete Page Implementations Needed

### 1. Products Management Page

```javascript
// Products Page Structure
{
  // State
  products: [],
  categories: [],
  selectedProduct: null,
  showProductModal: false,
  productForm: {
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    cost: 0,
    sku: '',
    barcode: '',
    image: '',
    status: 'active',
    hasVariants: false,
    variants: [],
    modifiers: []
  },

  // Methods
  async loadProducts() {},
  async loadCategories() {},
  openAddProductModal() {},
  openEditProductModal(product) {},
  async saveProduct() {},
  async deleteProduct(productId) {},
  async uploadImage(file) {},
  addVariant() {},
  removeVariant(index) {},
  addModifier() {},
  removeModifier(index) {}
}
```

**UI Components:**
- Product listing (DataTable with search, filter, sort)
- Add/Edit Product Modal
- Category management
- Variant builder
- Modifier builder
- Image uploader
- Bulk operations

---

### 2. Inventory Management Page

```javascript
// Inventory Page Structure
{
  // State
  inventoryItems: [],
  recipes: [],
  selectedItem: null,
  showAdjustmentModal: false,
  showRecipeModal: false,
  adjustmentForm: {
    itemId: '',
    adjustmentType: 'add', // add, subtract, set
    quantity: 0,
    reason: '',
    referenceNumber: ''
  },
  recipeForm: {
    productId: '',
    ingredients: []
  },

  // Methods
  async loadInventory() {},
  async loadRecipes() {},
  openAdjustmentModal(item) {},
  async saveAdjustment() {},
  openRecipeModal(product) {},
  async saveRecipe() {},
  addIngredient() {},
  removeIngredient(index) {},
  calculateCost(productId) {}
}
```

**UI Components:**
- Inventory listing with stock levels
- Stock adjustment modal
- Recipe/BOM builder
- Stock alerts
- Movement history
- Import/Export

---

### 3. Purchase Orders Page

```javascript
// Purchase Orders Page Structure
{
  // State
  purchaseOrders: [],
  suppliers: [],
  selectedPO: null,
  showPOModal: false,
  showReceiveModal: false,
  poForm: {
    supplierId: '',
    items: [],
    notes: '',
    expectedDate: ''
  },

  // Methods
  async loadPurchaseOrders() {},
  async loadSuppliers() {},
  openCreatePOModal() {},
  async savePurchaseOrder() {},
  async approvePO(poId) {},
  async rejectPO(poId) {},
  openReceiveModal(po) {},
  async receiveGoods(poId, items) {},
  addPOItem() {},
  removePOItem(index) {},
  calculatePOTotal() {}
}
```

---

### 4. Reports Page

```javascript
// Reports Page Structure
{
  // State
  reportType: 'sales',
  dateRange: { start: '', end: '' },
  reportData: null,
  chartData: null,

  // Report Types
  reportTypes: [
    'sales',
    'products',
    'inventory',
    'profit_loss',
    'cash_flow',
    'employee',
    'customer',
    'tax'
  ],

  // Methods
  async loadReport() {},
  async exportToPDF() {},
  async exportToExcel() {},
  renderChart() {},
  applyFilters() {}
}
```

**Report Details:**

**Sales Report:**
- Total sales by period
- Sales by channel
- Sales by product
- Sales by hour/day/week/month
- Comparison vs previous period
- Top products
- Sales trends

**Profit & Loss Report:**
- Revenue
- Cost of goods sold (COGS)
- Gross profit
- Operating expenses
- Net profit
- Profit margin %

**Inventory Report:**
- Current stock levels
- Stock value
- Low stock items
- Out of stock items
- Stock movement
- Wastage

---

## 🔌 Integration Specifications

### LINE OA Integration

```javascript
// LINE Webhook Handler
async function handleLINEWebhook(event) {
  const messageType = event.message.type;

  if (messageType === 'text') {
    const text = event.message.text.toLowerCase();

    if (text === 'เมนู' || text === 'menu') {
      return sendMenuFlex(event.replyToken);
    }

    if (text === 'สถานะออเดอร์') {
      return sendOrderStatus(event.userId);
    }
  }

  if (messageType === 'postback') {
    return handlePostback(event);
  }
}

// Send Menu as Flex Message
async function sendMenuFlex(replyToken) {
  const products = await getProducts();

  const flexMessage = {
    type: 'flex',
    altText: 'เมนูของเรา',
    contents: {
      type: 'carousel',
      contents: products.map(product => ({
        type: 'bubble',
        hero: {
          type: 'image',
          url: product.image,
          size: 'full',
          aspectRatio: '20:13'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: product.name,
              weight: 'bold',
              size: 'xl'
            },
            {
              type: 'text',
              text: `${product.basePrice} ฿`,
              size: 'lg',
              color: '#8B5CF6'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: 'สั่งเลย',
                data: `action=order&productId=${product.productId}`
              }
            }
          ]
        }
      }))
    }
  };

  return replyMessage(replyToken, flexMessage);
}

// Handle Order from LINE
async function handleOrderPostback(data) {
  const { productId, variants, modifiers } = parsePostbackData(data);

  // Create order
  const order = await createOrder({
    channelId: 'LINE_OA',
    items: [{
      productId,
      variants,
      modifiers,
      quantity: 1
    }],
    customerId: data.userId
  });

  // Send confirmation
  return sendOrderConfirmation(data.userId, order);
}
```

### PromptPay QR Integration

```javascript
// Generate PromptPay QR Code
function generatePromptPayQR(phoneNumber, amount) {
  // EMV QR Code format for PromptPay

  // Payload Format Indicator
  let qr = '000201';

  // Point of Initiation Method
  qr += '010212';

  // Merchant Account Information
  const merchantInfo = `0016A000000677010111${formatPhoneNumber(phoneNumber)}`;
  qr += `29${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;

  // Country Code
  qr += '5802TH';

  // Transaction Currency (THB = 764)
  qr += '5303764';

  // Transaction Amount
  if (amount > 0) {
    const amountStr = amount.toFixed(2);
    qr += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  }

  // CRC (calculate last)
  qr += '6304';
  const crc = calculateCRC16(qr);
  qr += crc;

  return qr;
}

function formatPhoneNumber(phone) {
  // Remove leading 0 and add country code
  return '66' + phone.substring(1);
}

function calculateCRC16(str) {
  // CRC-16-CCITT calculation
  let crc = 0xFFFF;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
```

---

## 🎨 Component Library Needed

### Reusable Components

```javascript
// DataTable Component
Alpine.data('dataTable', (config) => ({
  items: [],
  filteredItems: [],
  sortColumn: '',
  sortDirection: 'asc',
  searchQuery: '',
  currentPage: 1,
  perPage: 10,

  init() {
    this.filteredItems = this.items;
  },

  search() {
    // Filter logic
  },

  sort(column) {
    // Sort logic
  },

  paginate() {
    // Pagination logic
  }
}));

// Modal Component
Alpine.data('modal', () => ({
  open: false,

  show() {
    this.open = true;
    document.body.style.overflow = 'hidden';
  },

  hide() {
    this.open = false;
    document.body.style.overflow = '';
  }
}));

// DateRangePicker Component
Alpine.data('dateRangePicker', () => ({
  startDate: '',
  endDate: '',

  setRange(range) {
    // 'today', 'yesterday', 'thisWeek', 'thisMonth', etc.
  }
}));
```

---

## 🔒 Security Enhancements Needed

### 1. Input Validation
```javascript
// Validate all user inputs
function validateProductForm(data) {
  const errors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'ชื่อสินค้าต้องไม่เป็นค่าว่าง';
  }

  if (data.basePrice <= 0) {
    errors.basePrice = 'ราคาต้องมากกว่า 0';
  }

  if (data.cost < 0) {
    errors.cost = 'ต้นทุนต้องไม่ติดลบ';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
```

### 2. XSS Protection
```javascript
// Sanitize HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Use in templates
<div x-text="escapeHTML(product.name)"></div>
```

### 3. Rate Limiting
```javascript
// Implement rate limiting for API calls
const rateLimiter = {
  limits: {},

  checkLimit(key, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();

    if (!this.limits[key]) {
      this.limits[key] = { count: 0, resetTime: now + windowMs };
    }

    if (now > this.limits[key].resetTime) {
      this.limits[key] = { count: 0, resetTime: now + windowMs };
    }

    this.limits[key].count++;

    return this.limits[key].count <= maxRequests;
  }
};
```

---

**สรุป:** ยังมีฟีเจอร์ที่ต้องพัฒนาอีกมาก แต่ถ้าทำตาม roadmap จะได้ระบบที่สมบูรณ์และพร้อมใช้งานจริง 🚀
