# Architecture Decision Records — Claude Launcher

> This document records significant architectural decisions. Each ADR explains the context, decision, consequences, and alternatives considered.

---

## ADR Index

| ID | Title | Status |
|----|-------|--------|
| ADR-001 | Electron instead of Tauri | Accepted |
| ADR-002 | HOME isolation instead of copying Claude Desktop | Accepted |
| ADR-003 | Service + Repository architecture | Accepted |
| ADR-004 | Zod for IPC validation | Accepted |
| ADR-005 | Business logic outside Electron | Accepted |
| ADR-006 | Renderer never accesses filesystem | Accepted |
| ADR-007 | No Redux | Accepted |
| ADR-008 | TypeScript strict mode | Accepted |
| ADR-009 | electron-store for persistence | Accepted |
| ADR-010 | pnpm as package manager | Accepted |

---

## ADR-001: Electron instead of Tauri

**Date**: 2026-06-27
**Status**: Accepted

### Context

A framework was needed to build Claude Launcher. The two main options were Electron and Tauri.

Claude Desktop itself is an Electron app. Launching and managing Electron processes from another Electron app is a well-proven pattern. Tauri uses a Rust backend and the system's native WebView.

### Decision

Use **Electron** to build Claude Launcher.

### Reasoning

1. **Same process model**: Both the launcher and Claude Desktop are Node.js/Chromium processes. Child process management, environment variable inheritance, and process lifecycle all behave consistently.
2. **Mature ecosystem**: `electron-builder`, `electron-store`, `electron-updater` — packaging and distribution tools are production-ready.
3. **TypeScript first-class**: The entire stack (main + renderer + preload) is TypeScript — no Rust required.
4. **Team expertise**: Contributors do not need Rust knowledge.
5. **Binary distribution**: electron-builder supports code signing, notarization, and auto-update out of the box.

### Consequences

**Positive**:
- Consistent TypeScript codebase
- Rich ecosystem for desktop app features
- Team can contribute immediately without learning Rust
- Familiar process management APIs

**Negative**:
- Larger bundle size than Tauri (Electron bundles Chromium, ~100 MB)
- Higher RAM usage (each Electron app has its own Chromium instance)
- No native OS UI feel compared to Tauri

### Alternatives Considered

**Tauri**: Smaller bundle, native WebView, Rust backend. Rejected because the team lacks Rust expertise and the Electron process model fits the use case better.

**Native apps** (Swift/Kotlin): Not cross-platform, insufficient advantage over the development effort.

---

## ADR-002: HOME Isolation Instead of Copying Claude Desktop

**Date**: 2026-06-27
**Status**: Accepted

### Context

A mechanism was needed to give each profile its own session, cookies, cache, and preferences. There were two main approaches:

1. **Copy Claude Desktop**: Create multiple copies of the app, each with its own data directory.
2. **HOME isolation**: Run Claude Desktop with the `HOME` environment variable pointing to a profile-specific directory.

### Decision

Use **HOME isolation** — set the `HOME` environment variable (and `XDG_*` on Linux) before spawning the Claude Desktop process.

### Reasoning

Claude Desktop (an Electron app) uses `HOME` to determine where to store:
- `~/.config/` — config files
- `~/.local/share/` — app data
- Chromium data: session, cookies, IndexedDB, LocalStorage

By overriding `HOME=/path/to/profile/home`, Claude Desktop naturally creates isolated storage **without any modification whatsoever**.

### Consequences

**Positive**:
- **Zero coupling** with Claude Desktop internals — works with every version
- **Automatically update-safe** — Claude Desktop updates do not break the launcher
- **No binary duplication** — saves disk space
- **No patching** — does not violate ToS or create security issues
- **Simple mechanism** — just an environment variable

**Negative**:
- HOME isolation affects all apps in the process, not just Claude Desktop data
- On macOS, some system resources (Keychain, etc.) may still be shared
- `HOME` paths must not contain spaces on some systems

### Alternatives Considered

**Copy binary**: Wastes disk space, breaks on every Claude update, a maintenance nightmare.

**Symlinks**: More complex than HOME isolation, not portable, easily broken.

**Docker/Sandbox**: Too heavy for this use case, requires elevated permissions.

---

## ADR-003: Service + Repository Architecture

**Date**: 2026-06-27
**Status**: Accepted

### Context

An architecture pattern was needed for business logic and data persistence. The project has moderate complexity but requires:
- Testability (service tests must not require Electron)
- Clear separation of concerns
- Extensibility (ability to add storage backends)

### Decision

Apply the **Service + Repository** pattern with a **Domain layer** holding the interfaces.

```
Domain (types + interfaces)
    ↑
Repository (implements IRepository from Domain)
    ↑
Service (uses IRepository from Domain)
    ↑
Main Process IPC Handlers
```

### Reasoning

