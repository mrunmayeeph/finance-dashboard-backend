# Finance Dashboard Backend

A backend API for a multi-role finance dashboard. Built with Node.js, TypeScript, Express, and MongoDB, following Clean Architecture principles. This is a focused, assignment-scoped implementation — no unnecessary features, no over-engineering.


---

## Live Deployment

| | URL |
|---|---|
| **API Base** | https://finance-dashboard-backend-y7pn.onrender.com/api/v1 |
| **Swagger UI** | https://finance-dashboard-backend-y7pn.onrender.com/api-docs |
| **Health Check** | https://finance-dashboard-backend-y7pn.onrender.com/health |


---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime and type safety |
| Express | Web framework |
| MongoDB + Mongoose | Database and ODM |
| Zod | Schema validation |
| JWT (jsonwebtoken) | Token-based authentication |
| bcryptjs | Password hashing |
| Swagger UI | API documentation |

---

## Architecture

This project follows Clean Architecture with strict inward dependency flow:

```
┌─────────────────────────────────────────────┐
│             Presentation Layer               │
│   Controllers · Routes · Validators ·        │
│   Auth Middleware · RBAC Middleware          │
├─────────────────────────────────────────────┤
│             Application Layer                │
│        Use Cases · PolicyService             │
├─────────────────────────────────────────────┤
│               Domain Layer                   │
│      Entities · Repository Interfaces        │
├─────────────────────────────────────────────┤
│           Infrastructure Layer               │
│  Mongoose Models · Repository Impls · Config │
└─────────────────────────────────────────────┘
```

**Key principles:**
- Business logic lives exclusively in use cases
- Controllers are thin — they extract input, call one use case, return the result
- The domain layer has zero framework dependencies
- Dependency injection is wired manually in `app.ts`

---

## Request Flow

Every incoming request passes through these layers in order:

```
HTTP Request
     │
     ▼
Auth Middleware        → verifies JWT, attaches user to req
     │
     ▼
RBAC Middleware        → checks role permission via PolicyService
     │                  (returns 403 if role is not allowed)
     ▼
Validation Middleware  → parses request against Zod schema
     │                  (returns 422 if input is invalid)
     ▼
Controller             → extracts input, calls one use case
     │
     ▼
Use Case               → executes business logic
     │
     ▼
Repository             → reads/writes MongoDB
     │
     ▼
HTTP Response
```

---

## Project Structure

```
finance-backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts              # User entity + DTOs
│   │   │   └── Transaction.ts       # Transaction entity + DTOs + filters
│   │   └── repositories/
│   │       ├── IUserRepository.ts
│   │       └── ITransactionRepository.ts  # Includes DashboardSummary types
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── LoginUseCase.ts
│   │   │   │   └── GetMeUseCase.ts
│   │   │   ├── users/
│   │   │   │   ├── CreateUserUseCase.ts
│   │   │   │   ├── ListUsersUseCase.ts
│   │   │   │   └── UpdateUserUseCase.ts
│   │   │   ├── transactions/
│   │   │   │   ├── CreateTransactionUseCase.ts
│   │   │   │   ├── ListTransactionsUseCase.ts
│   │   │   │   ├── UpdateTransactionUseCase.ts
│   │   │   │   └── DeleteTransactionUseCase.ts
│   │   │   └── dashboard/
│   │   │       └── GetDashboardSummaryUseCase.ts
│   │   └── services/
│   │       └── PolicyService.ts     # RBAC evaluation
│   │
│   ├── infrastructure/
│   │   ├── config/
│   │   │   ├── index.ts
│   │   │   └── swagger.ts           # OpenAPI 3.0 spec
│   │   ├── database/mongoose/
│   │   │   ├── models/
│   │   │   │   ├── UserModel.ts
│   │   │   │   └── TransactionModel.ts
│   │   │   └── repositories/
│   │   │       ├── MongoUserRepository.ts
│   │   │       └── MongoTransactionRepository.ts  # Aggregation pipeline
│   │   └── middleware/
│   │       ├── authMiddleware.ts
│   │       ├── rbacMiddleware.ts
│   │       ├── validationMiddleware.ts
│   │       └── errorMiddleware.ts
│   │
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── TransactionController.ts
│   │   │   └── DashboardController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── transactionRoutes.ts
│   │   │   └── dashboardRoutes.ts
│   │   └── validators/
│   │       ├── authValidator.ts
│   │       ├── userValidator.ts
│   │       └── transactionValidator.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       └── password.ts
│   │
│   ├── scripts/
│   │   └── seed.ts
│   ├── app.ts                       # Express app + manual DI wiring
│   └── index.ts                     # Entry point + graceful shutdown
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Roles and Permissions

Roles are hardcoded as an enum (`viewer | analyst | admin`) — no dynamic permissions collection is needed for this scope.

| Role | Transactions | Dashboard | Users |
|---|---|---|---|
| Viewer | Read only | — | — |
| Analyst | Read only | Read (full summary) | — |
| Admin | Full CRUD | Read (full summary) | Create, Read, Update |

Access control is enforced at the route level via `rbacMiddleware`, which calls `PolicyService.hasPermission(role, resource, action)` on every protected request.

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login and receive access token |
| GET | `/api/v1/auth/me` | All roles | Get current user profile |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users` | Admin | List users (paginated) |
| POST | `/api/v1/users` | Admin | Create a new user |
| PATCH | `/api/v1/users/:id` | Admin | Update user role or status |

### Transactions (Financial Records)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/transactions` | All roles | List records with filters |
| POST | `/api/v1/transactions` | Admin | Create a financial record |
| PATCH | `/api/v1/transactions/:id` | Admin | Update a record |
| DELETE | `/api/v1/transactions/:id` | Admin | Soft-delete a record |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | Analyst, Admin | Aggregated financial summary |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |

