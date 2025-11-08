/**
 * ========================================
 * Coffee Shop POS - Setup Script
 * ========================================
 *
 * สคริปต์สำหรับ:
 * 1. สร้าง Master Spreadsheet
 * 2. สร้าง Master Folder
 * 3. สร้างร้านตัวอย่าง (Demo Tenant)
 * 4. สร้างข้อมูลตัวอย่าง
 *
 * วิธีใช้งาน:
 * 1. เปิด Google Apps Script Editor
 * 2. สร้างไฟล์ใหม่ชื่อ setup.gs
 * 3. Copy โค้ดทั้งหมดใส่
 * 4. รัน function: setupMasterSystem()
 * 5. ระบบจะสร้าง Master Sheet และร้านตัวอย่างให้อัตโนมัติ
 * 6. เมื่อเสร็จแล้ว copy MASTER_SHEET_ID และ MASTER_FOLDER_ID ไปใส่ใน code.gs
 */

// ========================================
// MAIN SETUP FUNCTION
// ========================================

/**
 * ฟังก์ชันหลักสำหรับ setup ระบบทั้งหมด
 * รันฟังก์ชันนี้เพื่อเริ่มต้นระบบ
 */
function setupMasterSystem() {
  Logger.log('🚀 เริ่มต้น Setup ระบบ Coffee Shop POS...');

  try {
    // 1. สร้าง Master Folder
    const masterFolder = createMasterFolder();
    Logger.log('✅ สร้าง Master Folder สำเร็จ: ' + masterFolder.getId());

    // 2. สร้าง Master Spreadsheet
    const masterSpreadsheet = createMasterSpreadsheet(masterFolder);
    Logger.log('✅ สร้าง Master Spreadsheet สำเร็จ: ' + masterSpreadsheet.getId());

    // 3. สร้างโครงสร้าง Master Sheet
    setupMasterSheetStructure(masterSpreadsheet);
    Logger.log('✅ สร้างโครงสร้าง Master Sheet สำเร็จ');

    // 4. สร้างข้อมูล Master เริ่มต้น
    seedMasterData(masterSpreadsheet, masterFolder.getId());
    Logger.log('✅ สร้างข้อมูล Master เริ่มต้นสำเร็จ');

    // 5. สร้างร้านตัวอย่าง (Demo Tenant)
    const demoTenant = createDemoTenant(masterSpreadsheet, masterFolder);
    Logger.log('✅ สร้างร้านตัวอย่างสำเร็จ');

    // 6. สร้างข้อมูลตัวอย่างในร้าน Demo
    seedDemoTenantData(demoTenant.spreadsheet);
    Logger.log('✅ สร้างข้อมูลตัวอย่างสำเร็จ');

    // 7. แสดงผลสรุป
    showSetupSummary(masterSpreadsheet, masterFolder, demoTenant);

    Logger.log('🎉 Setup ระบบเสร็จสมบูรณ์!');

  } catch (error) {
    Logger.log('❌ เกิดข้อผิดพลาด: ' + error.message);
    throw error;
  }
}

// ========================================
// MASTER FOLDER CREATION
// ========================================

/**
 * สร้าง Master Folder บน Google Drive
 */
function createMasterFolder() {
  const folderName = 'Coffee Shop POS Master';

  // ตรวจสอบว่ามีโฟลเดอร์อยู่แล้วหรือไม่
  const existingFolders = DriveApp.getFoldersByName(folderName);
  if (existingFolders.hasNext()) {
    const choice = Browser.msgBox(
      'โฟลเดอร์มีอยู่แล้ว',
      'พบโฟลเดอร์ "' + folderName + '" อยู่แล้ว ต้องการใช้โฟลเดอร์นี้หรือไม่?',
      Browser.Buttons.YES_NO
    );

    if (choice === 'yes') {
      return existingFolders.next();
    }
  }

  // สร้างโฟลเดอร์ใหม่
  const masterFolder = DriveApp.createFolder(folderName);

  // สร้างโฟลเดอร์ย่อย
  masterFolder.createFolder('Tenants');
  masterFolder.createFolder('Backups');

  Logger.log('📁 สร้าง Master Folder: ' + masterFolder.getName());

  return masterFolder;
}

// ========================================
// MASTER SPREADSHEET CREATION
// ========================================

/**
 * สร้าง Master Spreadsheet
 */
function createMasterSpreadsheet(masterFolder) {
  const spreadsheetName = 'Coffee Shop POS - Master Database';

  // สร้าง Spreadsheet ใหม่
  const spreadsheet = SpreadsheetApp.create(spreadsheetName);

  // ย้ายไปยัง Master Folder
  const file = DriveApp.getFileById(spreadsheet.getId());
  file.moveTo(masterFolder);

  Logger.log('📊 สร้าง Master Spreadsheet: ' + spreadsheet.getName());

  return spreadsheet;
}

/**
 * สร้างโครงสร้าง Master Sheet
 */
function setupMasterSheetStructure(spreadsheet) {
  // ลบ sheet เริ่มต้น
  const defaultSheet = spreadsheet.getSheets()[0];

  // สร้าง sheets ทั้งหมด
  const sheets = [
    'Tenants',
    'Users',
    'Licenses',
    'Settings',
    'AuditLog'
  ];

  sheets.forEach(function(sheetName) {
    const sheet = spreadsheet.insertSheet(sheetName);
    setupMasterSheetHeaders(sheet, sheetName);
    formatMasterSheet(sheet);
  });

  // ลบ sheet เริ่มต้น
  spreadsheet.deleteSheet(defaultSheet);

  // ตั้งค่า Tenants เป็น sheet แรก
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Tenants'));
}

/**
 * สร้าง Headers สำหรับแต่ละ Sheet ใน Master
 */
