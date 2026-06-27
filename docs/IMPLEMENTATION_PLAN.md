# Implementation Plan — Claude Launcher

> A detailed implementation roadmap split into small, independent, individually reviewable Pull Requests.

---

## Overview

| Phase | PRs | Goal |
|-------|-----|------|
| Phase 0: Foundation | PR-01 – PR-05 | Project scaffolding, tooling, domain types |
| Phase 1: Core Domain | PR-06 – PR-10 | Profile management, IPC, persistence |
| Phase 2: Launch Engine | PR-11 – PR-15 | Launch service, binary discovery, process management |
| Phase 3: UI Foundation | PR-16 – PR-20 | React app, components, profile UI |
| Phase 4: Launch UI | PR-21 – PR-24 | Launch controls, status indicators |
| Phase 5: Settings & Polish | PR-25 – PR-28 | Settings, error handling, UX polish |
| Phase 6: Packaging & Release | PR-29 – PR-32 | electron-builder, CI/CD, release |

---

## Phase 0: Foundation

### PR-01: Project Scaffolding

**Goal**: Create the basic project structure with Electron + Vite + React + TypeScript.

**Tasks**:
- [ ] Initialize project with `pnpm init`
- [ ] Configure Electron + Vite (using `electron-vite` or `vite-plugin-electron`)
- [ ] Configure TypeScript with 3 tsconfigs: base, main (Node), renderer (Browser)
- [ ] Configure ESLint + Prettier
- [ ] Create folder structure per `ARCHITECTURE.md`
- [ ] Add `.gitignore`, `.editorconfig`
- [ ] Verify `pnpm dev` launches an Electron window

**Deliverables**:
- `package.json` with all dependencies
- `tsconfig.json`, `tsconfig.main.json`, `tsconfig.renderer.json`
- `vite.config.ts`
- `.eslintrc.json`, `.prettierrc`
- Empty folder structure per spec
- Electron window displaying "Hello World"

**Acceptance Criteria**:
- [ ] `pnpm dev` starts Electron with a React renderer
- [ ] `pnpm typecheck` produces no errors
- [ ] `pnpm lint` produces no errors
- [ ] TypeScript strict mode is enabled

---

### PR-02: Testing Infrastructure

**Goal**: Configure Vitest with coverage reporting.

**Tasks**:
- [ ] Install and configure Vitest
- [ ] Add `vitest.config.ts` with coverage thresholds
- [ ] Create basic test helpers/utils
- [ ] Write a first passing test to verify the setup
- [ ] Add `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` scripts
- [ ] Configure coverage provider (v8 or istanbul)

**Deliverables**:
- `vitest.config.ts`
- `src/test/setup.ts`
- A passing example test
- Coverage thresholds set

**Acceptance Criteria**:
- [ ] `pnpm test` runs and passes
- [ ] `pnpm test:coverage` displays a coverage report
- [ ] Coverage thresholds enforced: domain/service ≥ 90%

---

### PR-03: Domain Types & Interfaces

**Goal**: Define all domain types, interfaces, and errors.

**Tasks**:
- [ ] Create `src/domain/profile.ts` — Profile interface, ProfileId branded type, IProfileRepository
- [ ] Create `src/domain/settings.ts` — AppSettings interface
- [ ] Create `src/domain/launch.ts` — LaunchStatus, LaunchResult types
- [ ] Create `src/domain/errors.ts` — typed error class hierarchy
- [ ] Create `src/domain/filesystem.ts` — IFilesystemService interface
- [ ] Create `src/shared/types/result.ts` — Result<T, E>, Ok, Err helpers
- [ ] Unit tests for domain types (type guards, branded types)

**Deliverables**:
- `src/domain/*.ts`
- `src/shared/types/result.ts`
- Tests for type guards

**Acceptance Criteria**:
- [ ] No external dependencies in the domain layer
- [ ] All interfaces correctly exported
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes

---

### PR-04: IPC Channel Definitions & Schemas

**Goal**: Define all IPC channels and Zod schemas.

