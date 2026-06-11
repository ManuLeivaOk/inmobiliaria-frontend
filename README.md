# Frontend Inmobiliaria (Next.js 16)

App Router con autenticación integrada al backend NestJS.

## Requisitos

- Node.js >= 20
- Backend corriendo en `http://localhost:3000`

## Inicio

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

App: **http://localhost:3001**

## Arquitectura de auth

| Pieza | Ubicación | Función |
|-------|-----------|---------|
| Proxy API | `next.config.ts` | `/api/*` → backend (mismo origen, cookies OK) |
| Cliente HTTP | `src/lib/api/client.ts` | Bearer + `credentials: include` + refresh automático en 401 |
| Estado | `src/contexts/auth-context.tsx` | Access en memoria, usuario, login/logout |
| Middleware | `src/middleware.ts` | Protege `/dashboard` si no hay cookie refresh |
| UI | `login`, `register`, `dashboard`, `perfil` | Formularios y panel |

## Flujo

1. **Login/register** → access en memoria + cookie `refresh_token` (httpOnly).
2. Peticiones protegidas envían `Authorization: Bearer …`.
3. Si el access expira (401), el cliente llama `POST /api/auth/refresh` y reintenta.
4. **Logout** revoca refresh y redirige a `/login`.

## Scripts

- `npm run dev` — puerto **3001**
- `npm run build` / `npm run start`