function setupMasterSheetHeaders(sheet, sheetName) {
  let headers = [];

  switch(sheetName) {
    case 'Tenants':
      headers = [
        'tenantId', 'tenantName', 'sheetId', 'folderId',
        'licenseKey', 'licenseType', 'startDate', 'endDate', 'status',
        'maxUsers', 'ownerName', 'ownerEmail', 'ownerPhone',
        'address', 'taxId',
        'createdDate', 'createdBy', 'modifiedDate', 'modifiedBy'
      ];
      break;

    case 'Users':
      headers = [
        'userId', 'tenantId', 'username', 'password', 'role',
        'fullName', 'email', 'phone', 'status', 'lastLogin',
        'createdDate', 'createdBy'
      ];
      break;

    case 'Licenses':
      headers = [
        'licenseKey', 'licenseType', 'maxTenants', 'maxUsers', 'maxProducts',
        'features', 'price', 'currency', 'status',
        'createdDate', 'expiryDate'
      ];
      break;

    case 'Settings':
      headers = [
        'settingKey', 'settingValue', 'settingType', 'description', 'category'
      ];
      break;

    case 'AuditLog':
      headers = [
        'logId', 'userId', 'username', 'action', 'module',
        'recordId', 'changes', 'ipAddress', 'userAgent', 'timestamp'
      ];
      break;
  }

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

/**
 * จัดรูปแบบ Master Sheet
 */
function formatMasterSheet(sheet) {
  // Header row
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#8B5CF6');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (let i = 1; i <= sheet.getLastColumn(); i++) {
    sheet.autoResizeColumn(i);
  }
}

// ========================================
// MASTER DATA SEEDING
// ========================================

/**
 * สร้างข้อมูล Master เริ่มต้น
 */
function seedMasterData(spreadsheet, masterFolderId) {
  // 1. สร้าง License Types
  seedLicenses(spreadsheet);

  // 2. สร้าง Settings
  seedMasterSettings(spreadsheet, masterFolderId);

  // 3. สร้าง Super Admin User
  seedSuperAdminUser(spreadsheet);
}

/**
 * สร้างข้อมูล License Types
 */
function seedLicenses(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Licenses');

  const licenses = [
    [
      'LIC-STARTER',
      'STARTER',
      1, // maxTenants
      5, // maxUsers
      50, // maxProducts
      JSON.stringify({
        pos: true,
        inventory: true,
        reports: true,
        multiChannel: false,
        api: false
      }),
      990, // price
      'THB',
      'ACTIVE',
      new Date(),
      null
    ],
    [
      'LIC-STANDARD',
      'STANDARD',
      1,
      10,
      200,
      JSON.stringify({
        pos: true,
        inventory: true,
        reports: true,
        multiChannel: true,
        api: false,
        customers: true
      }),
      1990,
      'THB',
      'ACTIVE',
      new Date(),
      null
    ],
    [
      'LIC-PRO',
      'PRO',
      1,
      30,
      1000,
      JSON.stringify({
        pos: true,
        inventory: true,
        reports: true,
        multiChannel: true,
        api: true,
        customers: true,
        analytics: true,
        integrations: true
      }),
      4990,
      'THB',
      'ACTIVE',
      new Date(),
      null
    ],
    [
      'LIC-ENTERPRISE',
      'ENTERPRISE',
      999, // unlimited
      999,
      9999,
      JSON.stringify({
        pos: true,
        inventory: true,
        reports: true,
        multiChannel: true,
        api: true,
        customers: true,
        analytics: true,
        integrations: true,
        whiteLabel: true,
        support247: true
      }),
      19990,
      'THB',
      'ACTIVE',
      new Date(),
      null
    ]
  ];

  sheet.getRange(2, 1, licenses.length, licenses[0].length).setValues(licenses);
  Logger.log('📝 สร้าง License Types: ' + licenses.length + ' รายการ');
}

/**
 * สร้าง Master Settings
 */
function seedMasterSettings(spreadsheet, masterFolderId) {
  const sheet = spreadsheet.getSheetByName('Settings');

  const settings = [
    ['MASTER_FOLDER_ID', masterFolderId, 'STRING', 'ID ของ Master Folder', 'SYSTEM'],
    ['TENANT_COUNTER', '0', 'NUMBER', 'ตัวนับสำหรับสร้าง Tenant ID', 'SYSTEM'],
    ['USER_COUNTER', '0', 'NUMBER', 'ตัวนับสำหรับสร้าง User ID', 'SYSTEM'],
    ['SYSTEM_NAME', 'Coffee Shop POS', 'STRING', 'ชื่อระบบ', 'GENERAL'],
    ['SYSTEM_VERSION', '1.0.0', 'STRING', 'เวอร์ชันระบบ', 'GENERAL'],
    ['DEFAULT_TIMEZONE', 'Asia/Bangkok', 'STRING', 'เขตเวลาเริ่มต้น', 'GENERAL'],
    ['DEFAULT_CURRENCY', 'THB', 'STRING', 'สกุลเงินเริ่มต้น', 'GENERAL'],
    ['DEFAULT_TAX_RATE', '0.07', 'NUMBER', 'อัตราภาษีเริ่มต้น (7%)', 'TAX'],
    ['AUTO_BACKUP_ENABLED', 'TRUE', 'BOOLEAN', 'เปิดใช้งาน Auto Backup', 'BACKUP'],
    ['BACKUP_FREQUENCY', 'DAILY', 'STRING', 'ความถี่ในการ Backup', 'BACKUP']
  ];

  sheet.getRange(2, 1, settings.length, settings[0].length).setValues(settings);
  Logger.log('⚙️ สร้าง Master Settings: ' + settings.length + ' รายการ');
}

/**
 * สร้าง Super Admin User
 */
function seedSuperAdminUser(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Users');

  const hashedPassword = hashPassword('superadmin123');

  const superAdmin = [
    'USR_SUPER_001',
    'SYSTEM',
    'superadmin',
    hashedPassword,
    'SUPERADMIN',
    'Super Administrator',
    'admin@coffeeshoppos.com',
    '',
    'ACTIVE',
    null,
    new Date(),
    'SYSTEM'
  ];

  sheet.getRange(2, 1, 1, superAdmin.length).setValues([superAdmin]);
  Logger.log('👤 สร้าง Super Admin: superadmin / superadmin123');
}

// ========================================
// DEMO TENANT CREATION
// ========================================

/**
 * สร้างร้านตัวอย่าง (Demo Tenant)
 */
