/**
 * ==========================================
 * Coffee Shop POS - Main Backend (code.gs)
 * ==========================================
 *
 * Google Apps Script Backend สำหรับ Multi-tenant Coffee Shop POS
 *
 * Features:
 * - Multi-tenant Architecture
 * - Authentication & Authorization
 * - Products & Variants Management
 * - Inventory & Recipe/BOM System
 * - Order Processing
 * - Stock Management (Auto-deduct)
 * - Payment Processing
 * - Reports & Analytics
 * - File Upload (Slips)
 *
 * วิธี Deploy:
 * 1. รัน setup.gs ก่อนเพื่อสร้าง Master Sheet
 * 2. Copy MASTER_SHEET_ID และ MASTER_FOLDER_ID มาใส่ด้านล่าง
 * 3. Deploy -> New deployment -> Web app
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Deploy และ copy Web App URL
 */

// ==========================================
// CONFIGURATION
// ==========================================

// ⚠️ แก้ไขค่าเหล่านี้หลังจากรัน setup.gs
const MASTER_SHEET_ID = 'YOUR_MASTER_SHEET_ID_HERE'; // จาก setup.gs
const MASTER_FOLDER_ID = 'YOUR_MASTER_FOLDER_ID_HERE'; // จาก setup.gs

// Session timeout (minutes)
const SESSION_TIMEOUT = 1440; // 24 hours

// API Version
const API_VERSION = '1.0.0';

// ==========================================
// ENTRY POINTS
// ==========================================

/**
 * GET request handler - Serve HTML pages
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'index';

    // Serve different pages
    switch(page) {
      case 'superadmin':
        return HtmlService.createTemplateFromFile('superadmin')
          .evaluate()
          .setTitle('Super Admin - Coffee Shop POS')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

      case 'index':
      default:
        return HtmlService.createTemplateFromFile('index')
          .evaluate()
          .setTitle('Coffee Shop POS')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

  } catch (error) {
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1><p>' + error.message + '</p>'
    );
  }
}

/**
 * Helper function to include other HTML files
 * ใช้สำหรับ <?!= include('filename') ?> ใน HTML template
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * POST request handler - API endpoints
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    Logger.log('📥 API Request: ' + action);

    // Route to appropriate handler
    switch(action) {
      // Authentication
      case 'login':
        return apiResponse(login(requestData));
      case 'logout':
        return apiResponse(logout(requestData));
      case 'validateSession':
        return apiResponse(validateSession(requestData));

      // Super Admin
      case 'createTenant':
        return apiResponse(createTenant(requestData));
      case 'getTenants':
        return apiResponse(getTenants(requestData));
      case 'updateTenant':
        return apiResponse(updateTenant(requestData));
      case 'deleteTenant':
        return apiResponse(deleteTenant(requestData));

      // Products
      case 'getProducts':
        return apiResponse(getProducts(requestData));
      case 'createProduct':
        return apiResponse(createProduct(requestData));
      case 'updateProduct':
        return apiResponse(updateProduct(requestData));
      case 'deleteProduct':
        return apiResponse(deleteProduct(requestData));

      // Variants
      case 'getVariants':
        return apiResponse(getVariants(requestData));
      case 'createVariant':
        return apiResponse(createVariant(requestData));
      case 'updateVariant':
        return apiResponse(updateVariant(requestData));
      case 'deleteVariant':
        return apiResponse(deleteVariant(requestData));

      // Modifiers
      case 'getModifiers':
        return apiResponse(getModifiers(requestData));
      case 'createModifier':
        return apiResponse(createModifier(requestData));
      case 'updateModifier':
        return apiResponse(updateModifier(requestData));
      case 'deleteModifier':
        return apiResponse(deleteModifier(requestData));

      // Inventory
      case 'getInventoryItems':
        return apiResponse(getInventoryItems(requestData));
      case 'createInventoryItem':
        return apiResponse(createInventoryItem(requestData));
      case 'updateInventoryItem':
        return apiResponse(updateInventoryItem(requestData));
      case 'deleteInventoryItem':
        return apiResponse(deleteInventoryItem(requestData));
      case 'adjustStock':
        return apiResponse(adjustStock(requestData));
      case 'getStockMovements':
        return apiResponse(getStockMovements(requestData));

      // Recipes
      case 'getRecipes':
        return apiResponse(getRecipes(requestData));
      case 'createRecipe':
        return apiResponse(createRecipe(requestData));
      case 'updateRecipe':
        return apiResponse(updateRecipe(requestData));
      case 'deleteRecipe':
        return apiResponse(deleteRecipe(requestData));
      case 'getProductRecipe':
        return apiResponse(getProductRecipe(requestData));

      // Orders
      case 'createOrder':
        return apiResponse(createOrder(requestData));
      case 'getOrders':
        return apiResponse(getOrders(requestData));
      case 'getOrderDetail':
        return apiResponse(getOrderDetail(requestData));
      case 'updateOrderStatus':
        return apiResponse(updateOrderStatus(requestData));
      case 'cancelOrder':
        return apiResponse(cancelOrder(requestData));

      // Dashboard
      case 'getDashboardData':
        return apiResponse(getDashboardData(requestData));

      // Reports
      case 'getSalesReport':
        return apiResponse(getSalesReport(requestData));
      case 'getProductReport':
        return apiResponse(getProductReport(requestData));
      case 'getInventoryReport':
        return apiResponse(getInventoryReport(requestData));

      // Channels
      case 'getChannels':
        return apiResponse(getChannels(requestData));
      case 'createChannel':
        return apiResponse(createChannel(requestData));
      case 'updateChannel':
        return apiResponse(updateChannel(requestData));

      // Customers
      case 'getCustomers':
        return apiResponse(getCustomers(requestData));
      case 'createCustomer':
        return apiResponse(createCustomer(requestData));
      case 'updateCustomer':
        return apiResponse(updateCustomer(requestData));

      // Suppliers
      case 'getSuppliers':
        return apiResponse(getSuppliers(requestData));
      case 'createSupplier':
        return apiResponse(createSupplier(requestData));
      case 'updateSupplier':
        return apiResponse(updateSupplier(requestData));

      // Purchase Orders
      case 'createPurchaseOrder':
        return apiResponse(createPurchaseOrder(requestData));
      case 'getPurchaseOrders':
        return apiResponse(getPurchaseOrders(requestData));
      case 'approvePurchaseOrder':
        return apiResponse(approvePurchaseOrder(requestData));
      case 'receivePurchaseOrder':
        return apiResponse(receivePurchaseOrder(requestData));

      // Settings
      case 'getSettings':
        return apiResponse(getSettings(requestData));
      case 'updateSettings':
        return apiResponse(updateSettings(requestData));

      // File Upload
      case 'uploadSlipImage':
        return apiResponse(uploadSlipImage(requestData));

      default:
        return apiResponse({
          success: false,
          message: 'Invalid action: ' + action
        });
    }

  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    return apiResponse({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * API Response wrapper
 */
function apiResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * Login
 */