**Tasks**:
- [ ] Create `src/shared/ipc/channels.ts` — all `IPC_CHANNELS` constants
- [ ] Create `src/shared/ipc/schemas.ts` — Zod schemas for every IPC message
- [ ] Schemas for: CreateProfileInput, UpdateProfileInput, LaunchInput, AppSettings
- [ ] Unit tests for Zod schemas (valid cases, invalid cases)
- [ ] Install Zod: `pnpm add zod`

**Deliverables**:
- `src/shared/ipc/channels.ts`
- `src/shared/ipc/schemas.ts`
- Tests for validation schemas

**Acceptance Criteria**:
- [ ] All IPC channels defined — no magic strings in the codebase
- [ ] Each schema has at least 3 unit tests (valid, invalid required, invalid format)
- [ ] `pnpm test` passes

---

### PR-05: Utility Functions

**Goal**: Shared utility functions used across the project.

**Tasks**:
- [ ] `src/shared/utils/id.ts` — ID generation (nanoid or crypto.randomUUID)
- [ ] `src/shared/utils/path.ts` — Path manipulation helpers (platform-safe)
- [ ] `src/shared/utils/date.ts` — Date helpers
- [ ] `src/shared/utils/result.ts` — Result type helpers (map, flatMap, match)
- [ ] Unit tests for all utils

**Deliverables**:
- `src/shared/utils/*.ts`
- Tests ≥ 90% coverage

**Acceptance Criteria**:
- [ ] `pnpm test` passes
- [ ] No Electron imports in utils

---

## Phase 1: Core Domain

### PR-06: Filesystem Service

**Goal**: Abstraction layer for filesystem operations, fully testable.

**Tasks**:
- [ ] Implement `FilesystemService` (production — wraps `fs/promises`)
- [ ] Implement `MockFilesystemService` (test — in-memory)
- [ ] Methods: `exists`, `mkdir`, `rm`, `readdir`, `joinPath`
- [ ] Unit tests using MockFilesystemService
- [ ] Integration tests using temp directories (`os.tmpdir()`)

**Deliverables**:
- `src/services/filesystemService.ts`
- `src/test/mocks/mockFilesystemService.ts`
- Tests ≥ 90% coverage

**Acceptance Criteria**:
- [ ] Service correctly implements the `IFilesystemService` interface
- [ ] Tests do not import Electron
- [ ] `pnpm test` passes

---

### PR-07: Profile Repository

**Goal**: Persistence layer for profiles using electron-store.

**Tasks**:
- [ ] Install `electron-store`: `pnpm add electron-store`
- [ ] Define `AppStoreSchema` with Zod
- [ ] Implement `ProfileRepository` implementing `IProfileRepository`
- [ ] Serialization/deserialization for Profile ↔ plain object
- [ ] Unit tests with a mock store
- [ ] Edge cases: empty store, duplicate IDs, date serialization round-trip

**Deliverables**:
- `src/repositories/profileRepository.ts`
- `src/repositories/__tests__/profileRepository.test.ts`

**Acceptance Criteria**:
- [ ] CRUD operations work correctly
- [ ] Serialization round-trip loses no data
- [ ] Tests ≥ 80% coverage
- [ ] `pnpm test` passes

---

### PR-08: Profile Service

**Goal**: Business logic for profile management.

**Tasks**:
- [ ] Implement `ProfileService` accepting `IProfileRepository` and `IFilesystemService`
- [ ] `createProfile(input)` — validate, check duplicate, mkdir, persist
- [ ] `deleteProfile(id)` — find, remove homeDir, delete from repo
- [ ] `updateProfile(id, input)` — validate, update name/icon
- [ ] `listProfiles()` — list all, sorted by lastUsed
- [ ] `getProfile(id)` — find or error
- [ ] Unit tests for all methods (using mocks)
- [ ] Test edge cases: duplicate names, non-existent IDs, filesystem errors

**Deliverables**:
- `src/services/profileService.ts`
- `src/services/__tests__/profileService.test.ts`

**Acceptance Criteria**:
- [ ] No Electron imports
- [ ] All methods return `Result<T, ProfileError>`
- [ ] Tests ≥ 90% coverage
- [ ] `pnpm test` passes

---

### PR-09: IPC Handlers — Profile

**Goal**: Connect ProfileService to the IPC layer.

