# Changelog

All notable changes to the KevBot infrastructure and cross-cutting concerns will be documented in this file.

This file tracks technical infrastructure changes (docker, CI/CD, monorepo structure, etc.). For user-facing release highlights and coordinated feature releases, see [RELEASE_NOTES.md](RELEASE_NOTES.md).

For component-specific technical changes, see:

- [API Changelog](api/CHANGELOG.md)
- [Frontend Changelog](frontend/CHANGELOG.md)
- [Database Changelog](db/CHANGELOG.md)
- [Tools Changelog](tools/CHANGELOG.md)
- [GCloud Changelog](gcloud/CHANGELOG.md)

---

## [2.0.0-beta.1] (2025-10-10)

### Infrastructure

- Initial release-please setup for monorepo with 6 components (kevbot, api, db, frontend, tools, gcloud)
- Made commit scopes optional in conventional commits
- Configured skip-github-release for all components (manual releases via RELEASE_NOTES.md)
- Added root-level version tracking with VERSION.txt
- Set kevbot to prerelease (beta) mode - v2 is the complete rewrite

### Historical Context

This repo represents v2 of KevBot - a complete rewrite from the original Discord bot (v1.0.0 - v1.2.0) to a modern web-based music platform. The v2 beta reflects that this is active development of the new architecture. Historical Discord bot releases are documented in [RELEASE_NOTES.md](RELEASE_NOTES.md).
