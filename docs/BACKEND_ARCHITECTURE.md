# Backend Architecture — Planned Phase

This document defines the backend boundary before implementation so the current frontend can evolve without a large rewrite.

## 1. Suggested stack

- API: FastAPI (Python) or NestJS (TypeScript)
- Database: PostgreSQL
- Cache / jobs: Redis
- Object storage: AWS S3 / Cloudflare R2 / MinIO for local development
- Search: PostgreSQL full-text first; OpenSearch later when scale justifies it
- Authentication: JWT access token + rotating refresh token
- Deployment: Docker + managed container platform

## 2. Service boundaries

Start as a modular monolith rather than multiple microservices.

~~~text
                    ┌──────────────────┐
                    │   React Frontend │
                    └─────────┬────────┘
                              │ HTTPS
                    ┌─────────▼────────┐
                    │ API Gateway /    │
                    │ Backend App      │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐           ┌────▼────┐          ┌─────▼─────┐
   │  Auth   │           │  Pins   │          │   Social  │
   │ Users   │           │ Boards  │          │ Follow    │
   └────┬────┘           └────┬────┘          └─────┬─────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                       ┌──────▼──────┐
                       │ PostgreSQL  │
                       └──────┬──────┘
                              │
                    ┌─────────▼─────────┐
                    │ Redis / Job Queue │
                    └─────────┬─────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
              recommendation        notification
                 worker                 worker
                   │                     │
                   └──────────┬──────────┘
                              │
                     ┌────────▼────────┐
                     │ S3 / R2 Images  │
                     └─────────────────┘
~~~

## 3. Core entities

### users
- id UUID
- username
- display_name
- email
- password_hash
- avatar_url
- bio
- created_at
- updated_at

### pins
- id UUID
- owner_id → users
- title
- description
- image_url
- thumbnail_url
- category
- created_at
- updated_at

### boards
- id UUID
- owner_id → users
- name
- description
- privacy
- created_at

### board_pins
- board_id
- pin_id
- saved_at

### likes
- user_id
- pin_id
- created_at

### follows
- follower_id
- following_id
- created_at

### comments
- id
- user_id
- pin_id
- body
- created_at

## 4. API versioning

Prefix endpoints with /api/v1 from the start.

~~~text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/me
GET    /api/v1/feed?cursor=...
GET    /api/v1/pins/:id
POST   /api/v1/pins
POST   /api/v1/pins/:id/save
DELETE /api/v1/pins/:id/save
GET    /api/v1/boards
POST   /api/v1/boards
POST   /api/v1/boards/:id/pins
GET    /api/v1/search?q=...
~~~

## 5. Image upload flow

1. Frontend asks backend for an upload URL.
2. Backend validates the authenticated user and requested file type/size.
3. Backend returns a short-lived signed URL.
4. Browser uploads directly to S3/R2.
5. Frontend sends the resulting object key when creating the pin.
6. Backend persists the canonical image record.
7. Worker creates optimized thumbnails/web variants if required.

## 6. Feed and pagination

Use cursor-based pagination rather than offset for the main feed.

~~~json
{
  "items": [
    { "id": "pin_123", "title": "Sample", "image_url": "https://cdn.example.com/pin.jpg" }
  ],
  "next_cursor": "..."
}
~~~

## 7. Recommendation path

Start with deterministic signals before adding ML:

- category preference
- saved boards
- recently viewed pins
- followed creators
- engagement history

Later, add a recommendation worker that produces a ranked feed candidate set. Keep this behind an API contract so the frontend does not care how recommendations are generated.

## 8. Security checklist

- Hash passwords with Argon2/bcrypt.
- Validate MIME type and file size server-side.
- Scan uploads for malicious content.
- Use signed URLs for private assets.
- Enforce ownership on edit/delete/save-board operations.
- Rate-limit login, create-pin and search endpoints.
- Add CORS allow-list instead of * in production.
- Store secrets only in server-side environment/secret management.
- Add audit logs for moderation-sensitive actions.

## 9. Observability

Baseline production telemetry should include structured request logs, error tracking, API latency percentiles, database timings, queue depth, image upload failures and authentication failure rates.

## 10. Migration strategy from this demo

1. Move seedPins into a service response fixture.
2. Add src/api/client.js and one resource module per domain.
3. Replace localStorage saves with POST/DELETE /pins/:id/save.
4. Replace create-pin state with upload URL → create-pin request.
5. Add auth context and protected routes.
6. Add React Query or another server-state library once API calls become numerous.
