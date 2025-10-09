# Contributing to KevBot

Thank you for contributing to KevBot! This guide will help you understand our development workflow and release process.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [PR Title Guidelines](#pr-title-guidelines)
- [Release Process](#release-process)
- [Project Structure](#project-structure)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js >= 20.17.0 (for local development)

### Starting the Development Environment

```bash
# Start all services
docker compose --env-file dev.env -f docker-compose.dev.yml up --build

# Start a specific service
cd api  # or frontend, db, tools, gcloud
docker compose -f docker-compose.yml up

# Full reset
docker compose -f docker-compose.dev.yml down -v
```

### Environment Files

The project uses multiple environment files:

- `.env` - General environment configuration
- `dev.env` - Development-specific configuration
- `local_dev.env` - Local overrides (not committed)

Keep these aligned and document any new variables.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/my-awesome-feature
# or
git checkout -b fix/my-bug-fix
```

### 2. Make Your Changes

**Important**: During development, commit freely! WIP commits, quick fixes, experimental code - it's all fine. Your individual commit messages don't need to follow any specific format.

```bash
# These are all perfectly acceptable:
git commit -m "wip"
git commit -m "trying something"
git commit -m "fix bug"
git commit -m "more changes"
```

**Why?** We use squash merging, which means all your commits will be combined into a single commit when merged. Only your PR title matters!

### 3. Open a Pull Request

When you're ready, open a PR against `main`. **This is where the format matters!**

#### PR Title Format (Required)

Your PR title MUST follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

**Type:**

- `feat` - New feature (triggers minor version bump)
- `fix` - Bug fix (triggers patch version bump)
- `chore` - Maintenance, refactoring, dependencies (no version bump)
- `docs` - Documentation changes only
- `test` - Test-related changes
- `ci` - CI/CD changes
- `refactor` - Code refactoring

**Scope** (required, must be one of):

- `project` - Root-level project changes
- `api` - Backend API changes
- `frontend` - Frontend application changes
- `db` - Database schema or migrations
- `gcloud` - Google Cloud Storage service
- `tools` - Development tools and scripts
- `bot` - Discord bot (planned)

**Breaking Changes:**
Add `!` after the scope for breaking changes (triggers major version bump):

```
feat(api)!: remove legacy authentication endpoint
```

**Examples:**

- `feat(api): add track streaming endpoint`
- `fix(frontend): resolve player controls not responding`
- `chore(db): update migration scripts`
- `docs(project): update README with new setup instructions`
- `feat(api)!: change user authentication to JWT only`

#### Why This Matters

Your PR title becomes the commit message on `main` and is used to:

1. Generate changelogs automatically
2. Determine version bumps (major, minor, patch)
3. Keep git history clean and readable

### 4. PR Review and Merge

- All PRs must be **squash merged** (configured in GitHub settings)
- Status checks must pass (linting, tests, CI)
- Code review is recommended but not strictly enforced

## Release Process

Our release process is semi-automated using [release-please](https://github.com/googleapis/release-please):

### How It Works

1. **Merge a PR**: When a PR is squash merged to `main`, release-please analyzes the commit message (your PR title)

2. **Release PR Created**: release-please automatically creates or updates a "Release PR" that:

   - Generates/updates CHANGELOGs for affected components
   - Bumps version numbers based on conventional commits
   - Lists all changes since the last release

3. **Review the Release PR**: Check the auto-generated changelog and versions

4. **Merge the Release PR**: When ready, merge it to trigger:
   - GitHub release creation
   - Git tags (e.g., `api@2.1.0`, `db@1.0.1`)
   - Deployment workflows (if configured)

### Component Versioning

Each component is versioned independently:

- `api@2.0.0` - Backend API
- `db@1.0.0` - Database migrations
- `frontend@0.1.0` - Frontend application
- `tools@1.0.0` - Development tools
- `gcloud@1.0.0` - GCS service

For major coordinated releases, we also create project-level tags (e.g., `v3.0.0`) and update the root `RELEASE_NOTES.md` with user-facing highlights.

### Documentation

**Component CHANGELOGs** (auto-generated):

- `api/CHANGELOG.md`
- `db/CHANGELOG.md`
- `frontend/CHANGELOG.md`
- `tools/CHANGELOG.md`
- `gcloud/CHANGELOG.md`

These are technical, detailed changelogs generated from PR titles. Don't edit these manually!

**RELEASE_NOTES.md** (manual, user-facing):

- Lives at project root
- High-level highlights for major releases
- Human-written, focused on user impact
- Updated manually for coordinated releases

## Project Structure

```
KevBot/
├── .github/
│   ├── workflows/     # CI/CD workflows
│   └── release-please-config.json
├── api/               # Express + TypeScript backend
│   ├── src/
│   ├── tests/
│   └── package.json
├── db/                # SQL migrations (semver)
│   ├── migration/
│   └── VERSION.txt
├── frontend/          # Next.js 15 App Router
│   ├── src/
│   └── package.json
├── gcloud/            # Fake GCS service
│   └── VERSION.txt
├── tools/             # Helper scripts and containers
│   └── VERSION.txt
└── README.md
```

### Component Guidelines

**API** (`api/`):

- TypeScript, Express
- Run: `npm run dev`
- Test: `npm run test`
- Build: `npm run build && npm start`

**Frontend** (`frontend/`):

- Next.js 15, TypeScript, Tailwind
- Run: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build && npm run start`

**Database** (`db/`):

- SQL migrations in `migration/migrations/`
- Named: `<version>__slug.sql`
- Forward-only, no rollbacks

**Tools** (`tools/`):

- Reusable scripts and helper containers
- Include execute bits and README notes

## Git Workflow Rules

1. **Main branch**: Long-lived, protected branch
2. **Feature branches**: Short-lived, follow `feat/name` or `fix/name` pattern
3. **Commits**: No format required in feature branches (they get squashed)
4. **PR titles**: MUST follow conventional commits (enforced by CI)
5. **Merging**: Always squash merge (no merge commits or rebase merges)
6. **Linear history**: Maintained automatically through squash merging

## Testing

- **API**: Jest + Testcontainers against disposable databases
- **Frontend**: Playwright/RTL (planned)
- **DB**: Test migrations against compose database before PRs
- **CI**: All tests run automatically on PR creation

## Need Help?

- Check existing PRs for examples
- Review the [README](README.md) for setup instructions
- Ask in PR comments or discussions

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Release Please](https://github.com/googleapis/release-please)
