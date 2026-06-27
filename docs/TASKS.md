# Tasks — Claude Launcher Backlog

> Full project backlog. Update after each completed task. See `WORKLOG.md` for current progress.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `- [ ]` | Not started |
| `- [x]` | Completed |
| `- [~]` | In progress |
| `- [!]` | Blocked |

---

## Phase 0: Foundation (PR-01 – PR-05)

### PR-01: Project Scaffolding

- [x] Initialize project with `pnpm init`
- [x] Install Electron, Vite, React, TypeScript
- [x] Install `vite-plugin-electron` or `electron-vite`
- [x] Create `package.json` with all required scripts
- [x] Create `tsconfig.json` (base)
- [x] Create `tsconfig.main.json` (Node target, CJS)
- [x] Create `tsconfig.renderer.json` (Browser target, ESM)
- [x] Configure `vite.config.ts`
- [x] Install ESLint and configure `.eslintrc.json`
- [x] Install Prettier and configure `.prettierrc`
- [x] Create `.gitignore` with Electron defaults
- [x] Create `.editorconfig`
- [x] Create `src/main/index.ts` — main process entry point
- [x] Create `src/renderer/index.tsx` — React entry point
- [x] Create `src/preload/index.ts` — preload script placeholder
- [x] Create full folder structure per `ARCHITECTURE.md`
- [x] Verify `pnpm dev` launches an Electron window
- [x] Verify TypeScript strict mode is enabled
- [x] Commit: `chore: initial project scaffolding`

### PR-02: Testing Infrastructure

- [x] Install Vitest
- [x] Create `vitest.config.ts`
- [x] Configure coverage provider (v8)
- [x] Set coverage thresholds (domain/service: 90%, repo: 80%)
- [x] Create `src/test/setup.ts`
- [x] Create `src/test/mocks/` directory
- [x] Write and pass a first test (smoke test)
- [x] Add `test`, `test:watch`, `test:coverage` scripts
- [x] Verify `pnpm test:coverage` displays a report
- [x] Commit: `chore(test): configure vitest with coverage`

### PR-03: Domain Types & Interfaces

- [ ] Create `src/domain/profile.ts`
  - [ ] `ProfileId` branded type
  - [ ] `Profile` interface
  - [ ] `IProfileRepository` interface
  - [ ] `CreateProfileInput` type
  - [ ] `UpdateProfileInput` type
- [ ] Create `src/domain/settings.ts`
  - [ ] `AppSettings` interface
  - [ ] `ISettingsRepository` interface
- [ ] Create `src/domain/launch.ts`
  - [ ] `LaunchStatus` union type
  - [ ] `LaunchResult` type
  - [ ] `RunningProcess` type
- [ ] Create `src/domain/filesystem.ts`
  - [ ] `IFilesystemService` interface
- [ ] Create `src/domain/errors.ts`
  - [ ] `AppError` base class
  - [ ] `ProfileNotFoundError`
  - [ ] `ProfileAlreadyExistsError`
  - [ ] `ProfileValidationError`
  - [ ] `BinaryNotFoundError`
  - [ ] `ProcessAlreadyRunningError`
  - [ ] `ProcessStartFailedError`
  - [ ] `StorageError`
- [ ] Create `src/shared/types/result.ts`
  - [ ] `Result<T, E>` type
  - [ ] `Ok()` helper
  - [ ] `Err()` helper
- [ ] Unit tests for type guards and domain logic
- [ ] Commit: `feat(domain): add domain types, interfaces, and error classes`

### PR-04: IPC Channel Definitions & Schemas

- [ ] Install Zod: `pnpm add zod`
- [ ] Create `src/shared/ipc/channels.ts`
  - [ ] `IPC_CHANNELS` constant object
  - [ ] `IpcChannel` type
- [ ] Create `src/shared/ipc/schemas.ts`
  - [ ] `CreateProfileInputSchema`
  - [ ] `UpdateProfileInputSchema`
  - [ ] `ProfileIdSchema`
  - [ ] `LaunchInputSchema`
  - [ ] `AppSettingsSchema`