function login(params) {
  try {
    const username = params.username;
    const password = params.password;

    if (!username || !password) {
      return {
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      };
    }

    // Get Master Spreadsheet
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const usersSheet = masterSS.getSheetByName('Users');
    const tenantsSheet = masterSS.getSheetByName('Tenants');

    // Find user
    const usersData = usersSheet.getDataRange().getValues();
    let user = null;

    for (let i = 1; i < usersData.length; i++) {
      const row = usersData[i];
      if (row[2] === username) { // username column
        user = {
          userId: row[0],
          tenantId: row[1],
          username: row[2],
          password: row[3],
          role: row[4],
          fullName: row[5],
          email: row[6],
          phone: row[7],
          status: row[8]
        };
        break;
      }
    }

    if (!user) {
      return {
        success: false,
        message: 'ไม่พบผู้ใช้นี้ในระบบ'
      };
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'บัญชีนี้ถูกระงับการใช้งาน'
      };
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return {
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง'
      };
    }

    // Get tenant information (if not SUPERADMIN)
    let tenant = null;
    if (user.tenantId !== 'SYSTEM') {
      const tenantsData = tenantsSheet.getDataRange().getValues();
      for (let i = 1; i < tenantsData.length; i++) {
        const row = tenantsData[i];
        if (row[0] === user.tenantId) {
          tenant = {
            tenantId: row[0],
            tenantName: row[1],
            sheetId: row[2],
            folderId: row[3],
            licenseKey: row[4],
            licenseType: row[5],
            startDate: row[6],
            endDate: row[7],
            status: row[8]
          };
          break;
        }
      }

      if (!tenant) {
        return {
          success: false,
          message: 'ไม่พบข้อมูลร้านค้า'
        };
      }

      // Check tenant status
      if (tenant.status !== 'ACTIVE') {
        return {
          success: false,
          message: 'ร้านค้านี้ถูกระงับการใช้งาน'
        };
      }

      // Check license expiry
      const endDate = new Date(tenant.endDate);
      const today = new Date();
      if (endDate < today) {
        return {
          success: false,
          message: 'ไลเซนส์หมดอายุแล้ว กรุณาต่ออายุ'
        };
      }

      // Calculate days remaining
      const diffTime = endDate - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      tenant.daysRemaining = daysRemaining;
    }

    // Generate session token
    const token = Utilities.getUuid();

    // Update last login
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][0] === user.userId) {
        usersSheet.getRange(i + 1, 10).setValue(new Date()); // lastLogin column
        break;
      }
    }

    // Build response
    const response = {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        token: token
      }
    };

    // Add tenant info if not SUPERADMIN
    if (tenant) {
      response.data.tenantId = tenant.tenantId;
      response.data.shopName = tenant.tenantName;
      response.data.shopSheetId = tenant.sheetId;
      response.data.licenseKey = tenant.licenseKey;
      response.data.licenseType = tenant.licenseType;
      response.data.licenseEndDate = tenant.endDate;
      response.data.daysRemaining = tenant.daysRemaining;
    }

    return response;

  } catch (error) {
    return {
      success: false,
      message: 'เกิดข้อผิดพลาด: ' + error.message
    };
  }
}

/**
 * Logout
 */
function logout(params) {
  // In a real app, would invalidate token
  return {
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  };
}

/**
 * Validate session
 */
function validateSession(params) {
  // In a real app, would check token validity
  return {
    success: true,
    valid: true
  };
}

// ==========================================
// SUPER ADMIN - TENANT MANAGEMENT
// ==========================================

/**
 * Create new tenant
 */