1. **Testability**: Services accept interfaces → easy to inject mocks in tests
2. **Single Responsibility**: Repository only handles persistence, Service only handles business logic
3. **Storage agnostic**: Can swap `electron-store` for SQLite, cloud storage, etc. without changing the Service
4. **AI-friendly**: Clear boundaries help AI agents understand and modify the correct layer

### Consequences

**Positive**:
- Service tests do not need Electron (inject mock repositories)
- Easy to swap storage backends
- Business logic is centralized in Services — easy to test and understand
- Clear boundaries for contributors

**Negative**:
- More files than a simple approach
- Boilerplate for interface definitions
- Overhead for simple CRUD operations

### Alternatives Considered

**Active Record**: Business logic inside model classes. Rejected because it is hard to test and violates SRP.

**Direct store access**: Main process calls electron-store directly. Simple but not testable.

---

## ADR-004: Zod for IPC Validation

**Date**: 2026-06-27
**Status**: Accepted

### Context

IPC messages cross the boundary between the renderer (untrusted) and the main process. Validation is required to:
- Ensure type safety when data traverses IPC
- Protect the main process from malformed input
- Provide runtime type checking (TypeScript is compile-time only)

### Decision

Use **Zod** to validate all IPC messages — both inbound (main receiving from renderer) and outbound (renderer receiving from main).

### Reasoning

1. **Runtime validation**: TypeScript types are erased at runtime — Zod provides actual validation
2. **Schema-first**: Schemas are both runtime validators and TypeScript type sources (`z.infer<typeof schema>`)
3. **Error messages**: Zod produces detailed, structured error messages
4. **Ecosystem**: Widely used, well-maintained, excellent TypeScript integration
5. **Shared schemas**: The same schema file is used in both main and renderer (in `src/shared/`)

### Consequences

**Positive**:
- IPC boundary is strongly validated
- Runtime validator and TypeScript types stay in sync automatically
- Clear error messages on validation failure
- Schemas serve as documentation

**Negative**:
- Bundle size increases (~14 KB minzipped)
- Runtime validation overhead (negligible for IPC use case)
- Learning curve for contributors unfamiliar with Zod

### Alternatives Considered

**Manual validation**: Verbose, error-prone, types do not stay in sync.

**io-ts**: Powerful but complex API, steeper learning curve than Zod.

**yup**: Good alternative but Zod has better TypeScript integration.

**No validation**: Unsafe — renderer could send arbitrary data.

---

## ADR-005: Business Logic Outside Electron

**Date**: 2026-06-27
**Status**: Accepted

### Context

Electron APIs (`app`, `ipcMain`, `BrowserWindow`, `shell`, etc.) are not available in a standard test environment. If business logic depends on Electron, tests would need to mock Electron — which is complex and fragile.

### Decision

**The Service layer and Domain layer must not import anything from Electron.**

Specifically:
- `src/domain/` — zero Electron imports
- `src/services/` — zero Electron imports
- `src/repositories/` — zero Electron imports (electron-store can be injected via interface)

Electron APIs are only permitted in:
- `src/main/` — main process entry, IPC handlers, window management
- `src/preload/` — contextBridge

### Reasoning

1. **Testability**: Services can run in a plain Node.js environment with Vitest
2. **Portability**: Business logic can be reused in a CLI version or web version
3. **Separation of concerns**: Electron is a delivery mechanism, not domain logic
4. **Maintainability**: Easier to reason about services without Electron side effects

### Consequences

**Positive**:
- Service tests run fast without an Electron mock
- Business logic is portable
- Clear architectural boundary

**Negative**:
- Interfaces are needed for Electron-backed operations (filesystem, etc.)
- Some features require workarounds (e.g., `app.getPath()` must be injected into the service)
- Main process must wire everything at startup

### Alternatives Considered

**Import Electron everywhere**: Simple but not testable, mixes concerns.

**Mock Electron in tests**: Possible but fragile — the Electron API surface is too large to mock fully.

---

## ADR-006: Renderer Never Accesses Filesystem

**Date**: 2026-06-27
**Status**: Accepted

### Context

Electron can allow the renderer (browser context) to access Node.js APIs if `nodeIntegration: true`. This creates security risks and mixes concerns.

### Decision

**The renderer process NEVER directly accesses the filesystem.** All filesystem operations go through:

```
Renderer → IPC (window.claudeApi) → Main Process → Service → Repository → Filesystem
```

`nodeIntegration: false` and `contextIsolation: true` are mandatory.

### Reasoning

1. **Security**: The renderer runs potentially untrusted web content and should not have filesystem access
2. **Architecture clarity**: A single path for all I/O — easy to audit, log, and validate
3. **Electron best practices**: Electron docs have recommended `contextIsolation: true` since 2019
4. **Consistency**: All renderer code operates under the same mental model (pure React, no Node)

### Consequences

**Positive**:
- Renderer code is clean, free of Node.js concerns
- Security by default
- All I/O is auditable through a single chokepoint (IPC handlers)