function createDemoTenant(masterSpreadsheet, masterFolder) {
  Logger.log('🏪 กำลังสร้างร้านตัวอย่าง...');

  // 1. สร้างโฟลเดอร์สำหรับร้าน
  const tenantFolder = createTenantFolder(masterFolder, 'ร้านกาแฟดอยช้าง Demo');

  // 2. สร้าง Spreadsheet สำหรับร้าน
  const tenantSpreadsheet = createTenantSpreadsheet(tenantFolder, 'ร้านกาแฟดอยช้าง Demo');

  // 3. สร้างโครงสร้าง Tenant Sheet
  setupTenantSheetStructure(tenantSpreadsheet);

  // 4. บันทึกข้อมูลร้านใน Master
  const tenantId = saveTenantToMaster(masterSpreadsheet, {
    tenantName: 'ร้านกาแฟดอยช้าง Demo',
    sheetId: tenantSpreadsheet.getId(),
    folderId: tenantFolder.getId(),
    licenseType: 'STANDARD',
    ownerName: 'Demo Owner',
    ownerEmail: 'demo@example.com',
    ownerPhone: '081-234-5678',
    address: '123 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่',
    taxId: '1234567890123'
  });

  // 5. สร้าง Admin User สำหรับร้าน Demo
  createTenantAdminUser(masterSpreadsheet, tenantId, 'ร้านกาแฟดอยช้าง Demo');

  return {
    tenantId: tenantId,
    spreadsheet: tenantSpreadsheet,
    folder: tenantFolder
  };
}

/**
 * สร้างโฟลเดอร์สำหรับ Tenant
 */
function createTenantFolder(masterFolder, tenantName) {
  const tenantsFolder = masterFolder.getFoldersByName('Tenants').next();

  // สร้างโฟลเดอร์ร้าน
  const tenantFolder = tenantsFolder.createFolder(tenantName);

  // สร้างโฟลเดอร์ย่อย
  tenantFolder.createFolder('Images').createFolder('products');
  tenantFolder.getFoldersByName('Images').next().createFolder('categories');

  const slipsFolder = tenantFolder.createFolder('Slips');
  const currentYear = new Date().getFullYear();
  slipsFolder.createFolder(currentYear.toString());

  tenantFolder.createFolder('Reports');

  Logger.log('📁 สร้างโฟลเดอร์ร้าน: ' + tenantName);

  return tenantFolder;
}

/**
 * สร้าง Spreadsheet สำหรับ Tenant
 */
function createTenantSpreadsheet(tenantFolder, tenantName) {
  const spreadsheet = SpreadsheetApp.create(tenantName + ' - Database');

  // ย้ายไปยัง Tenant Folder
  const file = DriveApp.getFileById(spreadsheet.getId());
  file.moveTo(tenantFolder);

  Logger.log('📊 สร้าง Tenant Spreadsheet: ' + spreadsheet.getName());

  return spreadsheet;
}

/**
 * สร้างโครงสร้าง Tenant Sheet
 */
function setupTenantSheetStructure(spreadsheet) {
  const defaultSheet = spreadsheet.getSheets()[0];

  const sheets = [
    'Products',
    'Variants',
    'Modifiers',
    'InventoryItems',
    'Recipes',
    'Orders',
    'OrderItems',
    'Channels',
    'Customers',
    'Staff',
    'Suppliers',
    'PurchaseOrders',
    'POItems',
    'Promotions',
    'Payments',
    'StockMovements',
    'Settings',
    'AuditLog'
  ];

  sheets.forEach(function(sheetName) {
    const sheet = spreadsheet.insertSheet(sheetName);
    setupTenantSheetHeaders(sheet, sheetName);
    formatMasterSheet(sheet);
  });

  spreadsheet.deleteSheet(defaultSheet);
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Products'));

  Logger.log('📋 สร้างโครงสร้าง Tenant Sheets: ' + sheets.length + ' sheets');
}

/**
 * สร้าง Headers สำหรับ Tenant Sheets
 */
