# Contributing Guide — Claude Launcher

Welcome to Claude Launcher! This guide explains how to contribute effectively — for both human contributors and AI agents.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Commit Messages](#commit-messages)
- [Branch Naming](#branch-naming)
- [Architecture Rules](#architecture-rules)
- [Documentation Updates](#documentation-updates)
- [AI Contributor Workflow](#ai-contributor-workflow)

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Claude Desktop installed (for testing)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/claude-launcher.git
cd claude-launcher

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Electron app in development mode |
| `pnpm build` | Build the production app |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm format` | Prettier format |

---

## Development Workflow

### Before You Start

1. **Read `CLAUDE.md`** — coding principles and architecture rules
2. **Read `docs/CONTEXT.md`** — current project state
3. **Read `docs/ARCHITECTURE.md`** — understand the architecture before implementing
4. **Pick a task from `docs/TASKS.md`** — do not add features arbitrarily

### Workflow

```
1. Pick a task from TASKS.md
2. Create a branch from main
3. Implement (one file at a time)
4. Write tests
5. pnpm test → must pass
6. pnpm typecheck → must pass
7. pnpm lint → must pass
8. Update WORKLOG.md + TASKS.md
9. Open PR
10. Code review
11. Merge
```

### During Development

- Implement **one file at a time** — do not try to implement many things simultaneously
- Run tests after each significant change
- Commit frequently with atomic commits
- Never commit broken code

---

## Coding Standards

### TypeScript

- **Strict mode** — `strict: true` in tsconfig
- **No `any`** — use `unknown` then narrow
- **Explicit return types** for all public functions
- **Zod** for validating all external data

```typescript
// ✅ Correct
export async function createProfile(
  input: unknown
): Promise<Result<Profile, ProfileError>> {
  const parsed = CreateProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    return Err(new ProfileValidationError(parsed.error.message));
  }
  // ...
}

// ❌ Wrong — no return type, uses any
export async function createProfile(input: any) {
  // ...
}
```

### Naming

```
Components:     PascalCase     → ProfileCard.tsx
Services:       camelCase      → profileService.ts
Repositories:   camelCase      → profileRepository.ts
Interfaces:     IPascalCase    → IProfileRepository
Types:          PascalCase     → ProfileId, LaunchStatus
Schemas:        camelCase+Schema → profileSchema
IPC channels:   domain:action  → profiles:create
Hooks:          use prefix     → useProfiles
```

### File Organization

- Each file has **one** responsibility
- No file over 300 lines (signal to split)
- Tests live in `__tests__/` next to the file being tested
- No logic in index.ts files (re-exports only)

### Comments

- Comments explain **WHY**, not WHAT
- Do not comment things the code already makes clear
- JSDoc for public APIs (interfaces, service methods)

```typescript
// ✅ Good — explains non-obvious behavior
// Claude Desktop reads HOME to determine its data directory,
// so we override it to achieve profile isolation without patching the binary.
env.HOME = profile.homeDir;

// ❌ Bad — explains the obvious
// Set the name
profile.name = input.name;
```

---

## Testing

### Rules

1. Tests for domain + service layers **must not import Electron**
2. Test names describe **behavior**: `should return error when profile name already exists`
3. Each test follows **Arrange → Act → Assert**
4. Use **MockFilesystemService** for filesystem operations in unit tests
5. Integration tests use real temporary directories

### Coverage Requirements

| Layer | Minimum |
|-------|---------|
| Domain | 90% |
| Service | 90% |
| Repository | 80% |
| IPC Handlers | 80% |
| React Components | snapshot + critical paths |

### Test Structure

```typescript
describe('ProfileService', () => {
  describe('createProfile', () => {
    it('should create profile successfully with valid input', async () => {
      // Arrange
      const repo = new MockProfileRepository();
      const fs = new MockFilesystemService();
      const service = new ProfileService(repo, fs);

      // Act
      const result = await service.createProfile({ name: 'Work' });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Work');
        expect(await repo.findAll()).toHaveLength(1);
      }
    });

    it('should return error when profile name already exists', async () => {
      // Arrange
      const repo = new MockProfileRepository([existingProfile]);
      const fs = new MockFilesystemService();
      const service = new ProfileService(repo, fs);

      // Act
      const result = await service.createProfile({ name: existingProfile.name });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ProfileAlreadyExistsError);
      }
    });
  });
});
```

---

## Pull Requests

### PR Requirements

1. **Small and focused** — one PR, one goal
2. **Passes CI** — all tests, typecheck, and lint must pass
3. **Self-contained** — independently reviewable
4. **Documented** — clear description of what, why, and how
5. **Tested** — unit tests for new logic

### PR Description Template

```markdown
## What
Short description of what this PR does.

## Why
Explanation of why this change is needed.

## How
Description of the approach and key decisions.

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing: ...

## Checklist
- [ ] pnpm test passes
- [ ] pnpm typecheck passes
- [ ] pnpm lint passes
- [ ] WORKLOG.md updated
- [ ] TASKS.md updated
```

### Review Process

1. Author opens PR and self-reviews using the checklist in CLAUDE.md
2. Reviewer checks: architecture rules, tests, typing
3. Do not merge with failing tests or TypeScript errors
4. Squash merge to keep history clean

---

## Commit Messages

Use **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactor without adding features or fixing bugs |
| `test` | Adding or updating tests |
| `docs` | Documentation |
| `chore` | Build, deps, config |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Scopes

`profiles`, `launcher`, `settings`, `ui`, `ipc`, `repo`, `deps`, `build`, `docs`

### Examples

```bash
feat(profiles): add create profile with home directory isolation
fix(launcher): handle missing Claude Desktop binary with clear error
refactor(ipc): extract validation into shared middleware
test(profile-service): add edge cases for duplicate name validation
docs(architecture): update IPC sequence diagram after handler refactor
chore(deps): update electron to 32.x
```

---

## Branch Naming

```
feat/pr-01-project-scaffolding
feat/pr-08-profile-service
fix/pr-XX-launcher-crash-on-missing-binary
chore/update-electron-32
docs/update-architecture-ipc
```

Format: `<type>/pr-<number>-<short-description>` or `<type>/<short-description>` for hotfixes.

---

## Architecture Rules

**These rules must never be violated:**

1. **Renderer must not access the filesystem** — use IPC
2. **Services must not import Electron APIs** — domain and services must be testable without Electron
3. **IPC messages must have Zod validation** — on both sides
4. **Dependency direction must be correct**: `Renderer → IPC → Main → Service → Repository`
5. **Never duplicate Claude Desktop** — only spawn with a modified environment
6. **Never patch Claude Desktop** — do not modify the binary or its config files

When in doubt, ask: _"Can I test this without Electron?"_

---

## Documentation Updates

Every PR **must** update:

| File | When |
|------|------|
| `docs/WORKLOG.md` | After every completed task |
| `docs/TASKS.md` | Check off completed tasks, add newly discovered tasks |
| `docs/CONTEXT.md` | When milestone, architecture, or features change |
| `docs/TECHNICAL_DEBT.md` | When debt is discovered or resolved |

Do not open a PR without updating documentation.

---

## AI Contributor Workflow

This section is for **Claude Code** and other AI agents.

### Mandatory Reading

Before starting **any task**, Claude Code must read:

```
1. CLAUDE.md          → rules and principles
2. docs/CONTEXT.md    → current state
3. docs/WORKLOG.md    → what is in progress, what is done
4. docs/TASKS.md      → what is the next task
5. docs/ARCHITECTURE.md → when implementing or reviewing
```

### One Task at a Time

- Only implement **one task** per session
- Do not add features outside the task scope
- Do not refactor unrelated code

### After Each Task

```
1. pnpm test → must pass
2. pnpm typecheck → must pass
3. pnpm lint → must pass
4. Update docs/WORKLOG.md
5. Update docs/TASKS.md
6. Update docs/CONTEXT.md if needed
7. Commit with a conventional commit message
```

### When Uncertain

If unsure about an architectural decision:
1. Read `docs/DECISIONS.md` — there may already be an ADR for it
2. Read `docs/ARCHITECTURE.md` — principles are already defined
3. Ask a human contributor before implementing

### What NOT to Do

- ❌ Do not add dependencies without approval
- ❌ Do not change IPC channels without updating schemas
- ❌ Do not implement features not listed in TASKS.md
- ❌ Do not skip tests with the intention of "doing them later"
- ❌ Do not commit code that fails typecheck or lint
- ❌ Do not patch or modify the Claude Desktop binary

---

## Getting Help

- Read `docs/DECISIONS.md` to understand architectural decisions
- Read `docs/ARCHITECTURE.md` to understand the system design
- Open a GitHub Issue with the `question` label for architectural questions
- Consult `docs/TECHNICAL_DEBT.md` to avoid creating additional debt