**Tasks**:
- [ ] Create `src/main/ipc/profileHandlers.ts`
- [ ] Register handlers: `profiles:list`, `profiles:get`, `profiles:create`, `profiles:update`, `profiles:delete`
- [ ] Validate input with Zod before calling the service
- [ ] Serialize Result before returning to renderer
- [ ] Unit tests for handlers (mock IpcMain, mock ProfileService)

**Deliverables**:
- `src/main/ipc/profileHandlers.ts`
- Tests for handlers

**Acceptance Criteria**:
- [ ] All channels registered
- [ ] Invalid input returns an error, does not crash
- [ ] `pnpm test` passes

---

### PR-10: Preload Script & Typed API

**Goal**: Safely expose the API to the renderer via contextBridge.

**Tasks**:
- [ ] Implement `src/preload/index.ts` — contextBridge setup
- [ ] Implement `src/preload/api.ts` — typed API definitions
- [ ] `ClaudeApi` interface with complete profiles, launcher, settings
- [ ] Update `Window` interface in global types
- [ ] Configure Electron window with correct preload + security settings
- [ ] Verify the preload in dev mode

**Deliverables**:
- `src/preload/index.ts`
- `src/preload/api.ts`
- Updated main window config

**Acceptance Criteria**:
- [ ] `contextIsolation: true`, `nodeIntegration: false`
- [ ] `window.claudeApi` has all methods in the renderer
- [ ] TypeScript types are correct on the renderer side
- [ ] `pnpm dev` works

---

## Phase 2: Launch Engine

### PR-11: Binary Discovery Service

**Goal**: Find the path to the Claude Desktop binary on every platform.

**Tasks**:
- [ ] Implement `BinaryDiscoveryService`
- [ ] macOS: `/Applications/Claude.app/Contents/MacOS/Claude`
- [ ] Linux: `/usr/bin/claude-desktop`, `~/.local/bin/claude-desktop`
- [ ] Windows: standard installation paths
- [ ] Fallback to user-configured custom path from settings
- [ ] `discoverBinary()` → `Result<string, BinaryNotFoundError>`
- [ ] Unit tests for each platform case (mock filesystem)
- [ ] Tests for custom path fallback

**Deliverables**:
- `src/services/binaryDiscoveryService.ts`
- Tests ≥ 90% coverage

**Acceptance Criteria**:
- [ ] Works on macOS, Linux, Windows (platform mocked in tests)
- [ ] Custom path override works
- [ ] `pnpm test` passes

---

### PR-12: Environment Service

**Goal**: Build the environment variables for an isolated launch.

**Tasks**:
- [ ] Implement `EnvironmentService`
- [ ] `buildEnv(profile: Profile)` — merge process.env with overrides
- [ ] Set `HOME=/path/to/profile/home`
- [ ] Set `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME` (Linux)
- [ ] Ensure homeDir exists before returning env
- [ ] Unit tests for env building
- [ ] Test that `HOME` is set correctly
- [ ] Test that existing env vars are preserved (PATH, DISPLAY, etc.)

**Deliverables**:
- `src/services/environmentService.ts`
- Tests ≥ 90% coverage

**Acceptance Criteria**:
- [ ] `HOME` always points to the profile homeDir
- [ ] No sensitive env vars are leaked
- [ ] Tests do not require Electron
- [ ] `pnpm test` passes

---

### PR-13: Launch Service — Core

**Goal**: Service managing the lifecycle of Claude Desktop processes.

**Tasks**:
- [ ] Implement `LaunchService`
- [ ] `startProfile(profileId)` → spawn process with isolated env
- [ ] `stopProfile(profileId)` → graceful terminate (SIGTERM) → SIGKILL fallback
- [ ] `getStatus(profileId)` → `running | stopped | starting | error`
- [ ] Track running processes in `Map<ProfileId, ChildProcess>`
- [ ] Handle process `exit` events (update status, cleanup)
- [ ] Handle process `error` events (update status)
- [ ] Unit tests with a mock ChildProcess
- [ ] Test: start, stop, already-running, process-crash scenarios

**Deliverables**:
- `src/services/launchService.ts`
- Tests ≥ 85% coverage

**Acceptance Criteria**:
- [ ] Same profile cannot be launched twice
- [ ] Process cleanup occurs on process exit
- [ ] `pnpm test` passes

---

