# CLAUDE.md — System Prompt for Claude Code

> **This is the most important file in the project.** Every Claude Code session must read this file first.

---

## Mandatory Reading Order

Before starting any task, Claude Code **must** read the following files in order:

1. **`CLAUDE.md`** (this file) — rules and principles
2. **`docs/CONTEXT.md`** — current project state
3. **`docs/WORKLOG.md`** — work in progress and completed work
4. **`docs/TASKS.md`** — backlog and next task
5. **`docs/ARCHITECTURE.md`** — detailed architecture (when implementing or reviewing)

> **Never implement without reading these 5 files first.**

---

## Project Overview

**Claude Launcher** is an Electron application that allows users to run multiple isolated Claude Desktop profiles, each with its own HOME directory for complete data separation.

### Core Principle

> **Never patch. Never duplicate. Never break on update.**

Claude Launcher only launches Claude Desktop with an isolated runtime environment — no modification, no binary copying.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | Electron |
| UI | React + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS + shadcn/ui |
| Packaging | electron-builder |
| Persistence | electron-store |
| Validation | Zod |
| Testing | Vitest |

---

## Architecture Rules

### Absolute Rules (NEVER violate)

1. **Renderer process NEVER accesses the filesystem directly.** All I/O must go through IPC → Main process → Service → Repository.
2. **Business logic MUST NOT depend on Electron APIs.** Domain and Service layers must run in a plain Node environment.
3. **Never patch, copy, or modify Claude Desktop.**
4. **All IPC messages must be validated with Zod schemas** on both ends (sender and handler).
5. **No `any` in TypeScript** — strict mode is always on.
6. **Main process MUST NOT import React, DOM APIs, or UI components.**
7. **Repository only knows about storage, not business logic.**
8. **Service only knows about business logic, not Electron APIs.**

### Dependency Direction

```
Renderer (React) → IPC → Main → Service → Repository → Filesystem
```

Dependencies flow in one direction only. No circular dependencies.

### Layer Responsibilities

| Layer | Allowed | Not Allowed |
|-------|---------|------------|
| **Renderer** | React components, UI state, IPC calls | Filesystem, Node.js APIs, Electron APIs |
| **Main Process** | IPC handlers, app lifecycle, window management | React, DOM APIs, business logic |
| **Service** | Business logic, orchestration, validation | Electron APIs, direct filesystem access |
| **Repository** | CRUD operations, serialization | Business logic, Electron APIs |
| **Domain** | Types, interfaces, value objects | External dependencies |

---

## Coding Principles

### TypeScript Rules

- **Strict mode** always on: `"strict": true` in tsconfig
- **No `any`** — use `unknown` if a wide type is needed, then narrow
- **Explicit return types** for all public functions and class methods
- **Zod schemas** for all external data (IPC, filesystem, user input)
- **Readonly** for immutable data: `Readonly<T>`, `ReadonlyArray<T>`
- **Discriminated unions** over optional fields where possible
- **Type-only imports**: `import type { Foo }` when only using the type

```typescript
// ✅ Correct
export function createProfile(data: unknown): Result<Profile, ValidationError> {
  const parsed = ProfileSchema.safeParse(data);
  if (!parsed.success) return Err(new ValidationError(parsed.error));
  return Ok(new Profile(parsed.data));
}

// ❌ Wrong
export function createProfile(data: any): Profile {
  return new Profile(data);
}
```

### Naming Conventions

| Concept | Convention | Example |
|---------|-----------|---------|
| Files (components) | PascalCase | `ProfileCard.tsx` |
| Files (services) | camelCase | `profileService.ts` |
| Files (repositories) | camelCase | `profileRepository.ts` |
| Files (types) | camelCase | `profile.types.ts` |
| Interfaces | PascalCase + `I` prefix | `IProfileRepository` |
| Types | PascalCase | `ProfileId`, `LaunchResult` |
| Zod schemas | camelCase + `Schema` suffix | `profileSchema`, `launchOptionsSchema` |
| IPC channels | `domain:action` | `profiles:create`, `launcher:start` |
| React components | PascalCase | `ProfileList`, `CreateProfileDialog` |
| Hooks | `use` prefix | `useProfiles`, `useLaunchStatus` |
| Services | PascalCase + `Service` suffix | `ProfileService`, `LaunchService` |
| Repositories | PascalCase + `Repository` suffix | `ProfileRepository` |

