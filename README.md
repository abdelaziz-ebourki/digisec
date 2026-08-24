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

Runs on `http://localhost:8080`.

### UI

```bash
cd ui
npm install
npm run dev
```

Runs on `http://localhost:5173`; `/api/*` requests are proxied to the backend.

## Branching

Work happens on the long-lived `rewrite` branch via feature branches (`rewrite/api-auth`, `rewrite/ui-layout`, ...). `main` holds the legacy PHP application until the rewrite reaches parity.