### PR-14: IPC Handlers — Launcher

**Goal**: Expose launch controls via IPC.

**Tasks**:
- [ ] Create `src/main/ipc/launchHandlers.ts`
- [ ] Register: `launcher:start`, `launcher:stop`, `launcher:status`
- [ ] Validate input with Zod
- [ ] Forward to LaunchService
- [ ] Tests for handlers

**Deliverables**:
- `src/main/ipc/launchHandlers.ts`
- Tests for handlers

**Acceptance Criteria**:
- [ ] `pnpm test` passes
- [ ] Handlers correctly handle error cases

---

### PR-15: Settings Repository & Service

**Goal**: Persistence and management for app settings.

**Tasks**:
- [ ] Implement `SettingsRepository`
- [ ] Default settings values
- [ ] `AppSettings` type: `claudeBinaryPath`, `profilesDir`, `theme`, `launchOnStartup`
- [ ] IPC handlers: `settings:get`, `settings:set`
- [ ] Tests

**Deliverables**:
- `src/repositories/settingsRepository.ts`
- `src/main/ipc/settingsHandlers.ts`
- Tests

**Acceptance Criteria**:
- [ ] Default settings apply when no settings exist
- [ ] Settings persist across app restarts
- [ ] `pnpm test` passes

---

## Phase 3: UI Foundation

### PR-16: React App Shell

**Goal**: Set up the React application with routing and layout.

**Tasks**:
- [ ] Install React Router or use simple state-based navigation
- [ ] Create `App.tsx` with basic routing
- [ ] Create `MainLayout.tsx` with sidebar + content area
- [ ] Set up TailwindCSS
- [ ] Set up shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Add required base shadcn components: Button, Dialog, Input, Badge, Card

**Deliverables**:
- `src/renderer/App.tsx`
- `src/renderer/components/layout/MainLayout.tsx`
- Tailwind config
- Base shadcn components

**Acceptance Criteria**:
- [ ] App shell renders
- [ ] TailwindCSS works
- [ ] shadcn/ui components render correctly
- [ ] `pnpm dev` produces no errors

---

### PR-17: Profile Hooks

**Goal**: Custom hooks to communicate with the backend via `window.claudeApi`.

**Tasks**:
- [ ] `useProfiles()` — list, refetch, loading state
- [ ] `useProfile(id)` — single profile, loading state
- [ ] `useCreateProfile()` — mutation + optimistic update
- [ ] `useDeleteProfile()` — mutation
- [ ] `useUpdateProfile()` — mutation
- [ ] Error handling in hooks
- [ ] Unit tests with mocked `window.claudeApi`

**Deliverables**:
- `src/renderer/hooks/useProfiles.ts`
- `src/renderer/hooks/useCreateProfile.ts`
- etc.
- Tests for hooks

**Acceptance Criteria**:
- [ ] Hooks contain no UI logic
- [ ] Loading and error states are exposed
- [ ] `pnpm test` passes

---

### PR-18: Profile List View

**Goal**: Main screen displaying the list of profiles.

**Tasks**:
- [ ] `ProfileList.tsx` — container component
- [ ] `ProfileCard.tsx` — individual profile display (name, icon, last used, status)
- [ ] Empty state (no profiles yet)
- [ ] Loading state (skeleton)
- [ ] Error state
- [ ] Uses `useProfiles()` hook

**Deliverables**:
- `src/renderer/components/profiles/ProfileList.tsx`
- `src/renderer/components/profiles/ProfileCard.tsx`
- Snapshot tests

**Acceptance Criteria**:
- [ ] List renders correctly with data
- [ ] Empty state displays correctly
- [ ] Loading skeleton looks good
- [ ] Responsive layout

---

### PR-19: Create Profile Dialog

**Goal**: Dialog for creating a new profile.

**Tasks**:
- [ ] `CreateProfileDialog.tsx` — modal with form
- [ ] Form fields: name (required), icon (optional)
- [ ] Client-side validation
- [ ] Submit → `useCreateProfile()` → show success/error
- [ ] Close on success
- [ ] Show validation errors inline
- [ ] Uses shadcn Dialog + Form components

**Deliverables**:
- `src/renderer/components/profiles/CreateProfileDialog.tsx`
- Tests