---

## Transaction Filters

`GET /api/v1/transactions` supports the following query parameters:

| Parameter | Type | Description |
|---|---|---|
| `type` | `income \| expense` | Filter by transaction type |
| `category` | string | Filter by category (case-insensitive) |
| `startDate` | ISO date | Filter from this date |
| `endDate` | ISO date | Filter to this date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 20, max: 100) |

---

## Dashboard Summary Response

```json
{
  "success": true,
  "data": {
    "totalIncome": 60000,
    "totalExpenses": 21000,
    "netBalance": 39000,
    "categoryTotals": [
      { "_id": "salary", "total": 50000 },
      { "_id": "freelance", "total": 8000 },
      { "_id": "rent", "total": 12000 }
    ],
    "monthlyTrends": [
      { "_id": { "year": 2025, "month": 4 }, "income": 60000, "expenses": 21000 },
      { "_id": { "year": 2025, "month": 3 }, "income": 50000, "expenses": 23000 }
    ],
    "recentTransactions": [ ... ]
  }
}
```

Dashboard calculations use MongoDB aggregation pipelines for efficiency and scalability. For large-scale systems, this can be cached using Redis or precomputed via background jobs.

---

## Database Indexes

Indexes are defined on the `Transaction` collection to optimize filtering and aggregation queries:

- `type` — filters by income/expense
- `category` — category-wise filtering and grouping
- `date` — date range filters and monthly trend grouping
- `userId` — per-user queries
- Compound: `{ type, category }`, `{ date, type }`, `{ userId, deletedAt }`

---

## How to Test

### Option 1 — Swagger UI (recommended)

1. Open https://finance-dashboard-backend-y7pn.onrender.com/api-docs
2. Call `POST /auth/login` with one of the credentials below
3. Copy the `accessToken` from the response
4. Click **Authorize** (top right) and paste the token
5. All endpoints are now unlocked based on the role you logged in with

### Option 2 — REST Client (VS Code)

Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension, open `test.rest`, and:

1. Run requests `#2`, `#3`, `#4` (logins) — paste the returned tokens into the `@adminToken`, `@analystToken`, `@viewerToken` variables at the top of the file
2. Run `#13` (create transaction) — paste the returned `id` into `@transactionId`
3. Run any remaining request in order

### Default credentials

| Role | Email | Password | Can do |
|---|---|---|---|
| Admin | admin@example.com | Admin@123 | Everything |
| Analyst | analyst@example.com | Admin@123 | Read transactions + dashboard |
| Viewer | viewer@example.com | Admin@123 | Read transactions only |

---

## Setup (Local)

### Prerequisites
- Node.js 18+
- MongoDB 6.0+

### Installation

```bash
# Clone and install
git clone https://github.com/mrunmayeeph/finance-dashboard-backend.git
cd finance-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Seed the database
npm run seed

# Start in development mode
npm run dev
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finance-db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

---

## API Documentation

Swagger UI (local):
```
http://localhost:3000/api-docs
```

Swagger UI (live):
```
https://finance-dashboard-backend-y7pn.onrender.com/api-docs
```

Raw OpenAPI JSON spec:
```
https://finance-dashboard-backend-y7pn.onrender.com/api-docs.json
```

---

## Scalability

The architecture is designed to scale incrementally — the repository pattern isolates data access so storage can be swapped, aggregation pipelines can be cached via Redis, and each use case is independently deployable as a serverless function if needed.

---

## Assumptions and Tradeoffs

| Decision | Reasoning |
|---|---|
| Access token only (no refresh token) | Refresh token rotation requires database storage, rotation logic, and a revocation mechanism — complexity that belongs in a dedicated auth service. A 15-minute access token is sufficient for this scope. |
| Hardcoded roles (`viewer`, `analyst`, `admin`) | The assignment defines three roles with fixed boundaries. A dynamic permissions collection adds flexibility at the cost of complexity. Hardcoding keeps the access control logic readable and the codebase simpler. |
| Soft delete on transactions | Financial records should never be permanently destroyed. Setting `deletedAt` preserves audit history, allows recovery from accidental deletions, and is standard practice in financial systems. |
| Dashboard aggregation at query time | Aggregation pipelines run on request rather than being precomputed. Simpler for this scope. In production, the result would be cached in Redis with a short TTL or precomputed on a schedule to avoid recomputing on every request. |
| `userId` stamped on transaction at creation | Ties each financial record to the user who created it without needing a separate ownership model or join table. Simple and sufficient for this use case. |
| MongoDB over a relational database | Financial records here are self-contained documents with no complex relational queries between entities. MongoDB's document model is a natural fit and avoids unnecessary schema rigidity. |
| Manual dependency injection over a DI container | All dependencies are wired explicitly in `app.ts`. This keeps the injection transparent and removes the need for decorators or a third-party container library, which would add complexity without meaningful benefit at this scale. |
| Rate limiting not included | Out of scope for this assignment. Can be added as a single middleware via `express-rate-limit` — no architectural changes required. |
| Tests not included | Use cases are constructor-injected, have no framework dependencies, and follow a single `execute()` contract — making them straightforward to unit test in isolation. Excluded to keep the submission focused on architecture and finance logic. |

---

<div align="center">

Built with Node.js · TypeScript · Express · MongoDB · Clean Architecture

[Live API](https://finance-dashboard-backend-y7pn.onrender.com/health) · [Swagger Docs](https://finance-dashboard-backend-y7pn.onrender.com/api-docs) · [GitHub](https://github.com)

</div>
