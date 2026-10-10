# TeamFlow API — CSE 341 W05

TeamFlow is a task and project management REST API. Week 05 implements CRUD for the first two feature collections: **projects** and **tasks**. GitHub OAuth, users, comments, and memberships are planned for later weeks.

## Requirements

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Git and GitHub account

## Setup

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `DB_NAME`.

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open:
   - API root: http://localhost:8080/
   - Swagger UI: http://localhost:8080/api-docs
   - OpenAPI JSON: http://localhost:8080/api-docs.json
   - Health: http://localhost:8080/api/health

5. Run tests:

   ```bash
   npm test
   ```

## Endpoints

### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Optional filters: `status`, `visibility`.

### Tasks

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Optional filters: `projectId`, `status`, `priority`, `assignedTo`.

## Example project body

```json
{
  "name": "Website redesign",
  "description": "Redesign the company website.",
  "status": "active",
  "startDate": "2026-10-10T00:00:00.000Z",
  "dueDate": "2026-12-01T00:00:00.000Z",
  "visibility": "private"
}
```

## Example task body

Replace `projectId` with the `_id` returned when creating a project.

```json
{
  "projectId": "66b123456789012345678901",
  "title": "Create API documentation",
  "description": "Document all project endpoints.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-11-01T00:00:00.000Z"
}
```

## Important W05 scope note

Authentication and authorization are not implemented in this initial W05 version. The `ownerId` and `createdBy` fields are currently set to `null` placeholders. Before production use and before the final W07 submission, add GitHub OAuth and enforce ownership and membership checks on protected routes.

## Render deployment

- Build command: `npm install`
- Start command: `npm start`
- Set `MONGODB_URI`, `DB_NAME`, and `NODE_ENV=production` in Render Environment.
- Set `RENDER_EXTERNAL_URL` to your service base URL if you want Swagger's server selector to show the deployed URL.
- After deployment, verify `/api-docs` and `/api/health`.
