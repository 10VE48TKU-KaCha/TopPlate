# TopPlate - Multi-Tenant SaaS Restaurant Management System 🍽️🚀

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Prisma%20%7C%20PostgreSQL-emerald)](#-tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Tenant%20Shared%20Schema-purple)](#-architecture--multi-tenant-security)

TopPlate is an enterprise-grade Multi-Tenant SaaS Restaurant Management System engineered for modern restaurant chains and single-store operations. It provides an end-to-end operational suite including Multi-Store Onboarding, Menu & Inventory Management with automated recipe stock deduction, Point of Sale (POS), Kitchen Display System (KDS), and Customer QR Table Self-Ordering.

---

## 🏛️ Architecture & Multi-Tenant Security

TopPlate employs a **Shared Database, Shared Schema** architecture designed for maximal performance, tenant isolation, and efficiency.

```
                    ┌──────────────────────────────────────────────┐
                    │               Client Frontend                │
                    │        Next.js 14 (React / Tailwind)         │
                    └──────────────────────┬───────────────────────┘
                                           │ Bearer JWT Token
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               FastAPI Backend                │
                    │   get_current_tenant_context() Dependency   │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │       Prisma ORM (prisma-client-py)          │
                    │   WHERE storeId = tenant_context.store_id    │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │            PostgreSQL Database               │
                    │    stores | users | menu_items | orders...   │
                    └──────────────────────────────────────────────┘
```

### 🔒 Security Principles (CRITICAL)
1. **Strict Tenant Isolation**: Every tenant entity model (`Category`, `MenuItem`, `InventoryItem`, `Table`, `Order`, `OrderItem`) has `storeId` indexed as a mandatory foreign key constraint referencing `Store`.
2. **Zero Trust Client Payloads**: The backend **NEVER** trusts `storeId` passed in client request bodies or query parameters. The `storeId` is securely extracted from the cryptographically verified JWT payload on the backend using FastAPI's dependency injection system (`get_current_tenant_context`).
3. **Role-Based Access Control (RBAC)**:
   - **`SUPER_ADMIN`**: Global platform owner. Manages stores, global tenant onboarding, and global metrics.
   - **`STORE_ADMIN`**: Store manager. Accesses Dashboard, Menu items, Recipe inventory, and Staff accounts.
   - **`EMPLOYEE`**: Restaurant staff (Waiters, Cashiers, Chefs). Operates POS cashier, Kitchen Display System (KDS), and Table Map.
   - **`CUSTOMER`**: Customer ordering interface via QR code. Restricted to order creation and order progress tracking for their table.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2 validation, `passlib` & `bcrypt` for password hashing, `python-jose` for JWT tokens.
- **ORM & Database**: Prisma (`prisma-client-py` with asyncio interface) & PostgreSQL 15.
- **Infrastructure**: Docker & Docker Compose.

---

## 📁 Directory Structure

```
TopPlate/
├── docker-compose.yml       # Local development & production orchestration
├── .env.example             # Root environment template
├── README.md                # System documentation & technical guide
├── backend/
│   ├── Dockerfile           # FastAPI container definition
│   ├── requirements.txt     # Python dependencies
│   ├── prisma/
│   │   └── schema.prisma    # Complete Prisma multi-tenant data model
│   └── app/
│       ├── main.py          # FastAPI application & startup lifecycle
│       ├── config.py        # Environment settings & Pydantic config
│       ├── database.py      # Prisma Client lifecycle handlers
│       ├── security/
│       │   ├── jwt.py       # Passlib hashing & JWT generation/decoding
│       │   └── dependencies.py # Zero-trust tenant isolation dependencies
│       ├── schemas/         # Pydantic request/response schemas
│       └── routers/         # Modular API endpoints (auth, stores, menu, inventory, orders, tables)
└── frontend/
    ├── Dockerfile           # Next.js container definition
    ├── package.json         # Dependencies & Next.js scripts
    ├── tsconfig.json        # TypeScript configuration
    ├── tailwind.config.js   # Tailwind design tokens
    └── src/
        ├── app/             # App Router pages & layout hierarchy
        │   ├── super-admin/ # Super Admin portal
        │   ├── admin/       # Store Admin dashboard, menu, inventory, staff
        │   ├── staff/       # POS cashier, KDS display, table map
        │   └── customer/    # QR Code digital menu & order status tracking
        ├── components/      # UI components & sticky navbar
        ├── lib/             # API client wrappers & token storage
        └── types/           # Shared TypeScript interfaces
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have installed:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Recommended)
- [Node.js 18+](https://nodejs.org/) (For local frontend development without Docker)
- [Python 3.11+](https://www.python.org/) (For local backend development without Docker)

---

## ⚙️ Environment Setup (`.env.example`)

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

### `.env` Content:
```ini
# Database Configuration
POSTGRES_USER=topplate_admin
POSTGRES_PASSWORD=topplate_secret_password
POSTGRES_DB=topplate_db
DATABASE_URL=postgresql://topplate_admin:topplate_secret_password@localhost:5432/topplate_db?schema=public

# Security / Auth Configuration
JWT_SECRET_KEY=supersecretjwtkey_topplate_multitenant_saas_2026_change_me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Backend Config
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend Config
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Running the Project Locally with Docker Compose

To launch the full stack (PostgreSQL + FastAPI Backend + Next.js Frontend):

```bash
docker-compose up --build
```

Services will be accessible at:
- **Frontend App**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## 💾 Database Migration & Seeding Commands

When running outside of Docker Compose or running manual migrations:

### 1. Install Backend Dependencies & Generate Prisma Client:
```bash
cd backend
pip install -r requirements.txt
prisma generate
```

### 2. Push Schema to Database:
```bash
prisma db push
```

### 3. Default SuperAdmin Credentials:
Upon starting the backend, an initial SuperAdmin account is automatically seeded:
- **Email**: `superadmin@topplate.com`
- **Password**: `SuperAdminPass123!`

---

## ⚡ Key Feature Workflows

### 1. Super Admin Store Onboarding
- Log in as `superadmin@topplate.com`.
- Access `/super-admin` to create a new store tenant (e.g. `Bistro Central`).
- Default dining tables (Table 1 through 5) are automatically seeded for the store.

### 2. POS Order & Automated Stock Deduction Logic
- Staff access `/staff/pos` to place orders.
- Selecting menu items and placing an order automatically:
  1. Computes line item subtotal and overall total.
  2. Queries `MenuItemRecipe` to find ingredient quantities required.
  3. Deducts required quantities directly from `InventoryItem.currentStock`.
  4. Dispatches live ticket to Kitchen Display System (`/staff/kds`).
  5. Updates table status to `OCCUPIED`.

### 3. Kitchen Display System (KDS)
- Kitchen chefs view tickets on `/staff/kds`.
- Transition orders through lifecycle: `PENDING` ➔ `COOKING` ➔ `SERVED` ➔ `COMPLETED`.
- On `COMPLETED`, table status is automatically reset to `AVAILABLE`.

### 4. Customer Self-Ordering via QR Code
- Customers scan QR code leading to `/customer/[storeId]/[tableId]`.
- Place direct orders to their table without logging in.
- Track real-time cooking progress on `/customer/[storeId]/[tableId]/status/[orderId]`.

---

## 📄 License
This project is licensed under the MIT License.