- [ ] Unit tests for schemas
  - [ ] Valid input tests
  - [ ] Invalid required fields tests
  - [ ] Invalid format tests
  - [ ] Edge cases (empty string, special characters)
- [ ] Commit: `feat(ipc): add channel definitions and zod validation schemas`

### PR-05: Utility Functions

- [ ] Create `src/shared/utils/id.ts`
  - [ ] `generateId()` function (crypto.randomUUID)
  - [ ] `createProfileId()` branded ID creator
- [ ] Create `src/shared/utils/path.ts`
  - [ ] `joinPaths(...parts)` — cross-platform
  - [ ] `expandHome(path)` — expand `~`
  - [ ] `isAbsolutePath(path)` — validation
- [ ] Create `src/shared/utils/date.ts`
  - [ ] `now()` — current date
  - [ ] `formatRelative(date)` — "2 hours ago"
- [ ] Create `src/shared/utils/result.ts`
  - [ ] `mapResult(result, fn)`
  - [ ] `flatMapResult(result, fn)`
  - [ ] `matchResult(result, { ok, err })`
- [ ] Unit tests ≥ 90% coverage
- [ ] Commit: `feat(utils): add shared utility functions`

---

## Phase 1: Core Domain (PR-06 – PR-10)

### PR-06: Filesystem Service

- [ ] Create `src/services/filesystemService.ts`
  - [ ] `exists(path): Promise<boolean>`
  - [ ] `mkdir(path, options?): Promise<void>`
  - [ ] `rm(path, options?): Promise<void>`
  - [ ] `readdir(path): Promise<string[]>`
- [ ] Create `src/test/mocks/mockFilesystemService.ts`
  - [ ] In-memory implementation
  - [ ] `addDirectory(path)` test helper
  - [ ] `getDirectories()` inspection helper
- [ ] Unit tests using MockFilesystemService
- [ ] Integration tests using `os.tmpdir()`
- [ ] Tests: exists, mkdir, rm recursive, readdir empty dir
- [ ] Commit: `feat(services): add filesystem service with mock for testing`

### PR-07: Profile Repository

- [ ] Install `electron-store`: `pnpm add electron-store`
- [ ] Create `src/repositories/appStore.ts`
  - [ ] `AppStoreSchema` type
  - [ ] Store factory function
- [ ] Create `src/repositories/profileRepository.ts`
  - [ ] Implement `IProfileRepository`
  - [ ] `findAll()` — sorted by lastUsedAt
  - [ ] `findById(id)` — return null if not found
  - [ ] `save(profile)` — upsert
  - [ ] `delete(id)` — no-op if not found
  - [ ] `exists(id)` — boolean check
  - [ ] Serialization helpers (Date ↔ string)
- [ ] Create mock store for tests
- [ ] Unit tests
  - [ ] Empty store returns empty array
  - [ ] Save and retrieve profile
  - [ ] Update existing profile
  - [ ] Delete profile
  - [ ] findById returns null for unknown ID
  - [ ] Date serialization round-trip
- [ ] Commit: `feat(repo): add profile repository with electron-store`

### PR-08: Profile Service

- [ ] Create `src/services/profileService.ts`
  - [ ] Constructor accepts `IProfileRepository` and `IFilesystemService`
  - [ ] `createProfile(input)` → validate, check dup, mkdir, save
  - [ ] `deleteProfile(id)` → find, rm homeDir, delete from repo
  - [ ] `updateProfile(id, input)` → find, validate, update, save
  - [ ] `listProfiles()` → findAll, sorted by lastUsedAt desc
  - [ ] `getProfile(id)` → findById or ProfileNotFoundError
  - [ ] `recordProfileUsage(id)` → update lastUsedAt
- [ ] Unit tests ≥ 90% coverage
  - [ ] `createProfile` — success case
  - [ ] `createProfile` — duplicate name error
  - [ ] `createProfile` — validation error (empty name)
  - [ ] `createProfile` — filesystem error
  - [ ] `deleteProfile` — success case
  - [ ] `deleteProfile` — profile not found error
  - [ ] `deleteProfile` — filesystem rm error
  - [ ] `updateProfile` — success case
  - [ ] `updateProfile` — duplicate name error
  - [ ] `listProfiles` — sorted correctly
  - [ ] `getProfile` — found and not found
