# Pinspire — Pinterest-Style Frontend Demo

A polished, frontend-first visual discovery app inspired by Pinterest: masonry feed, fast search, category filters, save actions, pin detail view, profile view and a create-pin flow.

> Current stage: Frontend demo only. Data is local/seeded and saved pins use browser localStorage.

## What is already working

- Responsive Pinterest-style masonry feed
- Search across title, author, category, description and tags
- Category chips: Design, Architecture, Travel, Food, Fashion, Nature and Tech
- Save / unsave pins with browser persistence
- Pin detail modal with Like / Share / Board placeholders
- Profile screen with simple stats
- Create Pin modal using an image URL
- Mobile navigation and floating create button
- Clean React component structure ready to swap mock data for API data

## Tech stack

- React
- Vite
- JavaScript (ES modules)
- CSS (responsive, component-oriented)
- Lucide React icons

## Run locally

~~~bash
npm install
npm run dev
~~~

Open the local Vite URL shown in the terminal. The default development port is 5173.

For a production build:

~~~bash
npm run build
npm run preview
~~~

## Project structure

~~~text
pinterest_demo/
├── docs/
│   ├── API_CONTRACT.md
│   ├── BACKEND_ARCHITECTURE.md
│   └── ROADMAP.md
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
~~~

## Backend-ready direction

The frontend intentionally keeps the boundary simple so the backend can be added later without rewriting the UI:

~~~text
React UI
   ↓
API client layer
   ↓
REST API / auth middleware
   ↓
PostgreSQL + object storage
   ↓
search / recommendations / notifications workers
~~~

The planned backend is documented in docs/BACKEND_ARCHITECTURE.md, while docs/API_CONTRACT.md contains the first version of the API shapes the frontend will expect.

## Planned backend features

1. Authentication: register, login, refresh token, logout
2. Users and profiles
3. Pins, boards and board membership
4. Image upload to object storage (S3-compatible)
5. Feed API with pagination / cursor-based loading
6. Search and category filters
7. Save, like, follow and share actions
8. Comments and notifications
9. Recommendation service
10. Moderation and rate limiting

## API environment

Copy .env.example to .env when backend work starts:

~~~env
VITE_API_BASE_URL=http://localhost:8000/api/v1
~~~

No backend is required to run the current demo.

## Demo notes

- Images are remote Unsplash URLs for demonstration.
- Created pins are kept in React state for the current session.
- Saved pin IDs persist in localStorage.
- Like / Share / Board controls currently show demo feedback instead of calling an API.

## Future production concerns

Before production, add image upload validation, authentication and authorization, server-side ownership checks, content moderation, signed upload URLs, database indexes, pagination, caching, observability and automated tests.