**Negative**:
- Every new operation requires an additional IPC handler + preload API
- IPC roundtrip latency (acceptable for this use case)
- Boilerplate for simple operations

### Alternatives Considered

**nodeIntegration: true**: Simple but insecure, bad practice.

---

## ADR-007: No Redux

**Date**: 2026-06-27
**Status**: Accepted

### Context

A state management solution was needed for the React renderer. Redux is popular but comes with significant boilerplate.

### Decision

**Do not use Redux.** Use React built-ins and custom hooks:
- `useState` / `useReducer` for local state
- React `Context` for global state that needs wide sharing
- Custom hooks (e.g., `useProfiles`, `useLaunchStatus`) to encapsulate IPC calls

### Reasoning

1. **Appropriate scale**: Claude Launcher is a small desktop app, not a large SPA with complex state
2. **Boilerplate**: Redux requires actions, reducers, selectors, and types — the overhead is not justified
3. **IPC as source of truth**: State primarily comes from IPC calls → `useEffect` + state is sufficient
4. **Maintainability**: Fewer abstractions = easier to understand for contributors and AI agents

### Consequences

**Positive**:
- Less boilerplate
- Easier to understand for new contributors
- Faster to implement

**Negative**:
- May need refactoring if the app scales significantly
- No Redux DevTools for debugging
- Prop drilling may occur if Context is not managed carefully

### Alternatives Considered

**Redux Toolkit**: Better than classic Redux but still overkill.

**Zustand**: A good alternative, lighter than Redux. May be reconsidered if Context proves insufficient.

---

## ADR-008: TypeScript Strict Mode

**Date**: 2026-06-27
**Status**: Accepted

### Context

TypeScript can be configured at various strictness levels. Strict mode enables the most rigorous checks.

### Decision

**TypeScript strict mode is always on** (`"strict": true` in tsconfig). This includes:
- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`
- `strictPropertyInitialization`
- And other checks

Also enabled: `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.

### Reasoning

1. **AI-friendliness**: Strict types help AI agents understand data shapes and generate correct code
2. **Bug prevention**: Many bugs are caught at compile time
3. **Documentation**: Types serve as inline documentation
4. **Refactoring safety**: Strict types catch breaking changes
5. **Codebase quality**: Higher bar = higher quality code

### Consequences

**Positive**:
- Fewer runtime errors
- Better IDE support (autocomplete, go-to-definition)
- AI agents generate more accurate code
- Safer refactoring

**Negative**:
- Steeper learning curve for TypeScript beginners
- More boilerplate (null checks, explicit types)
- Some third-party libraries require type overrides

### Alternatives Considered

**Loose TypeScript**: Fast to write but none of the benefits.

---

## ADR-009: electron-store for Persistence

**Date**: 2026-06-27
**Status**: Accepted

### Context

Profile metadata (names, IDs, home dirs) and app settings need to be persisted. Options: electron-store, SQLite, plain JSON file, IndexedDB.

### Decision

Use **electron-store** for persistent storage.

### Reasoning

1. **Simplicity**: JSON-based, synchronous API, zero setup
2. **Type safety**: Supports TypeScript schemas with a generic type parameter
3. **Electron native**: Automatically saves to `app.getPath('userData')` — correct Electron convention
4. **Zod integration**: Store access can be wrapped with Zod validation
5. **Appropriate scale**: Profile metadata is simple structured data — no database needed

### Consequences

**Positive**:
- Zero configuration
- Human-readable JSON file (easy to debug)
- Works perfectly for metadata storage
- No migration concerns for simple changes

**Negative**:
- Not suitable if data scales significantly (thousands of profiles)
- No query capabilities (must load all + filter in memory)
- Synchronous writes may block on slow disks

### Alternatives Considered

**SQLite (better-sqlite3)**: More capable but overkill for this use case.

**Plain JSON file**: Similar to electron-store but requires manual implementation.

---

## ADR-010: pnpm as Package Manager

**Date**: 2026-06-27
**Status**: Accepted

### Context

A package manager was needed: npm, yarn, or pnpm.

### Decision

Use **pnpm** as the package manager.

### Reasoning

1. **Disk efficiency**: pnpm uses hardlinks — no duplicate packages in node_modules
2. **Speed**: Faster installs than npm/yarn in most cases
3. **Strictness**: pnpm does not allow access to undeclared packages
4. **Monorepo ready**: If the project grows into a monorepo, pnpm workspaces are excellent
5. **Lockfile**: `pnpm-lock.yaml` produces fewer conflicts than the npm lockfile

### Consequences

**Positive**:
- Faster CI builds
- Disk space savings
- Stricter dependency management

**Negative**:
- Contributors must install pnpm (extra setup step)
- Some Electron-specific tools assume npm/yarn
- `.npmrc` may need special configuration for Electron native modules

### Alternatives Considered

**npm**: Universal but slow and disk-inefficient.

**yarn**: Good alternative; yarn 4 with PnP mode has compatibility issues with some tools.