function setupTenantSheetHeaders(sheet, sheetName) {
  let headers = [];

  switch(sheetName) {
    case 'Products':
      headers = [
        'productId', 'sku', 'barcode', 'name', 'description', 'category',
        'basePrice', 'cost', 'imageUrl', 'hasVariants', 'hasModifiers',
        'status', 'isAvailable', 'sortOrder', 'tags',
        'createdDate', 'createdBy', 'modifiedDate', 'modifiedBy'
      ];
      break;

    case 'Variants':
      headers = [
        'variantId', 'productId', 'variantType', 'variantValue', 'displayName',
        'priceAdjust', 'isDefault', 'isAvailable', 'sortOrder'
      ];
      break;

    case 'Modifiers':
      headers = [
        'modifierId', 'productId', 'name', 'description', 'price', 'cost',
        'modifierType', 'maxQuantity', 'isAvailable', 'sortOrder'
      ];
      break;

    case 'InventoryItems':
      headers = [
        'itemId', 'itemCode', 'itemName', 'category', 'unit',
        'currentStock', 'minStock', 'maxStock', 'reorderPoint', 'reorderQty',
        'unitCost', 'supplierId', 'status',
        'lastPurchaseDate', 'lastPurchasePrice',
        'createdDate', 'createdBy', 'modifiedDate', 'modifiedBy'
      ];
      break;

    case 'Recipes':
      headers = [
        'recipeId', 'productId', 'variantCombination', 'itemId',
        'quantity', 'unit', 'notes', 'createdDate', 'createdBy'
      ];
      break;

    case 'Orders':
      headers = [
        'orderId', 'orderNumber', 'channelId', 'channelName',
        'customerId', 'customerName', 'staffId', 'staffName',
        'orderType', 'tableNumber', 'queueNumber',
        'subtotal', 'discount', 'tax', 'deliveryFee', 'total',
        'paymentMethod', 'paymentStatus', 'receivedAmount', 'changeAmount',
        'slipImageUrl', 'status', 'notes',
        'createdDate', 'completedDate', 'cancelledDate', 'cancelReason'
      ];
      break;

    case 'OrderItems':
      headers = [
        'orderItemId', 'orderId', 'productId', 'productName',
        'variants', 'modifiers', 'variantText', 'specialInstructions',
        'quantity', 'unitPrice', 'subtotal', 'cost', 'totalCost', 'profit',
        'status'
      ];
      break;

    case 'Channels':
      headers = [
        'channelId', 'channelName', 'channelType', 'commissionRate',
        'deliveryFee', 'isActive', 'settings', 'createdDate',
        'orderNumberMode', 'orderNumberFormat'
      ];
      break;

    case 'Customers':
      headers = [
        'customerId', 'customerName', 'phone', 'email', 'lineId',
        'address', 'points', 'totalOrders', 'totalSpent',
        'lastOrderDate', 'memberSince', 'tier', 'status'
      ];
      break;

    case 'Staff':
      headers = [
        'staffId', 'userId', 'staffCode', 'fullName', 'nickname',
        'position', 'department', 'phone', 'email',
        'hireDate', 'salary', 'commissionRate', 'status'
      ];
      break;

    case 'Suppliers':
      headers = [
        'supplierId', 'supplierName', 'contactPerson', 'phone', 'email',
        'address', 'taxId', 'paymentTerms', 'creditLimit', 'rating', 'status'
      ];
      break;

    case 'PurchaseOrders':
      headers = [
        'poId', 'poNumber', 'supplierId', 'supplierName',
        'orderDate', 'expectedDate', 'receivedDate',
        'subtotal', 'discount', 'tax', 'total',
        'status', 'notes', 'createdBy', 'approvedBy', 'receivedBy'
      ];
      break;

    case 'POItems':
      headers = [
        'poItemId', 'poId', 'itemId', 'itemName',
        'quantity', 'receivedQty', 'unit', 'unitPrice', 'subtotal'
      ];
      break;

    case 'Promotions':
      headers = [
        'promotionId', 'promotionName', 'promotionType', 'discountValue',
        'minPurchase', 'applicableProducts', 'applicableChannels',
        'couponCode', 'startDate', 'endDate',
        'usageLimit', 'usageCount', 'isActive'
      ];
      break;

    case 'Payments':
      headers = [
        'paymentId', 'orderId', 'paymentMethod', 'amount',
        'receivedAmount', 'changeAmount', 'referenceNumber',
        'slipImageUrl', 'status', 'paidDate'
      ];
      break;

    case 'StockMovements':
      headers = [
        'movementId', 'itemId', 'itemName', 'movementType',
        'quantity', 'unit', 'beforeQty', 'afterQty',
        'referenceType', 'referenceId', 'reason', 'notes',
        'createdDate', 'createdBy'
      ];
      break;

    case 'Settings':
      headers = [
        'settingKey', 'settingValue', 'settingType', 'description', 'category'
      ];
      break;

    case 'AuditLog':
      headers = [
        'logId', 'userId', 'username', 'action', 'module',
        'recordId', 'changes', 'ipAddress', 'userAgent', 'timestamp'
      ];
      break;
  }

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

/**
 * บันทึกข้อมูล Tenant ใน Master Sheet
 */
function saveTenantToMaster(masterSpreadsheet, tenantData) {
  const sheet = masterSpreadsheet.getSheetByName('Tenants');
  const settingsSheet = masterSpreadsheet.getSheetByName('Settings');

  // Get tenant counter
  const counterRange = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2);
  const settings = counterRange.getValues();
  let counter = 0;

  for (let i = 0; i < settings.length; i++) {
    if (settings[i][0] === 'TENANT_COUNTER') {
      counter = parseInt(settings[i][1]) + 1;
      settingsSheet.getRange(i + 2, 2).setValue(counter);
      break;
    }
  }

  const tenantId = 'TENANT_' + String(counter).padStart(3, '0');

  // Generate license
  const licenseKey = 'LIC-' + new Date().getFullYear() + '-' + String(counter).padStart(3, '0');
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const tenant = [
    tenantId,
    tenantData.tenantName,
    tenantData.sheetId,
    tenantData.folderId,
    licenseKey,
    tenantData.licenseType || 'STANDARD',
    startDate,
    endDate,
    'ACTIVE',
    10, // maxUsers
    tenantData.ownerName,
    tenantData.ownerEmail,
    tenantData.ownerPhone,
    tenantData.address,
    tenantData.taxId,
    new Date(),
    'SYSTEM',
    null,
    null
  ];

  sheet.appendRow(tenant);
  Logger.log('💾 บันทึกข้อมูลร้านใน Master: ' + tenantId);

  return tenantId;
}

/**
 * สร้าง Admin User สำหรับ Tenant
 */
function createTenantAdminUser(masterSpreadsheet, tenantId, tenantName) {
  const sheet = masterSpreadsheet.getSheetByName('Users');
  const settingsSheet = masterSpreadsheet.getSheetByName('Settings');

  // Get user counter
  const counterRange = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2);
  const settings = counterRange.getValues();
  let counter = 0;

  for (let i = 0; i < settings.length; i++) {
    if (settings[i][0] === 'USER_COUNTER') {
      counter = parseInt(settings[i][1]) + 1;
      settingsSheet.getRange(i + 2, 2).setValue(counter);
      break;
    }
  }

  const userId = 'USR_' + tenantId + '_' + String(counter).padStart(3, '0');
  const username = 'admin';
  const hashedPassword = hashPassword('admin123');

  const user = [
    userId,
    tenantId,
    username,
    hashedPassword,
    'ADMIN',
    'Administrator',
    '',
    '',
    'ACTIVE',
    null,
    new Date(),
    'SYSTEM'
  ];

  sheet.appendRow(user);
  Logger.log('👤 สร้าง Admin User: ' + username + ' / admin123');

  // สร้าง Demo Users อื่นๆ
  createDemoUsers(masterSpreadsheet, tenantId);
}

/**
 * สร้าง Demo Users เพิ่มเติม
 */
