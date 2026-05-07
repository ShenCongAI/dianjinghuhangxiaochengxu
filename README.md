# 9100 Esports Backend MVP

This is the initial backend scaffold for the `9100 Esports` MVP.

## Stack

- `NestJS`
- `Prisma`
- `MySQL`
- `JWT`

## Current Status

This repository is already usable as a backend development starting point:

- Nest application structure is in place
- app/admin route groups are created
- JWT auth skeleton is available
- Prisma schema is included
- current data source is in-memory mock data for fast prototype linking

Important:

- Prisma schema is prepared, but persistence is not fully wired yet
- current endpoints return mock/in-memory data aligned with `api-spec.md`
- next phase should replace `MockDataService` with Prisma-backed repositories

## Scripts

```bash
pnpm install
pnpm prisma:generate
pnpm start:dev
```

## Environment

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

Required fields:

- `PORT`
- `APP_JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `ADMIN_DEFAULT_ACCOUNT`
- `ADMIN_DEFAULT_PASSWORD`
- `DATABASE_URL`

## API Groups

- App routes: `/api/v1/app/*`
- Admin routes: `/api/v1/admin/*`
- Swagger docs: `/docs`
- Health check: `/health`

## Recommended Next Steps

1. Replace mock services with Prisma repositories
2. Add real login flow for app users
3. Add migration and seed scripts
4. Split large controllers by domain if the API surface keeps growing
