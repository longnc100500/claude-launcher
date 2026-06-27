# Technical Debt — Claude Launcher

> Tracks technical debt discovered and resolved during development. Update when new debt is found or existing debt is resolved.

---

## Debt Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 — Critical | 0 | — |
| P1 — High | 2 | Open |
| P2 — Medium | 4 | Open |
| P3 — Low | 3 | Open |

---

## P0 — Critical (Blocks release)

> No P0 debt at this time.

---

## P1 — High Priority

### DEBT-001: No E2E Tests

| Field | Value |
|-------|-------|
| **Area** | Testing |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.5 |

**Description**:
The project plan includes only unit tests and integration tests. There are no end-to-end tests covering the full flow from UI → IPC → Service → real filesystem → actual Claude Desktop spawn.

E2E testing for Electron apps is more complex than for web apps (requires Playwright with Electron support), but it is important for catching integration bugs that unit tests miss.

**Suggested Solution**:
- Install Playwright with Electron support
- Write an E2E test for the happy path: create profile → launch → verify status → stop
- Write an E2E test for the error path: launch when binary does not exist
- Run E2E tests in CI on a macOS runner only (to avoid cross-platform complexity initially)

**Affected Code**:
- `src/` — entire application
- `.github/workflows/ci.yml` — needs an E2E job

---

### DEBT-002: No Structured Logging

| Field | Value |
|-------|-------|
| **Area** | Observability |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.2 |

**Description**:
The current architecture uses `console.log`/`console.error` in development and has no production logging. When bugs occur on a user's machine, there are no logs to debug.

**Suggested Solution**:
- Install `electron-log` or `winston`
- Structured JSON logs with: timestamp, level, context (service name), message, error details
- Log file at `app.getPath('logs')/claude-launcher.log`
- Log rotation (max 10 MB, keep 5 files)
- Renderer logs forwarded to the main process via IPC
- Log level configurable via settings

**Affected Code**:
- `src/main/` — add logger
- `src/services/` — inject logger
- `src/renderer/` — log errors via IPC

---

## P2 — Medium Priority

### DEBT-003: No electron-store Schema Migration

| Field | Value |
|-------|-------|
| **Area** | Data / Storage |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | Before v1.0 |

**Description**:
`electron-store` has no built-in schema migration system. When the data schema changes (adding fields, renaming, restructuring), existing user data will not automatically migrate.

This is not a problem in v0.1 because the schema is simple. However, after v0.1, any new fields added to the schema will leave existing users with stale data.

**Suggested Solution**:
- Add a `version` field to the store schema
- Write migration functions: `migrate_v1_to_v2()`, etc.
- Run migrations on app start, before loading any data
- Test migrations with sample data
- Document schema versions in `DECISIONS.md`

**Affected Code**:
- `src/repositories/appStore.ts`
- `src/repositories/profileRepository.ts`

---

### DEBT-004: Process Cleanup on App Crash

| Field | Value |
|-------|-------|
| **Area** | Process Management |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.2 |

**Description**:
If Claude Launcher crashes or is force-killed while tracking running Claude Desktop processes, those processes become orphaned — still running but no longer tracked by the launcher.

When the user restarts the launcher, the status will show "stopped" even though the processes are still running. Spawning again will create duplicate instances.

**Suggested Solution**:
- Persist running process PIDs to electron-store on launch
- On app start, check whether each stored PID is still alive (via `process.kill(pid, 0)`)
- If alive, re-attach tracking
- If not alive, clean up the stored PID
- Test with a simulated crash scenario

**Affected Code**:
- `src/services/launchService.ts`
- `src/repositories/` — needs PID persistence
- `src/main/index.ts` — startup check

---

### DEBT-005: No Input Sanitization for Profile Names Used in Paths

| Field | Value |
|-------|-------|
| **Area** | Security / Validation |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | PR-08 |

**Description**:
Profile names are used to create directory names. Without proper sanitization, a user could create a profile named `../../etc/passwd` or `CON` (a Windows reserved name), causing filesystem issues.

**Suggested Solution**:
- Validate profile names in the Zod schema:
  - Max 64 characters
  - No path separators (`/`, `\`)
  - No null bytes
  - Not a Windows reserved name (CON, PRN, AUX, etc.)
  - Does not start with `.`
- Derive the directory name from the profile ID (UUID), not the profile name
- Test with malicious inputs in ProfileService tests

**Affected Code**:
- `src/shared/ipc/schemas.ts` — Zod schema validation
- `src/services/profileService.ts` — additional validation
- Tests

---

### DEBT-006: No Metrics or Telemetry

| Field | Value |
|-------|-------|
| **Area** | Observability |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.5 or later |

**Description**:
There are no metrics on: how many profiles are created, how many launches occur, crash rates, or performance. This makes it hard to understand user behavior or detect issues at scale.

**Suggested Solution**:
- Opt-in anonymous telemetry (explicit user consent required)
- Metrics: profile count, launch count per session, error types
- Simple local counter with periodic flush to file
- Explicitly NOT: sending data to any external service without consent

**Affected Code**:
- `src/services/` — add telemetry hooks
- `src/renderer/components/settings/` — consent toggle

---

## P3 — Low Priority

### DEBT-007: Bundle Size Not Optimized

| Field | Value |
|-------|-------|
| **Area** | Performance / Build |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.5 |

**Description**:
v0.1 will have no tree-shaking optimization for the renderer bundle, no lazy-loaded routes, and no code splitting. This does not affect functionality but does affect startup time.

**Suggested Solution**:
- React.lazy + Suspense for routes
- Dynamic imports for heavy components (icon picker, dialogs)
- Analyze the bundle with `rollup-plugin-visualizer`
- Target: renderer bundle < 500 KB minzipped

---

### DEBT-008: No Crash Reporting

| Field | Value |
|-------|-------|
| **Area** | Observability |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v0.5 |

**Description**:
There is no crash reporting. When the app crashes on a user's machine, developers have no visibility.

**Suggested Solution**:
- Electron built-in crash reporter (`crashReporter.start()`)
- Write crash dumps locally
- Opt-in: users choose whether to send a crash report

---

### DEBT-009: Hardcoded English UI Strings

| Field | Value |
|-------|-------|
| **Area** | Internationalization |
| **Status** | Open |
| **Discovered** | 2026-06-27 |
| **Target resolution** | v1.0 or later |

**Description**:
UI strings are hardcoded in English. Internationalizing later would require refactoring all UI components.

**Suggested Solution**:
- Extract strings into a constants file early (even if only English for now)
- Avoid string concatenation to make i18n easier later
- Consider `react-i18next` when scaling

---

## Resolved Debt

> No resolved items yet. Will be added as debt is addressed.

---

## How to Update This File

When **new debt is discovered**:
1. Add an entry with the next ID (DEBT-00X)
2. Fill in: Area, Status, Description, Suggested Solution, Affected Code
3. Update the summary table

When **debt is resolved**:
1. Change Status → "Resolved"
2. Add "Resolved Date" and "Resolution" fields
3. Move the entry to the "Resolved Debt" section
4. Update the summary table