function createDemoUsers(masterSpreadsheet, tenantId) {
  const sheet = masterSpreadsheet.getSheetByName('Users');
  const settingsSheet = masterSpreadsheet.getSheetByName('Settings');

  const demoUsers = [
    { username: 'manager', password: 'manager123', role: 'MANAGER', fullName: 'Manager Demo' },
    { username: 'cashier', password: 'cashier123', role: 'CASHIER', fullName: 'Cashier Demo' },
    { username: 'demo', password: 'demo', role: 'CASHIER', fullName: 'Demo User' }
  ];

  demoUsers.forEach(function(userData) {
    // Get counter
    const counterRange = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2);
    const settings = counterRange.getValues();
    let counter = 0;

    for (let i = 0; i < settings.length; i++) {
      if (settings[i][0] === 'USER_COUNTER') {
        counter = parseInt(settings[i][1]) + 1;
        settingsSheet.getRange(i + 2, 2).setValue(counter);
        break;
      }
    }

    const userId = 'USR_' + tenantId + '_' + String(counter).padStart(3, '0');
    const hashedPassword = hashPassword(userData.password);

    const user = [
      userId,
      tenantId,
      userData.username,
      hashedPassword,
      userData.role,
      userData.fullName,
      '',
      '',
      'ACTIVE',
      null,
      new Date(),
      'SYSTEM'
    ];

    sheet.appendRow(user);
    Logger.log('👤 สร้าง Demo User: ' + userData.username + ' / ' + userData.password);
  });
}

// ========================================
// DEMO TENANT DATA SEEDING
// ========================================

/**
 * สร้างข้อมูลตัวอย่างในร้าน Demo
 */
function seedDemoTenantData(spreadsheet) {
  Logger.log('📝 กำลังสร้างข้อมูลตัวอย่าง...');

  // 1. Settings
  seedTenantSettings(spreadsheet);

  // 2. Channels
  seedChannels(spreadsheet);

  // 3. Suppliers
  seedSuppliers(spreadsheet);

  // 4. Inventory Items
  seedInventoryItems(spreadsheet);

  // 5. Products
  seedProducts(spreadsheet);

  // 6. Variants
  seedVariants(spreadsheet);

  // 7. Modifiers
  seedModifiers(spreadsheet);

  // 8. Recipes
  seedRecipes(spreadsheet);

  // 9. Customers
  seedCustomers(spreadsheet);

  // 10. Sample Orders
  seedSampleOrders(spreadsheet);

  Logger.log('✅ สร้างข้อมูลตัวอย่างครบถ้วน');
}

/**
 * สร้าง Settings สำหรับร้าน
 */
function seedTenantSettings(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Settings');

  const settings = [
    ['shop_name', 'ร้านกาแฟดอยช้าง', 'STRING', 'ชื่อร้าน', 'GENERAL'],
    ['shop_address', '123 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200', 'STRING', 'ที่อยู่ร้าน', 'GENERAL'],
    ['shop_phone', '053-123456', 'STRING', 'เบอร์โทรศัพท์', 'GENERAL'],
    ['shop_email', 'info@doichaangcafe.com', 'STRING', 'อีเมล', 'GENERAL'],
    ['tax_id', '1234567890123', 'STRING', 'เลขผู้เสียภาษี', 'TAX'],
    ['tax_rate', '0.07', 'NUMBER', 'อัตราภาษี (7%)', 'TAX'],
    ['currency', 'THB', 'STRING', 'สกุลเงิน', 'GENERAL'],
    ['timezone', 'Asia/Bangkok', 'STRING', 'เขตเวลา', 'GENERAL'],
    ['receipt_header', 'ร้านกาแฟดอยช้าง\n123 ถ.นิมมานเหมินท์\nโทร: 053-123456', 'STRING', 'หัวกระดาษใบเสร็จ', 'RECEIPT'],
    ['receipt_footer', 'ขอบคุณที่ใช้บริการ\nกรุณาเก็บใบเสร็จไว้เป็นหลักฐาน', 'STRING', 'ท้ายใบเสร็จ', 'RECEIPT'],
    ['promptpay_number', '0812345678', 'STRING', 'เบอร์ PromptPay', 'PAYMENT'],
    ['product_counter', '0', 'NUMBER', 'ตัวนับสินค้า', 'COUNTER'],
    ['order_counter', '0', 'NUMBER', 'ตัวนับออเดอร์', 'COUNTER'],
    ['inventory_counter', '0', 'NUMBER', 'ตัวนับวัตถุดิบ', 'COUNTER'],
    ['customer_counter', '0', 'NUMBER', 'ตัวนับลูกค้า', 'COUNTER']
  ];

  sheet.getRange(2, 1, settings.length, settings[0].length).setValues(settings);
  Logger.log('⚙️ สร้าง Tenant Settings');
}

/**
 * สร้าง Channels
 */
function seedChannels(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Channels');

  const channels = [
    // [channelId, channelName, channelType, commissionRate, deliveryFee, isActive, settings, createdDate, orderNumberMode, orderNumberFormat]
    ['CH_001', 'หน้าร้าน', 'POS', 0, 0, true, '{}', new Date(), 'AUTO', '#{NNNN}'],
    ['CH_002', 'LINE OA', 'LINE_OA', 0, 0, true, JSON.stringify({apiKey: '', webhook: ''}), new Date(), 'AUTO', 'LINE{YYYY}{MM}{DD}-{NNN}'],
    ['CH_003', 'Grab Food', 'GRAB', 30, 0, true, JSON.stringify({partnerId: ''}), new Date(), 'MANUAL', ''],
    ['CH_004', 'Food Panda', 'FOODPANDA', 30, 15, false, JSON.stringify({partnerId: ''}), new Date(), 'MANUAL', ''],
    ['CH_005', 'LINE MAN', 'LINEMAN', 25, 0, true, '{}', new Date(), 'MANUAL', '']
  ];

  sheet.getRange(2, 1, channels.length, channels[0].length).setValues(channels);
  Logger.log('🛒 สร้าง Channels: ' + channels.length + ' ช่องทาง');
}

/**
 * สร้าง Suppliers
 */
