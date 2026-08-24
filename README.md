# DIGISEC

Club web application — monorepo containing the React frontend (`ui/`) and the Spring Boot REST API (`api/`).

## Layout

```
├── ui/    React 19 + TypeScript + Vite + Tailwind CSS
└── api/   Spring Boot (Java 21, Maven) + MySQL
```

## Prerequisites

- Node.js 22+
- JDK 25+ (Maven Wrapper included, no global Maven needed)
- MySQL 8+

## Development

### API

```bash
cd api
export DB_USERNAME=... DB_PASSWORD=... JWT_SECRET=... SMTP_HOST=... SMTP_USERNAME=... SMTP_PASSWORD=...
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`; Swagger UI at `/swagger-ui.html`.

| Env var | Default | Purpose |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `digisec` | MariaDB connection |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / empty | Database credentials |
| `JWT_SECRET` | dev-only fallback | HMAC signing key (32+ bytes) |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Access token lifetime |
| `SMTP_HOST` / `SMTP_PORT` | `localhost` / `587` | Outgoing mail server |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | empty | SMTP credentials |
| `FRONTEND_URL` | `http://localhost:5173` | Base URL used in verification links |
| `STORAGE_LOCATION` | `./uploads` | Activity image storage directory |
| `SEED_ADMIN` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `true` / `admin@digisec.local` / `ChangeMe123!` | Dev admin seeding |

### UI

```bash
cd ui
npm install
npm run dev
```

Runs on `http://localhost:5173`; `/api/*` requests are proxied to the backend.

## Branching

Work happens on the long-lived `rewrite/main` branch via feature branches (`rewrite/api-auth`, `rewrite/ui-layout`, ...). `main` holds the legacy PHP application until the rewrite reaches parity.
