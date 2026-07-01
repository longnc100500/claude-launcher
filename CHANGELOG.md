# Changelog

All notable changes to Claude Launcher are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] — v0.1.0

### Added

**Core**
- Profile isolation via `HOME` directory override — no patching or binary copying
- Create, rename, and delete profiles with per-profile home directories
- Launch Claude Desktop with isolated session, cookies, and preferences
- Stop running Claude Desktop instances
- Auto-detect Claude Desktop binary on macOS, Linux, and Windows

**UI**
- Profile list with launch/stop controls and running status badge
- Create Profile dialog with name and emoji icon picker
- Edit Profile dialog with pre-filled form
- Delete Profile confirmation dialog
- Settings page: custom binary path and light/dark/system theme
- Toast notifications for errors and success actions
- Keyboard shortcuts: Cmd/Ctrl+N (new profile), Escape (close), Cmd/Ctrl+, (settings)

**Architecture**
- Clean Architecture: Domain → Service → Repository → Infrastructure
- All IPC messages validated with Zod schemas on both ends
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- TypeScript strict mode throughout (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- System tray with toggle window and quit

**Infrastructure**
- Vitest with jsdom for renderer tests; 240 tests passing
- electron-builder config: macOS DMG/ZIP (universal), Linux AppImage/deb, Windows NSIS
- GitHub Actions CI (test/lint/typecheck) and CD (multi-platform build on tag)

### Known Limitations

- macOS Keychain may still be shared between profiles (keychain isolation requires additional work)
- Auto-updater not yet included (planned for v0.2)
- No system tray icon asset bundled — must be added to `resources/tray-icon.png`
- App icons not yet bundled — must be added to `resources/` before packaging

---

## [0.0.7] — 2026-07-01

### Fixed

- macOS: clicking Launch on an already-running profile could freeze the whole app. The focus-existing-window call used `spawnSync('osascript', ...)`, which blocks the entire (single-threaded) main process until the AppleScript call returns — including any time spent waiting on a macOS Automation permission prompt for a freshly (re-)signed build. Switched to non-blocking `spawn`, matching the pattern already used in the tray menu's focus handler.

---

## [0.0.1] — 2026-06-27

- Initial project scaffolding
- Documentation system created
