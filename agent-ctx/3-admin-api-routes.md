# Task ID: 3 — Admin Panel API Routes

## Summary
Created all 7 admin panel API routes for the JMSA Builder CRM, covering authentication, user management, comment moderation, and dashboard statistics.

## Files Created

### 1. `src/lib/admin-auth.ts` — Admin Auth Helper
- `generateAdminToken()` — Creates a base64-encoded JSON token with `{ role: 'admin', exp: 24h }`
- `verifyAdminToken(token)` — Decodes and validates token (role check + expiry check)
- `getAdminToken(authHeader)` — Extracts `Bearer` token from Authorization header and validates it

### 2. `src/app/api/admin/login/route.ts` — Admin Login
- **POST** `/api/admin/login` — Accepts `{ email, password }`, validates against hardcoded credentials (`admin@jmsa.builder` / `JMSA@2024!`), returns `{ token, admin: { name, email } }` on success, 401 on failure, 400 on missing fields

### 3. `src/app/api/admin/users/route.ts` — List Users
- **GET** `/api/admin/users` — Returns all users ordered by `createdAt desc`, password field excluded via Prisma `select`. Requires admin token.

### 4. `src/app/api/admin/users/[id]/route.ts` — Update/Delete User
- **PUT** `/api/admin/users/:id` — Updates user fields (status, plan, domain, betaUrl, notes, role, name, business fields, social fields). Only includes fields explicitly provided in the request body. Returns updated user without password.
- **DELETE** `/api/admin/users/:id` — Deletes user by ID (cascades to related CMS data). Returns success message.
- Both require admin token.

### 5. `src/app/api/admin/comments/route.ts` — Comment Moderation
- **GET** `/api/admin/comments` — Returns all comments (including unapproved) ordered by `createdAt desc`
- **PUT** `/api/admin/comments` — Approve/reject comment via `{ id, isApproved: boolean }` body
- **DELETE** `/api/admin/comments?id=xxx` — Delete comment by ID (via query parameter)
- All require admin token.

### 6. `src/app/api/admin/stats/route.ts` — Dashboard Stats
- **GET** `/api/admin/stats` — Returns aggregate statistics in parallel:
  - `users.total`, `users.byStatus` (pending/analyzing/beta_ready/active), `users.recentRegistrations` (last 7 days)
  - `comments.total`, `comments.pending`
- Requires admin token.

## Design Decisions
- Token is simple base64-encoded JSON (no JWT library needed) with 24-hour expiry
- All admin endpoints verify token via `Authorization: Bearer <token>` header
- User update uses whitelist of allowed fields to prevent overwriting unexpected fields
- Password is always excluded from API responses (Prisma `select` or destructuring)
- Stats queries run in parallel via `Promise.all()` for performance
- DELETE for comments uses query parameter (`?id=xxx`) to avoid body parsing issues
- Structured logging prefixes (`[ADMIN LOGIN]`, `[ADMIN USERS]`, etc.) for debugging
- Proper HTTP status codes: 200, 400, 401, 404, 500

## Lint Results
- 0 new lint errors (only pre-existing errors in `keepalive.js` and `server-wrapper.js`)
- All files use TypeScript strict typing
