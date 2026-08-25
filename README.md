# 🚀 FinPay360 — Enterprise FinTech Operations Platform

[![CI/CD Pipeline](https://github.com/senodetech/fintechpay/actions/workflows/ci.yml/badge.svg)](https://github.com/senodetech/fintechpay/actions)
[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031.svg?logo=angular)](https://angular.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11%2B-E0234E.svg?logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Kafka](https://img.shields.io/badge/Apache_Kafka-3.7-231F20.svg?logo=apachekafka)](https://kafka.apache.org)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D.svg?logo=redis)](https://redis.io)

**FinPay360** is a production-grade, high-throughput FinTech banking operations and payment intelligence platform. It provides unified liquidity management, double-entry immutable ledgers, multi-rail payment routing (ACH, SEPA, UPI, Card, Wire), real-time composite fraud scoring, and live WebSocket telemetry.

---

## 🏛️ System Architecture

```text
                    ┌─────────────────────────────────────────┐
                    │               Angular SPA               │
                    │   (Signals, Material, Tailwind, ECharts)│
                    └────────────────────┬────────────────────┘
                                         │ HTTPS / WSS
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │           NestJS API Gateway            │
                    │  (OAuth2/OIDC, Rate Limiting, Redlock)  │
                    └────────────────────┬────────────────────┘
                                         │
        ┌───────────────────┬────────────┴───────────┬───────────────────┐
        ▼                   ▼                        ▼                   ▼
┌──────────────┐   ┌────────────────┐       ┌─────────────────┐   ┌──────────────┐
│ Auth & RBAC  │   │ Payment Engine │       │  Double-Entry   │   │  Fraud/Risk  │
│  (OIDC PKCE) │   │ (State Machine)│       │  Ledger Service │   │ Rule Engine  │
└──────────────┘   └────────┬───────┘       └────────┬────────┘   └───────┬──────┘
                            │                        │                    │
                            └───────────┬────────────┘                    │
                                        ▼                                 ▼
                         ┌─────────────────────────────┐        ┌──────────────────┐
                         │  PostgreSQL (ACID Core)     │        │  Redis (Redlock  │
                         │  NUMERIC(19,4) Money        │        │  & Velocity)     │
                         └──────────────┬──────────────┘        └──────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ Transactional Outbox Relay  │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │  Apache Kafka Event Stream  │
                         └─────────────────────────────┘
```

---

## 💎 Key Architectural Capabilities

### 1. Mathematical Double-Entry Ledger Invariant
- **Immutability**: Ledger records and transactions are append-only. Adjustments or reversals generate balancing counter-entries.
- **Strict Invariant**: Every transaction balances debits and credits:
  $$\sum \text{Debits} = \sum \text{Credits}$$
- **Zero Floating-Point Drift**: Stored as PostgreSQL `NUMERIC(19,4)` and computed using `decimal.js` with 28-digit precision.

### 2. Distributed Idempotency & Concurrency Locking
- Enforces unique `Idempotency-Key` headers on all financial mutation endpoints.
- In-flight request locking via Redis Redlock ensures concurrent duplicate requests execute **exactly once**.

### 3. Composite Real-Time Fraud & Anomaly Engine
- **Rule Pipeline**:
  - **Rule 1**: High-Value Anomaly (amounts > \$50,000 or > 5x baseline).
  - **Rule 2**: Velocity Check (sliding-window transaction frequency via Redis).
  - **Rule 3**: Geographic Velocity Impossibility (cross-border distance vs elapsed time).
  - **Rule 4**: FATF High-Risk Jurisdiction watchlist screening.
  - **Rule 5**: Device Fingerprint Anomaly.
- **Risk Score Brackets**: `LOW` (0–30), `MEDIUM` (31–60), `HIGH` (61–80), `CRITICAL` (81–100).
- Immediate automated intervention: `ALLOW`, `CHALLENGE (2FA)`, `REVIEW`, or `BLOCK & FREEZE`.

### 4. Enterprise OAuth 2.0 + OpenID Connect (RBAC)
- Support for 6 organizational roles with fine-grained permissions:
  - `ADMIN`, `OPERATIONS`, `FINANCE`, `RISK_ANALYST`, `CUSTOMER_SUPPORT`, `AUDITOR`.
- Dev Mock IdP with instant persona switching, JWKS endpoints, and RS256 token verification.

### 5. Real-Time Telemetry & WebSockets
- Socket.io bidirectional event bus streaming live transactions, balance movements, and high-risk alerts to the operations dashboard without page reloads.

---

## 📂 Monorepo Structure

```text
finpay360/
├── apps/
│   ├── web/                    # Angular 20+ SPA (Signals, Tailwind, Material, ECharts)
│   └── api/                    # NestJS API Gateway & Domain Micro-Modules
├── packages/
│   └── shared-types/           # Shared DTOs, Enums, Interfaces, and Event Contracts
├── infrastructure/
│   ├── docker/                 # Production Multi-Stage Dockerfiles & Nginx Config
│   ├── postgres/               # PostgreSQL schema & tuning
│   └── kafka/                  # Kafka topic provisioning
├── tools/
│   └── generate_historical_prs.py # Python Orchestrator for Historical Commits & PRs
├── docker-compose.yml          # Full stack orchestration (Postgres, Redis, Kafka, API, Web)
└── .env.example                # Documented environment variables template
```

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`
- Docker & Docker Compose (Optional for full stack)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/senodetech/fintechpay.git
cd fintechpay

# Install workspace dependencies
npm install

# Build shared contracts
npm run build --workspace=packages/shared-types
```

### 2. Run Backend API Gateway
```bash
# Start NestJS API in development mode
npm run start:dev --workspace=apps/api
```
- API Endpoint: `http://localhost:3000/api/v1`
- Swagger / OpenAPI Docs: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/api/v1/health`

### 3. Run Frontend Angular SPA
```bash
# Start Angular dev server
npm run start --workspace=apps/web
```
- Web Application: `http://localhost:4200`

### 4. Run Full Stack with Docker
```bash
docker compose up -d --build
```

---

## 🧪 Testing & Verification

```bash
# Run all backend unit & financial integrity tests
npm run test:api

# Run E2E concurrency & idempotency tests
npm run test:e2e

# Run Angular unit specs
npm run test:web
```

---

## 📚 API Endpoints Summary

| Method | Endpoint | Description | Guard / RBAC |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate or switch demo persona | Public |
| `GET` | `/api/v1/dashboard/metrics` | Executive KPIs and ECharts time-series | JWT Auth |
| `GET` | `/api/v1/customers` | Paginated customer directory | JWT / KYC Guard |
| `GET` | `/api/v1/customers/:id` | Customer 360 profile with accounts & risk | JWT Auth |
| `GET` | `/api/v1/accounts` | Multi-currency account balances | JWT Auth |
| `PATCH`| `/api/v1/accounts/:id/status` | Freeze or unfreeze banking account | `@Roles('ADMIN', 'OPERATIONS')` |
| `POST` | `/api/v1/payments` | Initiate payment with `Idempotency-Key` | `@Roles('ADMIN', 'OPERATIONS', 'FINANCE')` |
| `POST` | `/api/v1/payments/:id/refund`| Reverse settled payment in double-entry ledger | `@Roles('ADMIN', 'OPERATIONS', 'FINANCE')` |
| `GET` | `/api/v1/transactions` | Query immutable transaction ledger | JWT Auth |
| `GET` | `/api/v1/transactions/export/csv` | Stream ledger records to CSV | `@RequirePermissions('transactions:export')` |
| `GET` | `/api/v1/fraud/alerts` | Query fraud alert queue | `@Roles('ADMIN', 'RISK_ANALYST')` |
| `PATCH`| `/api/v1/fraud/alerts/:id/investigate` | Submit analyst determination | `@Roles('ADMIN', 'RISK_ANALYST')` |
| `GET` | `/api/v1/audit-logs` | Append-only security audit trail | `@Roles('ADMIN', 'AUDITOR')` |
| `GET` | `/api/v1/health` | Terminus infrastructure health probes | Public |

---

## 🛡️ Security & Compliance
- **Zero-Trust Token Validation**: RSA256 signature verification with token blacklisting in Redis.
- **Sensitive Financial Data Masking**: All PANs, account numbers, and PII are masked across logs and UI projections (`**** **** **** 4521`).
- **OWASP Top 10 Protections**: Helmet HTTP security headers, parameterized Prisma queries (zero SQL injection), rate limiting, and strict input DTO validation.

---

## 👥 Author & Committer
**Senapathy** (<senodetech@gmail.com>)
- GitHub: [senodetech/fintechpay](https://github.com/senodetech/fintechpay)