### Service Design Rules

- Services accept **interfaces** (not concrete implementations) via constructor
- Services return **`Result<T, E>`** types — do not throw exceptions arbitrarily
- Services must have **unit tests** that do not require Electron, Node, or the filesystem
- Each service has **one responsibility**

```typescript
// ✅ Correct — injectable, testable
export class ProfileService {
  constructor(
    private readonly repo: IProfileRepository,
    private readonly fs: IFilesystemService,
  ) {}

  async createProfile(input: CreateProfileInput): Promise<Result<Profile, ProfileError>> {
    // ...
  }
}
```

### Repository Rules

- Repositories only perform **CRUD operations**
- No business logic in repositories
- Repositories implement an **interface** from the domain layer
- Use `electron-store` for profile metadata, filesystem for data directories

### IPC Rules

- Each IPC channel has its own **Zod schema** for both request and response
- Main process handlers **validate** input before processing
- Renderer **validates** responses before use
- IPC channels are defined centrally in `src/shared/ipc/channels.ts`
- Use `ipcMain.handle` / `ipcRenderer.invoke` (async/await pattern)

```typescript
// src/shared/ipc/channels.ts
export const IPC_CHANNELS = {
  PROFILES_LIST: 'profiles:list',
  PROFILES_CREATE: 'profiles:create',
  PROFILES_DELETE: 'profiles:delete',
  LAUNCHER_START: 'launcher:start',
  LAUNCHER_STOP: 'launcher:stop',
  LAUNCHER_STATUS: 'launcher:status',
} as const;
```

### Electron Rules

- Always enable `contextIsolation: true` and `nodeIntegration: false`
- Use **preload scripts** to safely expose APIs to the renderer
- Never expose `ipcRenderer` directly — wrap in a typed API
- Window creation must include complete `webPreferences` with security settings
- Use `app.getPath('userData')` for user data, never hardcode paths

### React Rules

- **Functional components** only — no class components
- **Custom hooks** for reusable logic
- Props must have explicit TypeScript types
- Avoid using `React.FC` — prefer explicit function declarations with return types
- Avoid prop drilling beyond 2 levels — use context or composition
- Components in `src/renderer/components/` — no direct side effects

### Error Handling

- Use the **`Result<T, E>`** pattern for business logic errors
- **Typed error classes** — do not throw generic `Error`
- Log **all errors** with full context
- UI displays **user-friendly messages** — never expose internal errors
- Main process catches uncaught exceptions and logs before crashing

```typescript
// Typed errors
export class ProfileNotFoundError extends Error {
  readonly code = 'PROFILE_NOT_FOUND' as const;
  constructor(public readonly profileId: string) {
    super(`Profile not found: ${profileId}`);
  }
}

export type ProfileError =
  | ProfileNotFoundError
  | ProfileAlreadyExistsError
  | ProfileValidationError;
```

---

## Implementation Workflow

When given a task, Claude Code must follow this workflow:

```
1. Read mandatory docs (CONTEXT, WORKLOG, TASKS, ARCHITECTURE)
2. Identify the specific PR/task to implement
3. Understand the acceptance criteria
4. Implement ONE FILE AT A TIME — do not implement multiple things at once
5. Write tests before or alongside implementation
6. Run tests: pnpm test
7. Run type check: pnpm typecheck
8. Run lint: pnpm lint
9. Update WORKLOG.md
10. Update TASKS.md (check off completed tasks)
11. Update CONTEXT.md if architecture changes
12. Commit with a conventional commit message
```

> **One PR = one clear goal.** Do not implement multiple features in a single PR.

---

## Testing Requirements

### Coverage Requirements

- **Domain & Service layer**: ≥ 90% line coverage
- **Repository layer**: ≥ 80% line coverage (mock filesystem is acceptable)
- **IPC handlers**: ≥ 80% line coverage
- **React components**: snapshot tests + interaction tests for critical paths

### Test Structure

```
src/
  __tests__/           # Integration tests
  domain/
    __tests__/         # Domain unit tests
  services/
    __tests__/         # Service unit tests (NO Electron)
  repositories/
    __tests__/         # Repository unit tests
  renderer/
    components/
      __tests__/       # Component tests
```

### Testing Rules