function seedSuppliers(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Suppliers');

  const suppliers = [
    ['SUP_001', 'บริษัท กาแฟดอยช้าง จำกัด', 'คุณสมชาย', '053-111-111', 'coffee@example.com', '100 ถ.ช้างคลาน', '0123456789012', 'Net 30', 100000, 5, 'ACTIVE'],
    ['SUP_002', 'ห้างหุ้นส่วน นมสดเชียงใหม่', 'คุณสมหญิง', '053-222-222', 'milk@example.com', '200 ถ.ห้วยแก้ว', '0123456789013', 'Net 15', 50000, 4.5, 'ACTIVE'],
    ['SUP_003', 'ร้านขายส่งน้ำตาลและวัตถุดิบ', 'คุณสมศักดิ์', '053-333-333', 'sugar@example.com', '300 ถ.กล้วยน้ำไท', '0123456789014', 'Cash', 30000, 4, 'ACTIVE']
  ];

  sheet.getRange(2, 1, suppliers.length, suppliers[0].length).setValues(suppliers);
  Logger.log('🏭 สร้าง Suppliers: ' + suppliers.length + ' รายการ');
}

/**
 * สร้าง Inventory Items (วัตถุดิบ)
 */
function seedInventoryItems(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('InventoryItems');

  const items = [
    ['INV_001', 'COFFEE-01', 'เมล็ดกาแฟ Espresso', 'กาแฟ', 'g', 5000, 1000, 10000, 1500, 5000, 0.5, 'SUP_001', 'IN_STOCK', new Date(), 2500, new Date(), 'SYSTEM', null, null],
    ['INV_002', 'MILK-01', 'นมสดพาสเจอร์ไรส์', 'นม', 'ml', 10000, 2000, 20000, 3000, 10000, 0.08, 'SUP_002', 'IN_STOCK', new Date(), 800, new Date(), 'SYSTEM', null, null],
    ['INV_003', 'SUGAR-01', 'น้ำตาลทราย', 'น้ำตาล', 'g', 3000, 500, 5000, 800, 2000, 0.02, 'SUP_003', 'IN_STOCK', new Date(), 60, new Date(), 'SYSTEM', null, null],
    ['INV_004', 'WHIP-01', 'วิปครีม', 'ครีม', 'g', 500, 200, 2000, 300, 1000, 0.15, 'SUP_002', 'LOW_STOCK', new Date(), 150, new Date(), 'SYSTEM', null, null],
    ['INV_005', 'SYRUP-01', 'ไซรัปวานิลลา', 'ไซรัป', 'ml', 1000, 200, 3000, 400, 1500, 0.12, 'SUP_003', 'IN_STOCK', new Date(), 120, new Date(), 'SYSTEM', null, null],
    ['INV_006', 'SYRUP-02', 'ไซรัปคาราเมล', 'ไซรัป', 'ml', 1000, 200, 3000, 400, 1500, 0.12, 'SUP_003', 'IN_STOCK', new Date(), 120, new Date(), 'SYSTEM', null, null],
    ['INV_007', 'CUP-S', 'ถ้วยกระดาษ ขนาดเล็ก (8oz)', 'บรรจุภัณฑ์', 'ใบ', 500, 100, 1000, 150, 500, 2, 'SUP_003', 'IN_STOCK', new Date(), 1000, new Date(), 'SYSTEM', null, null],
    ['INV_008', 'CUP-M', 'ถ้วยกระดาษ ขนาดกลาง (12oz)', 'บรรจุภัณฑ์', 'ใบ', 500, 100, 1000, 150, 500, 2.5, 'SUP_003', 'IN_STOCK', new Date(), 1250, new Date(), 'SYSTEM', null, null],
    ['INV_009', 'CUP-L', 'ถ้วยกระดาษ ขนาดใหญ่ (16oz)', 'บรรจุภัณฑ์', 'ใบ', 500, 100, 1000, 150, 500, 3, 'SUP_003', 'IN_STOCK', new Date(), 1500, new Date(), 'SYSTEM', null, null],
    ['INV_010', 'ICE-01', 'น้ำแข็ง', 'น้ำแข็ง', 'kg', 50, 10, 100, 15, 50, 0.5, 'SUP_003', 'IN_STOCK', new Date(), 25, new Date(), 'SYSTEM', null, null]
  ];

  sheet.getRange(2, 1, items.length, items[0].length).setValues(items);
  Logger.log('📦 สร้าง Inventory Items: ' + items.length + ' รายการ');
}

/**
 * สร้าง Products (สินค้า)
 */
function seedProducts(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Products');

  const products = [
    ['PRD_001', 'ESP-LAT', '', 'Espresso Latte', 'กาแฟเอสเพรสโซ่ผสมนมสดเข้มข้น', 'กาแฟร้อน', 45, 20, '', true, true, 'ACTIVE', true, 1, 'coffee,hot,latte,bestseller', new Date(), 'SYSTEM', null, null],
    ['PRD_002', 'ICED-LAT', '', 'Iced Latte', 'กาแฟลาเต้เย็น', 'กาแฟเย็น', 50, 22, '', true, true, 'ACTIVE', true, 2, 'coffee,cold,latte,bestseller', new Date(), 'SYSTEM', null, null],
    ['PRD_003', 'CAP', '', 'Cappuccino', 'คาปูชิโน่โฟมนมนุ่มละมุน', 'กาแฟร้อน', 50, 22, '', true, true, 'ACTIVE', true, 3, 'coffee,hot,cappuccino', new Date(), 'SYSTEM', null, null],
    ['PRD_004', 'AMER', '', 'Americano', 'เอสเพรสโซ่ผสมน้ำร้อน', 'กาแฟร้อน', 40, 15, '', true, true, 'ACTIVE', true, 4, 'coffee,hot,americano', new Date(), 'SYSTEM', null, null],
    ['PRD_005', 'MOCHA', '', 'Mocha', 'มอคค่าช็อกโกแลต', 'กาแฟร้อน', 55, 25, '', true, true, 'ACTIVE', true, 5, 'coffee,hot,mocha,chocolate', new Date(), 'SYSTEM', null, null],
    ['PRD_006', 'CAR-MAC', '', 'Caramel Macchiato', 'คาราเมลมัคคิอาโต้', 'กาแฟเย็น', 60, 28, '', true, true, 'ACTIVE', true, 6, 'coffee,cold,caramel,bestseller', new Date(), 'SYSTEM', null, null]
  ];

  sheet.getRange(2, 1, products.length, products[0].length).setValues(products);
  Logger.log('☕ สร้าง Products: ' + products.length + ' รายการ');
}

