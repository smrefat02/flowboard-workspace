# Trello Codex

Production-ready Trello-style project management system built with Laravel 12 + React/TypeScript.

## Tech Stack
- Backend: PHP 8.4+, Laravel 12, Eloquent ORM, UUID primary keys, Sanctum
- Frontend: React, TypeScript, TailwindCSS, Vite, dnd-kit, Radix/shadcn-style components
- Database: MySQL (primary), SQLite/PostgreSQL supported with driver changes

## Architecture
Backend module:
- `app/Modules/Trello/Controllers`
- `app/Modules/Trello/Services`
- `app/Modules/Trello/Repositories`
- `app/Modules/Trello/Models`
- `app/Modules/Trello/Policies`
- `app/Modules/Trello/Requests`
- `app/Modules/Trello/DTOs`
- `app/Modules/Trello/Migrations`
- `app/Modules/Trello/Routes`
- `app/Modules/Trello/Resources`

Frontend module:
- `resources/js/modules/trello/pages`
- `resources/js/modules/trello/components`
- `resources/js/modules/trello/layouts`
- `resources/js/modules/trello/hooks`
- `resources/js/modules/trello/services`
- `resources/js/modules/trello/types`

## Features
- Workspaces: create, view, invite members
- Boards: create/update/delete, visibility, board member management
- Lists: create/update/delete, reorder
- Cards: create/update/delete, move/reorder across lists
- Card metadata: assignees, labels, due dates, comments, attachments
- Activity timeline: mutation events logged for board/list/card/comment/label/attachment/member actions
- Auth: Sanctum token API (`/api/auth/*`)
- Operational command: due-date notification dispatch (`trello:notify-due-cards`)

## API
Auth:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Workspace/Board:
- `GET|POST /api/workspaces`
- `GET /api/workspaces/{workspace}`
- `POST /api/workspaces/{workspace}/invite`
- `GET /api/workspaces/{workspace}/boards`
- `POST /api/boards`
- `GET|PATCH|DELETE /api/boards/{board}`
- `GET|POST /api/boards/{board}/members`
- `DELETE /api/boards/{board}/members/{user}`

Lists/Cards:
- `POST /api/boards/{board}/lists`
- `POST /api/boards/{board}/lists/reorder`
- `PATCH|DELETE /api/lists/{list}`
- `POST /api/lists/{list}/cards`
- `GET|PATCH|DELETE /api/cards/{card}`
- `POST /api/cards/reorder`

Comments/Labels/Attachments:
- `POST /api/cards/{card}/comments`
- `DELETE /api/cards/{card}/comments/{comment}`
- `POST /api/boards/{board}/labels`
- `PATCH|DELETE /api/labels/{label}`
- `POST /api/cards/{card}/attachments`
- `DELETE /api/attachments/{attachment}`

## Setup (Local)
1. Install dependencies
   - `composer install`
   - `npm install`
2. Configure `.env` (MySQL example)
   - `DB_CONNECTION=mysql`
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`
   - `DB_DATABASE=trello-codex`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=refat123`
3. Generate key and migrate
   - `php artisan key:generate`
   - `php artisan migrate --seed`
4. Link public storage
   - `php artisan storage:link`
5. Run app
   - `php artisan serve`
   - `npm run dev`

## Testing & Quality
- Full tests: `php artisan test`
- Typecheck: `npm run typecheck`
- Frontend build: `npm run build`

## DevOps & Docs
- OpenAPI spec: `docs/openapi.yaml`
- GitHub Actions CI: `.github/workflows/ci.yml`
- Docker: `Dockerfile` + `docker-compose.yml`

## Scheduled/Ops Command
- Notify due cards in next 24h:
  - `php artisan trello:notify-due-cards`

## Notes
- Ensure `pdo_mysql` is enabled for PHP.
- API routes are protected with `auth:sanctum` except login.