- Service tests **must not import** anything from Electron
- Repository tests use in-memory mocks or temp directories
- Test names must describe **behavior**, not implementation
- Each test follows **Arrange / Act / Assert**

```typescript
// ✅ Good test name
it('should return error when profile name already exists', async () => { ... });

// ❌ Bad test name
it('createProfile test', async () => { ... });
```

---

## Review Checklist

Before committing any change, Claude Code must self-review using this checklist:

### Code Quality
- [ ] No `any` types
- [ ] All public functions have explicit return types
- [ ] No unused imports or variables
- [ ] No `console.log` debug statements (use logger)
- [ ] Error handling is complete

### Architecture
- [ ] Renderer does not access the filesystem directly
- [ ] Business logic does not depend on Electron APIs
- [ ] IPC messages have Zod validation
- [ ] Dependency direction is correct (Renderer → IPC → Main → Service → Repository)

### Testing
- [ ] Unit tests for new service logic
- [ ] Tests pass: `pnpm test`
- [ ] Type check passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`

### Documentation
- [ ] WORKLOG.md is updated
- [ ] TASKS.md is updated (completed tasks checked off)
- [ ] CONTEXT.md is updated if architecture changed
- [ ] JSDoc for public APIs where needed

### Security
- [ ] `contextIsolation: true` and `nodeIntegration: false` remain unchanged
- [ ] No hardcoded paths or secrets
- [ ] User input is validated through Zod before processing

---

## Definition of Done

A task is considered **Done** when:

1. ✅ Code correctly implements the PR's acceptance criteria
2. ✅ Unit tests are written and passing
3. ✅ `pnpm test` passes (no test failures)
4. ✅ `pnpm typecheck` passes (no TypeScript errors)
5. ✅ `pnpm lint` passes (no lint errors)
6. ✅ `WORKLOG.md` is updated with the completed task
7. ✅ `TASKS.md` has the corresponding task checked off
8. ✅ `CONTEXT.md` is updated if there are significant changes
9. ✅ Commit message follows Conventional Commits format

---

## Pull Request Rules

- **Branch naming**: `feat/pr-XX-short-description`, `fix/pr-XX-short-description`
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- **PR size**: Small, focused, independently reviewable
- **A single PR must not** change both architecture and UI at the same time
- **Every PR must have** a clear description of what, why, and how

### Conventional Commits Examples

```
feat(profiles): add create profile functionality
fix(launcher): handle missing Claude Desktop binary gracefully
chore(deps): update electron to v32
docs(architecture): update IPC sequence diagram
test(profile-service): add tests for duplicate name validation
refactor(repository): extract filesystem operations into abstraction
```

---

## Documentation Update Rules

After each completed task, the following updates are **required**:

| File | When to Update |
|------|---------------|
| `docs/WORKLOG.md` | After every completed task |
| `docs/TASKS.md` | Check off completed tasks, add newly discovered tasks |
| `docs/CONTEXT.md` | When architecture, milestone, or completed features change |
| `docs/TECHNICAL_DEBT.md` | When new technical debt is discovered |

---

## Common Patterns

### Result Type

```typescript
// src/shared/types/result.ts
export type Result<T, E extends Error = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E extends Error>(error: E): Result<never, E> => ({ ok: false, error });
```

### IPC Handler Pattern

```typescript
// src/main/ipc/profileHandlers.ts
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, rawInput: unknown) => {
  const input = CreateProfileInputSchema.safeParse(rawInput);
  if (!input.success) {
    return Err(new ValidationError(input.error.message));
  }
  return profileService.createProfile(input.data);
});
```

### Preload Typed API Pattern

```typescript
// src/preload/api.ts
const profilesApi = {
  list: (): Promise<Result<Profile[]>> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_LIST),
  create: (input: CreateProfileInput): Promise<Result<Profile>> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_CREATE, input),
};

contextBridge.exposeInMainWorld('claudeApi', { profiles: profilesApi });
```

---

## Questions to Ask Before Implementing

When uncertain about a decision, ask:

1. **Does this belong in the domain layer?** — If the logic doesn't depend on Electron/Node, it belongs in the domain.
2. **Is this business logic or I/O?** — Business logic → Service. I/O → Repository.
3. **Does the renderer need this?** — If yes, it must go through IPC.
4. **Will this break on a Claude Desktop update?** — If yes, find another approach.
5. **Can I test this without Electron?** — If not, refactor.
