# Gaspoll CMS — Technical Documentation

> **Version:** 0.2.0  
> **Application:** Content Management System for Gaspoll Management Center  
> **Repository:** `gaspol-cms/`  
> **Last Updated:** 2026-06-25

---

## Table of Contents

1. [Application Architecture](#1-application-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Main Features](#3-main-features)
4. [Routing & Navigation](#4-routing--navigation)
5. [State Management](#5-state-management)
6. [Core Components](#6-core-components)
7. [API Integration](#7-api-integration)
8. [Configuration](#8-configuration)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Styling Approach](#10-styling-approach)

---

## 1. Application Architecture

### 1.1 Overview

Gaspoll CMS is a **single-page application (SPA)** built with React 18 using Create React App (CRA). It follows a **component-based architecture** with a centralized layout wrapper pattern. The application serves as an admin dashboard for managing restaurant operations across multiple outlets (brands).

### 1.2 Folder Structure

```
gaspol-cms/
├── public/                          # Static assets (served as-is)
│   ├── index.html                   # SPA entry HTML
│   ├── global.css                   # Global styles
│   ├── mix-manifest.json            # Asset version manifest
│   ├── assets/                      # Static JS/CSS/fonts/images
│   │   ├── css/                     # Pre-built CSS (pages, widgets)
│   │   ├── js/                      # Pre-built JS (app.js, extensions)
│   │   ├── extensions/              # Vendor libs (FontAwesome, Chart.js, etc.)
│   │   ├── fonts/                   # Icon fonts (Iconly)
│   │   └── images/                  # Images (faces, logos, SVG loaders)
│   └── DOKUMENTASI_REVENUE_GENERATOR.md
│
├── src/
│   ├── index.js                     # React entry point (ReactDOM.createRoot)
│   ├── App.js                       # Root component: routing, auth, layout
│   ├── components/                  # Feature components
│   │   ├── common/                  # Shared layout components
│   │   │   ├── Header.js            # Top navigation bar with user menu
│   │   │   ├── Sidebar.js           # Collapsible sidebar navigation
│   │   │   └── Footer.js            # App footer
│   │   ├── Login.js                 # Authentication page
│   │   ├── User.js / UserModal.js   # User management
│   │   ├── Outlet.js / OutletModal.js # Outlet management
│   │   ├── Menu.js / MenuModal.js   # Menu item management
│   │   ├── MenuCustomPriceModel.js  # Custom pricing per outlet
│   │   ├── Discount.js / DiscountModal.js # Discount management
│   │   ├── Member.js / MembersModal.js / MembersSettingsModal.js / MembersEditPointModal.js # Membership
│   │   ├── Tax.js / TaxFullscreen.js / TaxCalculationCustom.js # Tax & donation tracking
│   │   ├── TaxDonationDestinationModal.js # Donation destination editor
│   │   ├── TaxDocumentPictureModal.js / TaxDocumentPictureEditModal.js # Document images
│   │   ├── TaxFullscreenPictureModal.js # Fullscreen image viewer
│   │   ├── Report.js / ReportDetailModal.js / ReportPage.js / ReportPaymentModal.js # Reporting
│   │   ├── ServingType.js / ServingTypeModal.js # Serving type CRUD
│   │   ├── PaymentType.js / PaymentTypeModal.js # Payment type CRUD
│   │   ├── Ingredient.js / IngredientModal.js # Ingredient management (warehouse)
│   │   ├── IngredientOrderList.js / IngredientOrderListOutlet.js # Ingredient ordering
│   │   ├── IngredientReport.js      # Ingredient usage report
│   │   ├── RevenueGenerator.js / RevenueGeneratorDetailModal.js / RevenueGeneratorDocModal.js # Revenue simulation
│   │   ├── Profile.js / ProfileModal.js # User profile
│   │   ├── WhatsappPage.js          # WhatsApp bot management
│   │   ├── DeleteConfirmationModal.js # Reusable delete confirmation
│   │   └── ThemeToggle.js           # Dark/light mode toggle
│   ├── config/
│   │   └── antdTheme.js             # Ant Design theme customization
│   ├── contexts/
│   │   └── ThemeContext.js           # React Context for dark/light theme
│   ├── helpers/
│   │   ├── token.js                 # JWT decode & validation utilities
│   │   ├── normalizeMenuAccess.js   # Menu access normalization
│   │   └── accessRoutes.js          # Route-to-access-code mapping
│   └── styles/                      # CSS module files
│       ├── modern-theme.css         # CSS custom properties theme
│       ├── header-modern.css        # Header styles
│       ├── sidebar-modern.css       # Sidebar styles
│       ├── menu-module.css          # Menu page styles
│       ├── menu-modal.css
│       ├── outlet-module.css
│       ├── outlet-modal.css
│       ├── discount-module.css
│       ├── discount-modal.css
│       ├── member-module.css
│       ├── user-module.css
│       ├── user-modal.css
│       ├── report-module.css
│       ├── report-detail-modal.css
│       ├── serving-type-module.css
│       ├── serving-type-modal.css
│       ├── payment-type-module.css
│       ├── whatsapp-page.css
│       └── ... (other component CSS files)
│
├── .env                            # Environment variables (local)
├── .env.example                    # Environment variable template
├── package.json                    # Dependencies & scripts
└── README.md                       # Project overview
```

### 1.3 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Component Composition** | Pages built from smaller reusable components (modals, tables, forms) |
| **Layout Wrapper** | `Layout` component wraps authenticated routes with Header/Sidebar/Footer; fullscreen routes bypass layout |
| **Conditional Rendering** | Routes and menu items rendered conditionally based on user permissions (`hasMenuAccess()`) |
| **Custom Hooks** | `useTheme()` hook via Context provides dark/light mode state |
| **Presentational-Container** | Components manage both state and rendering (JS class components with inline state) |
| **Modal Pattern** | Each CRUD feature uses a modal component for create/edit operations |
| **Utility Helpers** | Token parsing, menu access normalization, route mapping extracted to `helpers/` |

### 1.4 Component Connection Flow

```
index.js
  └── <App />
        └── <ThemeProvider />                # React Context for theme
              └── <ConfigProvider />          # Ant Design theme config
                    └── <Router />
                          ├── [isLoading]  → Spinner
                          ├── [isLoggedIn+] → <Layout>
                          │     ├── <Sidebar />   # Navigation menu (access-controlled)
                          │     ├── <Header />    # Top bar with user info & logout
                          │     ├── <Routes />    # Authenticated routes
                          │     └── <Footer />    # App footer
                          └── [isLoggedIn-] → <Login /> (or public TaxFullscreen)
```

---

## 2. Technology Stack

### 2.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2.0 | UI library |
| React DOM | ^18.2.0 | DOM rendering |
| Create React App | 5.0.1 | Build tooling & dev server |
| React Router DOM | ^6.16.0 | Client-side routing |

### 2.2 UI & Components

| Library | Version | Purpose |
|---------|---------|---------|
| Ant Design (antd) | ^6.3.5 | UI component library (tables, forms, buttons, modals) |
| @ant-design/icons | ^6.1.1 | Ant Design icon set |
| SweetAlert2 | ^11.7.27 | Alert, confirmation, and notification dialogs |
| FontAwesome (Free) | 6.x | Icon library (via static assets) |
| Bootstrap Icons | — | Sidebar icons (via CDN classes) |

### 2.3 Charts & Data Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| Chart.js | ^4.4.1 | Canvas-based charts |
| react-chartjs-2 | ^5.2.0 | React wrapper for Chart.js |
| Recharts | ^2.15.4 | React-native chart library (Line, Bar, Pie charts) |

### 2.4 HTTP & Data

| Library | Version | Purpose |
|---------|---------|---------|
| axios | ^1.4.0 | HTTP client for API calls |
| jwt-decode | ^3.1.2 | JWT token decoding |
| xlsx | ^0.18.5 | Excel file generation |

### 2.5 File Uploads

| Library | Version | Purpose |
|---------|---------|---------|
| FilePond | ^4.32.8 | File upload component |
| react-filepond | ^7.1.2 | React wrapper for FilePond |
| filepond-plugin-file-validate-type | ^1.2.9 | File type validation |
| filepond-plugin-image-preview | ^4.6.12 | Image preview |

### 2.6 Form & Date Handling

| Library | Version | Purpose |
|---------|---------|---------|
| Flatpickr | ^4.6.13 | Date picker |
| react-beautiful-dnd | ^13.1.1 | Drag-and-drop (payment type reordering) |

### 2.7 Markdown & Document

| Library | Version | Purpose |
|---------|---------|---------|
| react-markdown | ^10.1.0 | Markdown rendering |
| remark-gfm | ^4.0.1 | GitHub Flavored Markdown support |
| react-to-print | ^2.14.15 | Print functionality for reports |

### 2.8 Build & Quality

| Tool | Version | Purpose |
|------|---------|---------|
| react-scripts | 5.0.1 | CRA build system (Webpack, Babel, ESLint) |
| @testing-library/react | ^13.4.0 | Component testing |
| web-vitals | ^2.1.4 | Performance metrics |

### 2.9 External Static Assets

| Asset | Purpose |
|-------|---------|
| ApexCharts | Alternative charting library (loaded statically) |
| DataTables | jQuery-based data tables (loaded statically) |
| Quill Editor | Rich text editor (loaded statically) |
| Perfect Scrollbar | Custom scrollbar (loaded statically) |
| TinyMCE | Rich text editor (loaded statically) |
| CKEditor | Rich text editor (loaded statically) |

---

## 3. Main Features

### 3.1 Authentication & User Management
- User login with JWT-based authentication
- Session expiry detection and auto-redirect
- Role-based access control (Admin, Warehouse, etc.)
- User CRUD with granular menu access permissions

### 3.2 Outlet (Brand) Management
- CRUD for business outlets/brands
- Each outlet has its own ID, name, address, and configuration

### 3.3 Menu Management
- CRUD for menu items with name, type (Makanan/Minuman), price
- Menu filtering and search
- Custom pricing per outlet (`MenuCustomPriceModel`)

### 3.4 Discount Management
- CRUD for discount codes
- Support for percentage or nominal discounts
- Cart-level or per-item discount types
- Date-range validity

### 3.5 Membership Management
- Member database with search/filter
- Point-based loyalty system
- Point editing and settings configuration
- WhatsApp link generation for member outreach

### 3.6 Tax & Donation Tracking
- Real-time tax and donation data with auto-refresh (30s interval)
- Line charts for tax and donation trends
- Donation destinations editing
- Document picture uploads (tax receipts)
- Custom tax calculation modal
- **Fullscreen public view** (`/tax-fullscreen/:id`) — donation transparency display accessible without login

### 3.7 Reporting
- Sales reports with date range filtering
- Multi-chart visualization (Bar, Line, Pie charts)
- Shift-based reporting
- Payment method breakdown
- Report detail modals with transaction drill-down
- Flatpickr date picker integration

### 3.8 Serving Types
- CRUD for serving types (e.g., Dine-in, Takeaway, Delivery)
- Per-outlet serving type configuration

### 3.9 Payment Types
- CRUD for payment methods
- Payment category grouping
- Drag-and-drop reordering (`react-beautiful-dnd`)

### 3.10 Ingredients Management
- **Ingredient Master:** CRUD for ingredients with types, units, storage locations (warehouse role)
- **Ingredient Ordering:** Order lists with detail management, fulfillment tracking
- **Ingredient Reports:** Usage reporting, editing of received quantities

### 3.11 WhatsApp Bot Management
- WhatsApp bot connection status monitoring
- QR code generation for device pairing
- Message log viewer with pagination
- Device configuration (webhook URLs, auto-reply settings)
- Session management (disconnect, reconnect)

### 3.12 Revenue Generator (Developer Tool)
- Automated transaction generation for revenue simulation
- Configurable parameters: outlet, month, year, target revenue, PPN
- Weekend boost, booking mode, refund/expenditure generation
- **Math Perfect Mode:** Algorithm to hit exact revenue targets
- Batch management with rollback capability
- Download reports in PDF, Excel, and Word formats
- Preview calculation before generation

### 3.13 Profile Management
- User profile editing (name, username, password)
- Outlet PIN configuration (Admin role only)

---

## 4. Routing & Navigation

### 4.1 Router Setup

The app uses [`react-router-dom`](gaspol-cms/package.json:25) v6 with `BrowserRouter` (aliased as `Router`). Routes are defined in [`App.js`](gaspol-cms/src/App.js:62).

### 4.2 Route Structure

#### Public Routes (Unauthenticated)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | [`<Login />`](gaspol-cms/src/components/Login.js) | Login page |
| `/tax-fullscreen/:id` | [`<TaxFullscreen />`](gaspol-cms/src/components/TaxFullscreen.js) | Public donation transparency (no auth required) |
| `*` | `<Navigate to="/" />` | Catch-all redirect to login |

#### Authenticated Routes (Inside Layout)

| Path | Component | Access Code | Description |
|------|-----------|-------------|-------------|
| `/` | [`<User />`](gaspol-cms/src/components/User.js) | 1 | User management (home) |
| `/outlet` | [`<Outlet />`](gaspol-cms/src/components/Outlet.js) | 0 | Outlet management |
| `/menu` | [`<Menu />`](gaspol-cms/src/components/Menu.js) | 2 | Menu management |
| `/discount` | [`<Discount />`](gaspol-cms/src/components/Discount.js) | 3 | Discount management |
| `/member` | [`<Members />`](gaspol-cms/src/components/Member.js) | 9 | Membership management |
| `/tax` | [`<Tax />`](gaspol-cms/src/components/Tax.js) | 12 | Tax & donation management |
| `/tax-fullscreen` | [`<TaxFullscreen />`](gaspol-cms/src/components/TaxFullscreen.js) | 12 | Authenticated fullscreen view |
| `/serving-type` | [`<ServingType />`](gaspol-cms/src/components/ServingType.js) | 5 | Serving type management |
| `/payment-type` | [`<PaymentType />`](gaspol-cms/src/components/PaymentType.js) | 8 | Payment type management |
| `/payment-management` | `<h1>Payment Management</h1>` | 10 | Placeholder page |
| `/report` | [`<Report />`](gaspol-cms/src/components/Report.js) | 4 | Sales reports |
| `/ingredient-order` | [`<IngredientOrderList />`](gaspol-cms/src/components/IngredientOrderList.js) | 6 | Ingredient ordering |
| `/ingredient-report` | [`<IngredientReport />`](gaspol-cms/src/components/IngredientReport.js) | 7 | Ingredient reports |
| `/ingredient` | [`<Ingredient />`](gaspol-cms/src/components/Ingredient.js) | Warehouse role | Ingredient master |
| `/ingredient-order-outlet` | [`<IngredientOrderListOutlet />`](gaspol-cms/src/components/IngredientOrderListOutlet.js) | Warehouse role | Outlet ingredient orders |
| `/whatsapp` | [`<WhatsappPage />`](gaspol-cms/src/components/WhatsappPage.js) | 11 | WhatsApp bot management |
| `/revenue-generator` | [`<RevenueGenerator />`](gaspol-cms/src/components/RevenueGenerator.js) | outlet_id 0 or 4 | Revenue simulation tool |

### 4.3 Route Guards

Route protection is implemented via **conditional rendering** in [`App.js`](gaspol-cms/src/App.js:74):

```javascript
const hasMenuAccess = (accessCode) => {
  if (!userTokenData?.menu_access) return false;
  // Developer outlet (outlet_id = 4) can access all menus
  if (userTokenData?.outlet_id === 4) return true;
  return userTokenData.menu_access.includes(accessCode);
};
```

- Routes are only rendered if `hasMenuAccess(code)` returns `true`
- The Revenue Generator route has an additional check: `outlet_id === 0 || outlet_id === 4`
- Warehouse-specific routes (`/ingredient`, `/ingredient-order-outlet`) are gated by `role === "Warehouse"`
- Fullscreen routes (`/tax-fullscreen/:id`) are accessible without authentication

### 4.4 Navigation Guards (Token Expiry)

In [`App.js`](gaspol-cms/src/App.js:93-122), on mount the app checks localStorage for a valid token:

- If valid: sets `isLoggedIn = true` and extracts user data
- If expired: clears user data, shows a SweetAlert2 notification, and redirects to `/`
- Public fullscreen paths are exempt from the expiry redirect

### 4.5 Sidebar Navigation

The [`Sidebar`](gaspol-cms/src/components/common/Sidebar.js) component renders menu sections with items filtered by `hasAccess()`:

| Section | Items | Access Codes |
|---------|-------|-------------|
| **MANAGEMENT** | Users, Outlet, Menus, Discounts, Membership, Tax | 1, 0, 2, 3, 9, 12 |
| **FINANCIAL** | Serving Types, Payment Types | 5, 8 |
| **REPORTING** | Reports, Ingredients Order, Ingredients Report | 4, 6, 7 |
| **WHATSAPP MANAGEMENT** | Whatsapp | 11 |
| **DEVELOPER TOOLS** | Revenue Generator | 13 (menu_access) |
| **Warehouse** (role-based) | Ingredients, Ingredients Order Outlet | Warehouse role |

The sidebar collapses on mobile (width: 250px open, 80px closed).

### 4.6 Post-Login Redirect

In [`Login.js`](gaspol-cms/src/components/Login.js:288), after successful login the user is redirected to the route corresponding to their smallest menu access code:

```javascript
const firstAccess = Math.min(...tokenData.menu_access);
const redirectPath = accessRoutes[firstAccess] || "/profile";
```

The mapping is defined in [`accessRoutes.js`](gaspol-cms/src/helpers/accessRoutes.js):

```javascript
{ 0: "/outlet", 1: "/", 2: "/menu", 3: "/discount", 4: "/report", 
  5: "/serving-type", 6: "/ingredient-order", 7: "/ingredient-report",
  8: "/payment-type", 9: "/member", 10: "/payment-management", 11: "/whatsapp" }
```

---

## 5. State Management

### 5.1 Approach

The application uses **React's built-in state management** (useState/useEffect hooks) at the component level. There is no Redux, Zustand, or other external state management library. The only cross-cutting state abstraction is:

1. **ThemeContext** ([`src/contexts/ThemeContext.js`](gaspol-cms/src/contexts/ThemeContext.js)) — provides dark/light mode toggle globally
2. **App-level state** ([`src/App.js`](gaspol-cms/src/App.js:62-69)) — `isLoggedIn`, `userTokenData`, `isSidebarOpen` managed at root and passed down as props

### 5.2 State Flow

```
App.js (Root)
├── isLoggedIn (boolean)          → passed to <Login />, <Layout />
├── userTokenData (object)        → passed to all feature components
├── isSidebarOpen (boolean)       → passed to <Sidebar />, <Header />
│
├── ThemeContext (context)
│   └── isDark (boolean)          → consumed by all components via useTheme()
│   └── toggleTheme (function)
│
├── Layout (wrapper)
│   ├── Sidebar ← (isOpen, userTokenData)
│   ├── Header ← (userTokenData, setIsLoggedIn, onToggleSidebar)
│   └── Feature Components ← (userTokenData)
│       └── Each manages its own:
│           ├── Data state (useState: items, modals, loading, errors)
│           ├── API fetching (useEffect on mount)
│           └── Local UI state (search, pagination, form inputs)
```

### 5.3 Per-Component State Pattern

Each management component follows a consistent state pattern:

```javascript
// Example: Menu.js
const [menus, setMenus] = useState([]);           // Data from API
const [filteredMenus, setFilteredMenus] = useState([]); // Filtered data
const [searchTerm, setSearchTerm] = useState("");  // Search/filter
const [showModal, setShowModal] = useState(false);  // Modal visibility
const [selectedMenuId, setSelectedMenuId] = useState(null); // Selected item
```

### 5.4 Theme State

[`ThemeContext`](gaspol-cms/src/contexts/ThemeContext.js) manages dark/light mode:

- **Persistence:** Saves to `localStorage('theme')` and restores on mount
- **System Preference:** Falls back to `prefers-color-scheme: dark` media query
- **Application:** Adds CSS class `theme-dark` or `theme-light` to `<body>`
- **Consumption:** All components use `useTheme()` hook to get `isDark` and `toggleTheme`

---

## 6. Core Components

### 6.1 Common/Layout Components

#### [`Sidebar`](gaspol-cms/src/components/common/Sidebar.js)
- **Props:** `isOpen`, `userTokenData`, `onToggleSidebar`
- **Responsibility:** Renders collapsible navigation menu filtered by user permissions
- **Key features:** Auto-close on mobile route change, section grouping, active link highlighting

#### [`Header`](gaspol-cms/src/components/common/Header.js)
- **Props:** `onToggleSidebar`, `userTokenData`, `setIsLoggedIn`
- **Responsibility:** Top navigation bar with sidebar toggle, user info, and logout button

#### [`Footer`](gaspol-cms/src/components/common/Footer.js)
- **Props:** None (uses `useTheme()`)
- **Responsibility:** App footer with dynamic company URL detection (dastrevas.com fallback)

### 6.2 Feature Components

| Component | File | Props | Responsibility |
|-----------|------|-------|----------------|
| `Login` | [`Login.js`](gaspol-cms/src/components/Login.js) | `setIsLoggedIn`, `setUserTokenData` | Authentication form, JWT acquisition, post-login redirect |
| `User` | [`User.js`](gaspol-cms/src/components/User.js) | None | User CRUD table with modal |
| `UserModal` | [`UserModal.js`](gaspol-cms/src/components/UserModal.js) | `show`, `onClose`, `userId`, `onSave` | Create/edit user form with menu access checkboxes |
| `Outlet` | [`Outlet.js`](gaspol-cms/src/components/Outlet.js) | None | Outlet CRUD table with modal |
| `Menu` | [`Menu.js`](gaspol-cms/src/components/Menu.js) | `userTokenData` | Menu items with grid/list view, search, CRUD modal |
| `MenuModal` | [`MenuModal.js`](gaspol-cms/src/components/MenuModal.js) | `show`, `onClose`, `menuId`, `onSave` | Menu create/edit form with details |
| `MenuCustomPriceModel` | [`MenuCustomPriceModel.js`](gaspol-cms/src/components/MenuCustomPriceModel.js) | `selectedMenuId`, `userTokenData` | Custom pricing per outlet for a menu item |
| `Discount` | [`Discount.js`](gaspol-cms/src/components/Discount.js) | `userTokenData` | Discount CRUD with search/filter |
| `Member` | [`Member.js`](gaspol-cms/src/components/Member.js) | `userTokenData` | Membership list with search, point editing, settings |
| `MembersEditPointModal` | [`MembersEditPointModal.js`](gaspol-cms/src/components/MembersEditPointModal.js) | `show`, `onClose`, `memberId` | Member point adjustment modal |
| `MembersSettingsModal` | [`MembersSettingsModal.js`](gaspol-cms/src/components/MembersSettingsModal.js) | `show`, `onClose` | Membership settings (point values) |
| `Tax` | [`Tax.js`](gaspol-cms/src/components/Tax.js) | `userTokenData` | Tax/donation dashboard with charts, document uploads, auto-refresh (30s) |
| `TaxFullscreen` | [`TaxFullscreen.js`](gaspol-cms/src/components/TaxFullscreen.js) | `userTokenData` (optional), `preview` | Public fullscreen donation transparency view |
| `TaxCalculationCustom` | [`TaxCalculationCustom.js`](gaspol-cms/src/components/TaxCalculationCustom.js) | `show`, `onClose`, `outletId` | Custom tax calculation input |
| `Report` | [`Report.js`](gaspol-cms/src/components/Report.js) | `userTokenData` | Multi-chart sales report with date range, shift, payment filters |
| `ReportDetailModal` | [`ReportDetailModal.js`](gaspol-cms/src/components/ReportDetailModal.js) | `transactionId`, `show`, `onClose` | Transaction detail drill-down |
| `ReportPaymentModal` | [`ReportPaymentModal.js`](gaspol-cms/src/components/ReportPaymentModal.js) | `show`, `onClose`, `paymentTypeId` | Payment method detail report |
| `ServingType` | [`ServingType.js`](gaspol-cms/src/components/ServingType.js) | `userTokenData` | Serving type CRUD |
| `PaymentType` | [`PaymentType.js`](gaspol-cms/src/components/PaymentType.js) | `userTokenData` | Payment type CRUD with drag-and-drop reorder |
| `Ingredient` | [`Ingredient.js`](gaspol-cms/src/components/Ingredient.js) | None | Ingredient master data CRUD (warehouse role) |
| `IngredientOrderList` | [`IngredientOrderList.js`](gaspol-cms/src/components/IngredientOrderList.js) | `userTokenData` | Ingredient order management |
| `IngredientReport` | [`IngredientReport.js`](gaspol-cms/src/components/IngredientReport.js) | `userTokenData` | Ingredient usage reports |
| `WhatsappPage` | [`WhatsappPage.js`](gaspol-cms/src/components/WhatsappPage.js) | `userTokenData` | WhatsApp bot management (QR, logs, config, devices) |
| `RevenueGenerator` | [`RevenueGenerator.js`](gaspol-cms/src/components/RevenueGenerator.js) | `userTokenData` | Revenue simulation with preview, generate, rollback |
| `RevenueGeneratorDetailModal` | [`RevenueGeneratorDetailModal.js`](gaspol-cms/src/components/RevenueGeneratorDetailModal.js) | `batchId`, `show`, `onClose` | Generated batch detail with summary, transactions, refunds |
| `RevenueGeneratorDocModal` | [`RevenueGeneratorDocModal.js`](gaspol-cms/src/components/RevenueGeneratorDocModal.js) | `batchId`, `show`, `onClose` | Download report (PDF/Excel/Word) with section checklist |

### 6.3 Modal Pattern

Most CRUD features follow this consistent pattern:

```javascript
// Parent component
const [showModal, setShowModal] = useState(false);
const [selectedItemId, setSelectedItemId] = useState(null);

const openModal = (id) => { setSelectedItemId(id); setShowModal(true); };
const closeModal = () => { setShowModal(false); };
const handleSave = async (data) => {
  // API call, then refresh list
};

// Render
{showModal && (
  <ModalComponent
    show={showModal}
    onClose={closeModal}
    itemId={selectedItemId}
    onSave={handleSave}
  />
)}
```

---

## 7. API Integration

### 7.1 HTTP Client

The application uses **axios** (v1.x) as its HTTP client. All API calls are made directly from component files — there is no centralized API service layer or interceptors.

### 7.2 Base URL Configuration

API base URL is set via environment variable:

```javascript
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL; // e.g., http://localhost:5000
```

For the WhatsApp page, there are additional configurations:

```javascript
// Priority: 1. window.__APP_CONFIG__ → 2. process.env → 3. relative path
const apiBaseUrl = (runtimeForce && runtimeWhatsappUrl) 
  ? runtimeWhatsappUrl 
  : (process.env.REACT_APP_FORCE_REMOTE === 'true' && process.env.REACT_APP_API_WHATSAPP_URL)
    ? process.env.REACT_APP_API_WHATSAPP_URL
    : '';
```

### 7.3 API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login (returns JWT token) |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user-management` | Get all users + outlets |
| POST | `/user-management` | Create user |
| PUT | `/user-management/:id` | Update user |
| DELETE | `/user-management/:id` | Delete user |

#### Outlet Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/outlet` | Get all outlets |
| POST | `/outlet` | Create outlet |
| PUT | `/outlet/:id` | Update outlet |
| DELETE | `/outlet/:id` | Delete outlet |

#### Menu Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v2/menu` | Get menus (by outlet_id) |
| GET | `/v2/menu/:id` | Get menu detail |
| POST | `/v2/menu` | Create menu |
| PUT | `/v2/menu/:id` | Update menu |
| DELETE | `/v2/menu/:id` | Delete menu |
| GET | `/custom-menu-price/:menuId` | Get custom prices for a menu |
| POST | `/custom-menu-price` | Create custom price |

#### Discount Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discount` | Get discounts (by outlet_id) |
| POST | `/discount` | Create discount |
| PUT | `/discount/:id` | Update discount |
| DELETE | `/discount/:id` | Delete discount |

#### Membership
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/membership` | Get members (by outlet_id) |
| PUT | `/membership/:id` | Update member |
| GET | `/membership-history/:memberId` | Get membership points history |
| GET/POST | `/membership-setting` | Membership settings |

#### Tax & Donation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tax/:outletId` | Get tax/donation data |
| GET/POST/PUT/DELETE | `/tax-donation-destination` | Donation destinations |
| GET/POST | `/tax-picture-documentation` | Tax document pictures |
| POST/PUT/DELETE | `/tax-calculation-custom` | Custom tax calculations |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/report` | Get sales report data |
| GET | `/payment-report` | Payment method report |

#### Serving Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/serving-type` | Get serving types (by outlet_id) |
| POST | `/serving-type` | Create serving type |
| PUT | `/serving-type/:id` | Update serving type |
| DELETE | `/serving-type/:id` | Delete serving type |

#### Payment Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payment-management` | Get payment types + categories |
| POST | `/payment-management` | Create payment type |
| PUT | `/payment-management/:id` | Update payment type |
| DELETE | `/payment-management/:id` | Delete payment type |
| PUT | `/payment-management/reorder` | Reorder payment types |

#### Ingredients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ingredient` | Get ingredients |
| POST | `/ingredient` | Create ingredient |
| PUT | `/ingredient/:id` | Update ingredient |
| DELETE | `/ingredient/:id` | Delete ingredient |
| GET | `/ingredient-order` | Get ingredient orders (by outlet_id) |
| POST | `/ingredient-order` | Create/update ingredient order |
| PATCH | `/ingredient-order` | Update ingredient order status |
| GET | `/ingredient-report` | Get ingredient reports (by outlet_id) |

#### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/profile` | Update user profile |

#### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp-log` | Get WhatsApp message logs |
| (Various) | `/device/*` | WhatsApp device management endpoints |

#### Revenue Generator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/revenue-generator/logs` | Get generation logs |
| GET | `/revenue-generator/log/:id` | Get log detail |
| GET | `/revenue-generator/outlets` | Get outlets for dropdown |
| POST | `/revenue-generator/preview` | Preview revenue calculation |
| POST | `/revenue-generator/generate` | Execute revenue generation |
| POST | `/revenue-generator/rollback/:batchId` | Rollback a batch |
| GET | `/revenue-generator/:batchId/transactions` | Get batch transactions |
| GET | `/revenue-generator/:batchId/refunds` | Get batch refunds |
| GET | `/revenue-generator/:batchId/expenditures` | Get batch expenditures |
| GET | `/revenue-generator/:batchId/daily-breakdown` | Get daily breakdown |

### 7.4 Common Response Format

API responses typically follow this structure:

```json
{
  "status": true,
  "message": "Success message",
  "data": { /* response payload */ }
}
```

Error responses:

```json
{
  "status": false,
  "message": "Error description"
}
```

Location-based responses (e.g., Login):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 7.5 CORS & Proxy

- The [`package.json`](gaspol-cms/package.json:5) has a `"proxy"` field set to `https://whatsapp.gaspollmanagementcenter.com` for development CORS proxying
- The WhatsApp page has runtime configuration support via `window.__APP_CONFIG__` for production deployment flexibility
- Most API calls use `withCredentials: false` or no credential option

---

## 8. Configuration

### 8.1 Environment Variables (`.env` / `.env.example`)

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `REACT_APP_API_BASE_URL` | `http://localhost:5000` | Backend API base URL |
| `REACT_APP_API_WHATSAPP_URL` | `https://whatsapp.gaspollmanagementcenter.com` | WhatsApp bot service URL |
| `REACT_APP_FORCE_REMOTE` | `true` | Force remote API URLs (WhatsApp) |
| `REACT_APP_WHATSAPP_APP_TOKEN` | — | WhatsApp bot authentication token |

### 8.2 Build Scripts ([`package.json`](gaspol-cms/package.json))

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `react-scripts start` | Development server |
| `build` | `react-scripts build` | Production build |
| `test` | `react-scripts test` | Run tests |
| `eject` | `react-scripts eject` | Eject CRA configuration |
| `serve` | `serve -s build` | Serve production build |

### 8.3 Browserslist

```json
{
  "production": [">0.2%", "not dead", "not op_mini all"],
  "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
}
```

### 8.4 ESLint Configuration

Extends `react-app` and `react-app/jest` — the default CRA ESLint setup.

### 8.5 Ant Design Theme

Custom theme defined in [`antdTheme.js`](gaspol-cms/src/config/antdTheme.js):

- **Primary color:** `#FF6B35` (orange)
- **Font:** Inter system font stack
- **Border radius:** 10px (default), 16px (large), 6px (small)
- **Box shadows:** Subtle elevation shadows
- **Component-specific overrides:** Button, Table, Input, Select, DatePicker, Modal, Card, Drawer, Menu

### 8.6 Index HTML

The [`public/index.html`](gaspol-cms/public/index.html) includes:
- CSS: `app.css`, `app-dark.css`, `global.css` (pre-built Mazer template styles)
- JS: `bootstrap.js`, `app.js` (Mazer template scripts)
- Hidden checkbox `#toggle-dark` for legacy Mazer dark mode compatibility
- Title set to "Gaspoll CMS"

### 8.7 Runtime Configuration (WhatsApp Page)

The WhatsApp page supports runtime configuration via `window.__APP_CONFIG__`:

```javascript
window.__APP_CONFIG__ = {
  REACT_APP_FORCE_REMOTE: 'true',
  REACT_APP_API_WHATSAPP_URL: 'https://your-whatsapp-service.com',
  REACT_APP_WHATSAPP_APP_TOKEN: 'your-token',
  REACT_APP_API_BASE_URL: 'https://your-api.com'
};
```

---

## 9. Authentication & Authorization

### 9.1 Authentication Flow

```
1. User submits credentials on Login page
2. POST request to /login with { username, password }
3. Backend returns JWT token in response
4. Frontend decodes token using jwt-decode
5. Token stored in localStorage('token')
6. isLoggedIn state set to true
7. User redirected to lowest-access-code route
```

### 9.2 Token Structure

The JWT token payload (decoded) contains:

```javascript
{
  userId: number,
  name: string,
  role: string,           // e.g., "Admin", "Warehouse"
  outlet_id: number,      // 0 = super admin, 4 = developer
  outlet_name: string,
  menu_access: string|array  // e.g., "1,2,3,11" or [1,2,3,11]
}
```

### 9.3 Token Validation

[`helpers/token.js`](gaspol-cms/src/helpers/token.js) provides:

- **`isTokenValid(token)`** — Decodes JWT, checks expiry against current time
- **`extractUserTokenData(token)`** — Decodes and extracts user info

### 9.4 Session Management

- Token expiry is checked on app mount ([`App.js:93-122`](gaspol-cms/src/App.js))
- On expiry: user data cleared, SweetAlert2 notification shown, redirect to `/`
- Logout: removes token from `localStorage`, sets `isLoggedIn = false`, navigates to `/`
- Public fullscreen paths (`/tax-fullscreen*`) are exempt from expiry handling

### 9.5 Access Control Model

The app uses a **menu_access code system** with an **array of numeric codes**:

| Code | Route | Feature |
|------|-------|---------|
| 0 | `/outlet` | Outlet Management |
| 1 | `/` | User Management |
| 2 | `/menu` | Menu Management |
| 3 | `/discount` | Discount Management |
| 4 | `/report` | Reports |
| 5 | `/serving-type` | Serving Types |
| 6 | `/ingredient-order` | Ingredient Orders |
| 7 | `/ingredient-report` | Ingredient Reports |
| 8 | `/payment-type` | Payment Types |
| 9 | `/member` | Membership |
| 10 | `/payment-management` | Payment Management |
| 11 | `/whatsapp` | WhatsApp Management |
| 12 | `/tax` | Tax & Donation |
| 13 | `/revenue-generator` | Revenue Generator |

**Normalization:** [`normalizeMenuAccess.js`](gaspol-cms/src/helpers/normalizeMenuAccess.js) handles multiple input formats:
- String: `"2,3,11"` → `[2, 3, 11]`
- String array: `["2","3"]` → `[2, 3]`
- Number array: `[2, 3, 11]` → `[2, 3, 11]`

**Special Rules:**
- **Developer Outlet** (outlet_id = 4): Can access ALL routes regardless of menu_access
- **Super Admin** (outlet_id = 0): Has access to Revenue Generator
- **Warehouse Role**: Has exclusive access to `/ingredient` and `/ingredient-order-outlet`

### 9.6 Protected Routes Implementation

Protection is implemented through **conditional `<Route>` rendering**:

```javascript
// In App.js <Routes>
{hasMenuAccess(2) && (
  <Route path="/menu" element={<Menu userTokenData={userTokenData} />} />
)}
```

If a user navigates directly to a URL they don't have access to, they'll see a blank page (no matching route), which currently falls through to the unauthenticated catch-all redirect to `/`.

---

## 10. Styling Approach

### 10.1 CSS Framework & Base Theme

The application uses a **hybrid styling approach**:

1. **Mazer Admin Template** — Pre-built Bootstrap 5-based admin template loaded via static assets in `public/`
   - `public/assets/css/main/app.css` — Main stylesheet
   - `public/assets/css/main/app-dark.css` — Dark mode stylesheet
   - `public/assets/js/app.js` — Template JavaScript
   - `public/assets/js/bootstrap.js` — Bootstrap JS

2. **Custom CSS Modules** — Per-component stylesheets in `src/styles/`

3. **Ant Design Theming** — Programmatic theme via `ConfigProvider` and `antdTheme.js`

4. **Inline Styles** — Many components use inline `style={}` objects for dynamic styling (especially theme-dependent styles)

### 10.2 Dark/Light Theme

Managed by [`ThemeContext.js`](gaspol-cms/src/contexts/ThemeContext.js):

- CSS class `theme-dark` or `theme-light` on `<body>` element
- Persistent to `localStorage('theme')`
- Respects system preference (`prefers-color-scheme`) on first visit
- Components access theme via `useTheme()` hook for conditional inline styles

### 10.3 CSS Custom Properties

[`modern-theme.css`](gaspol-cms/src/styles/modern-theme.css) defines CSS custom properties (variables) for consistent theming.

### 10.4 Component-Specific Stylesheets

Each major feature has a dedicated CSS file:

| Stylesheet | Component(s) |
|-----------|-------------|
| [`menu-module.css`](gaspol-cms/src/styles/menu-module.css) | Menu list page |
| [`menu-modal.css`](gaspol-cms/src/styles/menu-modal.css) | Menu create/edit modal |
| [`outlet-module.css`](gaspol-cms/src/styles/outlet-module.css) | Outlet list page |
| [`outlet-modal.css`](gaspol-cms/src/styles/outlet-modal.css) | Outlet modal |
| [`discount-module.css`](gaspol-cms/src/styles/discount-module.css) | Discount list page |
| [`discount-modal.css`](gaspol-cms/src/styles/discount-modal.css) | Discount modal |
| [`member-module.css`](gaspol-cms/src/styles/member-module.css) | Membership page |
| [`user-module.css`](gaspol-cms/src/styles/user-module.css) | User management page |
| [`user-modal.css`](gaspol-cms/src/styles/user-modal.css) | User modal |
| [`report-module.css`](gaspol-cms/src/styles/report-module.css) | Reports page |
| [`report-detail-modal.css`](gaspol-cms/src/styles/report-detail-modal.css) | Report detail modal |
| [`serving-type-module.css`](gaspol-cms/src/styles/serving-type-module.css) | Serving types |
| [`serving-type-modal.css`](gaspol-cms/src/styles/serving-type-modal.css) | Serving type modal |
| [`payment-type-module.css`](gaspol-cms/src/styles/payment-type-module.css) | Payment types |
| [`header-modern.css`](gaspol-cms/src/styles/header-modern.css) | Header component |
| [`sidebar-modern.css`](gaspol-cms/src/styles/sidebar-modern.css) | Sidebar component |
| [`whatsapp-page.css`](gaspol-cms/src/styles/whatsapp-page.css) | WhatsApp page |

### 10.5 Responsive Design

- **Sidebar:** Auto-collapses on mobile (≤768px); closes on route change
- **Header:** Responsive layout with toggle button visible on mobile
- **Tables:** Scrollable on small screens (standard Bootstrap responsive tables)
- **Fullscreen Tax view:** Responsive layout constrained to `max-width: 1200px`
- **Login page:** Centered card layout with responsive max-width (480px)

### 10.6 Icon Usage

- **Bootstrap Icons** (`bi-*`): Used in sidebar navigation
- **FontAwesome (Free)**: Full icon library loaded via static assets
- **Ant Design Icons** (`@ant-design/icons`): Used with Ant Design components
- **Iconly Bold**: Custom icon font loaded from `public/assets/fonts/`
- **Emoji/Unicode**: Simple icons like `🍽️` used inline

---

## Appendix: Key Findings

- **No centralized API layer** — all axios calls are inline in components
- **No TypeScript** — plain JavaScript (JSX) throughout
- **No unit tests implemented** — testing libraries included but no test files found
- **Revenue Generator** is the most complex feature: ~1037 lines in the main component
- **WhatsApp page** is the second most complex: ~1028 lines
- **Tax page** auto-refreshes every 30 seconds
- **The app has a "developer outlet" (ID 4)** that bypasses all permission checks
- **Profile component** exists but is commented out from routing
- **Payment Management** route renders only a placeholder `<h1>` element
- **mix-manifest.json** suggests the static assets may be processed by Laravel Mix (for the Mazer template)
