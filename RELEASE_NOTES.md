# KevBot Release Notes

Welcome to KevBot! This document highlights major features and changes for coordinated project releases. For technical details and component-specific changes, see the individual CHANGELOG files in each component directory.

---

## About This Document

**Purpose**: User-facing highlights for major KevBot releases

**Audience**: End users, stakeholders, and anyone interested in what's new

**Technical Details**: For detailed, technical changelogs, see:

- [Infrastructure Changelog](CHANGELOG.md) - Root-level infrastructure changes
- [API Changelog](api/CHANGELOG.md)
- [Database Changelog](db/CHANGELOG.md)
- [Frontend Changelog](frontend/CHANGELOG.md)
- [Tools Changelog](tools/CHANGELOG.md)
- [GCloud Changelog](gcloud/CHANGELOG.md)

---

## [Unreleased]

### v2.0 Beta (In Development)

KevBot v2 is a complete rewrite from the original Discord bot to a modern web-based music platform:

- **New**: Web-based UI with Next.js
- **New**: REST API for programmatic access
- **New**: Cloud storage integration
- **New**: Advanced playlist management
- **Improved**: Modern architecture with independent component versioning

Currently in beta - features and APIs may change before stable release.

---

## Historical Releases

### [v1.2.0] - 2024-05-05

**Major Updates:**

- Upgraded to discord.js v14 for better performance and features
- Added SQL CA SSL support for enhanced database security
- Major code refactoring for improved maintainability

### [v1.1.1] - 2021-12-21

**Bug Fixes:**

- Fixed issue where greeting files of `type` category were not playing correctly

**Documentation:**

- Updated README with new greeting functionality details

### [v1.1.0] - 2021-12-20

**New Features:**

- Greeting command now supports categories!
  - Set your greeting to a category and a random file from that category will play when entering a Discord channel
  - Adds variety and fun to user greetings

### [v1.0.0] - 2021-04-18

**Project Milestone:**

- KevBot is now public on GitHub! 🎉
- Comprehensive README and documentation added

**New Features:**

- Farewells: Play audio clips when leaving a Discord server (mirrors greeting functionality)
- New categories: `playhistory` and `uploadhistory` for tracking user activity

**Improvements:**

- Various bug fixes and code quality improvements
- Enhanced stability and performance

---

## Component Versioning

KevBot uses independent component versioning:

- Each component (api, db, frontend, etc.) has its own version number
- Components release independently based on changes
- This document highlights coordinated releases where multiple components come together

**Current Component Versions:**

- API: See [api/CHANGELOG.md](api/CHANGELOG.md)
- Database: See [db/CHANGELOG.md](db/CHANGELOG.md)
- Frontend: See [frontend/CHANGELOG.md](frontend/CHANGELOG.md)
- Tools: See [tools/CHANGELOG.md](tools/CHANGELOG.md)
- GCloud: See [gcloud/CHANGELOG.md](gcloud/CHANGELOG.md)

---

## Release Process

### Automated Component Versioning

1. Changes are merged to `main` with conventional commit messages
2. Release PRs are automatically created by release-please
3. When ready, release PRs are merged to update versions and component CHANGELOGs
4. Tags are created automatically (e.g., `api-v2.1.0`, `kevbot-v1.0.1`)
5. **No automatic GitHub Releases** - all components use `skip-github-release: true`

### Manual User-Facing Releases

Major coordinated releases are published manually:

1. Review component changelogs to identify significant features
2. Update this document (RELEASE_NOTES.md) with user-facing highlights
3. Create a manual GitHub Release when appropriate
4. Link to relevant component tags and changelogs

For more information, see [CONTRIBUTING.md](CONTRIBUTING.md).
