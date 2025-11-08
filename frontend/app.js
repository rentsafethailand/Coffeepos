// Coffee Shop POS - Alpine.js Application
// Main application logic for the frontend

function coffeeShopApp() {
  return {
    // ==================== STATE ====================

    // App State
    loading: false,
    isAuthenticated: false,
    currentPage: 'dashboard',
    sidebarOpen: true,

    // User Data
    username: '',
    userRole: '',
    tenantId: '',
    shopSheetId: '',
    shopName: '',
    currentDateTime: '',

    // Login
    showPassword: false,
    loggingIn: false,
    loginError: '',
    loginForm: {
      username: '',
      password: '',
      rememberMe: false
    },

    // Modals
    modals: {
      variantSelector: false,
      payment: false,
      orderDetail: false,
      productForm: false,
      stockAdjust: false,
      channelForm: false
    },

    // POS
    pos: {
      cart: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      searchQuery: '',
      selectedCategory: '',
      selectedChannel: 'POS', // Default channel: POS (In-store)
      filteredProducts: [],
      allProducts: []
    },

    // Selected Product for Variant Selector
    selectedProduct: {},
    selectedVariants: {
      size: 'MEDIUM',
      temperature: 'HOT',
      sweetness: '50%'
    },
    selectedAddons: [],
    variantQuantity: 1,

    // Payment
    payment: {
      method: 'CASH',
      received: 0,
      change: 0,
      slipFile: null
    },

    // Orders
    orders: {
      list: [],
      filteredList: [],
      filterDate: '',
      filterStatus: '',
      filterChannel: '',
      searchQuery: ''
    },

    // Products
    products: {
      list: []
    },

    // Inventory
    inventory: {
      list: []
    },

    // Dashboard
    dashboardData: {
      totalSales: 0,
      totalOrders: 0,
      lowStockItems: 0,
      totalProfit: 0,
      totalCommission: 0,      // NEW: Total commission across all channels
      netProfit: 0,            // NEW: Profit after commission
      channelStats: [],        // NEW: Per-channel statistics
      topChannelsByProfit: [], // NEW: Top 5 channels by profit
      topProducts: [],
      lowStockList: []
    },

    // Chart.js instance
    channelSalesChart: null,

    // Reports
    reports: {
      startDate: '',
      endDate: '',
      totalSales: 0,
      totalOrders: 0,
      avgOrderValue: 0
    },

    // Settings
    settings: {
      shopName: '',
      phone: '',
      address: '',
      taxRate: 7,
      taxId: '',
      printReceipt: true,
      autoDeductStock: true
    },

    // Channels Management
    channels: {
      list: [],
      editing: null,  // Channel being edited
      form: {
        channelId: '',
        channelName: '',
        channelType: 'POS',
        orderNumberMode: 'AUTO',  // AUTO or MANUAL
        orderNumberFormat: '#{NNNN}',  // Format for AUTO mode
        commissionRate: 0,
        deliveryFee: 0,
        isActive: true
      }
    },

    // Manual Order Number (for MANUAL channels)
    manualOrderNumber: '',

    lowStockCount: 0,


    // ==================== INITIALIZATION ====================

    init() {
      console.log('Coffee Shop POS initialized');

      // Update datetime every second
      this.updateDateTime();
      setInterval(() => this.updateDateTime(), 1000);

      // Check saved session
      this.checkSavedSession();

      // Set default dates for reports
      const today = new Date();
      this.reports.endDate = today.toISOString().split('T')[0];
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      this.reports.startDate = weekAgo.toISOString().split('T')[0];
    },

    updateDateTime() {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      this.currentDateTime = now.toLocaleDateString('th-TH', options);
    },

    checkSavedSession() {
      const saved = localStorage.getItem('coffeeShopSession');
      if (saved) {
        try {
          const session = JSON.parse(saved);
          this.username = session.username;
          this.userRole = session.role;
          this.tenantId = session.tenantId;
          this.shopSheetId = session.shopSheetId;
          this.shopName = session.shopName;
          this.isAuthenticated = true;
          this.loadInitialData();
        } catch (e) {
          console.error('Error loading saved session:', e);
        }
      }
    },


    // ==================== AUTHENTICATION ====================

    async login() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.loginError = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
        return;
      }

      this.loggingIn = true;
      this.loginError = '';

      try {
        // Call API
        const response = await this.callAPI('login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        });

        if (response.success) {
          this.username = response.data.username;
          this.userRole = response.data.role;
          this.tenantId = response.data.tenantId;
          this.shopSheetId = response.data.shopSheetId;
          this.shopName = response.data.tenantName || 'Coffee Shop';
          this.isAuthenticated = true;

          // Save session if remember me
          if (this.loginForm.rememberMe) {
            localStorage.setItem('coffeeShopSession', JSON.stringify({
              username: this.username,
              role: this.userRole,
              tenantId: this.tenantId,
              shopSheetId: this.shopSheetId,
              shopName: this.shopName
            }));
          }

          // Load initial data
          this.loadInitialData();

        } else {
          this.loginError = response.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        }

      } catch (error) {
        console.error('Login error:', error);
        this.loginError = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      } finally {
        this.loggingIn = false;
      }
    },

    logout() {
      this.isAuthenticated = false;
      this.username = '';
      this.userRole = '';
      this.tenantId = '';
      this.shopSheetId = '';
      this.shopName = '';
      this.currentPage = 'dashboard';
      localStorage.removeItem('coffeeShopSession');

      // Clear data
      this.pos.cart = [];
      this.orders.list = [];
      this.products.list = [];
      this.inventory.list = [];
    },


    // ==================== DATA LOADING ====================

    async loadInitialData() {
      this.loading = true;

      try {
        await Promise.all([
          this.loadProducts(),
          this.loadDashboard(),
          this.loadInventory()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadDashboard() {
      try {
        const response = await this.callAPI('getDashboardData', {
          shopSheetId: this.shopSheetId
        });

        if (response.success) {
          this.dashboardData = response.data;
          this.lowStockCount = response.data.lowStockItems || 0;

          // Initialize channel sales chart if on dashboard page
          this.$nextTick(() => {
            if (this.currentPage === 'dashboard') {
              this.initChannelSalesChart();
            }
          });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    },

    initChannelSalesChart() {
      const canvas = document.getElementById('channelSalesChart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // Destroy existing chart if any
      if (this.channelSalesChart) {
        this.channelSalesChart.destroy();
      }

      // Prepare data
      const channelStats = this.dashboardData.channelStats || [];
      const labels = channelStats.map(ch => ch.channelName);
      const salesData = channelStats.map(ch => ch.totalSales);
      const ordersData = channelStats.map(ch => ch.totalOrders);

      // Chart colors
      const colors = [
        'rgb(147, 51, 234)',   // Purple
        'rgb(236, 72, 153)',   // Pink
        'rgb(59, 130, 246)',   // Blue
        'rgb(34, 197, 94)',    // Green
        'rgb(249, 115, 22)',   // Orange
        'rgb(168, 85, 247)',   // Light Purple
        'rgb(251, 146, 60)',   // Light Orange
        'rgb(14, 165, 233)'    // Sky Blue
      ];

      this.channelSalesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'ยอดขาย (฿)',
              data: salesData,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const channel = channelStats[context.dataIndex];
                  return [
                    `ยอดขาย: ฿${channel.totalSales.toLocaleString()}`,
                    `ออเดอร์: ${channel.totalOrders} รายการ`,
                    `ค่าคอมมิชชั่น: ฿${channel.totalCommission.toLocaleString()}`,
                    `กำไรสุทธิ: ฿${channel.netProfit.toLocaleString()}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '฿' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    },

    async loadProducts() {
      try {
        const response = await this.callAPI('getProducts', {
          shopSheetId: this.shopSheetId
        });

        if (response.success) {
          this.products.list = response.data;
          this.pos.allProducts = response.data.filter(p => p.isActive);
          this.pos.filteredProducts = this.pos.allProducts;
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },

    async loadOrders() {
      try {
        const response = await this.callAPI('getOrders', {
          shopSheetId: this.shopSheetId
        });

        if (response.success) {
          this.orders.list = response.data;
          this.orders.filteredList = response.data;
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    },

    async loadInventory() {
      try {
        const response = await this.callAPI('getInventoryItems', {
          shopSheetId: this.shopSheetId
        });

        if (response.success) {
          this.inventory.list = response.data;
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
      }
    },

    async loadReports() {
      try {
        const response = await this.callAPI('getSalesReport', {
          shopSheetId: this.shopSheetId,
          startDate: this.reports.startDate,
          endDate: this.reports.endDate
        });

        if (response.success) {
          this.reports.totalSales = response.data.totalSales || 0;
          this.reports.totalOrders = response.data.totalOrders || 0;
          this.reports.avgOrderValue = response.data.avgOrderValue || 0;
        }
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    },


    // ==================== NAVIGATION ====================

    navigateTo(page) {
      this.currentPage = page;

      // Load data when navigating to specific pages
      if (page === 'orders' && this.orders.list.length === 0) {
        this.loadOrders();
      } else if (page === 'inventory' && this.inventory.list.length === 0) {
        this.loadInventory();
      } else if (page === 'dashboard') {
        this.loadDashboard();
      } else if (page === 'settings' && this.channels.list.length === 0) {
        this.loadChannels();
      }

      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        this.sidebarOpen = false;
      }
    },


    // ==================== POS FUNCTIONS ====================

    searchProducts() {
      this.filterProducts();
    },

    filterProducts() {
      let filtered = this.pos.allProducts;

      // Filter by category
      if (this.pos.selectedCategory) {
        filtered = filtered.filter(p => p.category === this.pos.selectedCategory);
      }

      // Filter by search query
      if (this.pos.searchQuery) {
        const query = this.pos.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      }

      this.pos.filteredProducts = filtered;
    },

    openVariantSelector(product) {
      if (!product.isActive) {
        alert('สินค้านี้ไม่พร้อมขาย');
        return;
      }

      this.selectedProduct = product;
      this.selectedVariants = {
        size: 'MEDIUM',
        temperature: 'HOT',
        sweetness: '50%'
      };
      this.selectedAddons = [];
      this.variantQuantity = 1;
      this.modals.variantSelector = true;
    },

    calculateVariantPrice() {
      let price = this.selectedProduct.price || 0;

      // Add variant price adjustments
      if (this.selectedVariants.size === 'LARGE') {
        price += 10;
      } else if (this.selectedVariants.size === 'SMALL') {
        price -= 5;
      }

      // Add addon prices
      this.selectedAddons.forEach(addon => {
        if (addon.includes('10฿')) price += 10;
        if (addon.includes('15฿')) price += 15;
      });

      return price;
    },

    addToCart() {
      const item = {
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        price: this.calculateVariantPrice(),
        quantity: this.variantQuantity,
        variants: { ...this.selectedVariants },
        addons: [...this.selectedAddons]
      };

      this.pos.cart.push(item);
      this.updateCartTotals();
      this.modals.variantSelector = false;

      // Reset
      this.selectedProduct = {};
      this.variantQuantity = 1;
    },

    removeFromCart(index) {
      this.pos.cart.splice(index, 1);
      this.updateCartTotals();
    },

    updateQuantity(index, change) {
      this.pos.cart[index].quantity += change;
      if (this.pos.cart[index].quantity < 1) {
        this.removeFromCart(index);
      } else {
        this.updateCartTotals();
      }
    },

    clearCart() {
      if (confirm('ต้องการล้างรายการทั้งหมดใช่หรือไม่?')) {
        this.pos.cart = [];
        this.updateCartTotals();
      }
    },

    updateCartTotals() {
      this.pos.subtotal = this.pos.cart.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      );
      this.pos.tax = this.pos.subtotal * 0.07;
      this.pos.total = this.pos.subtotal + this.pos.tax;
    },

    openPaymentModal() {
      if (this.pos.cart.length === 0) {
        return;
      }

      this.payment = {
        method: 'CASH',
        received: 0,
        change: 0,
        slipFile: null
      };

      this.manualOrderNumber = '';  // Reset manual order number

      this.modals.payment = true;
    },

    calculateChange() {
      const received = parseFloat(this.payment.received) || 0;
      this.payment.change = Math.max(0, received - this.pos.total);
    },

    canConfirmPayment() {
      // Check if manual order number is required
      const channel = this.getChannelInfo(this.pos.selectedChannel);
      if (channel && channel.orderNumberMode === 'MANUAL') {
        if (!this.manualOrderNumber || this.manualOrderNumber.trim() === '') {
          return false;
        }
      }

      // Check payment method
      if (this.payment.method === 'CASH') {
        return parseFloat(this.payment.received) >= this.pos.total;
      } else if (this.payment.method === 'TRANSFER') {
        return this.payment.slipFile !== null;
      }
      return false;
    },

    handleSlipUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.payment.slipFile = file;
      }
    },

    async confirmPayment() {
      if (!this.canConfirmPayment()) {
        return;
      }

      this.loading = true;

      try {
        // Prepare order items
        const orderItems = this.pos.cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          variants: JSON.stringify(item.variants),
          addons: JSON.stringify(item.addons)
        }));

        // Upload slip if transfer payment
        let slipUrl = null;
        if (this.payment.method === 'TRANSFER' && this.payment.slipFile) {
          slipUrl = await this.uploadSlip(this.payment.slipFile);
        }

        // Create order
        const response = await this.callAPI('createOrder', {
          shopSheetId: this.shopSheetId,
          username: this.username,
          channel: this.pos.selectedChannel,
          manualOrderNumber: this.manualOrderNumber || null,  // For MANUAL channels
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

          // Auto-print receipt
          this.printReceipt({
            orderNumber: response.data.orderNumber,
            channelName: this.getChannelName(this.pos.selectedChannel),
            items: this.pos.cart,
            subtotal: this.pos.subtotal,
            tax: this.pos.tax,
            total: this.pos.total,
            paymentMethod: this.payment.method,
            received: this.payment.received,
            change: this.payment.change,
            cashier: this.username,
            orderDate: new Date()
          });

          // Clear cart and close modal
          this.pos.cart = [];
          this.updateCartTotals();
          this.modals.payment = false;

          // Reload data
          await this.loadDashboard();
          await this.loadInventory();

        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

      } catch (error) {
        console.error('Payment error:', error);
        alert('เกิดข้อผิดพลาดในการชำระเงิน');
      } finally {
        this.loading = false;
      }
    },

    async uploadSlip(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64 = e.target.result.split(',')[1];
            const response = await this.callAPI('uploadSlipImage', {
              shopSheetId: this.shopSheetId,
              filename: file.name,
              mimeType: file.type,
              base64Data: base64
            });

            if (response.success) {
              resolve(response.data.url);
            } else {
              reject(new Error('Upload failed'));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    printReceipt(orderData) {
      try {
        // Prepare receipt data
        const receiptData = {
          shopName: this.shopName || 'COFFEE SHOP',
          orderNumber: orderData.orderNumber,
          channelName: orderData.channelName,
          orderDate: orderData.orderDate,
          cashier: orderData.cashier,
          items: orderData.items.map(item => {
            // Format variants display
            let variantsText = '';
            if (item.variants) {
              const variants = typeof item.variants === 'string'
                ? JSON.parse(item.variants)
                : item.variants;
              const parts = [];
              if (variants.size) parts.push(variants.size);
              if (variants.temperature) parts.push(variants.temperature);
              if (variants.sweetness) parts.push(`หวาน ${variants.sweetness}`);
              if (variants.shots) parts.push(`${variants.shots} shots`);
              variantsText = parts.join(', ');
            }

            // Add addons if any
            if (item.addons && item.addons.length > 0) {
              const addons = typeof item.addons === 'string'
                ? JSON.parse(item.addons)
                : item.addons;
              if (addons.length > 0) {
                const addonNames = addons.map(a => a.name).join(', ');
                variantsText += (variantsText ? ' + ' : '') + addonNames;
              }
            }

            return {
              productName: item.productName,
              variants: variantsText,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price
            };
          }),
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          deliveryFee: orderData.deliveryFee || 0,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          received: orderData.received || 0,
          change: orderData.change || 0
        };

        // Store in localStorage for receipt page to access
        localStorage.setItem('receiptData', JSON.stringify(receiptData));

        // Open receipt in new window
        const receiptWindow = window.open(
          'receipt-80mm.html?autoprint=true',
          '_blank',
          'width=400,height=600'
        );

        // Fallback: pass data via window.opener if localStorage fails
        if (receiptWindow) {
          receiptWindow.receiptData = receiptData;
        }

      } catch (error) {
        console.error('Error printing receipt:', error);
        alert('ไม่สามารถพิมพ์ใบเสร็จได้: ' + error.message);
      }
    },


    // ==================== ORDERS FUNCTIONS ====================

    filterOrders() {
      let filtered = this.orders.list;

      // Filter by date
      if (this.orders.filterDate) {
        filtered = filtered.filter(o =>
          o.createdAt.startsWith(this.orders.filterDate)
        );
      }

      // Filter by status
      if (this.orders.filterStatus) {
        filtered = filtered.filter(o => o.status === this.orders.filterStatus);
      }

      // Filter by channel
      if (this.orders.filterChannel) {
        filtered = filtered.filter(o => o.channel === this.orders.filterChannel);
      }

      // Search
      if (this.orders.searchQuery) {
        const query = this.orders.searchQuery.toLowerCase();
        filtered = filtered.filter(o =>
          o.orderNumber.toLowerCase().includes(query)
        );
      }

      this.orders.filteredList = filtered;
    },

    viewOrderDetail(order) {
      // TODO: Implement order detail modal
      console.log('View order:', order);
      alert('รายละเอียดออเดอร์: ' + order.orderNumber);
    },

    async reprintOrder(order) {
      try {
        this.loading = true;

        // Fetch order items
        const response = await this.callAPI('getOrderItems', {
          shopSheetId: this.shopSheetId,
          orderId: order.id
        });

        if (response.success && response.data && response.data.length > 0) {
          const items = response.data;

          // Prepare order data for printing
          const orderData = {
            orderNumber: order.orderNumber,
            channelName: order.channelName || order.channel,
            orderDate: new Date(order.createdAt),
            cashier: order.createdBy || 'พนักงาน',
            items: items.map(item => ({
              productName: item.productName,
              variants: item.variants ? (typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants) : {},
              addons: item.addons ? (typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons) : [],
              quantity: item.quantity,
              price: item.price
            })),
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            deliveryFee: order.deliveryFee || 0,
            total: order.totalAmount,
            paymentMethod: order.paymentMethod || 'CASH',
            received: order.amountReceived || 0,
            change: order.change || 0
          };

          // Print receipt
          this.printReceipt(orderData);

        } else {
          alert('ไม่พบรายการสินค้าในออเดอร์นี้');
        }

      } catch (error) {
        console.error('Error reprinting order:', error);
        alert('เกิดข้อผิดพลาดในการพิมพ์ใบเสร็จ');
      } finally {
        this.loading = false;
      }
    },


    // ==================== PRODUCTS FUNCTIONS ====================

    openProductModal() {
      // TODO: Implement product form modal
      alert('ฟีเจอร์เพิ่มสินค้าจะเปิดใช้งานในเร็วๆ นี้');
    },

    editProduct(product) {
      // TODO: Implement product edit
      console.log('Edit product:', product);
      alert('แก้ไขสินค้า: ' + product.name);
    },

    async toggleProductStatus(product) {
      try {
        const newStatus = !product.isActive;
        const response = await this.callAPI('updateProduct', {
          shopSheetId: this.shopSheetId,
          productId: product.id,
          isActive: newStatus
        });

        if (response.success) {
          product.isActive = newStatus;
          alert('เปลี่ยนสถานะสินค้าสำเร็จ');
          await this.loadProducts();
        }
      } catch (error) {
        console.error('Error toggling product status:', error);
        alert('เกิดข้อผิดพลาด');
      }
    },


    // ==================== INVENTORY FUNCTIONS ====================

    openStockAdjustModal() {
      // TODO: Implement stock adjust modal
      alert('ฟีเจอร์ปรับสต็อกจะเปิดใช้งานในเร็วๆ นี้');
    },

    adjustStock(item) {
      // TODO: Implement stock adjustment
      console.log('Adjust stock:', item);
      alert('ปรับสต็อก: ' + item.name);
    },


    // ==================== SETTINGS FUNCTIONS ====================

    async saveSettings() {
      try {
        const response = await this.callAPI('updateSettings', {
          shopSheetId: this.shopSheetId,
          settings: this.settings
        });

        if (response.success) {
          alert('บันทึกการตั้งค่าสำเร็จ');
          this.shopName = this.settings.shopName;
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    },


    // ==================== CHANNELS MANAGEMENT FUNCTIONS ====================

    async loadChannels() {
      try {
        const response = await this.callAPI('getChannels', {
          shopSheetId: this.shopSheetId
        });

        if (response.success) {
          this.channels.list = response.data;
        }
      } catch (error) {
        console.error('Error loading channels:', error);
      }
    },

    openAddChannelModal() {
      this.channels.editing = null;
      this.channels.form = {
        channelId: '',
        channelName: '',
        channelType: 'POS',
        orderNumberMode: 'AUTO',
        orderNumberFormat: '#{NNNN}',
        commissionRate: 0,
        deliveryFee: 0,
        isActive: true
      };
      this.modals.channelForm = true;
    },

    openEditChannelModal(channel) {
      this.channels.editing = channel.channelId;
      this.channels.form = { ...channel };
      this.modals.channelForm = true;
    },

    async saveChannel() {
      try {
        const action = this.channels.editing ? 'updateChannel' : 'createChannel';

        const response = await this.callAPI(action, {
          shopSheetId: this.shopSheetId,
          channel: this.channels.form
        });

        if (response.success) {
          alert(this.channels.editing ? 'อัพเดทช่องทางสำเร็จ' : 'เพิ่มช่องทางสำเร็จ');
          this.modals.channelForm = false;
          await this.loadChannels();
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
      } catch (error) {
        console.error('Error saving channel:', error);
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    },

    async toggleChannelStatus(channel) {
      try {
        const response = await this.callAPI('updateChannel', {
          shopSheetId: this.shopSheetId,
          channel: {
            ...channel,
            isActive: !channel.isActive
          }
        });

        if (response.success) {
          alert('อัพเดทสถานะสำเร็จ');
          await this.loadChannels();
        }
      } catch (error) {
        console.error('Error toggling channel:', error);
        alert('เกิดข้อผิดพลาด');
      }
    },

    getChannelInfo(channelType) {
      const channel = this.channels.list.find(c => c.channelType === channelType);
      return channel || null;
    },

    getChannelName(channelType) {
      const channelNames = {
        'POS': '🏪 หน้าร้าน',
        'GRAB': '🛵 Grab Food',
        'LINEMAN': '📦 LINE MAN',
        'FOODPANDA': '🐼 Food Panda',
        'ONLINE': '🌐 สั่งออนไลน์'
      };
      return channelNames[channelType] || channelType;
    },


    // ==================== UTILITY FUNCTIONS ====================

    formatCurrency(amount) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0);
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },


    // ==================== API FUNCTIONS ====================

    async callAPI(action, params) {
      // Check if running inside Google Apps Script
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        // Use google.script.run for production
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(response => {
              resolve(response);
            })
            .withFailureHandler(error => {
              console.error('API Error:', error);
              reject(error);
            })
            [action](params);
        });
      } else {
        // Use Mock API for local development/testing
        console.log('🧪 Running in development mode - using Mock API');
        return this.mockAPI(action, params);
      }
    },


    // ==================== MOCK API (for testing) ====================

    mockAPI(action, params) {
      console.log('Mock API Call:', action, params);

      switch (action) {
        case 'login':
          // Accept any login for demo
          return {
            success: true,
            data: {
              username: params.username,
              role: 'ADMIN',
              tenantId: 'DEMO_TENANT',
              shopSheetId: 'DEMO_SHOP_SHEET_ID',
              tenantName: 'ร้านกาแฟตัวอย่าง'
            }
          };

        case 'getDashboard':
        case 'getDashboardData':
          return {
            success: true,
            data: {
              totalSales: 12500,
              totalOrders: 45,
              lowStockItems: 3,
              totalProfit: 5600,
              topProducts: [
                { name: 'ลาเต้เย็น', count: 28, revenue: 2800 },
                { name: 'คาปูชิโน่ร้อน', count: 22, revenue: 1980 },
                { name: 'เอสเพรสโซ่', count: 18, revenue: 1440 },
                { name: 'มอคค่าเย็น', count: 15, revenue: 1650 },
                { name: 'อเมริกาโน่', count: 12, revenue: 960 }
              ],
              lowStockList: [
                { id: 1, name: 'เมล็ดกาแฟอาราบิก้า', stock: 500, unit: 'กรัม' },
                { id: 2, name: 'นมสด', stock: 2, unit: 'ลิตร' },
                { id: 3, name: 'ถ้วยกระดาษ Medium', stock: 15, unit: 'ใบ' }
              ]
            }
          };

        case 'getProducts':
          return {
            success: true,
            data: [
              {
                id: 'P001',
                name: 'ลาเต้',
                price: 100,
                category: 'COFFEE',
                isActive: true,
                description: 'กาแฟลาเต้หอมกรุ่น'
              },
              {
                id: 'P002',
                name: 'คาปูชิโน่',
                price: 90,
                category: 'COFFEE',
                isActive: true,
                description: 'คาปูชิโน่ฟองนุ่ม'
              },
              {
                id: 'P003',
                name: 'เอสเพรสโซ่',
                price: 80,
                category: 'COFFEE',
                isActive: true,
                description: 'เอสเพรสโซ่เข้มข้น'
              },
              {
                id: 'P004',
                name: 'มอคค่า',
                price: 110,
                category: 'COFFEE',
                isActive: true,
                description: 'มอคค่าช็อกโกแลต'
              },
              {
                id: 'P005',
                name: 'อเมริกาโน่',
                price: 80,
                category: 'COFFEE',
                isActive: true,
                description: 'อเมริกาโน่สไตล์อิตาลี'
              },
              {
                id: 'P006',
                name: 'ชาเขียว',
                price: 70,
                category: 'TEA',
                isActive: true,
                description: 'ชาเขียวญี่ปุ่น'
              }
            ]
          };

        case 'getInventoryItems':
          return {
            success: true,
            data: [
              {
                id: 'I001',
                sku: 'COFFEE-001',
                name: 'เมล็ดกาแฟอาราบิก้า',
                stock: 500,
                unit: 'กรัม',
                reorderPoint: 1000
              },
              {
                id: 'I002',
                sku: 'MILK-001',
                name: 'นมสด',
                stock: 2,
                unit: 'ลิตร',
                reorderPoint: 5
              },
              {
                id: 'I003',
                sku: 'CUP-M',
                name: 'ถ้วยกระดาษ Medium',
                stock: 15,
                unit: 'ใบ',
                reorderPoint: 50
              },
              {
                id: 'I004',
                sku: 'SUGAR-001',
                name: 'น้ำตาล',
                stock: 5000,
                unit: 'กรัม',
                reorderPoint: 2000
              },
              {
                id: 'I005',
                sku: 'CUP-S',
                name: 'ถ้วยกระดาษ Small',
                stock: 80,
                unit: 'ใบ',
                reorderPoint: 50
              },
              {
                id: 'I006',
                sku: 'CUP-L',
                name: 'ถ้วยกระดาษ Large',
                stock: 120,
                unit: 'ใบ',
                reorderPoint: 50
              }
            ]
          };

        case 'getOrders':
          return {
            success: true,
            data: [
              {
                id: 'O001',
                orderNumber: 'ORD-20240101-001',
                createdAt: '2024-01-01 10:30:00',
                channel: 'POS',
                itemCount: 3,
                totalAmount: 350,
                status: 'COMPLETED'
              },
              {
                id: 'O002',
                orderNumber: 'ORD-20240101-002',
                createdAt: '2024-01-01 11:15:00',
                channel: 'POS',
                itemCount: 2,
                totalAmount: 200,
                status: 'COMPLETED'
              }
            ]
          };

        case 'createOrder':
          return {
            success: true,
            data: {
              orderNumber: 'ORD-' + Date.now()
            }
          };

        case 'getReports':
        case 'getSalesReport':
          return {
            success: true,
            data: {
              totalSales: 45600,
              totalOrders: 156,
              avgOrderValue: 292.31
            }
          };

        default:
          return {
            success: true,
            data: {},
            message: 'Mock API response'
          };
      }
    }
  };
}
