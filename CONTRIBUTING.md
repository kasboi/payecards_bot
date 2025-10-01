# Contributing to the Games Platform

First off, thank you for considering contributing! This project is a community effort, and every contribution is valued. This document provides guidelines to ensure a smooth and consistent development workflow.

## Branching Strategy

We use a simple feature-branching workflow. Please create a new branch from `main` for every new feature, bug fix, or documentation update.

Branch names should be prefixed to categorize the work:

- **feat/**: For new features (e.g., `feat/add-chat-to-lobby`)
- **fix/**: For bug fixes (e.g., `fix/resolve-turn-passing-bug`)
- **docs/**: For documentation changes (e.g., `docs/update-api-reference`)
- **chore/**: For routine maintenance, refactoring, or build-related tasks (e.g., `chore/upgrade-nextjs`)

Example:

```bash
git checkout main
git pull
git checkout -b feat/new-game-mode
```

## Commit Message Convention

We follow the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps keep the commit history clean and allows for automated changelog generation in the future.

Each commit message should be structured as follows:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

- **Type:** Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`.
- **Scope (optional):** The package or area of the codebase affected (e.g., `frontend`, `backend`, `auth`, `game-logic`).
- **Subject:** A short, imperative-tense description of the change.

**Example Commit:**

```
feat(frontend): add public matchmaking button to lobby
```

```
fix(backend): ensure turn passes immediately after a player draws a card
```

## Pull Request (PR) Process

1.  Ensure your branch is up-to-date with the `main` branch.
2.  Push your branch to the remote repository and open a Pull Request against `main`.
3.  Provide a clear title and a brief description of the changes in your PR.
4.  If your PR addresses a specific issue, link it in the description (e.g., "Closes #42").
5.  Ensure all automated checks and tests are passing.

## Documentation Workflow

Accurate documentation is crucial for the project's health.

- **Architectural Changes:** Any significant changes to the architecture, dependencies, or core principles must be reflected in the `docs/` directory.
- **Implementation Guides:** When working from an implementation guide (e.g., `docs/implementation_guides/xx_guide.md`), the developer is responsible for updating the guide to reflect the final state of the code. If a smarter or different approach was taken during implementation, the guide should be amended to match the reality of the code before the work is considered complete.