**Acceptance Criteria**:
- [ ] Form validation works
- [ ] Error messages display clearly
- [ ] Cannot submit while loading
- [ ] Dialog closes after successful creation

---

### PR-20: Edit & Delete Profile

**Goal**: Allow editing name/icon and deleting profiles.

**Tasks**:
- [ ] `EditProfileDialog.tsx` — form prefilled with current data
- [ ] Confirm delete dialog (with data loss warning)
- [ ] `useUpdateProfile()` hook
- [ ] `useDeleteProfile()` hook
- [ ] Integrate into `ProfileCard` (context menu or action buttons)

**Deliverables**:
- `src/renderer/components/profiles/EditProfileDialog.tsx`
- Confirm dialog component
- Tests

**Acceptance Criteria**:
- [ ] Edit dialog prefills current values
- [ ] Delete has a clear confirmation step
- [ ] UI updates immediately after a successful action

---

## Phase 4: Launch UI

### PR-21: Launch Status Hook

**Goal**: Hook to track the launch status of profiles.

**Tasks**:
- [ ] `useLaunchStatus(profileId)` — poll or event-based
- [ ] `LaunchStatus` type: `idle | starting | running | stopped | error`
- [ ] Handle status updates from main process
- [ ] Set up IPC event listener for push updates
- [ ] Tests

**Deliverables**:
- `src/renderer/hooks/useLaunchStatus.ts`
- Tests

**Acceptance Criteria**:
- [ ] Status updates when process starts/stops
- [ ] No memory leaks (listeners are cleaned up)
- [ ] `pnpm test` passes

---

### PR-22: Launch Button & Controls

**Goal**: UI controls to launch and stop profiles.

**Tasks**:
- [ ] `LaunchButton.tsx` — button with loading/running states
- [ ] `StatusIndicator.tsx` — visual indicator (dot) for status
- [ ] Integrate into `ProfileCard`
- [ ] Disable launch while starting
- [ ] Stop button while running

**Deliverables**:
- `src/renderer/components/launcher/LaunchButton.tsx`
- `src/renderer/components/launcher/StatusIndicator.tsx`
- Tests

**Acceptance Criteria**:
- [ ] Button state accurately reflects launch status
- [ ] Launch/stop works end-to-end
- [ ] Loading state is clear

---

### PR-23: Error Handling UI

**Goal**: Display errors in a user-friendly way.

**Tasks**:
- [ ] Toast notifications for errors (shadcn Toast or Sonner)
- [ ] Error boundary for React components
- [ ] `BinaryNotFoundError` → guide user to install Claude Desktop
- [ ] `ProfileAlreadyExistsError` → inline validation message
- [ ] Global error handler setup

**Deliverables**:
- shadcn Toast or Sonner setup
- Error boundary component
- Error message mapping

**Acceptance Criteria**:
- [ ] All errors have user-friendly messages
- [ ] No raw error objects are shown to the user
- [ ] App does not crash when an error occurs

---

### PR-24: Launch Push Notifications (IPC Events)

**Goal**: Main process pushes status updates to the renderer when process state changes.

**Tasks**:
- [ ] Set up `webContents.send` in LaunchService when process state changes
- [ ] Preload exposes `onStatusUpdate` event listener
- [ ] Renderer hook listens and updates UI reactively
- [ ] Cleanup listeners on component unmount
- [ ] Tests

**Deliverables**:
- IPC event emission from main
- Renderer event listener
- Tests

**Acceptance Criteria**:
- [ ] UI auto-updates when Claude Desktop process exits
- [ ] No memory leaks
- [ ] `pnpm test` passes

---

## Phase 5: Settings & Polish

### PR-25: Settings UI

**Goal**: Settings screen for user configuration.

**Tasks**:
- [ ] `SettingsPage.tsx` — layout with sections
- [ ] Custom binary path field (with file picker)
- [ ] Profiles directory setting
- [ ] `useSettings()` hook
- [ ] Save and validate settings

**Deliverables**:
- `src/renderer/components/settings/SettingsPage.tsx`
- `src/renderer/hooks/useSettings.ts`

**Acceptance Criteria**:
- [ ] Settings persist after saving
- [ ] Validation for binary path (file exists, is executable)
- [ ] UI feedback on save