/**
 * สร้าง Variants
 */
function seedVariants(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Variants');

  const variants = [];
  const products = ['PRD_001', 'PRD_002', 'PRD_003', 'PRD_004', 'PRD_005', 'PRD_006'];

  let variantCounter = 1;

  products.forEach(function(productId) {
    // SIZE variants
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SIZE', 'SMALL', 'เล็ก', -5, false, true, 1]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SIZE', 'MEDIUM', 'กลาง', 0, true, true, 2]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SIZE', 'LARGE', 'ใหญ่', 10, false, true, 3]);

    // TEMPERATURE variants (สำหรับที่มีทั้งร้อนเย็น)
    if (productId !== 'PRD_002' && productId !== 'PRD_006') {
      variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'TEMPERATURE', 'HOT', 'ร้อน', 0, true, true, 1]);
      variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'TEMPERATURE', 'COLD', 'เย็น', 5, false, true, 2]);
    }

    // SWEETNESS variants
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SWEETNESS', '0', '0%', 0, false, true, 1]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SWEETNESS', '25', '25%', 0, false, true, 2]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SWEETNESS', '50', '50%', 0, true, true, 3]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SWEETNESS', '75', '75%', 0, false, true, 4]);
    variants.push(['VAR_' + String(variantCounter++).padStart(3, '0'), productId, 'SWEETNESS', '100', '100%', 0, false, true, 5]);
  });

  sheet.getRange(2, 1, variants.length, variants[0].length).setValues(variants);
  Logger.log('🎨 สร้าง Variants: ' + variants.length + ' รายการ');
}

/**
 * สร้าง Modifiers
 */
function seedModifiers(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Modifiers');

  const modifiers = [
    ['MOD_001', null, 'เพิ่มช็อตกาแฟ', 'เพิ่มความเข้มข้น', 25, 10, 'EXTRA_SHOT', 3, true, 1],
    ['MOD_002', null, 'วิปครีม', 'วิปครีมสด', 15, 5, 'TOPPING', 1, true, 2],
    ['MOD_003', null, 'ไซรัปวานิลลา', 'เพิ่มรสวานิลลา', 10, 3, 'SYRUP', 2, true, 3],
    ['MOD_004', null, 'ไซรัปคาราเมล', 'เพิ่มรสคาราเมล', 10, 3, 'SYRUP', 2, true, 4],
    ['MOD_005', null, 'เปลี่ยนนมถั่วเหลือง', 'เปลี่ยนเป็นนมถั่วเหลือง', 10, 4, 'MILK', 1, true, 5],
    ['MOD_006', null, 'ช็อกโกแลตชิพ', 'โรยหน้าช็อกโกแลตชิพ', 15, 5, 'TOPPING', 1, true, 6]
  ];

  sheet.getRange(2, 1, modifiers.length, modifiers[0].length).setValues(modifiers);
  Logger.log('🍫 สร้าง Modifiers: ' + modifiers.length + ' รายการ');
}

/**
 * สร้าง Recipes (สูตรการใช้วัตถุดิบ)
 */