- [ ] Commit: `feat(services): add profile service with full business logic`

### PR-09: IPC Handlers — Profile

- [ ] Create `src/main/ipc/profileHandlers.ts`
  - [ ] `registerProfileHandlers(ipcMain, profileService)`
  - [ ] Handler: `profiles:list`
  - [ ] Handler: `profiles:get`
  - [ ] Handler: `profiles:create`
  - [ ] Handler: `profiles:update`
  - [ ] Handler: `profiles:delete`
- [ ] Update `src/main/index.ts` to register handlers
- [ ] Unit tests with mock ipcMain and mock ProfileService
  - [ ] Valid input → calls service and returns result
  - [ ] Invalid input → returns validation error, does not call service
  - [ ] Service error → properly forwarded
- [ ] Commit: `feat(ipc): add profile IPC handlers with zod validation`

### PR-10: Preload Script & Typed API

- [ ] Create `src/preload/api.ts`
  - [ ] `ClaudeApi` interface definition
  - [ ] `Window` interface extension
- [ ] Implement `src/preload/index.ts`
  - [ ] `profiles` API (list, get, create, update, delete)
  - [ ] `launcher` API (start, stop, getStatus)
  - [ ] `settings` API (get, set)
- [ ] Update `src/main/window.ts`
  - [ ] `webPreferences.preload` points to preload script
  - [ ] `contextIsolation: true`
  - [ ] `nodeIntegration: false`
  - [ ] `sandbox: true`
- [ ] Verify `window.claudeApi` is available in renderer DevTools
- [ ] Commit: `feat(preload): expose typed api via contextbridge`

---

## Phase 2: Launch Engine (PR-11 – PR-15)

### PR-11: Binary Discovery Service

- [ ] Create `src/services/binaryDiscoveryService.ts`
  - [ ] `discoverBinary()` → `Result<string, BinaryNotFoundError>`
  - [ ] macOS paths list
  - [ ] Linux paths list
  - [ ] Windows paths list
  - [ ] Custom path override from settings
  - [ ] `validateBinary(path)` — verify executable exists
- [ ] Unit tests (mock filesystem + mock platform)
  - [ ] macOS discovery success
  - [ ] Linux discovery success
  - [ ] Windows discovery success
  - [ ] All paths missing → error
  - [ ] Custom path override works
  - [ ] Invalid custom path → error
- [ ] Commit: `feat(services): add binary discovery service for claude desktop`

### PR-12: Environment Service

- [ ] Create `src/services/environmentService.ts`
  - [ ] `buildEnv(profile)` → `Record<string, string>`
  - [ ] Clone `process.env`
  - [ ] Override `HOME` with `profile.homeDir`
  - [ ] Set `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` (Linux)
  - [ ] Ensure homeDir exists (via `IFilesystemService`)
- [ ] Unit tests ≥ 90% coverage
  - [ ] HOME is set to profile homeDir
  - [ ] Existing env vars preserved (PATH, DISPLAY)
  - [ ] XDG vars set on Linux
  - [ ] homeDir created if it does not exist
- [ ] Commit: `feat(services): add environment service for profile isolation`

### PR-13: Launch Service

- [ ] Create `src/services/launchService.ts`
  - [ ] Constructor accepts `IProfileRepository`, `BinaryDiscoveryService`, `EnvironmentService`
  - [ ] `startProfile(profileId)` → discover binary, build env, spawn
  - [ ] `stopProfile(profileId)` → send SIGTERM, timeout → SIGKILL
  - [ ] `getStatus(profileId)` → `LaunchStatus`
  - [ ] `getAllStatuses()` → `Map<ProfileId, LaunchStatus>`
  - [ ] Process tracking `Map<ProfileId, ChildProcess>`
  - [ ] Handle process `exit` event → cleanup tracking
  - [ ] Handle process `error` event → update status
- [ ] Unit tests with mock child_process
  - [ ] Start profile — success
  - [ ] Start profile — already running error
  - [ ] Start profile — binary not found error
  - [ ] Stop profile — success (SIGTERM)
  - [ ] Stop profile — not running no-op
  - [ ] Process exit → status updates to stopped
  - [ ] Process error → status updates to error
