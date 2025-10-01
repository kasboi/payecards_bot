# Contributing to Payecards Telegram Bot

## Branching Strategy

We use a simple feature-branching workflow. Please create a new branch from
`main` for every new feature, bug fix, or documentation update.

Branch names should be prefixed to categorize the work:

- **feat/**: For new features (e.g., `feat/user-registration`, `feat/crypto-prices`)
- **fix/**: For bug fixes (e.g., `fix/database-connection-timeout`)
- **docs/**: For documentation changes (e.g., `docs/update-readme`)
- **chore/**: For routine maintenance, refactoring, or build-related tasks
  (e.g., `chore/upgrade-deno-version`)

Example:

```bash
git checkout main
git pull
git checkout -b feat/new-feature-name
```

## Commit Message Convention

We follow the
[**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/)
specification. This helps keep the commit history clean and allows for automated
changelog generation in the future.

Each commit message should be structured as follows:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

- **Type:** Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
  `chore`, `build`.
- **Scope (optional):** The area of the codebase affected (e.g.,
  `handlers`, `database`, `services`, `middleware`).
- **Subject:** A short, imperative-tense description of the change.

**Example Commit:**

```
feat(handlers): add user registration command
```

```
fix(services): resolve CoinGecko API timeout issue
```

```
docs(readme): update deployment instructions
```

## Pull Request (PR) Process

1. Ensure your branch is up-to-date with the `main` branch.
2. Push your branch to the remote repository and open a Pull Request against
   `main`.
3. Provide a clear title and a brief description of the changes in your PR.
4. If your PR addresses a specific issue, link it in the description (e.g.,
   "Closes #42").
5. Ensure all automated checks and tests are passing.
