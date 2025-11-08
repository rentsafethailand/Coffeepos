# Coffee Shop POS - Project Structure

## 📁 โครงสร้างโปรเจกต์

```
Coffeepos/
├── analysis/                          # การวิเคราะห์ระบบ
│   ├── system-analysis.md
│   ├── development-roadmap.md
│   └── missing-features-detailed.md
│
├── backend/                           # Google Apps Script Backend
│   ├── Code.gs                        # Main entry point & Configuration
│   ├── Config.gs                      # Master configuration (Master Sheet ID, Folder ID)
│   ├── Auth.gs                        # Authentication & Authorization
│   ├── Tenant.gs                      # Multi-tenant management
│   ├── Users.gs                       # User management
│   ├── Products.gs                    # Products CRUD
│   ├── Variants.gs                    # Product variants management
│   ├── Inventory.gs                   # Inventory management
│   ├── Recipes.gs                     # Recipe/BOM management
│   ├── Orders.gs                      # Order management
│   ├── Payments.gs                    # Payment processing
│   ├── Reports.gs                     # Reports & Analytics
│   ├── FileUpload.gs                  # File upload handler (slip images)
│   ├── Utils.gs                       # Utility functions
│   └── README.md                      # Backend documentation
│
├── frontend/                          # Frontend Files
│   ├── index.html                     # Main application
│   ├── components/                    # Reusable components
│   │   ├── Modal.html
│   │   ├── DataTable.html
│   │   ├── VariantSelector.html
│   │   └── PaymentModal.html
│   ├── pages/                         # Individual pages
│   │   ├── Dashboard.html
│   │   ├── POS.html
│   │   ├── Products.html
│   │   ├── Inventory.html
│   │   ├── Orders.html
│   │   └── Reports.html
│   ├── assets/                        # Static assets
│   │   ├── css/
│   │   │   └── custom.css
│   │   └── js/
│   │       ├── app.js                 # Main Alpine.js app
│   │       ├── api.js                 # API service layer
│   │       └── utils.js               # Utility functions
│   └── README.md                      # Frontend documentation
│
├── database/                          # Database Schema & Documentation
│   ├── schema.md                      # Complete database schema
│   ├── master-sheet-structure.md     # Master sheet structure
│   ├── tenant-sheet-structure.md     # Per-tenant sheet structure
│   ├── sample-data/                   # Sample data for testing
│   │   ├── products.json
│   │   ├── inventory.json
│   │   └── recipes.json
│   └── migrations/                    # Schema migration scripts
│       └── v1.0.0-initial.gs
│
├── scripts/                           # Utility scripts
│   ├── setup/                         # Setup scripts
│   │   ├── create-master-sheet.gs    # Create master sheet
│   │   ├── create-tenant.gs          # Create new tenant
│   │   └── seed-sample-data.gs       # Seed sample data
│   └── deploy/                        # Deployment scripts
│       └── deploy.md                  # Deployment guide
│
├── docs/                              # Documentation
│   ├── USER_MANUAL.md                 # User manual
│   ├── ADMIN_GUIDE.md                 # Admin guide
│   ├── API_DOCUMENTATION.md           # API documentation
│   └── DEVELOPER_GUIDE.md             # Developer guide
│
├── tests/                             # Test files
│   ├── unit/                          # Unit tests
│   └── integration/                   # Integration tests
│
├── .gitignore                         # Git ignore file
├── README.md                          # Project README
└── PROJECT_STRUCTURE.md               # This file
```

---

## 🗄️ Google Drive Folder Structure

```
Coffee Shop POS Master Folder/
├── Master Spreadsheet                 # Master configuration & tenant list
│
├── Tenants/                           # All tenant folders
│   ├── TENANT_001_ShopName/
│   │   ├── Database.xlsx              # Tenant database (all sheets)
│   │   ├── Images/                    # Product images
│   │   │   ├── products/
│   │   │   └── categories/
│   │   ├── Slips/                     # Payment slip images
│   │   │   ├── 2024/
│   │   │   │   ├── 01/               # January
│   │   │   │   ├── 02/               # February
│   │   │   │   └── ...
│   │   │   └── 2025/
│   │   └── Reports/                   # Generated reports
│   │       ├── daily/
│   │       ├── monthly/
│   │       └── custom/
│   │
│   ├── TENANT_002_AnotherShop/
│   │   └── ... (same structure)
│   │
│   └── ... (more tenants)
│
└── Backups/                           # System backups
    ├── daily/
    ├── weekly/
    └── monthly/
```

