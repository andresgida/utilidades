# UTILIDADES — Enterprise Dashboard Platform

A modular, production-ready web platform built with **Angular 18+**, **.NET 9**, and **PostgreSQL**.

---

## Architecture

```
utilidades/
├── backend/               # .NET 9 Clean Architecture / Hexagonal / DDD / CQRS
│   ├── src/
│   │   ├── Utilidades.Domain/
│   │   ├── Utilidades.Application/
│   │   ├── Utilidades.Infrastructure/
│   │   └── Utilidades.API/
│   └── tests/
│       ├── Utilidades.Domain.Tests/
│       ├── Utilidades.Application.Tests/
│       └── Utilidades.Integration.Tests/
├── frontend/              # Angular 18 Standalone + TailwindCSS + GSAP
│   └── src/app/
│       ├── core/          # Auth, interceptors, guards, error handling
│       ├── domain/        # Domain models / interfaces
│       ├── application/   # Services, state management
│       ├── infrastructure/# API clients, storage, adapters
│       ├── shared/        # Reusable components, directives, pipes
│       └── features/      # Modules: auth, dashboard, vehicles, devices
├── docker/                # Nginx config, Postgres init
├── docs/                  # Architecture diagrams, API docs, ER diagram
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml
└── docker-compose.prod.yml
```

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | Angular 18, Signals, Standalone, Material, TailwindCSS, GSAP, Lottie, RxJS |
| Backend     | .NET 9, ASP.NET Core Web API, EF Core 9, MediatR, FluentValidation, AutoMapper, Serilog |
| Database    | PostgreSQL 16 |
| Auth        | JWT Access Token + Refresh Token Rotation + BCrypt |
| Charts      | ApexCharts / ng-apexcharts |
| Containers  | Docker, Docker Compose |
| Testing     | xUnit, Jest, Playwright |
| CI/CD       | GitHub Actions |

---

## Modules

| #  | Module | Description |
|----|--------|-------------|
| 01 | **Vehicle Mileage Control** | Track mileage across multiple vehicles, calculate daily/annual averages |
| 02 | **iPhone Cycle Control** | Monitor battery cycles for Apple devices, project health status |

---

## Getting Started

### Prerequisites
- Docker Desktop ≥ 4.x
- .NET 9 SDK (for local backend dev)
- Node.js 20 LTS (for local frontend dev)
- PowerShell 7+ or bash

### Run with Docker (recommended)

```bash
# From project root
docker-compose up --build
```

Services:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:5000
- **Swagger:** http://localhost:5000/swagger
- **PostgreSQL:** localhost:5432

### Run Locally (without Docker)

**Backend:**
```bash
cd backend
dotnet restore
dotnet ef database update --project src/Utilidades.Infrastructure --startup-project src/Utilidades.API
dotnet run --project src/Utilidades.API
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
POSTGRES_DB=utilidades_db
POSTGRES_USER=utilidades_user
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_ISSUER=https://utilidades.app
JWT_AUDIENCE=https://utilidades.app
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# App
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:5000
```

---

## Security Features

- JWT Access Token (15 min expiry) + Refresh Token Rotation (7 days)
- Token revocation & family invalidation
- BCrypt password hashing (cost factor 12)
- CSRF protection
- XSS protection headers
- Rate limiting (per IP + per user)
- Global exception handling
- Security audit logging
- CORS configurable per environment
- HTTPS enforced in production

---

## Database

**PostgreSQL 16** with:
- Soft delete (`IsDeleted`, `DeletedAt`)
- Full audit trail (`CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`)
- Optimistic concurrency (`RowVersion`)
- Indexed foreign keys
- Check constraints

---

## Development Phases

| Phase | Scope |
|-------|-------|
| **P1** | Auth system (login, register, JWT, refresh tokens) |
| **P2** | Vehicle Mileage module (CRUD + statistics + charts) |
| **P3** | iPhone Cycle module (CRUD + statistics + health projection) |
| **P4** | Admin panel (user management, audit logs) |
| **P5** | MFA (TOTP), email notifications, export (PDF/Excel) |
| **P6** | Mobile app (Capacitor), PWA, push notifications |

---

## Future Roadmap

- Multi-tenancy (Organizations/Workspaces)
- Expense Tracker module
- Document Vault module
- AI-powered insights (OpenAI integration)
- Real-time updates (SignalR)
- Native mobile app (Capacitor + iOS/Android)
- Localization (i18n)

---

## License

Private — All rights reserved.
