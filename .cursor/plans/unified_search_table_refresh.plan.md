---
name: Unified Search Table Refresh
overview: Rework unified search to deliver a single paginated result stream across entity types with infinite-scroll UI and dedicated routes.
todos:
  - id: routing-overhaul
    content: Implement new search/user/playlist routes
    status: completed
  - id: table-refresh
    content: Refine unified table layouts & playback UX
    status: completed
    dependencies:
      - routing-overhaul
  - id: profile-views
    content: Build user & playlist track views
    status: completed
    dependencies:
      - routing-overhaul
---

# Unified Search Table Refresh

## Backend

- Extend search parsing (`api/src/schemas/searchSchemas.ts`) to accept `filter` (all/tracks/playlists/users), plus `limit` and `offset`, while keeping playlist/user constraints.
- Rework the search controller/service (`api/src/controllers/searchController.ts`, `api/src/services/searchService.ts`) and helper queries (`api/src/services/tracksService.ts`, `api/src/services/playlistsService.ts`, `api/src/services/usersService.ts`) to emit one paginated `results[]` array tagged with entity type and relevance/browse ordering metadata.

## Frontend API

- Update shared types and API client (`frontend/src/lib/types.ts`, `frontend/src/lib/api-client.ts`) so the browser consumes the new mixed payload and exposes filter/pagination params.

## Frontend UI

- Rebuild the library experience (`frontend/src/components/library-search-panel.tsx`, `frontend/src/components/track-search-bar.tsx`, `frontend/src/app/(dashboard)/tracks/page.tsx`) to render a unified table with type indicators, mutually exclusive filters (All/Tracks/Playlists/Users), and infinite scroll via `useInfiniteScroll`.
- Ensure selecting playlist/user rows updates the filter badges/context.

### Next Enhancements

- Restore inline playback affordances in the unified table (hover play icon, click-to-play integration with music player).
- Specialise table rendering:
  - When viewing `filter=all`, collapse columns to a simplified layout (index, art placeholder, name with type badge, relevance).
  - When viewing filtered track lists (global `filter=tracks`, playlist page, user page), show duration column (ms) and reuse track row actions.
- Add art placeholder column for future thumbnails.
- Wire playlist/user row interactions to navigate to dedicated pages.
- Implement per-entity pages routed via the App Router:
  - `/search`, `/search/[query]`, `/search/[query]/(tracks|playlists|users)` capturing filter state.
  - `/playlist/[id]` showing playlist metadata + filtered tracks.
  - `/user/[id]` showing uploads; add `/myuploads` redirecting to current user page.
  - Ensure URL state syncs with search inputs and filter buttons.

## Sidebar

- Update the sidebar (`frontend/src/components/side-bar.tsx`) to list only the authenticated user's playlists and keep reset actions synchronized with the table view.

## Data Flow

```mermaid
flowchart TD
  sidebarFilters[Sidebar Filters]
  searchControls[Search Controls]
  unifiedSearch[/v1/search]
  trackSvc[tracksService]
  playlistSvc[playlistsService]
  userSvc[usersService]
  resultsTable[Unified Results Table]

  sidebarFilters --> searchControls
  searchControls --> unifiedSearch
  unifiedSearch --> trackSvc
  unifiedSearch --> playlistSvc
  unifiedSearch --> userSvc
  unifiedSearch --> resultsTable

```