function createTenant(params) {
  try {
    // This is the same as createNewTenant in setup.gs
    // But called via API
    return createNewTenantFromAPI(params);

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get all tenants
 */
function getTenants(params) {
  try {
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = masterSS.getSheetByName('Tenants');
    const data = sheet.getDataRange().getValues();

    const tenants = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      tenants.push({
        tenantId: row[0],
        tenantName: row[1],
        sheetId: row[2],
        folderId: row[3],
        licenseKey: row[4],
        licenseType: row[5],
        startDate: row[6],
        endDate: row[7],
        status: row[8],
        maxUsers: row[9],
        ownerName: row[10],
        ownerEmail: row[11],
        ownerPhone: row[12],
        address: row[13],
        taxId: row[14],
        createdDate: row[15]
      });
    }

    return {
      success: true,
      data: {
        tenants: tenants
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update tenant
 */
function updateTenant(params) {
  try {
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = masterSS.getSheetByName('Tenants');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.tenantId) {
        // Update fields
        if (params.tenantName) sheet.getRange(i + 1, 2).setValue(params.tenantName);
        if (params.licenseType) sheet.getRange(i + 1, 6).setValue(params.licenseType);
        if (params.status) sheet.getRange(i + 1, 9).setValue(params.status);
        if (params.ownerName) sheet.getRange(i + 1, 11).setValue(params.ownerName);
        if (params.ownerEmail) sheet.getRange(i + 1, 12).setValue(params.ownerEmail);
        if (params.ownerPhone) sheet.getRange(i + 1, 13).setValue(params.ownerPhone);

        // Update modified date
        sheet.getRange(i + 1, 18).setValue(new Date());
        sheet.getRange(i + 1, 19).setValue(params.username || 'SYSTEM');

        return {
          success: true,
          message: 'อัพเดทข้อมูลร้านสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบร้านที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete tenant (soft delete)
 */
function deleteTenant(params) {
  try {
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = masterSS.getSheetByName('Tenants');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.tenantId) {
        // Set status to INACTIVE
        sheet.getRange(i + 1, 9).setValue('INACTIVE');

        return {
          success: true,
          message: 'ปิดการใช้งานร้านสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบร้านที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// PRODUCTS MANAGEMENT
// ==========================================

/**
 * Get products
 */
function getProducts(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();

    const products = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      products.push({
        productId: row[0],
        sku: row[1],
        barcode: row[2],
        name: row[3],
        description: row[4],
        category: row[5],
        basePrice: row[6],
        cost: row[7],
        imageUrl: row[8],
        hasVariants: row[9],
        hasModifiers: row[10],
        status: row[11],
        isAvailable: row[12],
        sortOrder: row[13],
        tags: row[14]
      });
    }

    return {
      success: true,
      data: {
        products: products
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create product
 */
function createProduct(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Products');
    const settingsSheet = tenantSS.getSheetByName('Settings');

    // Generate product ID
    const productId = generateId(settingsSheet, 'product_counter', 'PRD_');

    // Prepare data
    const product = [
      productId,
      params.sku || '',
      params.barcode || '',
      params.name,
      params.description || '',
      params.category || '',
      params.basePrice || 0,
      params.cost || 0,
      params.imageUrl || '',
      params.hasVariants || false,
      params.hasModifiers || false,
      params.status || 'ACTIVE',
      params.isAvailable !== false,
      params.sortOrder || 999,
      params.tags || '',
      new Date(),
      params.username || 'SYSTEM',
      null,
      null
    ];

    sheet.appendRow(product);

    return {
      success: true,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: {
        productId: productId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update product
 */
function updateProduct(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.productId) {
        // Update fields
        if (params.sku !== undefined) sheet.getRange(i + 1, 2).setValue(params.sku);
        if (params.barcode !== undefined) sheet.getRange(i + 1, 3).setValue(params.barcode);
        if (params.name !== undefined) sheet.getRange(i + 1, 4).setValue(params.name);
        if (params.description !== undefined) sheet.getRange(i + 1, 5).setValue(params.description);
        if (params.category !== undefined) sheet.getRange(i + 1, 6).setValue(params.category);
        if (params.basePrice !== undefined) sheet.getRange(i + 1, 7).setValue(params.basePrice);
        if (params.cost !== undefined) sheet.getRange(i + 1, 8).setValue(params.cost);
        if (params.imageUrl !== undefined) sheet.getRange(i + 1, 9).setValue(params.imageUrl);
        if (params.status !== undefined) sheet.getRange(i + 1, 12).setValue(params.status);
        if (params.isAvailable !== undefined) sheet.getRange(i + 1, 13).setValue(params.isAvailable);

        // Update modified date
        sheet.getRange(i + 1, 18).setValue(new Date());
        sheet.getRange(i + 1, 19).setValue(params.username || 'SYSTEM');

        return {
          success: true,
          message: 'อัพเดทสินค้าสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบสินค้าที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete product
 */
function deleteProduct(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.productId) {
        // Soft delete - set status to INACTIVE
        sheet.getRange(i + 1, 12).setValue('INACTIVE');

        return {
          success: true,
          message: 'ลบสินค้าสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบสินค้าที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// VARIANTS MANAGEMENT
// ==========================================

/**
 * Get variants
 */
function getVariants(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Variants');
    const data = sheet.getDataRange().getValues();

    const variants = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Filter by product ID if provided
      if (params.productId && row[1] !== params.productId) {
        continue;
      }

      variants.push({
        variantId: row[0],
        productId: row[1],
        variantType: row[2],
        variantValue: row[3],
        displayName: row[4],
        priceAdjust: row[5],
        isDefault: row[6],
        isAvailable: row[7],
        sortOrder: row[8]
      });
    }

    return {
      success: true,
      data: {
        variants: variants
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create variant
 */
function createVariant(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Variants');
    const settingsSheet = tenantSS.getSheetByName('Settings');

    // Generate variant ID
    const variantId = 'VAR_' + Utilities.getUuid().substring(0, 8);

    const variant = [
      variantId,
      params.productId,
      params.variantType,
      params.variantValue,
      params.displayName,
      params.priceAdjust || 0,
      params.isDefault || false,
      params.isAvailable !== false,
      params.sortOrder || 999
    ];

    sheet.appendRow(variant);

    return {
      success: true,
      message: 'เพิ่ม Variant สำเร็จ',
      data: {
        variantId: variantId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update variant
 */
function updateVariant(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Variants');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.variantId) {
        if (params.variantType !== undefined) sheet.getRange(i + 1, 3).setValue(params.variantType);
        if (params.variantValue !== undefined) sheet.getRange(i + 1, 4).setValue(params.variantValue);
        if (params.displayName !== undefined) sheet.getRange(i + 1, 5).setValue(params.displayName);
        if (params.priceAdjust !== undefined) sheet.getRange(i + 1, 6).setValue(params.priceAdjust);
        if (params.isDefault !== undefined) sheet.getRange(i + 1, 7).setValue(params.isDefault);
        if (params.isAvailable !== undefined) sheet.getRange(i + 1, 8).setValue(params.isAvailable);
        if (params.sortOrder !== undefined) sheet.getRange(i + 1, 9).setValue(params.sortOrder);

        return {
          success: true,
          message: 'อัพเดท Variant สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบ Variant ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete variant
 */
function deleteVariant(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Variants');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.variantId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'ลบ Variant สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบ Variant ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// MODIFIERS MANAGEMENT
// ==========================================

/**
 * Get modifiers
 */
function getModifiers(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Modifiers');
    const data = sheet.getDataRange().getValues();

    const modifiers = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      modifiers.push({
        modifierId: row[0],
        productId: row[1],
        name: row[2],
        description: row[3],
        price: row[4],
        cost: row[5],
        modifierType: row[6],
        maxQuantity: row[7],
        isAvailable: row[8],
        sortOrder: row[9]
      });
    }

    return {
      success: true,
      data: {
        modifiers: modifiers
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create modifier
 */
function createModifier(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Modifiers');

    const modifierId = 'MOD_' + Utilities.getUuid().substring(0, 8);

    const modifier = [
      modifierId,
      params.productId || null,
      params.name,
      params.description || '',
      params.price || 0,
      params.cost || 0,
      params.modifierType || 'TOPPING',
      params.maxQuantity || 1,
      params.isAvailable !== false,
      params.sortOrder || 999
    ];

    sheet.appendRow(modifier);

    return {
      success: true,
      message: 'เพิ่ม Modifier สำเร็จ',
      data: {
        modifierId: modifierId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update modifier
 */
function updateModifier(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Modifiers');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.modifierId) {
        if (params.name !== undefined) sheet.getRange(i + 1, 3).setValue(params.name);
        if (params.description !== undefined) sheet.getRange(i + 1, 4).setValue(params.description);
        if (params.price !== undefined) sheet.getRange(i + 1, 5).setValue(params.price);
        if (params.cost !== undefined) sheet.getRange(i + 1, 6).setValue(params.cost);
        if (params.modifierType !== undefined) sheet.getRange(i + 1, 7).setValue(params.modifierType);
        if (params.maxQuantity !== undefined) sheet.getRange(i + 1, 8).setValue(params.maxQuantity);
        if (params.isAvailable !== undefined) sheet.getRange(i + 1, 9).setValue(params.isAvailable);

        return {
          success: true,
          message: 'อัพเดท Modifier สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบ Modifier ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete modifier
 */
function deleteModifier(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Modifiers');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.modifierId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'ลบ Modifier สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบ Modifier ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// INVENTORY MANAGEMENT
// ==========================================

/**
 * Get inventory items
 */
function getInventoryItems(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('InventoryItems');
    const data = sheet.getDataRange().getValues();

    const items = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      items.push({
        itemId: row[0],
        itemCode: row[1],
        itemName: row[2],
        category: row[3],
        unit: row[4],
        currentStock: row[5],
        minStock: row[6],
        maxStock: row[7],
        reorderPoint: row[8],
        reorderQty: row[9],
        unitCost: row[10],
        supplierId: row[11],
        status: row[12],
        lastPurchaseDate: row[13],
        lastPurchasePrice: row[14]
      });
    }

    return {
      success: true,
      data: {
        items: items
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create inventory item
 */
function createInventoryItem(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('InventoryItems');
    const settingsSheet = tenantSS.getSheetByName('Settings');

    const itemId = generateId(settingsSheet, 'inventory_counter', 'INV_');

    const item = [
      itemId,
      params.itemCode || '',
      params.itemName,
      params.category || '',
      params.unit || '',
      params.currentStock || 0,
      params.minStock || 0,
      params.maxStock || 0,
      params.reorderPoint || 0,
      params.reorderQty || 0,
      params.unitCost || 0,
      params.supplierId || '',
      params.currentStock <= params.minStock ? 'LOW_STOCK' : 'IN_STOCK',
      null,
      null,
      new Date(),
      params.username || 'SYSTEM',
      null,
      null
    ];

    sheet.appendRow(item);

    return {
      success: true,
      message: 'เพิ่มวัตถุดิบสำเร็จ',
      data: {
        itemId: itemId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update inventory item
 */
function updateInventoryItem(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('InventoryItems');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.itemId) {
        if (params.itemCode !== undefined) sheet.getRange(i + 1, 2).setValue(params.itemCode);
        if (params.itemName !== undefined) sheet.getRange(i + 1, 3).setValue(params.itemName);
        if (params.category !== undefined) sheet.getRange(i + 1, 4).setValue(params.category);
        if (params.unit !== undefined) sheet.getRange(i + 1, 5).setValue(params.unit);
        if (params.minStock !== undefined) sheet.getRange(i + 1, 7).setValue(params.minStock);
        if (params.maxStock !== undefined) sheet.getRange(i + 1, 8).setValue(params.maxStock);
        if (params.reorderPoint !== undefined) sheet.getRange(i + 1, 9).setValue(params.reorderPoint);
        if (params.reorderQty !== undefined) sheet.getRange(i + 1, 10).setValue(params.reorderQty);
        if (params.unitCost !== undefined) sheet.getRange(i + 1, 11).setValue(params.unitCost);
        if (params.supplierId !== undefined) sheet.getRange(i + 1, 12).setValue(params.supplierId);

        // Update modified date
        sheet.getRange(i + 1, 18).setValue(new Date());
        sheet.getRange(i + 1, 19).setValue(params.username || 'SYSTEM');

        return {
          success: true,
          message: 'อัพเดทวัตถุดิบสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบวัตถุดิบที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete inventory item
 */
function deleteInventoryItem(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('InventoryItems');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.itemId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'ลบวัตถุดิบสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบวัตถุดิบที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Adjust stock (manual adjustment)
 */
function adjustStock(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const invSheet = tenantSS.getSheetByName('InventoryItems');
    const movSheet = tenantSS.getSheetByName('StockMovements');

    const data = invSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.itemId) {
        const beforeQty = data[i][5]; // currentStock
        let newStock = beforeQty;

        // Calculate new stock based on adjustment type
        if (params.adjustmentType === 'add') {
          newStock = beforeQty + params.quantity;
        } else if (params.adjustmentType === 'subtract') {
          newStock = beforeQty - params.quantity;
        } else if (params.adjustmentType === 'set') {
          newStock = params.quantity;
        }

        // Update stock
        invSheet.getRange(i + 1, 6).setValue(newStock);

        // Update status
        const minStock = data[i][6];
        const status = newStock <= 0 ? 'OUT_OF_STOCK' : (newStock <= minStock ? 'LOW_STOCK' : 'IN_STOCK');
        invSheet.getRange(i + 1, 13).setValue(status);

        // Record stock movement
        const movementId = 'MOV_' + Utilities.getUuid().substring(0, 8);
        const movement = [
          movementId,
          params.itemId,
          data[i][2], // itemName
          'ADJUST',
          params.adjustmentType === 'subtract' ? -params.quantity : params.quantity,
          data[i][4], // unit
          beforeQty,
          newStock,
          'MANUAL',
          params.referenceNumber || '',
          params.reason || '',
          params.notes || '',
          new Date(),
          params.username || 'SYSTEM'
        ];

        movSheet.appendRow(movement);

        return {
          success: true,
          message: 'ปรับสต็อกสำเร็จ',
          data: {
            beforeQty: beforeQty,
            afterQty: newStock,
            status: status
          }
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบวัตถุดิบที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get stock movements
 */
function getStockMovements(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('StockMovements');
    const data = sheet.getDataRange().getValues();

    const movements = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Filter by item ID if provided
      if (params.itemId && row[1] !== params.itemId) {
        continue;
      }

      movements.push({
        movementId: row[0],
        itemId: row[1],
        itemName: row[2],
        movementType: row[3],
        quantity: row[4],
        unit: row[5],
        beforeQty: row[6],
        afterQty: row[7],
        referenceType: row[8],
        referenceId: row[9],
        reason: row[10],
        notes: row[11],
        createdDate: row[12],
        createdBy: row[13]
      });
    }

    return {
      success: true,
      data: {
        movements: movements
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Due to character limit, I'll continue in next message...
// This file will continue with:
// - Recipes Management
// - Orders Management (with auto stock deduction)
// - Dashboard Data
// - Reports
// - Other modules
// - Utility functions

// ==========================================
// RECIPES / BOM MANAGEMENT
// ==========================================

/**
 * Get recipes
 */
function getRecipes(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Recipes');
    const data = sheet.getDataRange().getValues();

    const recipes = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Filter by product ID if provided
      if (params.productId && row[1] !== params.productId) {
        continue;
      }

      recipes.push({
        recipeId: row[0],
        productId: row[1],
        variantCombination: row[2],
        itemId: row[3],
        quantity: row[4],
        unit: row[5],
        notes: row[6],
        createdDate: row[7],
        createdBy: row[8]
      });
    }

    return {
      success: true,
      data: {
        recipes: recipes
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create recipe
 */
function createRecipe(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Recipes');

    const recipeId = 'RCP_' + Utilities.getUuid().substring(0, 8);

    const recipe = [
      recipeId,
      params.productId,
      params.variantCombination ? JSON.stringify(params.variantCombination) : '{}',
      params.itemId,
      params.quantity,
      params.unit,
      params.notes || '',
      new Date(),
      params.username || 'SYSTEM'
    ];

    sheet.appendRow(recipe);

    return {
      success: true,
      message: 'เพิ่มสูตรสำเร็จ',
      data: {
        recipeId: recipeId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update recipe
 */
function updateRecipe(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Recipes');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.recipeId) {
        if (params.itemId !== undefined) sheet.getRange(i + 1, 4).setValue(params.itemId);
        if (params.quantity !== undefined) sheet.getRange(i + 1, 5).setValue(params.quantity);
        if (params.unit !== undefined) sheet.getRange(i + 1, 6).setValue(params.unit);
        if (params.notes !== undefined) sheet.getRange(i + 1, 7).setValue(params.notes);

        return {
          success: true,
          message: 'อัพเดทสูตรสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบสูตรที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Delete recipe
 */
function deleteRecipe(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Recipes');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.recipeId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'ลบสูตรสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบสูตรที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get product recipe (for a specific product with variant combination)
 */
function getProductRecipe(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const recipesSheet = tenantSS.getSheetByName('Recipes');
    const inventorySheet = tenantSS.getSheetByName('InventoryItems');

    const recipesData = recipesSheet.getDataRange().getValues();
    const inventoryData = inventorySheet.getDataRange().getValues();

    const recipe = [];
    const variantCombo = JSON.stringify(params.variants || {});

    // Find matching recipes
    for (let i = 1; i < recipesData.length; i++) {
      const row = recipesData[i];

      if (row[1] === params.productId) {
        // Check if variant combination matches
        const recipeVariants = row[2];

        if (recipeVariants === variantCombo || recipeVariants === '{}') {
          // Get inventory item details
          let itemName = '';
          let unit = '';

          for (let j = 1; j < inventoryData.length; j++) {
            if (inventoryData[j][0] === row[3]) {
              itemName = inventoryData[j][2];
              unit = inventoryData[j][4];
              break;
            }
          }

          recipe.push({
            recipeId: row[0],
            itemId: row[3],
            itemName: itemName,
            quantity: row[4],
            unit: unit,
            notes: row[6]
          });
        }
      }
    }

    return {
      success: true,
      data: {
        recipe: recipe
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// ORDERS MANAGEMENT
// ==========================================

/**
 * Create order (with auto stock deduction)
 */
function createOrder(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const ordersSheet = tenantSS.getSheetByName('Orders');
    const orderItemsSheet = tenantSS.getSheetByName('OrderItems');
    const settingsSheet = tenantSS.getSheetByName('Settings');
    const recipesSheet = tenantSS.getSheetByName('Recipes');
    const inventorySheet = tenantSS.getSheetByName('InventoryItems');
    const movementsSheet = tenantSS.getSheetByName('StockMovements');

    // Generate order ID and number
    const counter = parseInt(getSetting(settingsSheet, 'order_counter') || '0') + 1;
    setSetting(settingsSheet, 'order_counter', counter.toString());

    const orderId = 'ORD_' + formatOrderDate(new Date()) + '_' + String(counter).padStart(3, '0');
    const orderNumber = '#' + String(counter).padStart(4, '0');

    const orderData = params.orderData;

    // Create order
    const order = [
      orderId,
      orderNumber,
      orderData.channelId || 'CH_001',
      orderData.channelName || 'หน้าร้าน',
      orderData.customerId || null,
      orderData.customerName || null,
      orderData.staffId || 'STF_001',
      orderData.staffName || params.username,
      orderData.orderType || 'DINE_IN',
      orderData.tableNumber || '',
      orderData.queueNumber || '',
      orderData.subtotal,
      orderData.discount || 0,
      orderData.tax || 0,
      orderData.deliveryFee || 0,
      orderData.total,
      orderData.paymentMethod || 'CASH',
      'PAID',
      orderData.receivedAmount || orderData.total,
      orderData.changeAmount || 0,
      orderData.slipImageUrl || '',
      'PENDING',
      orderData.notes || '',
      new Date(),
      null,
      null,
      null
    ];

    ordersSheet.appendRow(order);

    // Create order items and deduct stock
    const items = orderData.items || [];
    let orderItemCounter = 1;

    for (const item of items) {
      const orderItemId = orderId + '_ITEM_' + String(orderItemCounter++).padStart(3, '0');

      // Create order item
      const orderItem = [
        orderItemId,
        orderId,
        item.productId,
        item.productName,
        JSON.stringify(item.variants || {}),
        JSON.stringify(item.modifiers || []),
        item.variantText || '',
        item.specialInstructions || '',
        item.quantity,
        item.unitPrice,
        item.subtotal,
        item.cost || 0,
        (item.cost || 0) * item.quantity,
        item.subtotal - ((item.cost || 0) * item.quantity),
        'PENDING'
      ];

      orderItemsSheet.appendRow(orderItem);

      // Auto-deduct stock based on recipe
      deductStockForOrderItem(
        recipesSheet,
        inventorySheet,
        movementsSheet,
        item,
        orderId,
        params.username
      );
    }

    return {
      success: true,
      message: 'สร้างออเดอร์สำเร็จ',
      data: {
        orderId: orderId,
        orderNumber: orderNumber
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Deduct stock for order item (using recipe)
 */
function deductStockForOrderItem(recipesSheet, inventorySheet, movementsSheet, orderItem, orderId, username) {
  try {
    const recipesData = recipesSheet.getDataRange().getValues();
    const variantCombo = JSON.stringify(orderItem.variants || {});

    // Find matching recipes
    for (let i = 1; i < recipesData.length; i++) {
      const row = recipesData[i];

      if (row[1] === orderItem.productId) {
        const recipeVariants = row[2];

        if (recipeVariants === variantCombo || recipeVariants === '{}') {
          const itemId = row[3];
          const quantityPerUnit = row[4];

          // Calculate total quantity to deduct
          const totalQty = quantityPerUnit * orderItem.quantity;

          // Deduct from inventory
          const invData = inventorySheet.getDataRange().getValues();
          for (let j = 1; j < invData.length; j++) {
            if (invData[j][0] === itemId) {
              const beforeQty = invData[j][5];
              const newQty = beforeQty - totalQty;

              // Update stock
              inventorySheet.getRange(j + 1, 6).setValue(newQty);

              // Update status
              const minStock = invData[j][6];
              const status = newQty <= 0 ? 'OUT_OF_STOCK' : (newQty <= minStock ? 'LOW_STOCK' : 'IN_STOCK');
              inventorySheet.getRange(j + 1, 13).setValue(status);

              // Record movement
              const movementId = 'MOV_' + Utilities.getUuid().substring(0, 8);
              const movement = [
                movementId,
                itemId,
                invData[j][2], // itemName
                'OUT',
                -totalQty,
                invData[j][4], // unit
                beforeQty,
                newQty,
                'ORDER',
                orderId,
                'ขายสินค้า: ' + orderItem.productName,
                '',
                new Date(),
                username || 'SYSTEM'
              ];

              movementsSheet.appendRow(movement);

              break;
            }
          }
        }
      }
    }

  } catch (error) {
    Logger.log('Error deducting stock: ' + error.message);
  }
}

/**
 * Get orders
 */
function getOrders(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Orders');
    const data = sheet.getDataRange().getValues();

    const orders = [];
    const limit = params.limit || 50;
    let count = 0;

    // Get orders (newest first)
    for (let i = data.length - 1; i >= 1 && count < limit; i--) {
      const row = data[i];

      // Filter by status if provided
      if (params.status && row[21] !== params.status) {
        continue;
      }

      orders.push({
        orderId: row[0],
        orderNumber: row[1],
        channelId: row[2],
        channelName: row[3],
        customerId: row[4],
        customerName: row[5],
        staffId: row[6],
        staffName: row[7],
        orderType: row[8],
        tableNumber: row[9],
        queueNumber: row[10],
        subtotal: row[11],
        discount: row[12],
        tax: row[13],
        deliveryFee: row[14],
        total: row[15],
        paymentMethod: row[16],
        paymentStatus: row[17],
        receivedAmount: row[18],
        changeAmount: row[19],
        slipImageUrl: row[20],
        status: row[21],
        notes: row[22],
        createdDate: row[23],
        completedDate: row[24],
        cancelledDate: row[25],
        cancelReason: row[26]
      });

      count++;
    }

    return {
      success: true,
      data: {
        orders: orders
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get order detail
 */
function getOrderDetail(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const ordersSheet = tenantSS.getSheetByName('Orders');
    const itemsSheet = tenantSS.getSheetByName('OrderItems');

    const ordersData = ordersSheet.getDataRange().getValues();
    const itemsData = itemsSheet.getDataRange().getValues();

    // Find order
    let order = null;
    for (let i = 1; i < ordersData.length; i++) {
      if (ordersData[i][0] === params.orderId) {
        const row = ordersData[i];
        order = {
          orderId: row[0],
          orderNumber: row[1],
          channelId: row[2],
          channelName: row[3],
          customerId: row[4],
          customerName: row[5],
          staffId: row[6],
          staffName: row[7],
          orderType: row[8],
          subtotal: row[11],
          discount: row[12],
          tax: row[13],
          total: row[15],
          paymentMethod: row[16],
          status: row[21],
          createdDate: row[23]
        };
        break;
      }
    }

    if (!order) {
      return {
        success: false,
        message: 'ไม่พบออเดอร์'
      };
    }

    // Find order items
    const items = [];
    for (let i = 1; i < itemsData.length; i++) {
      if (itemsData[i][1] === params.orderId) {
        const row = itemsData[i];
        items.push({
          orderItemId: row[0],
          productId: row[2],
          productName: row[3],
          variants: row[4],
          modifiers: row[5],
          variantText: row[6],
          specialInstructions: row[7],
          quantity: row[8],
          unitPrice: row[9],
          subtotal: row[10]
        });
      }
    }

    order.items = items;

    return {
      success: true,
      data: order
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update order status
 */
function updateOrderStatus(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Orders');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.orderId) {
        sheet.getRange(i + 1, 22).setValue(params.status);

        // Update completed date if status is COMPLETED
        if (params.status === 'COMPLETED') {
          sheet.getRange(i + 1, 25).setValue(new Date());
        }

        return {
          success: true,
          message: 'อัพเดทสถานะออเดอร์สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบออเดอร์ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Cancel order
 */
function cancelOrder(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Orders');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.orderId) {
        sheet.getRange(i + 1, 22).setValue('CANCELLED');
        sheet.getRange(i + 1, 26).setValue(new Date());
        sheet.getRange(i + 1, 27).setValue(params.reason || 'ลูกค้าขอยกเลิก');

        // TODO: Return stock

        return {
          success: true,
          message: 'ยกเลิกออเดอร์สำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบออเดอร์ที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// DASHBOARD DATA
// ==========================================

/**
 * Get dashboard data
 */
function getDashboardData(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const ordersSheet = tenantSS.getSheetByName('Orders');
    const orderItemsSheet = tenantSS.getSheetByName('OrderItems');
    const inventorySheet = tenantSS.getSheetByName('InventoryItems');

    const ordersData = ordersSheet.getDataRange().getValues();
    const itemsData = orderItemsSheet.getDataRange().getValues();
    const inventoryData = inventorySheet.getDataRange().getValues();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalSales = 0;
    let totalOrders = 0;
    let totalProfit = 0;

    const topProductsMap = {};

    // Calculate today's stats
    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      const orderDate = new Date(row[23]);
      orderDate.setHours(0, 0, 0, 0);

      if (orderDate.getTime() === today.getTime() && row[21] === 'COMPLETED') {
        totalSales += row[15]; // total
        totalOrders++;

        // Find order items
        const orderId = row[0];
        for (let j = 1; j < itemsData.length; j++) {
          if (itemsData[j][1] === orderId) {
            totalProfit += itemsData[j][13]; // profit

            // Count top products
            const productName = itemsData[j][3];
            const subtotal = itemsData[j][10];
            const quantity = itemsData[j][8];

            if (!topProductsMap[productName]) {
              topProductsMap[productName] = {
                name: productName,
                count: 0,
                revenue: 0
              };
            }

            topProductsMap[productName].count += quantity;
            topProductsMap[productName].revenue += subtotal;
          }
        }
      }
    }

    // Top products
    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock items
    const lowStockList = [];
    for (let i = 1; i < inventoryData.length; i++) {
      const row = inventoryData[i];
      const currentStock = row[5];
      const minStock = row[6];

      if (currentStock <= minStock) {
        lowStockList.push({
          id: row[0],
          name: row[2],
          stock: currentStock,
          unit: row[4]
        });
      }
    }

    return {
      success: true,
      data: {
        totalSales: totalSales,
        totalOrders: totalOrders,
        totalProfit: totalProfit,
        lowStockItems: lowStockList.length,
        salesGrowth: 12.5, // Mock data
        ordersGrowth: 8.2, // Mock data
        topProducts: topProducts,
        lowStockList: lowStockList
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// REPORTS
// ==========================================

/**
 * Get sales report
 */
function getSalesReport(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const ordersSheet = tenantSS.getSheetByName('Orders');
    const itemsSheet = tenantSS.getSheetByName('OrderItems');

    const ordersData = ordersSheet.getDataRange().getValues();
    const itemsData = itemsSheet.getDataRange().getValues();

    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    let totalSales = 0;
    let totalOrders = 0;
    let totalProfit = 0;

    const channelSales = {};
    const hourlySales = {};

    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      const orderDate = new Date(row[23]);

      if (orderDate >= startDate && orderDate <= endDate && row[21] === 'COMPLETED') {
        totalSales += row[15];
        totalOrders++;

        // Channel sales
        const channelName = row[3];
        if (!channelSales[channelName]) {
          channelSales[channelName] = 0;
        }
        channelSales[channelName] += row[15];

        // Hourly sales
        const hour = orderDate.getHours();
        if (!hourlySales[hour]) {
          hourlySales[hour] = 0;
        }
        hourlySales[hour] += row[15];

        // Calculate profit
        const orderId = row[0];
        for (let j = 1; j < itemsData.length; j++) {
          if (itemsData[j][1] === orderId) {
            totalProfit += itemsData[j][13];
          }
        }
      }
    }

    return {
      success: true,
      data: {
        totalSales: totalSales,
        totalOrders: totalOrders,
        totalProfit: totalProfit,
        channelSales: channelSales,
        hourlySales: hourlySales
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get product report
 */
function getProductReport(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const itemsSheet = tenantSS.getSheetByName('OrderItems');
    const ordersSheet = tenantSS.getSheetByName('Orders');

    const itemsData = itemsSheet.getDataRange().getValues();
    const ordersData = ordersSheet.getDataRange().getValues();

    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    const productStats = {};

    // Get completed orders in date range
    const completedOrders = new Set();
    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      const orderDate = new Date(row[23]);

      if (orderDate >= startDate && orderDate <= endDate && row[21] === 'COMPLETED') {
        completedOrders.add(row[0]);
      }
    }

    // Calculate product stats
    for (let i = 1; i < itemsData.length; i++) {
      const row = itemsData[i];
      const orderId = row[1];

      if (completedOrders.has(orderId)) {
        const productName = row[3];

        if (!productStats[productName]) {
          productStats[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }

        productStats[productName].quantity += row[8];
        productStats[productName].revenue += row[10];
        productStats[productName].cost += row[12];
        productStats[productName].profit += row[13];
      }
    }

    const products = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      success: true,
      data: {
        products: products
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get inventory report
 */
function getInventoryReport(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const inventorySheet = tenantSS.getSheetByName('InventoryItems');
    const movementsSheet = tenantSS.getSheetByName('StockMovements');

    const inventoryData = inventorySheet.getDataRange().getValues();
    const movementsData = movementsSheet.getDataRange().getValues();

    const items = [];
    let totalValue = 0;

    for (let i = 1; i < inventoryData.length; i++) {
      const row = inventoryData[i];
      const value = row[5] * row[10]; // currentStock * unitCost
      totalValue += value;

      items.push({
        itemId: row[0],
        itemName: row[2],
        category: row[3],
        currentStock: row[5],
        minStock: row[6],
        unit: row[4],
        unitCost: row[10],
        value: value,
        status: row[12]
      });
    }

    return {
      success: true,
      data: {
        items: items,
        totalValue: totalValue
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// CHANNELS MANAGEMENT
// ==========================================

/**
 * Get channels
 */
function getChannels(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Channels');
    const data = sheet.getDataRange().getValues();

    const channels = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      channels.push({
        channelId: row[0],
        channelName: row[1],
        channelType: row[2],
        commissionRate: row[3],
        deliveryFee: row[4],
        isActive: row[5],
        settings: row[6],
        createdDate: row[7]
      });
    }

    return {
      success: true,
      data: {
        channels: channels
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create channel
 */
function createChannel(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Channels');

    const channelId = 'CH_' + Utilities.getUuid().substring(0, 8);

    const channel = [
      channelId,
      params.channelName,
      params.channelType || 'OTHER',
      params.commissionRate || 0,
      params.deliveryFee || 0,
      params.isActive !== false,
      params.settings ? JSON.stringify(params.settings) : '{}',
      new Date()
    ];

    sheet.appendRow(channel);

    return {
      success: true,
      message: 'เพิ่มช่องทางขายสำเร็จ',
      data: {
        channelId: channelId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update channel
 */
function updateChannel(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Channels');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.channelId) {
        if (params.channelName !== undefined) sheet.getRange(i + 1, 2).setValue(params.channelName);
        if (params.commissionRate !== undefined) sheet.getRange(i + 1, 4).setValue(params.commissionRate);
        if (params.deliveryFee !== undefined) sheet.getRange(i + 1, 5).setValue(params.deliveryFee);
        if (params.isActive !== undefined) sheet.getRange(i + 1, 6).setValue(params.isActive);

        return {
          success: true,
          message: 'อัพเดทช่องทางขายสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบช่องทางขายที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// CUSTOMERS MANAGEMENT
// ==========================================

/**
 * Get customers
 */
function getCustomers(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Customers');
    const data = sheet.getDataRange().getValues();

    const customers = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      customers.push({
        customerId: row[0],
        customerName: row[1],
        phone: row[2],
        email: row[3],
        lineId: row[4],
        address: row[5],
        points: row[6],
        totalOrders: row[7],
        totalSpent: row[8],
        lastOrderDate: row[9],
        memberSince: row[10],
        tier: row[11],
        status: row[12]
      });
    }

    return {
      success: true,
      data: {
        customers: customers
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create customer
 */
function createCustomer(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Customers');
    const settingsSheet = tenantSS.getSheetByName('Settings');

    const customerId = generateId(settingsSheet, 'customer_counter', 'CST_');

    const customer = [
      customerId,
      params.customerName,
      params.phone || '',
      params.email || '',
      params.lineId || '',
      params.address || '',
      0, // points
      0, // totalOrders
      0, // totalSpent
      null, // lastOrderDate
      new Date(), // memberSince
      'BRONZE', // tier
      'ACTIVE' // status
    ];

    sheet.appendRow(customer);

    return {
      success: true,
      message: 'เพิ่มลูกค้าสำเร็จ',
      data: {
        customerId: customerId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update customer
 */
function updateCustomer(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Customers');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.customerId) {
        if (params.customerName !== undefined) sheet.getRange(i + 1, 2).setValue(params.customerName);
        if (params.phone !== undefined) sheet.getRange(i + 1, 3).setValue(params.phone);
        if (params.email !== undefined) sheet.getRange(i + 1, 4).setValue(params.email);
        if (params.address !== undefined) sheet.getRange(i + 1, 6).setValue(params.address);

        return {
          success: true,
          message: 'อัพเดทข้อมูลลูกค้าสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบลูกค้าที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// SUPPLIERS MANAGEMENT
// ==========================================

/**
 * Get suppliers
 */
function getSuppliers(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Suppliers');
    const data = sheet.getDataRange().getValues();

    const suppliers = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      suppliers.push({
        supplierId: row[0],
        supplierName: row[1],
        contactPerson: row[2],
        phone: row[3],
        email: row[4],
        address: row[5],
        taxId: row[6],
        paymentTerms: row[7],
        creditLimit: row[8],
        rating: row[9],
        status: row[10]
      });
    }

    return {
      success: true,
      data: {
        suppliers: suppliers
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Create supplier
 */
function createSupplier(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Suppliers');

    const supplierId = 'SUP_' + Utilities.getUuid().substring(0, 8);

    const supplier = [
      supplierId,
      params.supplierName,
      params.contactPerson || '',
      params.phone || '',
      params.email || '',
      params.address || '',
      params.taxId || '',
      params.paymentTerms || 'Cash',
      params.creditLimit || 0,
      params.rating || 5,
      'ACTIVE'
    ];

    sheet.appendRow(supplier);

    return {
      success: true,
      message: 'เพิ่มผู้จำหน่ายสำเร็จ',
      data: {
        supplierId: supplierId
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update supplier
 */
function updateSupplier(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Suppliers');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.supplierId) {
        if (params.supplierName !== undefined) sheet.getRange(i + 1, 2).setValue(params.supplierName);
        if (params.contactPerson !== undefined) sheet.getRange(i + 1, 3).setValue(params.contactPerson);
        if (params.phone !== undefined) sheet.getRange(i + 1, 4).setValue(params.phone);
        if (params.email !== undefined) sheet.getRange(i + 1, 5).setValue(params.email);

        return {
          success: true,
          message: 'อัพเดทผู้จำหน่ายสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบผู้จำหน่ายที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// PURCHASE ORDERS
// ==========================================

/**
 * Create purchase order
 */
function createPurchaseOrder(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const poSheet = tenantSS.getSheetByName('PurchaseOrders');
    const poItemsSheet = tenantSS.getSheetByName('POItems');

    const poId = 'PO_' + formatOrderDate(new Date()) + '_' + Utilities.getUuid().substring(0, 4);
    const poNumber = 'PO-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const po = [
      poId,
      poNumber,
      params.supplierId,
      params.supplierName,
      new Date(),
      params.expectedDate || new Date(),
      null,
      params.subtotal || 0,
      params.discount || 0,
      params.tax || 0,
      params.total || 0,
      'PENDING',
      params.notes || '',
      params.username || 'SYSTEM',
      null,
      null
    ];

    poSheet.appendRow(po);

    // Add PO items
    const items = params.items || [];
    for (const item of items) {
      const poItemId = poId + '_ITEM_' + Utilities.getUuid().substring(0, 4);

      const poItem = [
        poItemId,
        poId,
        item.itemId,
        item.itemName,
        item.quantity,
        0, // receivedQty
        item.unit,
        item.unitPrice,
        item.subtotal
      ];

      poItemsSheet.appendRow(poItem);
    }

    return {
      success: true,
      message: 'สร้างใบสั่งซื้อสำเร็จ',
      data: {
        poId: poId,
        poNumber: poNumber
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get purchase orders
 */
function getPurchaseOrders(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('PurchaseOrders');
    const data = sheet.getDataRange().getValues();

    const pos = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      pos.push({
        poId: row[0],
        poNumber: row[1],
        supplierId: row[2],
        supplierName: row[3],
        orderDate: row[4],
        expectedDate: row[5],
        receivedDate: row[6],
        subtotal: row[7],
        discount: row[8],
        tax: row[9],
        total: row[10],
        status: row[11],
        notes: row[12],
        createdBy: row[13]
      });
    }

    return {
      success: true,
      data: {
        purchaseOrders: pos
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Approve purchase order
 */
function approvePurchaseOrder(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('PurchaseOrders');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.poId) {
        sheet.getRange(i + 1, 12).setValue('APPROVED');
        sheet.getRange(i + 1, 15).setValue(params.username || 'SYSTEM');

        return {
          success: true,
          message: 'อนุมัติใบสั่งซื้อสำเร็จ'
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบใบสั่งซื้อที่ระบุ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Receive purchase order (update stock)
 */
function receivePurchaseOrder(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const poSheet = tenantSS.getSheetByName('PurchaseOrders');
    const poItemsSheet = tenantSS.getSheetByName('POItems');
    const inventorySheet = tenantSS.getSheetByName('InventoryItems');
    const movementsSheet = tenantSS.getSheetByName('StockMovements');

    const poData = poSheet.getDataRange().getValues();
    const poItemsData = poItemsSheet.getDataRange().getValues();
    const inventoryData = inventorySheet.getDataRange().getValues();

    // Update PO status
    for (let i = 1; i < poData.length; i++) {
      if (poData[i][0] === params.poId) {
        poSheet.getRange(i + 1, 7).setValue(new Date()); // receivedDate
        poSheet.getRange(i + 1, 12).setValue('RECEIVED');
        poSheet.getRange(i + 1, 16).setValue(params.username || 'SYSTEM');
        break;
      }
    }

    // Update stock for each item
    for (let i = 1; i < poItemsData.length; i++) {
      if (poItemsData[i][1] === params.poId) {
        const itemId = poItemsData[i][2];
        const quantity = poItemsData[i][4];

        // Update PO item received quantity
        poItemsSheet.getRange(i + 1, 6).setValue(quantity);

        // Update inventory stock
        for (let j = 1; j < inventoryData.length; j++) {
          if (inventoryData[j][0] === itemId) {
            const beforeQty = inventoryData[j][5];
            const newQty = beforeQty + quantity;

            inventorySheet.getRange(j + 1, 6).setValue(newQty);

            // Update status
            const minStock = inventoryData[j][6];
            const status = newQty <= 0 ? 'OUT_OF_STOCK' : (newQty <= minStock ? 'LOW_STOCK' : 'IN_STOCK');
            inventorySheet.getRange(j + 1, 13).setValue(status);

            // Update last purchase
            inventorySheet.getRange(j + 1, 14).setValue(new Date());
            inventorySheet.getRange(j + 1, 15).setValue(poItemsData[i][7] * quantity);

            // Record movement
            const movementId = 'MOV_' + Utilities.getUuid().substring(0, 8);
            const movement = [
              movementId,
              itemId,
              inventoryData[j][2], // itemName
              'IN',
              quantity,
              inventoryData[j][4], // unit
              beforeQty,
              newQty,
              'PO',
              params.poId,
              'รับของจาก PO',
              '',
              new Date(),
              params.username || 'SYSTEM'
            ];

            movementsSheet.appendRow(movement);

            break;
          }
        }
      }
    }

    return {
      success: true,
      message: 'รับของเข้าสต็อกสำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// SETTINGS
// ==========================================

/**
 * Get settings
 */
function getSettings(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Settings');
    const data = sheet.getDataRange().getValues();

    const settings = {};
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      settings[row[0]] = {
        key: row[0],
        value: row[1],
        type: row[2],
        description: row[3],
        category: row[4]
      };
    }

    return {
      success: true,
      data: {
        settings: settings
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update settings
 */
function updateSettings(params) {
  try {
    const tenantSS = SpreadsheetApp.openById(params.shopSheetId);
    const sheet = tenantSS.getSheetByName('Settings');
    const data = sheet.getDataRange().getValues();

    const updates = params.settings || {};

    for (const key in updates) {
      let found = false;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(updates[key]);
          found = true;
          break;
        }
      }

      // If not found, create new setting
      if (!found) {
        sheet.appendRow([key, updates[key], 'STRING', '', 'GENERAL']);
      }
    }

    return {
      success: true,
      message: 'อัพเดทการตั้งค่าสำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// FILE UPLOAD
// ==========================================

/**
 * Upload slip image
 */
function uploadSlipImage(params) {
  try {
    // Get tenant folder
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const tenantsSheet = masterSS.getSheetByName('Tenants');
    const tenantsData = tenantsSheet.getDataRange().getValues();

    let folderId = null;
    for (let i = 1; i < tenantsData.length; i++) {
      if (tenantsData[i][2] === params.shopSheetId) {
        folderId = tenantsData[i][3];
        break;
      }
    }

    if (!folderId) {
      return {
        success: false,
        message: 'ไม่พบโฟลเดอร์ของร้าน'
      };
    }

    // Get slips folder
    const tenantFolder = DriveApp.getFolderById(folderId);
    const slipsFolder = tenantFolder.getFoldersByName('Slips').next();

    // Create year/month folders if not exist
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    let yearFolder;
    const yearFolders = slipsFolder.getFoldersByName(year);
    if (yearFolders.hasNext()) {
      yearFolder = yearFolders.next();
    } else {
      yearFolder = slipsFolder.createFolder(year);
    }

    let monthFolder;
    const monthFolders = yearFolder.getFoldersByName(month);
    if (monthFolders.hasNext()) {
      monthFolder = monthFolders.next();
    } else {
      monthFolder = yearFolder.createFolder(month);
    }

    // Upload image (base64)
    const imageData = params.imageData; // base64 string
    const fileName = 'slip_' + new Date().getTime() + '.jpg';

    const blob = Utilities.newBlob(
      Utilities.base64Decode(imageData),
      'image/jpeg',
      fileName
    );

    const file = monthFolder.createFile(blob);
    const fileUrl = file.getUrl();

    return {
      success: true,
      message: 'อัพโหลดรูปสลิปสำเร็จ',
      data: {
        url: fileUrl,
        fileId: file.getId()
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Hash password (simple implementation)
 */
function hashPassword(password) {
  return Utilities.base64Encode(password + '_SALT_' + password.length);
}

/**
 * Generate ID with counter
 */
function generateId(settingsSheet, counterKey, prefix) {
  const data = settingsSheet.getDataRange().getValues();
  let counter = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === counterKey) {
      counter = parseInt(data[i][1]) + 1;
      settingsSheet.getRange(i + 1, 2).setValue(counter);
      break;
    }
  }

  return prefix + String(counter).padStart(3, '0');
}

/**
 * Format date for order ID
 */
function formatOrderDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + month + day;
}

/**
 * Get setting value
 */
function getSetting(settingsSheet, key) {
  const data = settingsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }

  return null;
}

/**
 * Set setting value
 */
function setSetting(settingsSheet, key, value) {
  const data = settingsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      settingsSheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  // If not found, append new
  settingsSheet.appendRow([key, value, 'STRING', '', 'GENERAL']);
}

/**
 * Create new tenant from API (called by Super Admin)
 */
function createNewTenantFromAPI(params) {
  try {
    const masterSS = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
    const tenantsFolder = masterFolder.getFoldersByName('Tenants').next();

    // Create tenant folder
    const tenantName = params.tenantName;
    const tenantFolder = tenantsFolder.createFolder(tenantName);

    // Create subfolders
    const imagesFolder = tenantFolder.createFolder('Images');
    imagesFolder.createFolder('products');
    imagesFolder.createFolder('categories');

    const slipsFolder = tenantFolder.createFolder('Slips');
    const currentYear = new Date().getFullYear();
    slipsFolder.createFolder(currentYear.toString());

    tenantFolder.createFolder('Reports');

    // Create tenant spreadsheet
    const spreadsheet = SpreadsheetApp.create(tenantName + ' - Database');
    const file = DriveApp.getFileById(spreadsheet.getId());
    file.moveTo(tenantFolder);

    // Setup tenant sheet structure (copy from setup.gs logic)
    const defaultSheet = spreadsheet.getSheets()[0];
    const sheets = [
      'Products', 'Variants', 'Modifiers', 'InventoryItems', 'Recipes',
      'Orders', 'OrderItems', 'Channels', 'Customers', 'Staff',
      'Suppliers', 'PurchaseOrders', 'POItems', 'Promotions', 'Payments',
      'StockMovements', 'Settings', 'AuditLog'
    ];

    sheets.forEach(function(sheetName) {
      const sheet = spreadsheet.insertSheet(sheetName);
      // Setup headers (simplified - use same logic as setup.gs)
    });

    spreadsheet.deleteSheet(defaultSheet);

    // Save to master
    const tenantsSheet = masterSS.getSheetByName('Tenants');
    const settingsSheet = masterSS.getSheetByName('Settings');

    const counter = parseInt(getSetting(settingsSheet, 'TENANT_COUNTER') || '0') + 1;
    setSetting(settingsSheet, 'TENANT_COUNTER', counter.toString());

    const tenantId = 'TENANT_' + String(counter).padStart(3, '0');
    const licenseKey = 'LIC-' + new Date().getFullYear() + '-' + String(counter).padStart(3, '0');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const tenant = [
      tenantId,
      tenantName,
      spreadsheet.getId(),
      tenantFolder.getId(),
      licenseKey,
      params.licenseType || 'STANDARD',
      startDate,
      endDate,
      'ACTIVE',
      10,
      params.ownerName || '',
      params.ownerEmail || '',
      params.ownerPhone || '',
      params.address || '',
      params.taxId || '',
      new Date(),
      'SUPERADMIN',
      null,
      null
    ];

    tenantsSheet.appendRow(tenant);

    // Create admin user
    const usersSheet = masterSS.getSheetByName('Users');
    const userCounter = parseInt(getSetting(settingsSheet, 'USER_COUNTER') || '0') + 1;
    setSetting(settingsSheet, 'USER_COUNTER', userCounter.toString());

    const userId = 'USR_' + tenantId + '_001';
    const hashedPassword = hashPassword('admin123');

    const user = [
      userId,
      tenantId,
      'admin',
      hashedPassword,
      'ADMIN',
      'Administrator',
      '',
      '',
      'ACTIVE',
      null,
      new Date(),
      'SUPERADMIN'
    ];

    usersSheet.appendRow(user);

    return {
      success: true,
      message: 'สร้างร้านใหม่สำเร็จ',
      data: {
        tenantId: tenantId,
        sheetId: spreadsheet.getId(),
        folderId: tenantFolder.getId(),
        username: 'admin',
        password: 'admin123'
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// END OF CODE.GS
// ==========================================
