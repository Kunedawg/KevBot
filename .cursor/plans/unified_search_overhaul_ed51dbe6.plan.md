---
name: Unified Search Overhaul
overview: Add backend + frontend support for unified search across tracks, playlists, and users with playlist-constrained track filters and updated UI.
todos:
  - id: backend-search
    content: Add search schemas/services/routes
    status: completed
  - id: frontend-api
    content: Update API client/types for unified search
    status: completed
    dependencies:
      - backend-search
  - id: frontend-ui
    content: Replace track-only view with unified search UI
    status: completed
    dependencies:
      - frontend-api
  - id: sidebar-playlists
    content: Wire sidebar to real playlists & filters
    status: completed
    dependencies:
      - frontend-ui
---

# Unified Search Overhaul

## Backend Enhancements

- Expand track querying ([`api/src/schemas/tracksSchemas.ts`](api/src/schemas/tracksSchemas.ts), [`api/src/services/tracksService.ts`](api/src/services/tracksService.ts)) to accept optional `playlist_id` and `user_id` filters while keeping current search modes intact.
- Add playlist/user search helpers ([`api/src/services/playlistsService.ts`](api/src/services/playlistsService.ts), [`api/src/services/usersService.ts`](api/src/services/usersService.ts)) and a new aggregator service/controller/route (e.g. [`api/src/services/searchService.ts`](api/src/services/searchService.ts), [`api/src/controllers/searchController.ts`](api/src/controllers/searchController.ts), [`api/src/routes/searchRoutes.ts`](api/src/routes/searchRoutes.ts)) that exposes `GET /v1/search` returning grouped results and playlist-scoped track matches.
- Create a migration to add supporting btree/fulltext indexes for playlist and user search (mirroring [`db/migration/migrations/2.11.0__add_track_search_indexes.sql`](db/migration/migrations/2.11.0__add_track_search_indexes.sql)) so unified queries stay performant.
- Introduce a dedicated search query schema (new [`api/src/schemas/searchSchemas.ts`](api/src/schemas/searchSchemas.ts)) and wire route registration via [`api/src/app.ts`](api/src/app.ts) and [`api/src/services/index.ts`](api/src/services/index.ts).

## Frontend API & Types

- Extend shared types to cover playlists/users/search response payloads ([`frontend/src/lib/types.ts`](frontend/src/lib/types.ts)).
- Update the browser API client ([`frontend/src/lib/api-client.ts`](frontend/src/lib/api-client.ts)) to call `/v1/search` with filters (query text, entity toggles, optional playlist_id) and surface helpers for playlist fetches.

## Frontend UI/UX

- Refactor the existing track search bar into a reusable library search component with entity filter toggles and playlist selector ([`frontend/src/components/track-search-bar.tsx`](frontend/src/components/track-search-bar.tsx) → new `global-search` component).
- Replace the infinite track list view ([`frontend/src/components/infinite-track-list.tsx`](frontend/src/components/infinite-track-list.tsx), `[frontend/src/app/(dashboard)/tracks/page.tsx](frontend/src/app/\\\\\\(dashboard)/tracks/page.tsx)`) with a unified results panel showing sections for tracks, playlists, and users, including user selection flow that loads their uploads via the new track filters.
- Update the sidebar ([`frontend/src/components/side-bar.tsx`](frontend/src/components/side-bar.tsx)) to load real playlists, allow selecting one to constrain track results, and expose a quick link for "My uploads" (current user filter).

## Data Flow

```mermaid
flowchart TD
  ui[Dashboard Search UI]
  sidebar[Sidebar Playlist Filter]
  searchEndpoint[/v1/search]
  trackSvc[tracksService]
  playlistSvc[playlistsService]
  userSvc[usersService]

  ui -- query + filters --> searchEndpoint
  sidebar -- playlist_id --> ui
  searchEndpoint --> trackSvc
  searchEndpoint --> playlistSvc
  searchEndpoint --> userSvc
  trackSvc -- playlist/user scoped results --> ui
  playlistSvc -- playlist matches --> ui
  userSvc -- user matches --> ui






```