---

## 🔧 Configuration Flow

### 1. Master Configuration (Config.gs)
```javascript
// Hard-coded in Config.gs
const MASTER_SHEET_ID = 'YOUR_MASTER_SHEET_ID_HERE';
const MASTER_FOLDER_ID = 'YOUR_MASTER_FOLDER_ID_HERE';
```

### 2. Tenant Creation Flow
```
1. Admin creates new tenant via UI
2. System creates:
   - New folder: Tenants/TENANT_XXX_ShopName/
   - New spreadsheet: Database.xlsx
   - Subfolders: Images/, Slips/, Reports/
3. System populates Master Sheet with tenant info
4. Returns tenant credentials to admin
```

### 3. Authentication Flow
```
1. User logs in with username/password
2. System checks Master Sheet -> Users table
3. Gets tenant ID from user record
4. Opens tenant's specific spreadsheet
5. Returns session token with tenant context
```

---

## 📊 Google Sheets Structure

### Master Spreadsheet
**Sheets:**
- `Tenants` - List of all tenants
- `Users` - All users across tenants
- `Licenses` - License information
- `Settings` - Global settings
- `AuditLog` - System-wide audit log

### Tenant Spreadsheet (per tenant)
**Sheets:**
- `Products` - Product catalog
- `Variants` - Product variants (size, temp, sweetness, etc.)
- `Modifiers` - Add-ons/toppings
- `InventoryItems` - Raw materials/ingredients
- `Recipes` - Recipe/BOM (product -> ingredients mapping)
- `Orders` - Order records
- `OrderItems` - Order line items
- `Channels` - Sales channels
- `Customers` - Customer database
- `Staff` - Staff members
- `Suppliers` - Supplier list
- `PurchaseOrders` - Purchase orders
- `POItems` - PO line items
- `Promotions` - Promotions & discounts
- `Payments` - Payment transactions
- `Settings` - Tenant-specific settings
- `StockMovements` - Inventory movement history
- `AuditLog` - Tenant audit log

---

## 🔑 Key Features

### Multi-Tenant System
- ✅ Single deployment serves multiple shops
- ✅ Data isolation per tenant
- ✅ Shared code, separate data
- ✅ Easy tenant onboarding

### Product Variants System
- ✅ Flexible variant types (size, temperature, sweetness)
- ✅ Price adjustments per variant
- ✅ Multiple variants per product
- ✅ Default variant selection

### Recipe/BOM System
- ✅ Link products to inventory items
- ✅ Quantity calculation
- ✅ Auto-deduct stock on sale
- ✅ Cost calculation per product

### File Management
- ✅ Product images stored in Drive
- ✅ Payment slips organized by date
- ✅ Reports auto-generated and saved

---

## 🚀 Development Workflow

1. **Setup**
   ```bash
   # Clone repository
   git clone [repo-url]

   # Create branch
   git checkout -b feature/your-feature
   ```

2. **Backend Development**
   - Edit files in `backend/`
   - Test in Apps Script editor
   - Deploy as Web App

3. **Frontend Development**
   - Edit files in `frontend/`
   - Test locally (serve HTML)
   - Deploy by copying to Apps Script

4. **Testing**
   - Run unit tests
   - Test multi-tenant isolation
   - Test variant selection
   - Test recipe calculations

5. **Deployment**
   - Follow `scripts/deploy/deploy.md`
   - Update version number
   - Create release notes

---

## 📝 Notes

- All IDs (Master Sheet, Master Folder) are configured in `backend/Config.gs`
- Each tenant gets isolated data storage
- Image uploads go to tenant-specific folders
- Slips are organized by year/month for easy retrieval
- Recipe system auto-calculates ingredient usage
- Multi-tenant ensures scalability for franchise operations