- [ ] Commit: `feat(services): add launch service for process lifecycle management`

### PR-14: IPC Handlers — Launcher

- [ ] Create `src/main/ipc/launchHandlers.ts`
  - [ ] `registerLaunchHandlers(ipcMain, launchService)`
  - [ ] Handler: `launcher:start`
  - [ ] Handler: `launcher:stop`
  - [ ] Handler: `launcher:status`
- [ ] Tests for handlers
- [ ] Update `container.ts` to register handlers
- [ ] Commit: `feat(ipc): add launcher IPC handlers`

### PR-15: Settings Repository & IPC

- [ ] Create `src/repositories/settingsRepository.ts`
  - [ ] Implement `ISettingsRepository`
  - [ ] `get()` → settings with defaults applied
  - [ ] `set(partial)` → merge and save
  - [ ] Default settings values
- [ ] Create `src/main/ipc/settingsHandlers.ts`
  - [ ] Handler: `settings:get`
  - [ ] Handler: `settings:set`
- [ ] Tests
- [ ] Commit: `feat(repo): add settings repository and ipc handlers`

---

## Phase 3: UI Foundation (PR-16 – PR-20)

### PR-16: React App Shell

- [ ] Install and configure TailwindCSS
- [ ] Initialize shadcn/ui
- [ ] Add shadcn components: Button, Dialog, Input, Card, Badge, Separator
- [ ] Create `src/renderer/App.tsx` with simple state-based routing
- [ ] Create `src/renderer/components/layout/MainLayout.tsx`
- [ ] Create `src/renderer/components/layout/Sidebar.tsx`
- [ ] Set up global CSS variables for dark mode
- [ ] Test rendering in Electron
- [ ] Commit: `feat(ui): add react app shell with tailwind and shadcn`

### PR-17: Profile Hooks

- [ ] Create `src/renderer/hooks/useProfiles.ts`
- [ ] Create `src/renderer/hooks/useProfile.ts`
- [ ] Create `src/renderer/hooks/useCreateProfile.ts`
- [ ] Create `src/renderer/hooks/useUpdateProfile.ts`
- [ ] Create `src/renderer/hooks/useDeleteProfile.ts`
- [ ] Unit tests with mocked `window.claudeApi`
- [ ] Tests: loading state, error state, success state
- [ ] Commit: `feat(hooks): add profile management hooks`

### PR-18: Profile List View

- [ ] Create `ProfileList.tsx`
- [ ] Create `ProfileCard.tsx`
- [ ] Empty state component
- [ ] Loading skeleton
- [ ] Error state
- [ ] Snapshot tests
- [ ] Commit: `feat(ui): add profile list and card components`

### PR-19: Create Profile Dialog

- [ ] Create `CreateProfileDialog.tsx`
- [ ] Form with name field (required) and icon picker placeholder
- [ ] Client-side validation (min length, invalid characters)
- [ ] Submit handler with loading state
- [ ] Inline error display
- [ ] Success → close dialog + refresh list
- [ ] Tests
- [ ] Commit: `feat(ui): add create profile dialog`

### PR-20: Edit & Delete Profile

- [ ] Create `EditProfileDialog.tsx` with prefilled form
- [ ] Delete confirm dialog
- [ ] Context menu or dropdown menu on `ProfileCard`
- [ ] Integrate `useUpdateProfile` and `useDeleteProfile`
- [ ] Tests
- [ ] Commit: `feat(ui): add edit and delete profile functionality`

---

## Phase 4: Launch UI (PR-21 – PR-24)

### PR-21: Launch Status Hook

- [ ] Create `src/renderer/hooks/useLaunchStatus.ts`
- [ ] Poll status via IPC
- [ ] Cleanup on unmount
- [ ] Tests
- [ ] Commit: `feat(hooks): add launch status polling hook`

### PR-22: Launch Button & Controls

