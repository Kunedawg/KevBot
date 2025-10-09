# GitHub Repository Settings

This document describes the required GitHub repository settings to support our release process and development workflow.

## Required Settings

### Branch Protection Rules (main)

Navigate to: **Settings → Branches → Branch protection rules → main**

Enable the following:

#### Branch Protection

- ✅ **Require pull request before merging**
  - Require approvals: 0 (or 1 for stricter review)
  - Dismiss stale pull request approvals when new commits are pushed: Optional

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging: Optional (can cause extra work)
  - **Required status checks:**
    - `pr-lint` (from lint-pr-title.yml)
    - `run_api_tests` (from continuos-integration.yml)
    - Any other CI jobs you want to require

#### Merge Options

- ⚠️ **Do NOT check**: "Allow merge commits"
- ⚠️ **Do NOT check**: "Allow rebase merging"
- ✅ **ONLY enable**: "Allow squash merging"

#### Merge Button Settings

Under squash merging options:

- ✅ **Default commit message**: "Pull request title"
- ✅ **Default commit description**: "Pull request title and description" (or "Blank")

This ensures the PR title (which follows conventional commits) becomes the commit message on main.

### General Settings

Navigate to: **Settings → General**

#### Pull Requests

Scroll to "Pull Requests" section:

**Merge button options:**

- ⚠️ **Uncheck**: "Allow merge commits"
- ⚠️ **Uncheck**: "Allow rebase merging"
- ✅ **Check**: "Allow squash merging"

**Squash merge settings:**

- ✅ **Default commit message**: "Pull request title"
- ✅ **Default description**: "Pull request title and description" (optional)

**After merge:**

- ✅ **Automatically delete head branches**: Recommended (keeps repo clean)

#### Features

- ✅ Enable Issues (if not already enabled)
- ✅ Enable Discussions (optional, for community engagement)

### Actions Permissions

Navigate to: **Settings → Actions → General**

#### Workflow permissions

- ✅ **Read and write permissions**: Required for release-please to create PRs and releases
- ✅ **Allow GitHub Actions to create and approve pull requests**: Required for release-please

Alternative (more restrictive):

- Use a Personal Access Token (PAT) with `repo` scope
- Add it as a secret: `RELEASE_PLEASE_TOKEN`
- Update `.github/workflows/release-please.yml` to use it:
  ```yaml
  token: ${{ secrets.RELEASE_PLEASE_TOKEN }}
  ```

### Secrets (If Using Custom Token)

Navigate to: **Settings → Secrets and variables → Actions**

Add secret:

- **Name**: `RELEASE_PLEASE_TOKEN`
- **Value**: Personal Access Token with `repo` scope

## Verification Checklist

After configuring settings, verify:

- [ ] Only squash merging is enabled
- [ ] PR title becomes commit message (test with a draft PR)
- [ ] Branch protection requires PR title linting to pass
- [ ] Branch protection requires API tests to pass
- [ ] release-please workflow has permission to create PRs
- [ ] Automatic branch deletion works after merge

## Testing the Setup

1. **Create a test branch**:

   ```bash
   git checkout -b test/verify-settings
   echo "test" > test.txt
   git add test.txt
   git commit -m "testing setup"
   git push origin test/verify-settings
   ```

2. **Open a PR** with title: `chore(project): test repository settings`

3. **Verify**:

   - PR title linting passes
   - Status checks run
   - Only squash merge button is available
   - After merge, commit message on main matches PR title
   - Branch is deleted automatically

4. **Clean up**:
   ```bash
   git checkout main
   git pull
   # The test commit should appear as a single commit with your PR title
   ```

## Troubleshooting

### release-please workflow fails with permission errors

**Solution**: Enable "Read and write permissions" for workflows or use a PAT.

### Status checks not showing as required

**Solution**: The check must run at least once before it appears in the required checks list. Merge a PR first, then add it to required checks.

### Multiple merge buttons visible

**Solution**: Go to Settings → General → Pull Requests and ensure only "Allow squash merging" is checked.

### PR title linting not enforcing

**Solution**:

1. Check `.github/workflows/lint-pr-title.yml` exists
2. Verify it runs on `pull_request` events
3. Add it to required status checks in branch protection

## Additional Configuration (Optional)

### PR Templates

Create `.github/pull_request_template.md`:

```markdown
## Description

<!-- Brief description of changes -->

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] chore: Maintenance
- [ ] docs: Documentation
- [ ] refactor: Code refactoring
- [ ] test: Test changes

## Scope

- [ ] project
- [ ] api
- [ ] frontend
- [ ] db
- [ ] gcloud
- [ ] tools
- [ ] bot

## Checklist

- [ ] PR title follows conventional commits format
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
```

### Issue Templates

Create `.github/ISSUE_TEMPLATE/` directory with templates for bugs, features, etc.

### CODEOWNERS

Create `.github/CODEOWNERS` to auto-assign reviewers:

```
# Default owners
*       @Kunedawg

# Component owners
/api/       @Kunedawg
/frontend/  @Kunedawg
/db/        @Kunedawg
```

## Reference

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Release Please Documentation](https://github.com/googleapis/release-please)
