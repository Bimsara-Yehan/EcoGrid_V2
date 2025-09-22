# Unified Login Setup

## Backend

Env (`backend/.env`):

```
MONGO_URI=...
DB_NAME=EcoGrid_V2
NO_AUTH=0
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
# DEV_UID=... (dev only when NO_AUTH=1)
```

Run:

```
cd backend
npm i
npm run dev
```

Seed sample users (optional):

```
npm run seed:auth
# driver@example.com / Passw0rd!
# scheduler@example.com / Passw0rd!
```

## Frontend

Env (`frontend/.env.local`):

```
VITE_API_BASE=http://localhost:5000
VITE_REQUIRE_LOGIN=1
VITE_ENABLE_SCHEDULER=1
```

Run:

```
cd frontend
npm i
npm run dev
```

## Login

- POST `/api/auth/login` with `{ email, password }` → JWT.
- Frontend stores token and sends `Authorization: Bearer <token>`.
- Roles gate routes: driver → `/driver`, scheduler → `/scheduler`.