- [ ] Create `LaunchButton.tsx`
- [ ] Create `StatusIndicator.tsx` (colored dot)
- [ ] Integrate into `ProfileCard`
- [ ] Loading/disabled states
- [ ] Stop button when running
- [ ] Tests
- [ ] Commit: `feat(ui): add launch button and status indicator`

### PR-23: Error Handling UI

- [ ] Set up Sonner or shadcn Toast
- [ ] Error boundary component
- [ ] Error code → user-friendly message mapping
- [ ] Tests
- [ ] Commit: `feat(ui): add error handling and toast notifications`

### PR-24: IPC Push Notifications

- [ ] Main: `webContents.send` when launch status changes
- [ ] Preload: expose `onStatusUpdate(callback)` listener
- [ ] Renderer: update UI reactively
- [ ] Cleanup listeners on unmount
- [ ] Tests
- [ ] Commit: `feat(ipc): add push notifications for launch status updates`

---

## Phase 5: Settings & Polish (PR-25 – PR-28)

### PR-25: Settings UI

- [ ] `SettingsPage.tsx`
- [ ] Custom binary path field + file picker
- [ ] Profiles directory setting
- [ ] `useSettings()` hook
- [ ] Save with feedback
- [ ] Commit: `feat(ui): add settings page`

### PR-26: App Tray Icon

- [ ] `src/main/tray.ts`
- [ ] Tray menu: profiles, open window, quit
- [ ] Minimize to tray when window is closed
- [ ] Tray icon assets
- [ ] Commit: `feat(main): add system tray icon and menu`

### PR-27: Profile Icons

- [ ] Icon picker with predefined set
- [ ] Emoji support
- [ ] Display icon in ProfileCard
- [ ] Default icon fallback
- [ ] Commit: `feat(ui): add profile icon picker`

### PR-28: Keyboard Shortcuts & Accessibility

- [ ] `Cmd/Ctrl+N` → create profile
- [ ] Arrow key navigation
- [ ] ARIA labels
- [ ] Focus management in dialogs
- [ ] Dark mode toggle
- [ ] Commit: `feat(ui): add keyboard shortcuts and accessibility improvements`

---

## Phase 6: Packaging & Release (PR-29 – PR-32)

### PR-29: electron-builder Config

- [x] Install `electron-builder`
- [x] `electron-builder.config.ts`
- [x] macOS: dmg + zip, universal binary
- [x] Linux: AppImage + deb
- [x] Windows: NSIS installer
- [x] App icons (icns, ico, png 512x512)
- [x] `pnpm build` script
- [x] Commit: `chore(build): add electron-builder configuration`

### PR-30: Auto-Updater

- [x] Install `electron-updater`
- [x] `src/main/updater.ts`
- [x] Auto-check on startup
- [x] UI notification when update available
- [x] Setting to disable auto-check
- [x] Commit: `feat(main): add auto-update support`

### PR-31: GitHub Actions CI/CD

- [x] `.github/workflows/ci.yml` — test on PR
- [x] `.github/workflows/release.yml` — build on tag
- [x] Matrix: macOS, Linux, Windows
- [x] Artifact upload
- [x] Commit: `ci: add github actions for ci and release`

### PR-32: Documentation & README

- [x] `README.md` — installation, usage, screenshots
- [x] `CHANGELOG.md`
- [x] `LICENSE` (MIT)
- [x] `.github/ISSUE_TEMPLATE/bug_report.md`
- [x] `.github/ISSUE_TEMPLATE/feature_request.md`
- [x] `.github/pull_request_template.md`
- [x] Commit: `docs: add readme, changelog, and github templates`

---

## Discovered Tasks (Added During Development)

> Add new tasks discovered during implementation here.

- [ ] _(To be added as implementation progresses)_

---

## Icebox (Future Considerations)

> Not in scope for v1.0, but recorded for future consideration.

- [ ] Import/export profile configurations
- [ ] Profile backup and restore
- [ ] Multiple launcher targets (not just Claude Desktop)
- [ ] Profile groups and tags
- [ ] Launch profiles on system startup
- [ ] CLI interface (`claude-launcher start <profile>`)
- [ ] Plugin system for custom environment setups
- [ ] Profile usage statistics
- [ ] Sync profiles across machines via cloud
