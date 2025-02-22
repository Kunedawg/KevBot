# Contributing to KevBot

## Old Content

Here is a guide for contributing to kev-bot api

- [Project Workflow](#project-workflow)

## Project Workflow

This project will utilize the following tools/ideas:

- [Github Flow][github-flow] for branching/merging strategy.
- [conventional commits][conventional-commits] for commit formatting.
- [semantic versioning][sem-ver] for tracking code versions.

### Rules

1. There will be a single long term branch called `main`.
2. Work will typically be done in two types of short-lived branches:
   - `feat/feature-branch` for feature work, can contain fixes as well.
   - `fix/fix-branch` for fixes that need to be applied to main quickly.
3. All commits should follow the [conventional commits][conventional-commits] guidelines.
   - Note, scope will be enforced, as well as commit line length see [commitlint config](commitlint.config.js)
4. All merges will be done via pull requests.
5. Linear history is encouraged either by squash merging or rebasing merging.
   - Merge commits are not totally outlawed, but are discouraged.
6. Pull request titles should also follow conventional commits

### Typical Development Workflow

1. Create new branch from `main` with a name of `feat/my-cool-feature` for example.
2. Make commits to the branch.
   - `feat: my cool feature`
   - `docs: updated readme to document cool feature`
3. Create pull request.
4. Ideally get pull request reviewed
5. Merge pull request into main (squash or rebase)
6. Delete feature branch.

### Typical Release Workflow (WIP)

[github-flow]: https://docs.github.com/en/get-started/quickstart/github-flow
[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
[sem-ver]: https://semver.org/