function seedRecipes(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Recipes');

  const recipes = [];
  let recipeCounter = 1;

  // Espresso Latte - Medium, Hot
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_001', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_001', 18, 'g', 'เมล็ดกาแฟสำหรับ 2 ช็อต', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_001', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_002', 200, 'ml', 'นมสด', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_001', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_003', 10, 'g', 'น้ำตาล (50%)', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_001', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_008', 1, 'ใบ', 'ถ้วยกลาง', new Date(), 'SYSTEM']);

  // Iced Latte - Medium
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_002', JSON.stringify({SIZE:'MEDIUM'}), 'INV_001', 18, 'g', 'เมล็ดกาแฟ', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_002', JSON.stringify({SIZE:'MEDIUM'}), 'INV_002', 200, 'ml', 'นมสด', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_002', JSON.stringify({SIZE:'MEDIUM'}), 'INV_003', 10, 'g', 'น้ำตาล', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_002', JSON.stringify({SIZE:'MEDIUM'}), 'INV_010', 0.2, 'kg', 'น้ำแข็ง', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_002', JSON.stringify({SIZE:'MEDIUM'}), 'INV_008', 1, 'ใบ', 'ถ้วยกลาง', new Date(), 'SYSTEM']);

  // Cappuccino - Medium, Hot
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_003', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_001', 18, 'g', 'เมล็ดกาแฟ', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_003', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_002', 150, 'ml', 'นมสด (ตีฟอง)', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_003', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_003', 10, 'g', 'น้ำตาล', new Date(), 'SYSTEM']);
  recipes.push(['RCP_' + String(recipeCounter++).padStart(3, '0'), 'PRD_003', JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT'}), 'INV_008', 1, 'ใบ', 'ถ้วยกลาง', new Date(), 'SYSTEM']);

  sheet.getRange(2, 1, recipes.length, recipes[0].length).setValues(recipes);
  Logger.log('📖 สร้าง Recipes: ' + recipes.length + ' รายการ');
}

/**
 * สร้าง Customers
 */
function seedCustomers(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Customers');

  const customers = [
    ['CST_001', 'คุณสมหญิง ใจดี', '081-111-1111', 'somying@example.com', 'Ub1234567890', '456 ถ.นิมมาน', 350, 15, 4500, new Date(), new Date(2023, 11, 1), 'GOLD', 'ACTIVE'],
    ['CST_002', 'คุณสมชาย รักกาแฟ', '081-222-2222', 'somchai@example.com', 'Ub0987654321', '789 ถ.ห้วยแก้ว', 120, 8, 1200, new Date(), new Date(2024, 0, 5), 'SILVER', 'ACTIVE'],
    ['CST_003', 'คุณสมศรี มีสุข', '081-333-3333', 'somsri@example.com', '', '321 ถ.สุเทพ', 50, 3, 450, new Date(), new Date(2024, 0, 15), 'BRONZE', 'ACTIVE']
  ];

  sheet.getRange(2, 1, customers.length, customers[0].length).setValues(customers);
  Logger.log('👥 สร้าง Customers: ' + customers.length + ' รายการ');
}

/**
 * สร้าง Sample Orders
 */
function seedSampleOrders(spreadsheet) {
  const ordersSheet = spreadsheet.getSheetByName('Orders');
  const orderItemsSheet = spreadsheet.getSheetByName('OrderItems');

  // สร้าง 5 orders ตัวอย่าง
  const now = new Date();

  const orders = [
    [
      'ORD_' + formatDate(now) + '_001',
      '#001',
      'CH_001',
      'หน้าร้าน',
      'CST_001',
      'คุณสมหญิง ใจดี',
      'STF_001',
      'Admin',
      'DINE_IN',
      'A-05',
      '',
      130, // subtotal
      0, // discount
      9.1, // tax
      0, // delivery
      139.1, // total
      'CASH',
      'PAID',
      200,
      60.9,
      '',
      'COMPLETED',
      '',
      now,
      new Date(now.getTime() + 15*60000),
      null,
      null
    ]
  ];

  ordersSheet.getRange(2, 1, orders.length, orders[0].length).setValues(orders);

  // Order items
  const orderItems = [
    [
      'OI_001',
      'ORD_' + formatDate(now) + '_001',
      'PRD_001',
      'Espresso Latte',
      JSON.stringify({SIZE:'MEDIUM',TEMPERATURE:'HOT',SWEETNESS:'50'}),
      JSON.stringify([{id:'MOD_002',qty:1}]),
      'กลาง, ร้อน, หวาน 50%, วิปครีม',
      '',
      2,
      65,
      130,
      25,
      50,
      80,
      'COMPLETED'
    ]
  ];

  orderItemsSheet.getRange(2, 1, orderItems.length, orderItems[0].length).setValues(orderItems);

  Logger.log('🛍️ สร้าง Sample Orders: ' + orders.length + ' รายการ');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Hash password (simple hash for demo)
 */
function hashPassword(password) {
  // ในการใช้งานจริง ควรใช้ library สำหรับ hash password อย่างถูกต้อง
  // นี่เป็นแค่ตัวอย่างง่ายๆ
  return Utilities.base64Encode(password + '_SALT_' + password.length);
}

/**
 * Format date สำหรับ order ID
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + month + day;
}

/**
 * แสดงสรุปผล Setup
 */
function showSetupSummary(masterSpreadsheet, masterFolder, demoTenant) {
  const ui = SpreadsheetApp.getUi();

  const message = `
🎉 Setup ระบบเสร็จสมบูรณ์!

📊 Master Spreadsheet:
   ID: ${masterSpreadsheet.getId()}
   URL: ${masterSpreadsheet.getUrl()}

📁 Master Folder:
   ID: ${masterFolder.getId()}
   URL: ${masterFolder.getUrl()}

🏪 ร้านตัวอย่าง (Demo Tenant):
   Tenant ID: ${demoTenant.tenantId}
   Spreadsheet ID: ${demoTenant.spreadsheet.getId()}
   Folder ID: ${demoTenant.folder.getId()}

👤 บัญชีทดลองใช้งาน:
   Super Admin: superadmin / superadmin123
   Admin: admin / admin123
   Manager: manager / manager123
   Cashier: cashier / cashier123
   Demo: demo / demo

⚠️ สิ่งที่ต้องทำต่อไป:
1. Copy MASTER_SHEET_ID และ MASTER_FOLDER_ID ด้านบน
2. ไปที่ไฟล์ code.gs
3. แก้ไขค่า MASTER_SHEET_ID และ MASTER_FOLDER_ID
4. Deploy as Web App
5. เริ่มใช้งานระบบได้เลย!

คัดลอกค่าเหล่านี้เก็บไว้:
MASTER_SHEET_ID = "${masterSpreadsheet.getId()}"
MASTER_FOLDER_ID = "${masterFolder.getId()}"
  `;

  ui.alert('Setup Complete!', message, ui.ButtonSet.OK);

  Logger.log('=====================================');
  Logger.log('MASTER_SHEET_ID = "' + masterSpreadsheet.getId() + '"');
  Logger.log('MASTER_FOLDER_ID = "' + masterFolder.getId() + '"');
  Logger.log('=====================================');
}

// ========================================
// ADDITIONAL SETUP FUNCTIONS
// ========================================

/**
 * สร้างร้านใหม่ (เรียกจาก Super Admin UI)
 */
function createNewTenant(tenantData) {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);

    // สร้างโฟลเดอร์และ Spreadsheet
    const tenantFolder = createTenantFolder(masterFolder, tenantData.tenantName);
    const tenantSpreadsheet = createTenantSpreadsheet(tenantFolder, tenantData.tenantName);

    // สร้างโครงสร้าง
    setupTenantSheetStructure(tenantSpreadsheet);

    // บันทึกใน Master
    const tenantId = saveTenantToMaster(masterSpreadsheet, {
      tenantName: tenantData.tenantName,
      sheetId: tenantSpreadsheet.getId(),
      folderId: tenantFolder.getId(),
      licenseType: tenantData.licenseType,
      ownerName: tenantData.ownerName,
      ownerEmail: tenantData.ownerEmail,
      ownerPhone: tenantData.ownerPhone,
      address: tenantData.address,
      taxId: tenantData.taxId
    });

    // สร้าง Admin User
    createTenantAdminUser(masterSpreadsheet, tenantId, tenantData.tenantName);

    // สร้าง Settings เบื้องต้น
    seedTenantSettings(tenantSpreadsheet);

    return {
      success: true,
      tenantId: tenantId,
      sheetId: tenantSpreadsheet.getId(),
      folderId: tenantFolder.getId(),
      message: 'สร้างร้านใหม่สำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * ลบร้าน (Soft delete - เปลี่ยนสถานะเป็น INACTIVE)
 */
function deleteTenant(tenantId) {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = masterSpreadsheet.getSheetByName('Tenants');

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === tenantId) {
        // เปลี่ยนสถานะเป็น INACTIVE
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

// ========================================
// END OF SETUP SCRIPT
// ========================================