---

### PR-26: App Tray Icon

**Goal**: System tray icon with a quick access menu.

**Tasks**:
- [ ] Create tray icon when app starts
- [ ] Menu: list running profiles, quick launch, open main window, quit
- [ ] Tray icon badge when profiles are running
- [ ] Keep app running when main window is closed (minimize to tray)

**Deliverables**:
- `src/main/tray.ts`
- Tray icon assets

**Acceptance Criteria**:
- [ ] Tray icon appears when app is running
- [ ] Menu works correctly
- [ ] App does not quit when window is closed (minimizes to tray)

---

### PR-27: Profile Icons

**Goal**: Allow users to choose a custom icon for each profile.

**Tasks**:
- [ ] Icon picker dialog with predefined icons
- [ ] Support emoji as icons
- [ ] Display icon in ProfileCard
- [ ] Default icon when no custom icon is set

**Deliverables**:
- Icon picker component
- Icon rendering logic
- Icon assets (or emoji support)

**Acceptance Criteria**:
- [ ] User can choose an icon when creating/editing a profile
- [ ] Icon displays correctly in the list

---

### PR-28: Keyboard Shortcuts & Accessibility

**Goal**: Keyboard navigation and accessibility improvements.

**Tasks**:
- [ ] Keyboard shortcut: `Cmd/Ctrl+N` — create new profile
- [ ] Arrow key navigation in the profile list
- [ ] ARIA labels for all interactive elements
- [ ] Focus management in dialogs
- [ ] High contrast / dark mode support (Tailwind dark mode)

**Deliverables**:
- Keyboard shortcut handler
- ARIA improvements
- Dark mode toggle

**Acceptance Criteria**:
- [ ] App is fully usable with only a keyboard
- [ ] Screen reader friendly
- [ ] Dark mode works

---

## Phase 6: Packaging & Release

### PR-29: electron-builder Configuration

**Goal**: Configure packaging for macOS, Linux, and Windows.

**Tasks**:
- [ ] `electron-builder.config.ts` — complete config
- [ ] macOS: `.dmg` + `.zip`, universal binary (Intel + Apple Silicon)
- [ ] Linux: `.AppImage`, `.deb`
- [ ] Windows: `.exe` installer (NSIS)
- [ ] App icons for each platform
- [ ] `pnpm build` script

**Deliverables**:
- `electron-builder.config.ts`
- App icons (`.icns`, `.ico`, `.png`)
- `pnpm build` script

**Acceptance Criteria**:
- [ ] `pnpm build` produces artifacts
- [ ] macOS build supports universal binary
- [ ] App icons display correctly

---

### PR-30: Auto-Updater

**Goal**: Automatically check for and install updates.

**Tasks**:
- [ ] Install `electron-updater`
- [ ] Auto-check for updates on app start
- [ ] UI notification when an update is available
- [ ] User can download and install
- [ ] Setting to disable auto-update check

**Deliverables**:
- `src/main/updater.ts`
- Update notification UI

**Acceptance Criteria**:
- [ ] Update check works
- [ ] User is notified when an update is available
- [ ] Updates are never forced

---

### PR-31: GitHub Actions CI/CD

**Goal**: Automated testing and release pipeline.

**Tasks**:
- [ ] `.github/workflows/ci.yml` — test on every PR
- [ ] `.github/workflows/release.yml` — build and publish on tag
- [ ] Test matrix: macOS, Linux, Windows
- [ ] Code signing setup (when certificates are available)
- [ ] Release draft creation

**Deliverables**:
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

**Acceptance Criteria**:
- [ ] CI runs tests on every PR
- [ ] Release workflow produces artifacts automatically

---

### PR-32: Documentation & README

**Goal**: Complete public-facing documentation.

**Tasks**:
- [ ] `README.md` — installation, usage, screenshots
- [ ] `CHANGELOG.md` — version history
- [ ] Contributing guide link
- [ ] License file (MIT)
- [ ] GitHub issue templates
- [ ] PR template

**Deliverables**:
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `.github/ISSUE_TEMPLATE/`
- `.github/pull_request_template.md`

**Acceptance Criteria**:
- [ ] README is sufficient for a new user to install and use the app
- [ ] Contributing guide is clear
